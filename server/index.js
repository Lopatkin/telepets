const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://telepets.netlify.app",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err.message));

// Схема пользователя
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  username: String,
  photoUrl: String,
  isRegistered: { type: Boolean, default: false },
  isHuman: Boolean,
  formerProfession: String,
  residence: String,
  animalType: String,
  name: String,
  credits: { type: Number, default: 0 },
  lastRoom: { type: String, default: 'Полигон утилизации' }, // Новое поле для последней комнаты
  homeless: { type: Boolean, default: true }, // Поле "homeless" с значением по умолчанию true
  inPocket: { type: Boolean, default: false }, // Поле "inPocket" с значением по умолчанию false
  lastActivity: { type: Date, default: Date.now } // Добавляем поле для отслеживания активности
});
const User = mongoose.model('User', userSchema);

// Схема сообщений (без изменений)
const messageSchema = new mongoose.Schema({
  userId: String,
  text: String,
  firstName: String,
  username: String,
  lastName: String,
  photoUrl: String,
  name: String,
  isHuman: Boolean,
  animalType: String,
  room: String,
  timestamp: { type: Date, default: Date.now },
  animalText: String // Оставляем поле, но заполняется клиентом
});
const Message = mongoose.model('Message', messageSchema);

const itemSchema = new mongoose.Schema({
  owner: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  rarity: { type: String },
  weight: { type: Number },
  cost: { type: Number },
  effect: { type: String },
  playerID: { type: String, required: false } // Новое поле для ID игрока-животного
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);

const inventoryLimitSchema = new mongoose.Schema({
  owner: String,
  maxWeight: Number,
  currentWeight: { type: Number, default: 0 }
});
const InventoryLimit = mongoose.model('InventoryLimit', inventoryLimitSchema);

const userCreditsSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  credits: { type: Number, default: 0, min: 0 }
});
const UserCredits = mongoose.model('UserCredits', userCreditsSchema);

// Хранилища
const roomUsers = {};
const userCurrentRoom = new Map();
const activeSockets = new Map();
const roomJoinTimes = new WeakMap();
const itemCache = new Map();
const itemLocks = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('getShelterAnimals', async () => {
    if (!socket.userData || !socket.userData.userId) {
      socket.emit('error', { message: 'Пользователь не аутентифицирован' });
      return;
    }

    const currentRoom = userCurrentRoom.get(socket.userData.userId);
    if (currentRoom !== 'Приют для животных "Кошкин дом"') {
      socket.emit('error', { message: 'Вы не в приюте для животных' });
      return;
    }

    try {
      const shelterAnimals = await User.find({
        lastRoom: 'Приют для животных "Кошкин дом"',
        homeless: true,
        inPocket: false,
        isHuman: false // Предполагаем, что животные имеют isHuman: false
      }).select('userId name photoUrl lastActivity isHuman animalType');

      // Определяем статус онлайн (например, активность за последние 5 минут)
      const now = new Date();
      const animalsWithStatus = shelterAnimals.map(animal => ({
        userId: animal.userId,
        name: animal.name,
        photoUrl: animal.photoUrl,
        isOnline: (now - new Date(animal.lastActivity || 0)) < 5 * 60 * 1000,
        animalType: animal.animalType
      }));

      socket.emit('shelterAnimals', animalsWithStatus);
    } catch (err) {
      console.error('Error fetching shelter animals:', err.message, err.stack);
      socket.emit('error', { message: 'Ошибка при загрузке списка животных' });
    }
  });

  socket.on('auth', async (userData, callback) => {
    if (!userData || !userData.userId) {
      console.error('Invalid user data:', userData);
      if (callback) callback({ success: false, message: 'Некорректные данные пользователя' });
      return;
    }

    let user = await User.findOne({ userId: userData.userId });
    if (!user) {
      user = new User({
        userId: userData.userId.toString(),
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        username: userData.username || '',
        photoUrl: userData.photoUrl || '',
        isRegistered: false,
        lastRoom: 'Полигон утилизации'
      });
      await user.save();
      console.log('New user created:', user.userId);
    } else {
      console.log('User data from DB:', JSON.stringify(user));
    }

    socket.userData = {
      userId: user.userId,
      firstName: user.firstName,
      username: user.username,
      lastName: user.lastName,
      photoUrl: user.photoUrl,
      name: user.name,
      isHuman: user.isHuman,
      animalType: user.animalType
    };
    console.log('Received auth data:', userData);
    console.log('Authenticated user:', socket.userData.userId, 'PhotoURL:', socket.userData.photoUrl);

    if (activeSockets.has(socket.userData.userId)) {
      console.log(`User ${socket.userData.userId} already connected with socket ${activeSockets.get(socket.userData.userId)}. Disconnecting old socket.`);
      const oldSocket = activeSockets.get(socket.userData.userId);
      oldSocket.disconnect();
    }

    activeSockets.set(socket.userData.userId, socket);

    socket.emit('userUpdate', {
      userId: user.userId,
      firstName: user.firstName,
      username: user.username,
      lastName: user.lastName,
      photoUrl: user.photoUrl,
      isRegistered: user.isRegistered,
      isHuman: user.isHuman,
      animalType: user.animalType,
      name: user.name,
    });
    console.log('Sent userUpdate on auth with photoUrl:', user.photoUrl);

    const userOwnerKey = `user_${socket.userData.userId}`;
    const myHomeOwnerKey = `myhome_${socket.userData.userId}`;

    let userCredits = await UserCredits.findOne({ userId: socket.userData.userId });
    if (!userCredits) {
      userCredits = await UserCredits.create({
        userId: socket.userData.userId,
        credits: 0
      });
    }

    socket.emit('creditsUpdate', userCredits.credits);
    console.log('Sent initial credits to client:', userCredits.credits);

    const userLimit = await InventoryLimit.findOne({ owner: userOwnerKey });
    if (!userLimit) {
      await InventoryLimit.create({
        owner: userOwnerKey,
        maxWeight: 40
      });
      const stick = new Item({
        name: 'Палка',
        description: 'Многофункциональная вещь',
        rarity: 'Обычный',
        weight: 1,
        cost: 5,
        effect: 'Вы чувствуете себя более уверенно в тёмное время суток',
        owner: userOwnerKey
      });
      await stick.save();
      await InventoryLimit.updateOne(
        { owner: userOwnerKey },
        { $inc: { currentWeight: 1 } }
      );
    }

    const myHomeLimit = await InventoryLimit.findOne({ owner: myHomeOwnerKey });
    if (!myHomeLimit) {
      await InventoryLimit.create({
        owner: myHomeOwnerKey,
        maxWeight: 500
      });
    }

    const workshopLimit = await InventoryLimit.findOne({ owner: 'Мастерская' });
    if (!workshopLimit) {
      await InventoryLimit.create({
        owner: 'Мастерская',
        maxWeight: 1000
      });
    }

    const rooms = [
      'Автобусная остановка',
      'Бар "У бобра" (18+)',
      'Бизнес центр "Альбион"',
      'Вокзал',
      'ЖК Сфера',
      'Завод',
      'Кофейня "Ляля-Фа"',
      'Лес',
      'Мастерская',
      'Парк',
      'Полигон утилизации',
      'Приют для животных "Кошкин дом"',
      'Район Дачный',
      'Торговый центр "Карнавал"',
    ];

    const staticRooms = [
      'Автобусная остановка',
      'Бар "У бобра" (18+)',
      'Бизнес центр "Альбион"',
      'Вокзал',
      'ЖК Сфера',
      'Завод',
      'Кофейня "Ляля-Фа"',
      'Лес',
      'Мастерская',
      'Парк',
      'Полигон утилизации',
      'Приют для животных "Кошкин дом"',
      'Район Дачный',
      'Торговый центр "Карнавал"',
    ];

    for (const room of staticRooms) {
      const roomLimit = await InventoryLimit.findOne({ owner: room });
      if (!roomLimit) {
        await InventoryLimit.create({
          owner: room,
          maxWeight: 10000, // Установи подходящий лимит для локаций
        });
      }
    }

    console.log('Available static rooms:', rooms);
    console.log('Received lastRoom:', userData.lastRoom);

    // Проверяем переданную последнюю комнату
    const isMyHome = userData.lastRoom && userData.lastRoom === `myhome_${socket.userData.userId}`;
    const isStaticRoom = userData.lastRoom && rooms.includes(userData.lastRoom); // rooms — список статичных комнат
    const defaultRoom = user.isRegistered ? (user.lastRoom || 'Полигон утилизации') : 'Автобусная остановка';
    console.log('Выбрана стартовая комната:', defaultRoom);

    socket.join(defaultRoom);
    userCurrentRoom.set(socket.userData.userId, defaultRoom);

    if (!roomUsers[defaultRoom]) roomUsers[defaultRoom] = new Set();
    roomUsers[defaultRoom].forEach(user => {
      if (user.userId === socket.userData.userId) {
        roomUsers[defaultRoom].delete(user);
      }
    });

    roomUsers[defaultRoom].add({
      userId: socket.userData.userId,
      firstName: socket.userData.firstName,
      username: socket.userData.username,
      lastName: socket.userData.lastName,
      photoUrl: socket.userData.photoUrl,
      name: user.name,
      isHuman: user.isHuman,
      inPocket: user.inPocket // Добавляем inPocket
    });

    io.to(defaultRoom).emit('roomUsers', Array.from(roomUsers[defaultRoom]));
    console.log(`User ${socket.userData.userId} auto-joined room: ${defaultRoom}`);

    try {
      const messages = await Message.find({ room: defaultRoom }).sort({ timestamp: 1 }).limit(100);
      socket.emit('messageHistory', messages);
    } catch (err) {
      console.error('Error fetching messages for default room:', err.message, err.stack);
      socket.emit('error', { message: 'Ошибка при загрузке сообщений' });
    }

    socket.emit('authSuccess', { defaultRoom, isRegistered: user.isRegistered });
    if (callback) callback({ success: true });
  });

  socket.on('completeRegistration', async (data, callback) => {
    try {
      const user = await User.findOneAndUpdate(
        { userId: data.userId },
        {
          isRegistered: true,
          isHuman: data.isHuman,
          formerProfession: data.formerProfession,
          residence: data.residence,
          animalType: data.animalType,
          name: data.name,
          photoUrl: data.photoUrl || socket.userData.photoUrl || '',
          homeless: data.isHuman ? false : true // Устанавливаем homeless: false для людей, true для животных
        },
        { new: true }
      );
      if (!user) {
        socket.emit('error', { message: 'User not found' });
        if (callback) callback({ success: false });
        return;
      }
      console.log('Registration completed for user:', user.userId, 'with photoUrl:', user.photoUrl);

      if (!data.isHuman && data.photoUrl) {
        socket.userData.photoUrl = data.photoUrl;
        console.log('Updated socket.userData.photoUrl for animal:', socket.userData.photoUrl);
      }
      if (!data.isHuman && data.name) {
        socket.userData.name = data.name;
      }

      const defaultRoom = 'Автобусная остановка';
      socket.join(defaultRoom);
      userCurrentRoom.set(user.userId, defaultRoom);

      if (!roomUsers[defaultRoom]) roomUsers[defaultRoom] = new Set();
      roomUsers[defaultRoom].forEach(u => {
        if (u.userId === user.userId) {
          roomUsers[defaultRoom].delete(u);
        }
      });

      roomUsers[defaultRoom].add({
        userId: user.userId,
        firstName: user.firstName,
        username: user.username,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        name: user.name,
        isHuman: user.isHuman,
        inPocket: user.inPocket // Добавляем inPocket
      });

      io.to(defaultRoom).emit('roomUsers', Array.from(roomUsers[defaultRoom]));
      console.log(`User ${user.userId} joined room after registration: ${defaultRoom}`);

      try {
        const messages = await Message.find({ room: defaultRoom }).sort({ timestamp: 1 }).limit(100);
        socket.emit('messageHistory', messages);
      } catch (err) {
        console.error('Error fetching messages after registration:', err.message, err.stack);
        socket.emit('error', { message: 'Ошибка при загрузке сообщений' });
      }

      socket.emit('userUpdate', {
        userId: user.userId,
        firstName: user.firstName,
        username: user.username,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        isRegistered: user.isRegistered,
        isHuman: user.isHuman,
        animalType: user.animalType,
        name: user.name,
      });
      console.log('Sent userUpdate with photoUrl:', user.photoUrl);

      if (callback) callback({ success: true });
    } catch (err) {
      console.error('Registration error:', err.message, err.stack);
      socket.emit('error', { message: 'Registration failed' });
      if (callback) callback({ success: false });
    }
  });

  socket.on('getCredits', async (callback) => {
    if (!socket.userData || !socket.userData.userId) {
      if (callback) callback({ success: false, message: 'Пользователь не аутентифицирован' });
      return;
    }
    try {
      const userCredits = await UserCredits.findOne({ userId: socket.userData.userId });
      if (callback) callback({ success: true, credits: userCredits ? userCredits.credits : 0 });
    } catch (err) {
      console.error('Error fetching credits:', err.message);
      if (callback) callback({ success: false, message: 'Ошибка при получении кредитов' });
    }
  });

  socket.on('joinRoom', async ({ room, lastTimestamp }) => {
    if (typeof room !== 'string') {
      console.error('Invalid room type:', room);
      socket.emit('error', { message: 'Некорректное название комнаты' });
      return;
    }

    if (!socket.userData || !socket.userData.userId) {
      console.error('User not authenticated for room join:', socket.id);
      socket.emit('error', { message: 'Пользователь не аутентифицирован' });
      return;
    }

    const user = await User.findOne({ userId: socket.userData.userId });
    if (!user) {
      socket.emit('error', { message: 'Пользователь не найден в базе' });
      return;
    }

    // Обновление lastRoom в базе данных
    try {
      await User.updateOne(
        { userId: socket.userData.userId },
        { lastRoom: room }
      );
      console.log(`Updated lastRoom for user ${socket.userData.userId} to ${room}`);
    } catch (error) {
      console.error(`Error updating lastRoom for user ${socket.userData.userId}:`, error);
    }


    // Проверяем, есть ли в инвентаре предметы-животные с playerID
    const userOwnerKey = `user_${socket.userData.userId}`;
    const animalItems = await Item.find({ owner: userOwnerKey, playerID: { $exists: true } });
    if (animalItems.length > 0) {
      const animalIds = animalItems.map(item => item.playerID);
      try {
        // Обновляем lastRoom для всех связанных животных
        await User.updateMany(
          { userId: { $in: animalIds } },
          { lastRoom: room }
        );
        console.log(`Updated lastRoom for animals ${animalIds.join(', ')} to ${room}`);

        // Уведомляем животных о перемещении
        animalIds.forEach(animalId => {
          const animalSocket = activeSockets.get(animalId);
          if (animalSocket) {
            animalSocket.leave(userCurrentRoom.get(animalId) || '');
            animalSocket.join(room);
            userCurrentRoom.set(animalId, room);

            // Удаляем животное из старой комнаты
            const oldRoom = userCurrentRoom.get(animalId);
            if (oldRoom && roomUsers[oldRoom]) {
              roomUsers[oldRoom].forEach(u => {
                if (u.userId === animalId) {
                  roomUsers[oldRoom].delete(u);
                }
              });
              io.to(oldRoom).emit('roomUsers', Array.from(roomUsers[oldRoom]));
            }

            // Добавляем животное в новую комнату
            if (!roomUsers[room]) roomUsers[room] = new Set();
            const animalUser = animalItems.find(item => item.playerID === animalId);
            roomUsers[room].add({
              userId: animalId,
              firstName: '',
              username: '',
              lastName: '',
              photoUrl: animalUser?.photoUrl || '',
              name: animalUser?.name || '',
              isHuman: false,
              inPocket: true // Устанавливаем inPocket: true для животного
            });
            io.to(room).emit('roomUsers', Array.from(roomUsers[room]));

            // Отправляем животному событие forceRoomChange
            animalSocket.emit('forceRoomChange', { newRoom: room });

            // Отправляем историю сообщений новой комнаты
            Message.find({ room }).sort({ timestamp: 1 }).limit(100)
              .then(messages => animalSocket.emit('messageHistory', messages))
              .catch(err => console.error('Error sending message history to animal:', err.message));
          }
        });
      } catch (error) {
        console.error(`Error updating lastRoom for animals:`, error);
      }
    }

    Object.keys(roomUsers).forEach(currentRoom => {
      if (currentRoom !== room) {
        roomUsers[currentRoom].forEach(user => {
          if (user.userId === socket.userData.userId) {
            roomUsers[currentRoom].delete(user);
            io.to(currentRoom).emit('roomUsers', Array.from(roomUsers[currentRoom]));
          }
        });
      }
    });

    userCurrentRoom.set(socket.userData.userId, room);

    const userInRoom = Array.from(roomUsers[room] || []).some(user => user.userId === socket.userData.userId);
    const isRejoining = userInRoom;

    if (!roomJoinTimes.has(socket)) {
      roomJoinTimes.set(socket, new Map());
    }
    const roomTimes = roomJoinTimes.get(socket);
    const lastJoinTime = roomTimes.get(room) || 0;
    const now = Date.now();
    const JOIN_COOLDOWN = 1000;

    if (isRejoining && (now - lastJoinTime < JOIN_COOLDOWN)) {
      console.log(`User ${socket.userData.userId} attempted to rejoin room: ${room} too quickly — skipping`);
      return;
    }

    if (isRejoining) {
      console.log(`User ${socket.userData.userId} already in room: ${room} — rejoining to fetch messages`);
    } else {
      socket.join(room);
      console.log(`User ${socket.userData.userId} joined room: ${room}`);
    }

    roomTimes.set(room, now);

    if (!roomUsers[room]) roomUsers[room] = new Set();
    roomUsers[room].forEach(user => {
      if (user.userId === socket.userData.userId) {
        roomUsers[room].delete(user);
      }
    });

    roomUsers[room].add({
      userId: socket.userData.userId,
      firstName: socket.userData.firstName,
      username: socket.userData.username,
      lastName: socket.userData.lastName,
      photoUrl: socket.userData.photoUrl,
      name: user.name,
      isHuman: user.isHuman,
      inPocket: userData.inPocket // Добавляем поле inPocket
    });

    io.to(room).emit('roomUsers', Array.from(roomUsers[room]));

    try {
      const query = {};
      if (room.startsWith('myhome_')) {
        query.room = room;
        query.userId = socket.userData.userId;
      } else {
        query.room = room;
      }

      if (lastTimestamp) {
        query.timestamp = { $gt: new Date(lastTimestamp) };
      } else {
        query.timestamp = { $exists: true };
      }

      const messages = await Message.find(query).sort({ timestamp: 1 }).limit(100);
      socket.emit('messageHistory', messages);
    } catch (err) {
      console.error('Error fetching messages:', err.message, err.stack);
      socket.emit('error', { message: 'Ошибка при загрузке сообщений' });
    }
  });

  socket.on('leaveRoom', (roomToLeave) => {
    if (roomUsers[roomToLeave]) {
      roomUsers[roomToLeave].forEach(user => {
        if (user.userId === socket.userData.userId) {
          roomUsers[roomToLeave].delete(user);
          io.to(roomToLeave).emit('roomUsers', Array.from(roomUsers[roomToLeave]));
          console.log(`User ${socket.userData.userId} left room: ${roomToLeave}`);
        }
      });
    }
  });

  socket.on('sendMessage', async (message) => {
    if (!socket.userData || !message || !message.room) {
      console.error('Invalid message data:', message);
      socket.emit('error', { message: 'Некорректные данные сообщения' });
      return;
    }

    try {
      const user = await User.findOne({ userId: socket.userData.userId });
      if (!user) {
        console.error('User not found for userId:', socket.userData.userId);
        socket.emit('error', { message: 'Пользователь не найден' });
        return;
      }

      const newMessage = new Message({
        userId: socket.userData.userId,
        text: message.text,
        firstName: user.firstName || '',
        username: user.username || '',
        lastName: user.lastName || '',
        photoUrl: user.photoUrl || '',
        name: user.name || '',
        isHuman: user.isHuman,
        animalType: user.animalType,
        room: message.room,
        timestamp: message.timestamp || new Date().toISOString(),
        animalText: message.animalText || undefined
      });
      await newMessage.save();

      // Обновляем активность, потом добавить на смену локации и авторизацию
      await User.updateOne(
        { userId: socket.userData.userId },
        { lastActivity: new Date() }
      );

      console.log('Message saved:', { text: newMessage.text, animalText: newMessage.animalText });
      io.to(message.room).emit('message', newMessage);

      // Логика для NPC "Ловец животных"
      const isAnimal = !user.isHuman && (user.animalType === 'Кошка' || user.animalType === 'Собака');
      const isCatchableLocation = message.room === 'Парк' || message.room === 'Район Дачный';
      const hasAnimalCatcher = (
        (message.room === 'Парк' && isLovecParkTime()) ||
        (message.room === 'Район Дачный' && isLovecDachnyTime())
      );

      console.log(`sendMessage - User data: ${JSON.stringify(user)}`);
      console.log('sendMessage - isAnimal:', isAnimal);
      console.log('sendMessage - isCatchableLocation:', isCatchableLocation);
      console.log('sendMessage - hasAnimalCatcher:', hasAnimalCatcher);
      console.log('sendMessage - Random chance (Math.random() < 0.1):', Math.random() < 0.1);

      if (isAnimal && isCatchableLocation && hasAnimalCatcher && Math.random() < 0.1) {
        const newRoom = 'Приют для животных "Кошкин дом"';
        console.log(`Attempting to update lastRoom for user ${socket.userData.userId} to ${newRoom}`);

        try {
          const updateResult = await User.updateOne(
            { userId: socket.userData.userId },
            { lastRoom: newRoom }
          );
          console.log(`Update result: ${JSON.stringify(updateResult)}`);
          if (updateResult.nModified === 0) {
            console.log(`No documents were updated for user ${socket.userData.userId}`);
          }

          // Проверяем обновление в базе данных
          const updatedUser = await User.findOne({ userId: socket.userData.userId });
          console.log(`Updated user lastRoom: ${updatedUser.lastRoom}`);
        } catch (error) {
          console.error(`Error updating lastRoom for user ${socket.userData.userId}:`, error);
        }

        socket.emit('forceRoomChange', { newRoom });

        // Удаляем пользователя из текущей комнаты
        if (roomUsers[message.room]) {
          roomUsers[message.room].forEach(u => {
            if (u.userId === socket.userData.userId) {
              roomUsers[message.room].delete(u);
            }
          });
          io.to(message.room).emit('roomUsers', Array.from(roomUsers[message.room]));
        }

        // Обновляем текущую комнату пользователя
        userCurrentRoom.set(socket.userData.userId, newRoom);
        socket.leave(message.room);
        socket.join(newRoom);

        // Добавляем пользователя в новую комнату
        if (!roomUsers[newRoom]) roomUsers[newRoom] = new Set();
        roomUsers[newRoom].add({
          userId: socket.userData.userId,
          firstName: socket.userData.firstName,
          username: socket.userData.username,
          lastName: socket.userData.lastName,
          photoUrl: socket.userData.photoUrl,
          name: user.name,
          isHuman: user.isHuman,
        });
        io.to(newRoom).emit('roomUsers', Array.from(roomUsers[newRoom]));

        // Отправляем историю сообщений новой комнаты
        const messages = await Message.find({ room: newRoom }).sort({ timestamp: 1 }).limit(100);
        socket.emit('messageHistory', messages);
      }
    } catch (err) {
      console.error('Error saving message:', err.message, err.stack);
      socket.emit('error', { message: 'Ошибка при сохранении сообщения' });
    }
  });

  // Функции проверки времени для ловцов (добавим их перед io.on('connection'))
  const isLovecParkTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 8 * 60;   // 8:00
    const endMinutes = 23 * 60;    // 23:00
    // const startMinutes = 1 * 60;   // 8:00
    // const endMinutes = 9 * 60;    // 23:00

    return totalMinutes >= startMinutes && totalMinutes <= endMinutes && hours % 2 === 0;
    // return totalMinutes >= startMinutes && totalMinutes <= endMinutes && hours % 2 !== 0;

  };

  // const isLovecDachnyTime = () => {
  //   const now = new Date();
  //   const hours = now.getHours();
  //   const minutes = now.getMinutes();
  //   const totalMinutes = hours * 60 + minutes;
  //   const startMinutes = 7 * 60;   // 7:00
  //   const endMinutes = 22 * 60;    // 22:00
  //   return totalMinutes >= startMinutes && totalMinutes <= endMinutes && hours % 2 !== 0;
  // };
  const isLovecDachnyTime = () => true;

  socket.on('getItems', async ({ owner }) => {
    try {
      if (itemCache.has(owner)) {
        socket.emit('items', { owner, items: itemCache.get(owner) });
        return;
      }

      const items = await Item.find({ owner });
      itemCache.set(owner, items);
      socket.emit('items', { owner, items });
    } catch (err) {
      console.error('Error fetching items:', err.message, err.stack);
    }
  });

  socket.on('getInventoryLimit', async ({ owner }) => {
    try {
      const limit = await InventoryLimit.findOne({ owner });
      socket.emit('inventoryLimit', limit);
    } catch (err) {
      console.error('Error fetching inventory limit:', err.message, err.stack);
    }
  });

  socket.on('addItem', async ({ owner, item }, callback) => {
    try {
      console.log('Received item data:', { owner, item }); // Для отладки
      if (!item || typeof item !== 'object') {
        console.error('Invalid item data:', item);
        if (callback) callback({ success: false, message: 'Некорректные данные предмета' });
        return;
      }

      if (item._id) {
        itemLocks.set(item._id, true);
      }

      const ownerLimit = await InventoryLimit.findOne({ owner });
      if (!ownerLimit) {
        if (item._id) itemLocks.delete(item._id);
        if (callback) callback({ success: false, message: 'Лимиты инвентаря не найдены' });
        return;
      }

      const itemWeight = parseFloat(item.weight) || 0;
      if (ownerLimit.currentWeight + itemWeight > ownerLimit.maxWeight) {
        if (item._id) itemLocks.delete(item._id);
        if (callback) callback({ success: false, message: 'Превышен лимит веса' });
        return;
      }

      const newItem = await Item.create({ owner, ...item }); // Распаковываем item
      console.log('Saved item:', newItem); // Для отладки

      await InventoryLimit.updateOne(
        { owner },
        { $inc: { currentWeight: itemWeight } }
      );

      const ownerItems = itemCache.get(owner) || [];
      itemCache.set(owner, [...ownerItems, newItem]);

      const updatedLimit = await InventoryLimit.findOne({ owner });
      socket.emit('inventoryLimit', updatedLimit);

      const currentRoom = userCurrentRoom.get(socket.userData.userId);
      if (currentRoom) {
        io.to(currentRoom).emit('itemAction', { action: 'add', owner, item: newItem });
        io.to(currentRoom).emit('items', { owner, items: itemCache.get(owner) });
        io.to(currentRoom).emit('inventoryLimit', updatedLimit);
      }

      io.to(owner).emit('items', { owner, items: itemCache.get(owner) }); // Уведомляем владельца

      if (callback) callback({ success: true });
      if (item._id) itemLocks.delete(item._id);
    } catch (err) {
      console.error('Error adding item:', err.message, err.stack);
      if (item._id) itemLocks.delete(item._id);
      if (callback) callback({ success: false, message: 'Ошибка при добавлении предмета' });
    }
  });

  socket.on('moveItem', async ({ itemIds, newOwner }) => {
    try {
      let ids = Array.isArray(itemIds) ? itemIds : [itemIds]; // Поддержка как массива, так и одиночного ID
      const items = await Item.find({ _id: { $in: ids } });
      if (items.length !== ids.length) {
        socket.emit('error', { message: 'Некоторые предметы не найдены' });
        return;
      }

      const oldOwner = items[0].owner; // Предполагаем, что все предметы из одного инвентаря
      const totalWeight = items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);

      const newOwnerLimit = await InventoryLimit.findOne({ owner: newOwner });
      if (!newOwnerLimit || newOwnerLimit.currentWeight + totalWeight > newOwnerLimit.maxWeight) {
        socket.emit('error', { message: 'Превышен лимит веса в месте назначения' });
        return;
      }

      await Item.updateMany({ _id: { $in: ids } }, { owner: newOwner });
      await InventoryLimit.updateOne({ owner: oldOwner }, { $inc: { currentWeight: -totalWeight } });
      await InventoryLimit.updateOne({ owner: newOwner }, { $inc: { currentWeight: totalWeight } });

      const updatedItems = await Item.find({ _id: { $in: ids } });
      updatedItems.forEach(item => {
        const cachedOldOwnerItems = itemCache.get(oldOwner) || [];
        itemCache.set(oldOwner, cachedOldOwnerItems.filter(i => i._id.toString() !== item._id.toString()));
        const cachedNewOwnerItems = itemCache.get(newOwner) || [];
        itemCache.set(newOwner, [...cachedNewOwnerItems, item]);
      });

      const oldOwnerLimit = await InventoryLimit.findOne({ owner: oldOwner });
      const newOwnerLimitUpdated = await InventoryLimit.findOne({ owner: newOwner });

      socket.emit('inventoryLimit', oldOwnerLimit);
      socket.emit('inventoryLimit', newOwnerLimitUpdated);
      io.to(oldOwner).emit('items', { owner: oldOwner, items: itemCache.get(oldOwner) });
      io.to(newOwner).emit('items', { owner: newOwner, items: itemCache.get(newOwner) });

      const currentRoom = userCurrentRoom.get(socket.userData.userId);
      if (currentRoom) {
        io.to(currentRoom).emit('itemAction', { action: 'remove', owner: oldOwner, itemId: ids });
        io.to(currentRoom).emit('itemAction', { action: 'add', owner: newOwner, item: updatedItems[0] });
        io.to(currentRoom).emit('inventoryLimit', oldOwnerLimit);
        io.to(currentRoom).emit('inventoryLimit', newOwnerLimitUpdated);
      }
    } catch (err) {
      console.error('Error moving items:', err.message, err.stack);
      socket.emit('error', { message: 'Ошибка при перемещении предметов' });
    }
  });

  socket.on('pickupItem', async ({ itemId }) => {
    try {
      if (itemLocks.has(itemId)) {
        socket.emit('error', { message: 'Этот предмет уже обрабатывается другим пользователем' });
        return;
      }

      itemLocks.set(itemId, true);

      const item = await Item.findById(itemId);
      if (!item) {
        itemLocks.delete(itemId);
        socket.emit('error', { message: 'Предмет не найден' });
        return;
      }

      const userOwnerKey = `user_${socket.userData.userId}`;
      const oldOwner = item.owner;
      const itemWeight = parseFloat(item.weight) || 0;

      const userLimit = await InventoryLimit.findOne({ owner: userOwnerKey });
      if (userLimit.currentWeight + itemWeight > userLimit.maxWeight) {
        itemLocks.delete(itemId);
        socket.emit('error', { message: 'Превышен лимит веса у пользователя' });
        return;
      }

      const oldOwnerLimit = await InventoryLimit.findOne({ owner: oldOwner });
      if (!oldOwnerLimit) {
        itemLocks.delete(itemId);
        socket.emit('error', { message: 'Лимиты инвентаря не найдены' });
        return;
      }

      item.owner = userOwnerKey;
      await item.save();

      await InventoryLimit.updateOne(
        { owner: oldOwner },
        { $inc: { currentWeight: -itemWeight } }
      );
      await InventoryLimit.updateOne(
        { owner: userOwnerKey },
        { $inc: { currentWeight: itemWeight } }
      );

      const oldOwnerItems = itemCache.get(oldOwner) || [];
      itemCache.set(oldOwner, oldOwnerItems.filter(i => i._id.toString() !== itemId));
      const userItems = itemCache.get(userOwnerKey) || [];
      itemCache.set(userOwnerKey, [...userItems, item]);

      const updatedOldLimit = await InventoryLimit.findOne({ owner: oldOwner });
      const updatedUserLimit = await InventoryLimit.findOne({ owner: userOwnerKey });
      socket.emit('inventoryLimit', updatedOldLimit);
      socket.emit('inventoryLimit', updatedUserLimit);

      const currentRoom = userCurrentRoom.get(socket.userData.userId);
      if (currentRoom) {
        io.to(currentRoom).emit('itemAction', { action: 'remove', owner: oldOwner, itemId });
        io.to(currentRoom).emit('itemAction', { action: 'add', owner: userOwnerKey, item });
        io.to(currentRoom).emit('items', { owner: oldOwner, items: itemCache.get(oldOwner) });
        io.to(currentRoom).emit('items', { owner: userOwnerKey, items: itemCache.get(userOwnerKey) });
        io.to(currentRoom).emit('inventoryLimit', updatedOldLimit);
        io.to(currentRoom).emit('inventoryLimit', updatedUserLimit);
      }

      itemLocks.delete(itemId);
    } catch (err) {
      console.error('Error picking up item:', err.message, err.stack);
      itemLocks.delete(itemId);
      socket.emit('error', { message: 'Ошибка при подборе предмета' });
    }
  });

  socket.on('deleteItem', async ({ itemId }) => {
    try {
      if (itemLocks.has(itemId)) {
        socket.emit('error', { message: 'Этот предмет уже обрабатывается другим пользователем' });
        return;
      }

      itemLocks.set(itemId, true);

      const item = await Item.findById(itemId);
      if (!item) {
        itemLocks.delete(itemId);
        socket.emit('error', { message: 'Предмет не найден' });
        return;
      }

      const owner = item.owner;
      const itemWeight = parseFloat(item.weight) || 0;

      await Item.deleteOne({ _id: itemId });

      let trashItem = null;
      if (item.name !== 'Мусор') {
        trashItem = new Item({
          name: 'Мусор',
          description: 'Раньше это было чем-то полезным',
          rarity: 'Бесполезный',
          weight: itemWeight,
          cost: 1,
          effect: 'Чувство обременения чем-то бесполезным',
          owner: owner
        });
        await trashItem.save();
        console.log('Created trash item:', trashItem);
      }

      await InventoryLimit.updateOne(
        { owner },
        { $inc: { currentWeight: trashItem ? 0 : -itemWeight } }
      );

      const ownerItems = itemCache.get(owner) || [];
      itemCache.set(owner, ownerItems.filter(i => i._id.toString() !== itemId).concat(trashItem ? [trashItem] : []));

      const updatedLimit = await InventoryLimit.findOne({ owner });
      socket.emit('inventoryLimit', updatedLimit);

      const updatedItems = await Item.find({ owner });
      console.log('Sending updated items after delete:', updatedItems);
      io.to(owner).emit('items', { owner, items: updatedItems });

      itemLocks.delete(itemId);
    } catch (err) {
      console.error('Error deleting item:', err.message, err.stack);
      itemLocks.delete(itemId);
      socket.emit('error', { message: 'Ошибка при удалении предмета' });
    }
  });

  socket.on('takeAnimalHome', async ({ animalId }) => {
    try {
      if (!socket.userData || !socket.userData.userId) {
        socket.emit('error', { message: 'Пользователь не аутентифицирован' });
        return;
      }

      // Проверяем, что текущий пользователь — человек
      const humanUser = await User.findOne({ userId: socket.userData.userId });
      if (!humanUser || !humanUser.isHuman) {
        socket.emit('error', { message: 'Только люди могут забирать животных домой' });
        return;
      }

      // Проверяем, что животное существует и находится в приюте
      const animalUser = await User.findOne({ userId: animalId });
      if (!animalUser || animalUser.isHuman || !animalUser.homeless || animalUser.inPocket) {
        socket.emit('error', { message: 'Животное не найдено или уже забрано' });
        return;
      }

      const currentRoom = userCurrentRoom.get(socket.userData.userId);
      if (currentRoom !== 'Приют для животных "Кошкин дом"') {
        socket.emit('error', { message: 'Вы должны находиться в приюте, чтобы забрать животное' });
        return;
      }

      // Создаём предмет-животное в инвентаре человека
      const userOwnerKey = `user_${socket.userData.userId}`;
      const animalItem = new Item({
        owner: userOwnerKey,
        name: animalUser.name,
        description: animalUser.animalType, // Тип животного (Кошка или Собака) как описание
        weight: 0, // Вес не учитывается
        playerID: animalId // Добавляем ID игрока-животного
      });
      await animalItem.save();

      // Обновляем поле inPocket у животного
      await User.updateOne(
        { userId: animalId },
        { inPocket: true }
      );

      // Обновляем кэш предметов
      const ownerItems = itemCache.get(userOwnerKey) || [];
      itemCache.set(userOwnerKey, [...ownerItems, animalItem]);

      // Уведомляем клиента об обновлении инвентаря
      io.to(userOwnerKey).emit('items', { owner: userOwnerKey, items: itemCache.get(userOwnerKey) });

      // Обновляем список животных в приюте
      const shelterAnimals = await User.find({
        lastRoom: 'Приют для животных "Кошкин дом"',
        homeless: true,
        inPocket: false,
        isHuman: false
      }).select('userId name photoUrl lastActivity isHuman animalType');

      const now = new Date();
      const animalsWithStatus = shelterAnimals.map(animal => ({
        userId: animal.userId,
        name: animal.name,
        photoUrl: animal.photoUrl,
        isOnline: (now - new Date(animal.lastActivity || 0)) < 5 * 60 * 1000,
        animalType: animal.animalType
      }));

      // Уведомляем всех в комнате приюта об обновлённом списке животных
      io.to('Приют для животных "Кошкин дом"').emit('shelterAnimals', animalsWithStatus);

      console.log(`User ${socket.userData.userId} took animal ${animalId} home`);
    } catch (err) {
      console.error('Error in takeAnimalHome:', err.message, err.stack);
      socket.emit('error', { message: 'Ошибка при попытке забрать животное домой' });
    }
  });

  socket.on('utilizeTrash', async (callback) => {
    if (!socket.userData || !socket.userData.userId) {
      if (callback) callback({ success: false, message: 'Пользователь не аутентифицирован' });
      return;
    }

    try {
      const owner = `user_${socket.userData.userId}`;
      const trashItems = await Item.find({ owner, name: 'Мусор' });

      if (trashItems.length === 0) {
        if (callback) callback({ success: false, message: 'У вас нет мусора для утилизации' });
        return;
      }

      let totalWeight = 0;
      let totalCredits = 0;
      for (const item of trashItems) {
        totalWeight += parseFloat(item.weight) || 0;
        totalCredits += parseFloat(item.cost) || 0;
        await Item.deleteOne({ _id: item._id });
      }

      const creditsEarned = Math.floor(totalCredits);

      await InventoryLimit.updateOne(
        { owner },
        { $inc: { currentWeight: -totalWeight } }
      );

      const userCredits = await UserCredits.findOneAndUpdate(
        { userId: socket.userData.userId },
        { $inc: { credits: creditsEarned } },
        { new: true, upsert: true }
      );

      const updatedItems = await Item.find({ owner });
      itemCache.set(owner, updatedItems);
      console.log('Trash items deleted for:', owner);
      console.log('Credits earned:', creditsEarned);
      console.log('Sending updated items:', updatedItems);
      io.to(owner).emit('items', { owner, items: updatedItems });

      const updatedLimit = await InventoryLimit.findOne({ owner });
      io.to(owner).emit('inventoryLimit', updatedLimit);

      socket.emit('creditsUpdate', userCredits.credits);
      console.log('Sent creditsUpdate to client:', userCredits.credits);

      if (callback) callback({ success: true, message: `Мусор утилизирован. Получено ${creditsEarned} кредитов.` });
    } catch (err) {
      console.error('Error utilizing trash:', err.message, err.stack);
      if (callback) callback({ success: false, message: 'Ошибка при утилизации мусора' });
    }
  });

  socket.on('removeItems', async (data) => {
    try {
      const { owner, name, count } = data;
      const items = await Item.find({ owner, name }).limit(count);

      if (items.length < count) {
        socket.emit('error', { message: `Недостаточно предметов "${name}" для удаления` });
        return;
      }

      const itemIds = items.map(item => item._id);
      const totalWeight = items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);

      await Item.deleteMany({ _id: { $in: itemIds } });

      await InventoryLimit.updateOne(
        { owner },
        { $inc: { currentWeight: -totalWeight } }
      );

      const updatedItems = await Item.find({ owner });
      itemCache.set(owner, updatedItems);

      const updatedLimit = await InventoryLimit.findOne({ owner });
      io.to(owner).emit('items', { owner, items: updatedItems });
      io.to(owner).emit('inventoryLimit', updatedLimit);

      const currentRoom = userCurrentRoom.get(socket.userData.userId);
      if (currentRoom) {
        io.to(currentRoom).emit('itemAction', { action: 'remove', owner, itemIds });
        io.to(currentRoom).emit('items', { owner, items: updatedItems });
        io.to(currentRoom).emit('inventoryLimit', updatedLimit);
      }
    } catch (err) {
      console.error('Error removing items:', err.message, err.stack);
      socket.emit('error', { message: 'Ошибка при удалении предметов' });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);

    if (socket.userData && socket.userData.userId) {
      if (activeSockets.get(socket.userData.userId) === socket) {
        activeSockets.delete(socket.userData.userId);
        console.log(`Removed socket for user ${socket.userData.userId}`);

        Object.keys(roomUsers).forEach(room => {
          roomUsers[room].forEach(user => {
            if (user.userId === socket.userData.userId) {
              roomUsers[room].delete(user);
            }
          });
          io.to(room).emit('roomUsers', Array.from(roomUsers[room]));
        });

        userCurrentRoom.delete(socket.userData.userId);
      }
    }

    if (roomJoinTimes.has(socket)) {
      roomJoinTimes.delete(socket);
    }
  });
});

server.listen(4000, () => {
  console.log('Server running on port 4000');
});
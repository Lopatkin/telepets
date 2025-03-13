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

// Схема сообщений
const messageSchema = new mongoose.Schema({
  userId: String,
  text: String,
  firstName: String,
  username: String,
  lastName: String,
  photoUrl: String,
  room: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Схема предметов (изменили weight и cost на Number)
const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
  rarity: String,
  weight: Number, // Изменили с String на Number
  cost: Number,   // Изменили с String на Number
  effect: String,
  owner: String,
});

const Item = mongoose.model('Item', itemSchema);

// Схема для хранения ограничений по весу
const inventoryLimitSchema = new mongoose.Schema({
  owner: String,
  maxWeight: Number,
  currentWeight: { type: Number, default: 0 }
});

const userCreditsSchema = new mongoose.Schema({
  userId: { type: String, unique: true }, // Уникальный ID пользователя
  credits: { type: Number, default: 0, min: 0 } // Количество кредитов, не отрицательное
});

const UserCredits = mongoose.model('UserCredits', userCreditsSchema);

const InventoryLimit = mongoose.model('InventoryLimit', inventoryLimitSchema);

// Хранилище активных пользователей по комнатам
const roomUsers = {};

// Хранилище текущей комнаты для каждого пользователя
const userCurrentRoom = new Map();

// Хранилище активных сокетов для предотвращения дублирования
const activeSockets = new Map();

// Хранилище времени последнего входа в комнаты для каждого сокета
const roomJoinTimes = new WeakMap();

// Кэш предметов
const itemCache = new Map();

// Хранилище блокировок предметов
const itemLocks = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('auth', async (userData, callback) => {
    if (!userData || !userData.userId) {
      console.error('Invalid user data:', userData);
      if (callback) callback({ success: false, message: 'Некорректные данные пользователя' });
      return;
    }

    socket.userData = {
      userId: userData.userId.toString(),
      firstName: userData.firstName || '',
      username: userData.username || '',
      lastName: userData.lastName || '',
      photoUrl: userData.photoUrl || ''
    };
    console.log('Authenticated user:', socket.userData.userId, 'PhotoURL:', socket.userData.photoUrl);

    if (activeSockets.has(socket.userData.userId)) {
      console.log(`User ${socket.userData.userId} already connected with socket ${activeSockets.get(socket.userData.userId)}. Disconnecting old socket.`);
      const oldSocket = activeSockets.get(socket.userData.userId);
      oldSocket.disconnect();
    }

    activeSockets.set(socket.userData.userId, socket);

    const userOwnerKey = `user_${socket.userData.userId}`;
    const myHomeOwnerKey = `myhome_${socket.userData.userId}`;

    // Проверяем и создаём запись о кредитах для пользователя
    let userCredits = await UserCredits.findOne({ userId: socket.userData.userId });
    if (!userCredits) {
      userCredits = await UserCredits.create({
        userId: socket.userData.userId,
        credits: 0
      });
    }

    // Отправляем текущее количество кредитов клиенту после авторизации
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
        maxWeight: 500 // Лимит для "Мой дом": 500 кг
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
      'Парк',
      'Полигон утилизации',
      'Приют для животных "Кошкин дом"',
      'Район Дачный',
      'Торговый центр "Карнавал"',
    ];
    for (const room of rooms) {
      const roomLimit = await InventoryLimit.findOne({ owner: room });
      if (!roomLimit) {
        await InventoryLimit.create({
          owner: room,
          maxWeight: 10000 // Лимит для всех остальных комнат: 10 000 кг
        });
      }
    }

    // Используем последнюю комнату пользователя, если она передана, иначе дефолтную
    const defaultRoom = userData.lastRoom && rooms.includes(userData.lastRoom) ? userData.lastRoom : 'Автобусная остановка';
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
      photoUrl: socket.userData.photoUrl
    });

    io.to(defaultRoom).emit('roomUsers', Array.from(roomUsers[defaultRoom]));
    console.log(`User ${socket.userData.userId} auto-joined room: ${defaultRoom}`);

    // Отправляем историю сообщений для дефолтной комнаты
    try {
      const messages = await Message.find({ room: defaultRoom }).sort({ timestamp: 1 }).limit(100);
      socket.emit('messageHistory', messages);
    } catch (err) {
      console.error('Error fetching messages for default room:', err.message, err.stack);
      socket.emit('error', { message: 'Ошибка при загрузке сообщений' });
    }

    socket.emit('authSuccess', { defaultRoom }); // Передаем дефолтную комнату клиенту
    if (callback) callback({ success: true });
  });

  // Добавляем событие для получения текущего количества кредитов
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
    // Проверка на валидность комнаты
    if (typeof room !== 'string') {
      console.error('Invalid room type:', room);
      socket.emit('error', { message: 'Некорректное название комнаты' });
      return;
    }

    // Проверка на наличие socket.userData
    if (!socket.userData || !socket.userData.userId) {
      console.error('User not authenticated for room join:', socket.id);
      socket.emit('error', { message: 'Пользователь не аутентифицирован' });
      return;
    }

    // Удаление пользователя из других комнат
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

    const maxWait = 2000;
    const startTime = Date.now();
    while (!socket.userData && (Date.now() - startTime < maxWait)) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!socket.userData || !socket.userData.userId) {
      console.error('User not authenticated for room join:', socket.id);
      return;
    }

    // Установка текущей комнаты для пользователя
    userCurrentRoom.set(socket.userData.userId, room);

    // Проверка, находится ли пользователь уже в комнате
    const userInRoom = Array.from(roomUsers[room] || []).some(user => user.userId === socket.userData.userId);
    const isRejoining = userInRoom;

    // Проверка на кулдаун для повторного входа
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

    // Удаление старой записи пользователя из комнаты (если есть)
    if (!roomUsers[room]) roomUsers[room] = new Set();
    roomUsers[room].forEach(user => {
      if (user.userId === socket.userData.userId) {
        roomUsers[room].delete(user);
      }
    });

    // Добавление пользователя в комнату
    roomUsers[room].add({
      userId: socket.userData.userId,
      firstName: socket.userData.firstName,
      username: socket.userData.username,
      lastName: socket.userData.lastName,
      photoUrl: socket.userData.photoUrl
    });

    io.to(room).emit('roomUsers', Array.from(roomUsers[room]));

    // Получение истории сообщений
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
      return;
    }

    try {
      const newMessage = new Message({
        userId: socket.userData.userId,
        text: message.text,
        firstName: socket.userData.firstName || '',
        username: socket.userData.username || '',
        lastName: socket.userData.lastName || '',
        photoUrl: socket.userData.photoUrl || '',
        room: message.room,
        timestamp: message.timestamp || new Date().toISOString()
      });
      await newMessage.save();
      io.to(message.room).emit('message', newMessage);
    } catch (err) {
      console.error('Error saving message:', err.message, err.stack);
    }
  });

  // Получение предметов
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

  // Получение лимитов инвентаря
  socket.on('getInventoryLimit', async ({ owner }) => {
    try {
      const limit = await InventoryLimit.findOne({ owner });
      socket.emit('inventoryLimit', limit);
    } catch (err) {
      console.error('Error fetching inventory limit:', err.message, err.stack);
    }
  });

  // Добавление предмета
  socket.on('addItem', async ({ owner, item }, callback) => {
    try {
      if (item._id && itemLocks.has(item._id)) {
        if (callback) callback({ success: false, message: 'Этот предмет уже обрабатывается' });
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

      // Создаём новый предмет, не передаём _id, если он есть, чтобы MongoDB сгенерировал его
      const newItem = new Item({
        name: item.name,
        description: item.description,
        rarity: item.rarity,
        weight: item.weight,
        cost: item.cost,
        effect: item.effect,
        owner: owner
      });
      await newItem.save();

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

      if (callback) callback({ success: true });
      if (item._id) itemLocks.delete(item._id);
    } catch (err) {
      console.error('Error adding item:', err.message, err.stack);
      if (item._id) itemLocks.delete(item._id);
      if (callback) callback({ success: false, message: 'Ошибка при добавлении предмета' });
    }
  });

  // Перемещение предмета
  socket.on('moveItem', async ({ itemId, newOwner }) => {
    try {
      const item = await Item.findById(itemId);
      if (!item) {
        socket.emit('error', { message: 'Предмет не найден' });
        return;
      }

      const oldOwner = item.owner;
      const itemWeight = parseFloat(item.weight) || 0;

      const oldOwnerLimit = await InventoryLimit.findOne({ owner: oldOwner });
      const newOwnerLimit = await InventoryLimit.findOne({ owner: newOwner });

      if (!oldOwnerLimit || !newOwnerLimit) {
        socket.emit('error', { message: 'Лимиты инвентаря не найдены' });
        return;
      }

      if (newOwnerLimit.currentWeight + itemWeight > newOwnerLimit.maxWeight) {
        socket.emit('error', { message: 'Превышен лимит веса в новом месте' });
        return;
      }

      item.owner = newOwner;
      await item.save();

      await InventoryLimit.updateOne(
        { owner: oldOwner },
        { $inc: { currentWeight: -itemWeight } }
      );
      await InventoryLimit.updateOne(
        { owner: newOwner },
        { $inc: { currentWeight: itemWeight } }
      );

      const oldOwnerItems = itemCache.get(oldOwner) || [];
      itemCache.set(oldOwner, oldOwnerItems.filter(i => i._id.toString() !== itemId));
      const newOwnerItems = itemCache.get(newOwner) || [];
      itemCache.set(newOwner, [...newOwnerItems, item]);

      const updatedOldLimit = await InventoryLimit.findOne({ owner: oldOwner });
      const updatedNewLimit = await InventoryLimit.findOne({ owner: newOwner });
      socket.emit('inventoryLimit', updatedOldLimit);
      socket.emit('inventoryLimit', updatedNewLimit);

      const currentRoom = userCurrentRoom.get(socket.userData.userId);
      if (currentRoom) {
        io.to(currentRoom).emit('itemAction', { action: 'remove', owner: oldOwner, itemId });
        io.to(currentRoom).emit('itemAction', { action: 'add', owner: newOwner, item });
        io.to(currentRoom).emit('items', { owner: oldOwner, items: itemCache.get(oldOwner) });
        io.to(currentRoom).emit('items', { owner: newOwner, items: itemCache.get(newOwner) });
        io.to(currentRoom).emit('inventoryLimit', updatedOldLimit);
        io.to(currentRoom).emit('inventoryLimit', updatedNewLimit);
      }
    } catch (err) {
      console.error('Error moving item:', err.message, err.stack);
      socket.emit('error', { message: 'Ошибка при перемещении предмета' });
    }
  });

  // Подбор предмета
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

  // Удаление предмета
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

      // Создаём "Мусор", если удалённый предмет не был "Мусором"
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
        { $inc: { currentWeight: trashItem ? 0 : -itemWeight } } // Если создали "Мусор", вес остаётся, иначе уменьшаем
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

  // Утилизация мусора
  // Утилизация мусора
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

      // Отправляем обновление кредитов напрямую клиенту
      socket.emit('creditsUpdate', userCredits.credits);
      console.log('Sent creditsUpdate to client:', userCredits.credits);

      if (callback) callback({ success: true, message: `Мусор утилизирован. Получено ${creditsEarned} кредитов.` });
    } catch (err) {
      console.error('Error utilizing trash:', err.message, err.stack);
      if (callback) callback({ success: false, message: 'Ошибка при утилизации мусора' });
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
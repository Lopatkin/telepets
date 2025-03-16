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

// Схема пользователя для регистрации
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
  credits: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// Остальные схемы остаются без изменений
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

const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
  rarity: String,
  weight: Number,
  cost: Number,
  effect: String,
  owner: String,
});
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

// Хранилища остаются без изменений
const roomUsers = {};
const userCurrentRoom = new Map();
const activeSockets = new Map();
const roomJoinTimes = new WeakMap();
const itemCache = new Map();
const itemLocks = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('auth', async (userData, callback) => {
    if (!userData || !userData.userId) {
      console.error('Invalid user data:', userData);
      if (callback) callback({ success: false, message: 'Некорректные данные пользователя' });
      return;
    }

    // Проверяем или создаём пользователя в базе данных
    let user = await User.findOne({ userId: userData.userId });
    if (!user) {
      user = new User({
        userId: userData.userId.toString(),
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        username: userData.username || '',
        photoUrl: userData.photoUrl || '',
        isRegistered: false
      });
      await user.save();
      console.log('New user created:', user.userId);
    } else {
      console.log('User authenticated:', user.userId);
    }

    socket.userData = {
      userId: user.userId,
      firstName: user.firstName,
      username: user.username,
      lastName: user.lastName,
      photoUrl: user.photoUrl
    };
    console.log('Received auth data:', userData);
    console.log('Authenticated user:', socket.userData.userId, 'PhotoURL:', socket.userData.photoUrl);

    if (activeSockets.has(socket.userData.userId)) {
      console.log(`User ${socket.userData.userId} already connected with socket ${activeSockets.get(socket.userData.userId)}. Disconnecting old socket.`);
      const oldSocket = activeSockets.get(socket.userData.userId);
      oldSocket.disconnect();
    }

    activeSockets.set(socket.userData.userId, socket);

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
        maxWeight: 1000 // Большой лимит для мастерской
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
    console.log('Available static rooms:', rooms);
    console.log('Received lastRoom:', userData.lastRoom);

    // Проверяем, является ли lastRoom личным домом пользователя или статической комнатой
    const isMyHome = userData.lastRoom && userData.lastRoom === `myhome_${socket.userData.userId}`;
    const isStaticRoom = userData.lastRoom && rooms.includes(userData.lastRoom);
    const defaultRoom = user.isRegistered ? (isMyHome || isStaticRoom ? userData.lastRoom : 'Полигон утилизации') : 'Автобусная остановка';
    console.log('Is lastRoom a personal home?', isMyHome);
    console.log('Is lastRoom a static room?', isStaticRoom);
    console.log('Selected defaultRoom:', defaultRoom);

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
          name: data.name
        },
        { new: true }
      );
      if (!user) {
        socket.emit('error', { message: 'User not found' });
        if (callback) callback({ success: false });
        return;
      }
      console.log('Registration completed for user:', user.userId);

      // После успешной регистрации переводим игрока в "Автобусная остановка"
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
        photoUrl: user.photoUrl
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
      photoUrl: socket.userData.photoUrl
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

  socket.on('addItem', async (item, callback) => {
    try {
      const owner = item.owner;
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

      io.to(owner).emit('items', { owner, items: itemCache.get(owner) });

      if (callback) callback({ success: true });
      if (item._id) itemLocks.delete(item._id);
    } catch (err) {
      console.error('Error adding item:', err.message, err.stack);
      if (item._id) itemLocks.delete(item._id);
      if (callback) callback({ success: false, message: 'Ошибка при добавлении предмета' });
    }
  });

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
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

// Схема предметов
const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
  rarity: String,
  weight: String,
  cost: String,
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

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('auth', async (userData) => {
    if (!userData || !userData.userId) {
      console.error('Invalid user data:', userData);
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

    // Инициализация лимитов для пользователя
    const userLimit = await InventoryLimit.findOne({ owner: userOwnerKey });
    if (!userLimit) {
      await InventoryLimit.create({
        owner: userOwnerKey,
        maxWeight: 10
      });
      const stick = new Item({
        name: 'Палка',
        description: 'Многофункциональная вещь',
        rarity: 'Обычный',
        weight: '2 кг',
        cost: '5 кредитов',
        effect: 'Вы чувствуете себя более уверенно в тёмное время суток',
        owner: userOwnerKey
      });
      await stick.save();
      await InventoryLimit.updateOne(
        { owner: userOwnerKey },
        { $inc: { currentWeight: 2 } }
      );
    }

    // Инициализация лимитов для "Мой дом"
    const myHomeLimit = await InventoryLimit.findOne({ owner: myHomeOwnerKey });
    if (!myHomeLimit) {
      await InventoryLimit.create({
        owner: myHomeOwnerKey,
        maxWeight: 20
      });
    }

    // Инициализация лимитов для остальных комнат
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
      'Приют для животных "Кошкин дом"',
      'Район Дачный',
      'Торговый центр "Карнавал"',
    ];
    for (const room of rooms) {
      const roomLimit = await InventoryLimit.findOne({ owner: room });
      if (!roomLimit) {
        await InventoryLimit.create({
          owner: room,
          maxWeight: 20
        });
      }
    }
  });

  socket.on('joinRoom', async ({ room, lastTimestamp }) => {
    if (typeof room !== 'string') {
      console.error('Invalid room type:', room);
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

    const maxWait = 2000;
    const startTime = Date.now();
    while (!socket.userData && (Date.now() - startTime < maxWait)) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!socket.userData || !socket.userData.userId) {
      console.error('User not authenticated for room join:', socket.id);
      return;
    }

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
        socket.emit('items', itemCache.get(owner));
        return;
      }

      const items = await Item.find({ owner });
      itemCache.set(owner, items);
      socket.emit('items', items);
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

      // Обновляем владельца предмета
      item.owner = newOwner;
      await item.save();

      // Обновляем вес
      await InventoryLimit.updateOne(
        { owner: oldOwner },
        { $inc: { currentWeight: -itemWeight } }
      );
      await InventoryLimit.updateOne(
        { owner: newOwner },
        { $inc: { currentWeight: itemWeight } }
      );

      // Обновляем кэш
      const oldOwnerItems = itemCache.get(oldOwner) || [];
      itemCache.set(oldOwner, oldOwnerItems.filter(i => i._id.toString() !== itemId));
      const newOwnerItems = itemCache.get(newOwner) || [];
      itemCache.set(newOwner, [...newOwnerItems, item]);

      // Обновляем лимиты на клиенте
      const updatedOldLimit = await InventoryLimit.findOne({ owner: oldOwner });
      const updatedNewLimit = await InventoryLimit.findOne({ owner: newOwner });
      socket.emit('inventoryLimit', updatedOldLimit);
      socket.emit('inventoryLimit', updatedNewLimit);

      // Уведомляем клиента об успешном перемещении
      socket.emit('items', itemCache.get(oldOwner));
      socket.emit('items', itemCache.get(newOwner));
    } catch (err) {
      console.error('Error moving item:', err.message, err.stack);
      socket.emit('error', { message: 'Ошибка при перемещении предмета' });
    }
  });

  // Подбор предмета
  socket.on('pickupItem', async ({ itemId }) => {
    try {
      const item = await Item.findById(itemId);
      if (!item) {
        socket.emit('error', { message: 'Предмет не найден' });
        return;
      }

      const userOwnerKey = `user_${socket.userData.userId}`;
      const oldOwner = item.owner;
      const itemWeight = parseFloat(item.weight) || 0;

      const userLimit = await InventoryLimit.findOne({ owner: userOwnerKey });
      if (userLimit.currentWeight + itemWeight > userLimit.maxWeight) {
        socket.emit('error', { message: 'Превышен лимит веса у пользователя' });
        return;
      }

      const oldOwnerLimit = await InventoryLimit.findOne({ owner: oldOwner });
      if (!oldOwnerLimit) {
        socket.emit('error', { message: 'Лимиты инвентаря не найдены' });
        return;
      }

      // Обновляем владельца предмета
      item.owner = userOwnerKey;
      await item.save();

      // Обновляем вес
      await InventoryLimit.updateOne(
        { owner: oldOwner },
        { $inc: { currentWeight: -itemWeight } }
      );
      await InventoryLimit.updateOne(
        { owner: userOwnerKey },
        { $inc: { currentWeight: itemWeight } }
      );

      // Обновляем кэш
      const oldOwnerItems = itemCache.get(oldOwner) || [];
      itemCache.set(oldOwner, oldOwnerItems.filter(i => i._id.toString() !== itemId));
      const userItems = itemCache.get(userOwnerKey) || [];
      itemCache.set(userOwnerKey, [...userItems, item]);

      // Обновляем лимиты на клиенте
      const updatedOldLimit = await InventoryLimit.findOne({ owner: oldOwner });
      const updatedUserLimit = await InventoryLimit.findOne({ owner: userOwnerKey });
      socket.emit('inventoryLimit', updatedOldLimit);
      socket.emit('inventoryLimit', updatedUserLimit);

      socket.emit('items', itemCache.get(oldOwner));
      socket.emit('items', itemCache.get(userOwnerKey));
    } catch (err) {
      console.error('Error picking up item:', err.message, err.stack);
      socket.emit('error', { message: 'Ошибка при подборе предмета' });
    }
  });

  // Удаление предмета
  socket.on('deleteItem', async ({ itemId }) => {
    try {
      const item = await Item.findById(itemId);
      if (!item) {
        socket.emit('error', { message: 'Предмет не найден' });
        return;
      }

      const owner = item.owner;
      const itemWeight = parseFloat(item.weight) || 0;

      await Item.deleteOne({ _id: itemId });

      await InventoryLimit.updateOne(
        { owner },
        { $inc: { currentWeight: -itemWeight } }
      );

      const ownerItems = itemCache.get(owner) || [];
      itemCache.set(owner, ownerItems.filter(i => i._id.toString() !== itemId));

      const updatedLimit = await InventoryLimit.findOne({ owner });
      socket.emit('inventoryLimit', updatedLimit);

      socket.emit('items', itemCache.get(owner));
    } catch (err) {
      console.error('Error deleting item:', err.message, err.stack);
      socket.emit('error', { message: 'Ошибка при удалении предмета' });
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
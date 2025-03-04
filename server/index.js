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
  pingTimeout: 60000, // Увеличим таймаут до 60 секунд
  pingInterval: 25000 // Интервал проверки соединения — 25 секунд
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
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

// Схема пользователя для энергии
const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  energy: { type: Number, default: 100, min: 0, max: 100 },
  lastUpdated: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Хранилище активных пользователей по комнатам
const roomUsers = {};

// Функция для расчёта энергии
const calculateEnergy = (user) => {
  const now = new Date();
  const lastUpdated = new Date(user.lastUpdated);
  const minutesPassed = Math.floor((now - lastUpdated) / 60000); // минут прошло
  const decrease = Math.floor(minutesPassed / 10); // 1% каждые 10 минут
  return Math.max(user.energy - decrease, 0); // не ниже 0
};

// Хранилище активных сокетов для предотвращения дублирования
const activeSockets = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Обработка аутентификации
  socket.on('auth', async (userData) => {
    if (!userData || !userData.id) { // Проверяем наличие id в userData
      console.error('Invalid user data:', userData);
      return;
    }

    // Сохраняем userData в socket.userData
    socket.userData = {
      userId: userData.id.toString(), // Убедимся, что userId — строка
      firstName: userData.firstName || '',
      username: userData.username || '',
      lastName: userData.lastName || '',
      photoUrl: userData.photoUrl || ''
    };
    console.log('Authenticated user:', socket.userData.userId);

    // Проверяем, есть ли уже активное соединение для этого пользователя
    if (activeSockets.has(socket.userData.userId)) {
      console.log(`User ${socket.userData.userId} already connected with socket ${activeSockets.get(socket.userData.userId)}. Disconnecting old socket.`);
      const oldSocket = activeSockets.get(socket.userData.userId);
      oldSocket.disconnect(); // Отключаем старое соединение
    }

    // Сохраняем новое соединение
    activeSockets.set(socket.userData.userId, socket);

    // Обновляем или создаём пользователя для энергии
    try {
      let user = await User.findOne({ userId: socket.userData.userId });
      if (!user) {
        user = new User({ userId: socket.userData.userId });
      }
      const newEnergy = calculateEnergy(user);
      user.energy = newEnergy;
      user.lastUpdated = new Date();
      await user.save();
      socket.emit('energyUpdate', newEnergy); // Отправляем начальное значение энергии
    } catch (err) {
      console.error('Error initializing energy:', err.message, err.stack);
    }
  });

  // Обработка входа в комнату
  socket.on('joinRoom', async ({ room, lastTimestamp }) => {
    if (typeof room !== 'string') {
      console.error('Invalid room type:', room);
      return;
    }

    // Проверяем, аутентифицирован ли пользователь
    if (!socket.userData || !socket.userData.userId) {
      console.error('User not authenticated for room join:', socket.id);
      return;
    }

    socket.join(room);
    console.log(`User ${socket.userData.userId} joined room: ${room}`);

    if (!roomUsers[room]) roomUsers[room] = new Set();
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
      }

      const messages = await Message.find(query).sort({ timestamp: 1 }).limit(100);
      socket.emit('messageHistory', messages);
    } catch (err) {
      console.error('Error fetching messages:', err.message, err.stack);
    }
  });

  // Обработка отправки сообщения
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
        timestamp: message.timestamp
      });
      await newMessage.save();
      io.to(message.room).emit('message', newMessage);
    } catch (err) {
      console.error('Error saving message:', err.message, err.stack);
    }
  });

  // Обработчик для получения энергии
  socket.on('getEnergy', async () => {
    if (!socket.userData || !socket.userData.userId) {
      console.error('User not authenticated for energy request:', socket.id);
      return;
    }

    try {
      let user = await User.findOne({ userId: socket.userData.userId });
      if (!user) {
        user = new User({ userId: socket.userData.userId });
      }
      const newEnergy = calculateEnergy(user);
      user.energy = newEnergy;
      user.lastUpdated = new Date();
      await user.save();
      socket.emit('energyUpdate', newEnergy);
    } catch (err) {
      console.error('Error updating energy:', err.message, err.stack);
    }
  });

  // Обработка отключения
  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);

    if (socket.userData && socket.userData.userId) {
      // Удаляем сокет из активных, если он был связан с пользователем
      if (activeSockets.get(socket.userData.userId) === socket) {
        activeSockets.delete(socket.userData.userId);
        console.log(`Removed socket for user ${socket.userData.userId}`);
      }

      // Удаляем пользователя из всех комнат
      Object.keys(roomUsers).forEach(room => {
        roomUsers[room].forEach(user => {
          if (user.userId === socket.userData.userId) {
            roomUsers[room].delete(user);
          }
        });
        io.to(room).emit('roomUsers', Array.from(roomUsers[room]));
      });
    }
  });
});

server.listen(4000, () => {
  console.log('Server running on port 4000');
});
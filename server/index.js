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
  // Убраны устаревшие опции useNewUrlParser и useUnifiedTopology
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

// Убрана схема пользователя для энергии (User)

// Хранилище активных пользователей по комнатам
const roomUsers = {};

// Хранилище текущей комнаты для каждого пользователя
const userCurrentRoom = new Map();

// Убрана функция calculateEnergy

// Хранилище активных сокетов для предотвращения дублирования
const activeSockets = new Map();

// Хранилище времени последнего входа в комнаты для каждого сокета
const roomJoinTimes = new WeakMap(); // Используем WeakMap для ассоциации сокета с временами входа

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Обработка аутентификации
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
  });

  // Обработка входа в комнату с буферизацией
  socket.on('joinRoom', async ({ room, lastTimestamp }) => {
    if (typeof room !== 'string') {
      console.error('Invalid room type:', room);
      return;
    }

    // Перед добавлением в новую комнату удаляем из всех других комнат
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

    // Ждём, пока пользователь аутентифицируется (максимум 2 секунды)
    const maxWait = 2000; // 2 секунды
    const startTime = Date.now();
    while (!socket.userData && (Date.now() - startTime < maxWait)) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Пауза 100 мс
    }

    if (!socket.userData || !socket.userData.userId) {
      console.error('User not authenticated for room join:', socket.id);
      return;
    }

    // Сохраняем текущую комнату пользователя
    userCurrentRoom.set(socket.userData.userId, room);

    // Проверяем, уже ли пользователь в этой комнате
    const userInRoom = Array.from(roomUsers[room] || []).some(user => user.userId === socket.userData.userId);
    const isRejoining = userInRoom;

    // Храним время последнего входа в комнату для этого сокета
    if (!roomJoinTimes.has(socket)) {
      roomJoinTimes.set(socket, new Map());
    }
    const roomTimes = roomJoinTimes.get(socket);
    const lastJoinTime = roomTimes.get(room) || 0;
    const now = Date.now();
    const JOIN_COOLDOWN = 1000; // Минимальная задержка между входами в одну и ту же комнату (1 секунда)

    if (isRejoining && (now - lastJoinTime < JOIN_COOLDOWN)) {
      console.log(`User ${socket.userData.userId} attempted to rejoin room: ${room} too quickly — skipping`);
      return; // Пропускаем, если повторный вход слишком быстрый
    }

    if (isRejoining) {
      console.log(`User ${socket.userData.userId} already in room: ${room} — rejoining to fetch messages`);
    } else {
      socket.join(room);
      console.log(`User ${socket.userData.userId} joined room: ${room}`);
    }

    // Обновляем время последнего входа
    roomTimes.set(room, now);

    if (!roomUsers[room]) roomUsers[room] = new Set();
    // Перед добавлением пользователя в roomUsers проверяем, есть ли он уже в комнате, и удаляем, если есть
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

    // Обновляем список пользователей в комнате
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

  // Добавляем обработчик для выхода из комнаты
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
        timestamp: message.timestamp || new Date().toISOString()
      });
      await newMessage.save();
      io.to(message.room).emit('message', newMessage);
    } catch (err) {
      console.error('Error saving message:', err.message, err.stack);
    }
  });

  // Убран обработчик getEnergy

  // Обработка отключения
  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);

    if (socket.userData && socket.userData.userId) {
      if (activeSockets.get(socket.userData.userId) === socket) {
        activeSockets.delete(socket.userData.userId);
        console.log(`Removed socket for user ${socket.userData.userId}`);

        // Удаляем пользователя из всех комнат
        Object.keys(roomUsers).forEach(room => {
          roomUsers[room].forEach(user => {
            if (user.userId === socket.userData.userId) {
              roomUsers[room].delete(user);
            }
          });
          io.to(room).emit('roomUsers', Array.from(roomUsers[room]));
        });

        // Очищаем текущую комнату пользователя
        userCurrentRoom.delete(socket.userData.userId);
      }
    }

    // Очищаем данные о времени входа в комнаты для этого сокета
    if (roomJoinTimes.has(socket)) {
      roomJoinTimes.delete(socket);
    }
  });
});

server.listen(4000, () => {
  console.log('Server running on port 4000');
});
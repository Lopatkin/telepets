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
  }
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
  lastUpdated: { type: Date, default: Date.now },
  currentRoom: String,
  socketId: String // Для отправки обновлений конкретному клиенту
});
const User = mongoose.model('User', userSchema);

// Хранилище активных пользователей по комнатам
const roomUsers = {};

// Функция расчёта энергии
const calculateEnergy = (userData) => {
  const now = new Date();
  const lastUpdated = new Date(userData.lastUpdated);
  const timeDiffMinutes = (now - lastUpdated) / (1000 * 60);
  const energyDecrease = Math.floor(timeDiffMinutes / 10); // 1% каждые 10 минут

  if (userData.currentRoom && !userData.currentRoom.startsWith('myhome_')) {
    return Math.max(userData.energy - energyDecrease, 0);
  }
  return userData.energy;
};

// Периодическое обновление энергии (каждые 10 минут)
setInterval(async () => {
  try {
    const users = await User.find({});
    for (const user of users) {
      const newEnergy = calculateEnergy(user);
      if (newEnergy !== user.energy) {
        user.energy = newEnergy;
        user.lastUpdated = new Date();
        await user.save();
        if (user.socketId) {
          io.to(user.socketId).emit('energyUpdate', newEnergy);
        }
      }
    }
    console.log('Energy updated for all users');
  } catch (err) {
    console.error('Error updating energy:', err.message, err.stack);
  }
}, 10 * 60 * 1000); // 10 минут в миллисекундах

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('auth', async (userData) => {
    socket.userData = userData;
    console.log('Authenticated user:', userData.userId);

    // Проверяем или создаём пользователя
    let user = await User.findOne({ userId: userData.userId });
    if (!user) {
      user = new User({ userId: userData.userId, socketId: socket.id });
      await user.save();
    } else {
      user.socketId = socket.id; // Обновляем socketId
      const newEnergy = calculateEnergy(user);
      user.energy = newEnergy;
      user.lastUpdated = new Date();
      await user.save();
      socket.emit('energyUpdate', newEnergy);
    }
  });

  socket.on('joinRoom', async (room) => {
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
      const query = room.startsWith('myhome_') 
        ? { room, userId: socket.userData.userId } 
        : { room };
      const messages = await Message.find(query).sort({ timestamp: -1 }).limit(20);
      socket.emit('messageHistory', messages);

      // Обновляем текущую комнату
      await User.updateOne(
        { userId: socket.userData.userId },
        { currentRoom: room }
      );
    } catch (err) {
      console.error('Error fetching messages:', err.message, err.stack);
    }
  });

  socket.on('sendMessage', async (message) => {
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

      // Обновляем текущую комнату
      await User.updateOne(
        { userId: socket.userData.userId },
        { currentRoom: message.room }
      );
    } catch (err) {
      console.error('Error saving message:', err.message, err.stack);
    }
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    Object.keys(roomUsers).forEach(room => {
      roomUsers[room].forEach(user => {
        if (user.userId === socket.userData?.userId) {
          roomUsers[room].delete(user);
        }
      });
      io.to(room).emit('roomUsers', Array.from(roomUsers[room]));
    });

    // Убираем socketId при отключении
    await User.updateOne(
      { userId: socket.userData?.userId },
      { socketId: null }
    );
  });
});

server.listen(4000, () => {
  console.log('Server running on port 4000');
});
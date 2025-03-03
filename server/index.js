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

// Хранилище активных пользователей по комнатам
const roomUsers = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('auth', async (userData) => {
    socket.userData = userData;
    console.log('Authenticated user:', userData.userId);
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
    } catch (err) {
      console.error('Error saving message:', err.message, err.stack);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    Object.keys(roomUsers).forEach(room => {
      roomUsers[room].forEach(user => {
        if (user.userId === socket.userData?.userId) {
          roomUsers[room].delete(user);
        }
      });
      io.to(room).emit('roomUsers', Array.from(roomUsers[room]));
    });
  });
});

server.listen(4000, () => {
  console.log('Server running on port 4000');
});
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://telepets.netlify.app",
    methods: ["GET", "POST"]
  }
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err.message));

// Схема сообщений с дополнительными полями
const messageSchema = new mongoose.Schema({
  userId: String,
  text: String,
  firstName: String,
  username: String,
  lastName: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('auth', async (userData) => {
    socket.userData = userData; // Сохраняем данные пользователя в сокете
    console.log('Authenticated user:', userData.userId);

    try {
      const messages = await Message.find({}).sort({ timestamp: 1 }).limit(50);
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
        timestamp: message.timestamp
      });
      await newMessage.save();
      io.emit('message', newMessage);
    } catch (err) {
      console.error('Error saving message:', err.message, err.stack);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(4000, () => {
  console.log('Server running on port 4000');
});
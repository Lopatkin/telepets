const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://telepets.netlify.app", // Разрешаем Netlify
    methods: ["GET", "POST"]
  }
});

// Подключение к MongoDB Atlas
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
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Обработка авторизации
  socket.on('auth', async ({ userId }) => {
    socket.userId = userId; // Привязываем userId к сокету
    console.log('Authenticated user:', userId);

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
        userId: socket.userId, // Используем userId из сокета
        text: message.text,
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
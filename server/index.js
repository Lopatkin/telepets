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

// Подключение к MongoDB
mongoose.connect('mongodb://adm:adm@e27aed3db67d.vps.myjino.ru:27017/telepets_db?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err.message, err.stack));

// Схема и модель для сообщений
const messageSchema = new mongoose.Schema({
  userId: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

io.on('connection', async (socket) => {
  console.log('User connected:', socket.id);

  // Отправка истории сообщений при подключении
  try {
    const messages = await Message.find().sort({ timestamp: 1 }).limit(50);
    socket.emit('messageHistory', messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
  }

  // Получение и сохранение нового сообщения
  socket.on('sendMessage', async (message) => {
    try {
      const newMessage = new Message(message);
      await newMessage.save();
      io.emit('message', newMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(4000, () => {
  console.log('Server running on port 4000');
});
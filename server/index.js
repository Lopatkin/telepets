const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const npcDataCore = require('../src/utils/npcDataCore');
const {
  isLovecParkTime,
  isLovecDachnyTime,
  isBabushkaTime,
  isIraKatyaTime,
  isZhannaTime
} = require('../src/utils/npcUtils');

const { registerUserHandlers } = require('./handlers/userHandlers');
const { registerRoomHandlers } = require('./handlers/roomHandlers');
const { registerMessageHandlers } = require('./handlers/messageHandlers');
const { registerInventoryHandlers } = require('./handlers/inventoryHandlers');
const { registerAnimalHandlers } = require('./handlers/animalHandlers');

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

// Схема пользователя
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
  credits: { type: Number, default: 0, min: 0 },
  lastRoom: { type: String, default: 'Автобусная остановка' },
  homeless: { type: Boolean, default: true },
  onLeash: { type: Boolean, default: false },
  lastActivity: { type: Date, default: Date.now },
  owner: { type: String, default: null },
  freeRoam: { type: Boolean, default: false },
  // Удаляем значения по умолчанию, чтобы они задавались при регистрации
  health: { type: Number },
  attack: { type: Number },
  defense: { type: Number }
});
const User = mongoose.model('User', userSchema);

// Схема сообщений
const messageSchema = new mongoose.Schema({
  userId: String,
  text: String,
  firstName: String,
  username: String,
  lastName: String,
  photoUrl: String,
  name: String,
  isHuman: Boolean,
  animalType: String,
  room: String,
  timestamp: { type: Date, default: Date.now },
  animalText: String,
  isSystem: { type: Boolean, default: false }
});
const Message = mongoose.model('Message', messageSchema);

const itemSchema = new mongoose.Schema({
  owner: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  rarity: { type: String },
  weight: { type: Number },
  cost: { type: Number },
  effect: { type: String },
  playerID: { type: String, required: false },
  animalId: { type: String, required: false }
}, { timestamps: true });
const Item = mongoose.model('Item', itemSchema);

const inventoryLimitSchema = new mongoose.Schema({
  owner: String,
  maxWeight: Number,
  currentWeight: { type: Number, default: 0 }
});
const InventoryLimit = mongoose.model('InventoryLimit', inventoryLimitSchema);

// Хранилища
const roomUsers = {};
const userCurrentRoom = new Map();
const activeSockets = new Map();
const roomJoinTimes = new WeakMap();
const itemCache = new Map();
const itemLocks = new Map();
const fightStates = new Map();

// Маппинг строковых условий к функциям
const conditionMap = {
  isLovecParkTime,
  isLovecDachnyTime,
  isBabushkaTime,
  isIraKatyaTime,
  isZhannaTime
};

// Создаём npcData с условиями для сервера
const npcData = Object.keys(npcDataCore).reduce((acc, room) => {
  acc[room] = npcDataCore[room].map(npc => ({
    ...npc,
    condition: npc.condition ? conditionMap[npc.condition] : undefined
  }));
  return acc;
}, {});

// Функция для получения активных NPC в комнате
const getActiveNPCs = (room) => {
  const npcs = npcData[room] || [];
  return npcs.filter(npc => !npc.condition || npc.condition());
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  const dependencies = {
    io,
    socket,
    User,
    Message,
    Item,
    InventoryLimit,
    roomUsers,
    userCurrentRoom,
    activeSockets,
    roomJoinTimes,
    itemCache,
    itemLocks,
    fightStates
  };

  registerUserHandlers(dependencies);
  registerRoomHandlers(dependencies);
  registerMessageHandlers(dependencies);
  registerInventoryHandlers(dependencies);
  registerAnimalHandlers(dependencies);

  socket.on('fightRound', (data, callback) => {
    const { userId, npcId, playerAttackZone, playerDefenseZones, npcAttackZone, npcDefenseZones, playerAttack } = data;

    // Находим NPC в npcData
    const npc = Object.values(npcData).flat().find(n => n.userId === npcId);
    if (!npc || !npc.stats) {
      callback({ success: false, message: 'NPC не найден или отсутствуют параметры' });
      return;
    }

    // Инициализация состояния боя
    if (!fightStates.has(userId)) {
      fightStates.set(userId, {
        playerHP: 100,
        npcHP: npc.stats.health,
        npcId
      });
    }

    const fight = fightStates.get(userId);

    let message = '';
    let damageToPlayer = 0;
    let damageToNPC = 0;

    // Проверяем атаку игрока
    if (playerAttackZone && !npcDefenseZones.includes(playerAttackZone)) {
      const npcDefenseValue = Math.floor(Math.random() * (npc.stats.defense + 1)); // Случайное от 0 до defense
      damageToNPC = Math.max(0, playerAttack - npcDefenseValue);
      message += `Вы ударили ${npcId.replace('npc_', '')} в ${playerAttackZone} и нанесли ${damageToNPC} урона! `;
    } else {
      message += `Ваш удар в ${playerAttackZone || 'неизвестную зону'} был заблокирован! `;
    }

    // Проверяем атаку NPC
    if (npcAttackZone && !playerDefenseZones.includes(npcAttackZone)) {
      damageToPlayer = npc.stats.attack;
      message += `${npcId.replace('npc_', '')} ударил вас в ${npcAttackZone} и нанёс ${damageToPlayer} урона! `;
    } else {
      message += `Вы заблокировали удар в ${npcAttackZone}! `;
    }

    // Обновляем HP
    fight.playerHP = Math.max(0, fight.playerHP - damageToPlayer);
    fight.npcHP = Math.max(0, fight.npcHP - damageToNPC);

    // Проверяем завершение боя
    if (fight.playerHP <= 0 || fight.npcHP <= 0) {
      fightStates.delete(userId);
    }

    callback({
      success: true,
      playerHP: fight.playerHP,
      npcHP: fight.npcHP,
      message
    });
  });

  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);

    if (socket.userData && socket.userData.userId) {
      if (activeSockets.get(socket.userData.userId) === socket) {
        activeSockets.delete(socket.userData.userId);
        console.log(`Removed socket for user ${socket.userData.userId}`);

        fightStates.delete(socket.userData.userId);

        const ownerKey = `user_${socket.userData.userId}`;
        Item.find({ owner: ownerKey, playerID: { $exists: true } })
          .then(animalItems => {
            animalItems.forEach(async (item) => {
              const animalSocket = activeSockets.get(item.playerID);
              if (animalSocket) {
                const animalUser = await User.findOne({ userId: item.playerID });
                if (animalUser) {
                  animalSocket.emit('userUpdate', {
                    userId: animalUser.userId,
                    firstName: animalUser.firstName,
                    username: animalUser.username,
                    lastName: animalUser.lastName,
                    photoUrl: animalUser.photoUrl,
                    isRegistered: animalUser.isRegistered,
                    isHuman: animalUser.isHuman,
                    animalType: animalUser.animalType,
                    name: animalUser.name,
                    onLeash: animalUser.onLeash,
                    owner: animalUser.owner,
                    ownerOnline: false,
                    homeless: animalUser.homeless
                  });
                }
              }
            });
          })
          .catch(err => console.error('Error finding animal items on disconnect:', err.message));

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
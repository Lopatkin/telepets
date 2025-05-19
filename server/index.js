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
  stats: {
    health: { type: Number },
    attack: { type: Number },
    defense: { type: Number },
    energy: { type: Number },
    mood: { type: Number },
    satiety: { type: Number },
    maxHealth: { type: Number }, // Новое поле для максимального здоровья
    maxEnergy: { type: Number, default: 100 }, // Максимальная энергия
    maxMood: { type: Number, default: 100 }, // Максимальное настроение
    maxSatiety: { type: Number, default: 100 } // Максимальная сытость
  }
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

  // Модификация fightRound для использования актуального здоровья
  socket.on('fightRound', async (data, callback) => {
    const { userId, npcId, playerAttackZone, playerDefenseZones, npcAttackZone, npcDefenseZones, playerAttack, playerDefense } = data;

    // Находим пользователя в базе данных
    const user = await User.findOne({ userId });
    if (!user || !user.stats) {
      callback({ success: false, message: 'Пользователь не найден или отсутствуют параметры' });
      return;
    }

    // Находим NPC в npcData
    const npc = Object.values(npcData).flat().find(n => n.userId === npcId);
    if (!npc || !npc.stats) {
      callback({ success: false, message: 'NPC не найден или отсутствуют параметры' });
      return;
    }

    // Инициализация состояния боя с актуальным здоровьем
    if (!fightStates.has(userId)) {
      fightStates.set(userId, {
        playerHP: Math.min(user.stats.health, user.stats.maxHealth), // Всегда используем текущее здоровье
        npcHP: npc.stats.health,
        npcId
      });
    } else {
      // Обновляем playerHP до актуального значения из базы данных
      const fight = fightStates.get(userId);
      fight.playerHP = Math.min(user.stats.health, user.stats.maxHealth);
    }

    const fight = fightStates.get(userId);

    let message = '';
    let damageToPlayer = 0;
    let damageToNPC = 0;

    // Проверяем атаку игрока
    if (playerAttackZone && !npcDefenseZones.includes(playerAttackZone)) {
      const npcDefenseValue = Math.floor(Math.random() * (npc.stats.defense + 1));
      damageToNPC = Math.max(0, playerAttack - npcDefenseValue);
      message += `Вы ударили ${npcId.replace('npc_', '')} в ${playerAttackZone} и нанесли ${damageToNPC} урона! `;
    } else {
      message += `Ваш удар в ${playerAttackZone || 'неизвестную зону'} был заблокирован! `;
    }

    // Проверяем атаку NPC
    if (npcAttackZone && !playerDefenseZones.includes(npcAttackZone)) {
      const playerDefenseValue = Math.floor(Math.random() * (playerDefense + 1));
      damageToPlayer = Math.max(0, npc.stats.attack - playerDefenseValue);
      message += `${npcId.replace('npc_', '')} ударил вас в ${npcAttackZone} и нанёс ${damageToPlayer} урона! `;
    } else {
      message += `Вы заблокировали удар в ${npcAttackZone}! `;
    }

    // Обновляем HP
    fight.playerHP = Math.max(0, fight.playerHP - damageToPlayer);
    fight.npcHP = Math.max(0, fight.npcHP - damageToNPC);

    // Ограничиваем здоровье максимальным значением
    fight.playerHP = Math.min(fight.playerHP, user.stats.maxHealth);

    // Обновляем здоровье игрока в базе данных
    await User.updateOne(
      { userId },
      { $set: { 'stats.health': fight.playerHP } }
    );

    // Получаем обновленного пользователя
    const updatedUser = await User.findOne({ userId });

    // Отправляем userUpdate
    socket.emit('userUpdate', {
      userId: updatedUser.userId,
      firstName: updatedUser.firstName,
      username: updatedUser.username,
      lastName: updatedUser.lastName,
      photoUrl: updatedUser.photoUrl,
      isRegistered: updatedUser.isRegistered,
      isHuman: updatedUser.isHuman,
      animalType: updatedUser.animalType,
      name: updatedUser.name,
      owner: updatedUser.owner,
      homeless: updatedUser.homeless,
      credits: updatedUser.credits || 0,
      onLeash: updatedUser.onLeash,
      freeRoam: updatedUser.freeRoam || false,
      stats: updatedUser.stats
    });

    // Проверяем завершение боя
    if (fight.playerHP <= 0 || fight.npcHP <= 0) {
      fightStates.delete(userId);
      if (fight.playerHP <= 0) {
        fight.playerHP = 1;
        await User.updateOne(
          { userId },
          { $set: { 'stats.health': 1 } }
        );
        const finalUser = await User.findOne({ userId });
        socket.emit('userUpdate', {
          userId: finalUser.userId,
          firstName: finalUser.firstName,
          username: finalUser.username,
          lastName: finalUser.lastName,
          photoUrl: finalUser.photoUrl,
          isRegistered: finalUser.isRegistered,
          isHuman: finalUser.isHuman,
          animalType: finalUser.animalType,
          name: finalUser.name,
          owner: finalUser.owner,
          homeless: finalUser.homeless,
          credits: finalUser.credits || 0,
          onLeash: finalUser.onLeash,
          freeRoam: finalUser.freeRoam || false,
          stats: finalUser.stats
        });
        message += 'Вы проиграли бой!';
      } else {
        message += 'Вы победили!';
      }
    }

    callback({
      success: true,
      playerHP: fight.playerHP,
      npcHP: fight.npcHP,
      message
    });
  });

  // Добавление обработчика getUser
  socket.on('getUser', async (data, callback) => {
    const { userId } = data;
    console.log(`Received getUser for user ${userId}`);

    const user = await User.findOne({ userId });
    if (user) {
      console.log(`Sending user data for ${userId}:`, user);
      callback({
        success: true,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          username: user.username,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
          isRegistered: user.isRegistered,
          isHuman: user.isHuman,
          animalType: user.animalType,
          name: user.name,
          owner: user.owner,
          homeless: user.homeless,
          credits: user.credits || 0,
          onLeash: user.onLeash,
          freeRoam: user.freeRoam || false,
          stats: user.stats
        }
      });
    } else {
      console.log(`User ${userId} not found for getUser`);
      callback({ success: false, message: 'Пользователь не найден' });
    }
  });

  // Улучшенный обработчик endFight
  socket.on('endFight', async (data) => {
    const { userId } = data;
    console.log(`Received endFight for user ${userId}`);

    if (fightStates.has(userId)) {
      fightStates.delete(userId);
      console.log(`Fight state cleared for user ${userId}`);
    } else {
      console.log(`No active fight state found for user ${userId}`);
    }

    const user = await User.findOne({ userId });
    if (user) {
      console.log(`Preparing userUpdate for user ${userId} with stats:`, user.stats);
      try {
        socket.emit('userUpdate', {
          userId: user.userId,
          firstName: user.firstName,
          username: user.username,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
          isRegistered: user.isRegistered,
          isHuman: user.isHuman,
          animalType: user.animalType,
          name: user.name,
          owner: user.owner,
          homeless: user.homeless,
          credits: user.credits || 0,
          onLeash: user.onLeash,
          freeRoam: user.freeRoam || false,
          stats: user.stats
        });
        console.log(`Sent userUpdate for user ${userId}`);
      } catch (error) {
        console.error(`Failed to send userUpdate for user ${userId}:`, error.message);
      }
    } else {
      console.log(`User ${userId} not found for userUpdate`);
    }
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
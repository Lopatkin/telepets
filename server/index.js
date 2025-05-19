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
    const {
      userId,
      npcId,
      playerAttackZone,
      playerDefenseZones,
      npcAttackZone,
      npcDefenseZones,
      playerAttack,
      playerDefense
    } = data;

    console.log(`Received fightRound for user ${userId} vs NPC ${npcId}`);

    let fight = fightStates.get(userId);
    if (!fight) {
      console.log(`No active fight found for user ${userId}, initializing new fight`);
      const user = await User.findOne({ userId });
      const npc = npcs.find(n => n.userId === npcId);
      if (!user || !npc) {
        console.error(`User ${userId} or NPC ${npcId} not found`);
        return callback({ success: false, message: 'User or NPC not found' });
      }
      fight = {
        userId,
        npcId,
        playerHP: user.stats.health,
        npcHP: npc.stats.health,
        playerMaxHP: user.stats.maxHealth || 100,
        npcMaxHP: npc.stats.health || 100
      };
      fightStates.set(userId, fight);
    }

    let message = '';
    let playerDamage = 0;
    let npcDamage = 0;

    // Проверяем, атаковал ли игрок
    if (playerAttackZone) {
      const isBlocked = npcDefenseZones.includes(playerAttackZone);
      const damage = isBlocked ? Math.floor(playerAttack * 0.5) : playerAttack;
      fight.npcHP -= damage;
      npcDamage = damage;
      message += `Игрок атаковал ${playerAttackZone} и нанес ${damage} урона. `;
    } else {
      message += `Игрок не атаковал. `;
    }

    // NPC атакует
    const isPlayerBlocked = playerDefenseZones.includes(npcAttackZone);
    const npcAttackValue = npcs.find(n => n.userId === npcId)?.stats.attack || 10;
    const damageToPlayer = isPlayerBlocked ? Math.floor(npcAttackValue * 0.5) : npcAttackValue;
    fight.playerHP -= damageToPlayer;
    playerDamage = damageToPlayer;
    message += `NPC атаковал ${npcAttackZone} и нанес ${damageToPlayer} урона.`;

    // Ограничиваем здоровье игрока минимальным значением 0
    if (fight.playerHP < 0) {
      fight.playerHP = 0;
    }

    // Ограничиваем здоровье NPC минимальным значением 0
    if (fight.npcHP < 0) {
      fight.npcHP = 0;
    }

    // Обновляем здоровье игрока в базе данных
    const user = await User.findOne({ userId });
    if (user) {
      user.stats.health = fight.playerHP;
      await user.save();
      console.log(`Updated user ${userId} health to ${user.stats.health}`);
    } else {
      console.error(`User ${userId} not found for health update`);
    }

    // Проверяем завершение боя
    let fightEnded = false;
    if (fight.playerHP <= 0) {
      message = `Игрок проиграл! ${message}`;
      fightEnded = true;
    } else if (fight.npcHP <= 0) {
      message = `Игрок победил! ${message}`;
      fightEnded = true;
    }

    // Отправляем результат раунда
    callback({
      success: true,
      playerHP: fight.playerHP,
      npcHP: fight.npcHP,
      message
    });

    // Если бой завершился, очищаем состояние и отправляем userUpdate
    if (fightEnded) {
      fightStates.delete(userId);
      console.log(`Fight ended for user ${userId}, cleared fight state`);
      if (user) {
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
          console.log(`Sent userUpdate for user ${userId} after fight`);
        } catch (error) {
          console.error(`Failed to send userUpdate for user ${userId}:`, error.message);
        }
      }
    }
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
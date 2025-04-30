const { updateRoomUsers } = require('../utils/roomUtils');

function registerRoomHandlers({
  io,
  socket,
  User,
  Message,
  Item,
  roomUsers,
  userCurrentRoom,
  activeSockets,
  roomJoinTimes
}) {
  socket.on('joinRoom', async ({ room, lastTimestamp }, callback = () => { }) => {
    if (typeof room !== 'string') {
      console.error('Invalid room type:', room);
      socket.emit('error', { message: 'Некорректное название комнаты' });
      callback({ success: false, message: 'Некорректное название комнаты' });
      return;
    }

    if (!socket.userData || !socket.userData.userId) {
      console.error('User not authenticated for room join:', socket.id);
      socket.emit('error', { message: 'Пользователь не аутентифицирован' });
      return;
    }

    const user = await User.findOne({ userId: socket.userData.userId });
    if (!user) {
      socket.emit('error', { message: 'Пользователь не найден в базе' });
      return;
    }

    let ownerOnline = false;
    if (user && user.onLeash && user.owner) {
      ownerOnline = activeSockets.has(user.owner);
    }

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
      onLeash: user.onLeash,
      owner: user.owner,
      ownerOnline,
      homeless: user.homeless,
      freeRoam: user.freeRoam || false
    });

    try {
      await User.updateOne(
        { userId: socket.userData.userId },
        { lastRoom: room }
      );
      console.log(`Updated lastRoom for user ${socket.userData.userId} to ${room}`);
    } catch (error) {
      console.error(`Error updating lastRoom for user ${socket.userData.userId}:`, error);
    }

    if (user.isHuman) {
      const animalsOnLeash = await User.find({
        owner: socket.userData.userId,
        onLeash: true,
        isHuman: false
      });
      for (const animal of animalsOnLeash) {
        const animalSocket = activeSockets.get(animal.userId);
        if (animalSocket) {
          const currentAnimalRoom = userCurrentRoom.get(animal.userId);
          if (currentAnimalRoom !== room) {
            updateRoomUsers({
              io,
              roomUsers,
              userCurrentRoom,
              userId: animal.userId,
              oldRoom: currentAnimalRoom,
              newRoom: room,
              userData: {
                userId: animal.userId,
                firstName: animal.firstName || '',
                username: animal.username || '',
                lastName: animal.lastName || '',
                photoUrl: animal.photoUrl || '',
                name: animal.name || '',
                isHuman: false,
                onLeash: true,
                owner: socket.userData.userId,
                homeless: animal.homeless
              }
            });

            animalSocket.emit('forceRoomChange', { newRoom: room });

            const messages = await Message.find({ room }).sort({ timestamp: 1 }).limit(100);
            animalSocket.emit('messageHistory', messages);

            console.log(`Animal ${animal.userId} moved to room ${room} with owner ${socket.userData.userId}`);
          }
        }
      }
    }

    const userOwnerKey = `user_${socket.userData.userId}`;
    const animalItems = await Item.find({ owner: userOwnerKey, playerID: { $exists: true } });
    if (animalItems.length > 0) {
      const animalIds = animalItems.map(item => item.playerID);
      try {
        await User.updateMany(
          { userId: { $in: animalIds } },
          { lastRoom: room }
        );
        console.log(`Updated lastRoom for animals ${animalIds.join(', ')} to ${room}`);

        animalIds.forEach(animalId => {
          const animalSocket = activeSockets.get(animalId);
          if (animalSocket) {
            const oldRoom = userCurrentRoom.get(animalId);
            updateRoomUsers({
              io,
              roomUsers,
              userCurrentRoom,
              userId: animalId,
              oldRoom,
              newRoom: room,
              userData: {
                userId: animalId,
                firstName: '',
                username: '',
                lastName: '',
                photoUrl: animalItems.find(item => item.playerID === animalId)?.photoUrl || '',
                name: animalItems.find(item => item.playerID === animalId)?.name || '',
                isHuman: false,
                onLeash: true,
                owner: socket.userData.userId,
                homeless: false
              }
            });

            animalSocket.emit('forceRoomChange', { newRoom: room });

            Message.find({ room }).sort({ timestamp: 1 }).limit(100)
              .then(messages => animalSocket.emit('messageHistory', messages))
              .catch(err => console.error('Error sending message history to animal:', err.message));
          }
        });
      } catch (error) {
        console.error(`Error updating lastRoom for animals:`, error);
      }
    }

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

    userCurrentRoom.set(socket.userData.userId, room);

    const userInRoom = Array.from(roomUsers[room] || []).some(user => user.userId === socket.userData.userId);
    const isRejoining = userInRoom;

    if (!roomJoinTimes.has(socket)) {
      roomJoinTimes.set(socket, new Map());
    }
    const roomTimes = roomJoinTimes.get(socket);
    const lastJoinTime = roomTimes.get(room) || 0;
    const now = Date.now();
    const JOIN_COOLDOWN = 1000;

    if (isRejoining && (now - lastJoinTime < JOIN_COOLDOWN)) {
      console.log(`User ${socket.userData.userId} attempted to rejoin room: ${room} too quickly - sending current room data`);
      callback({ success: false, message: 'Повторное присоединение слишком быстро' });
      return;
    }

    if (isRejoining) {
      console.log(`User ${socket.userData.userId} already in room: ${room} — rejoining to fetch messages`);
    } else {
      socket.join(room);
      console.log(`User ${socket.userData.userId} joined room: ${room}`);
    }

    roomTimes.set(room, now);

    updateRoomUsers({
      io,
      roomUsers,
      userCurrentRoom,
      userId: socket.userData.userId,
      newRoom: room,
      userData: {
        userId: socket.userData.userId,
        firstName: socket.userData.firstName,
        username: socket.userData.username,
        lastName: socket.userData.lastName,
        photoUrl: socket.userData.photoUrl,
        name: user.name,
        isHuman: user.isHuman,
        onLeash: user.onLeash,
        owner: user.owner,
        homeless: user.homeless
      }
    });

    try {
      const query = { room };
      if (lastTimestamp) {
        query.timestamp = { $gt: new Date(lastTimestamp) };
      } else {
        query.timestamp = { $exists: true };
      }

      const messages = await Message.find(query).sort({ timestamp: 1 }).limit(100);
      socket.emit('messageHistory', messages);
    } catch (err) {
      console.error('Error fetching messages:', err.message, err.stack);
      socket.emit('error', { message: 'Ошибка при загрузке сообщений' });
    }
    callback({ success: true });
  });

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
}

module.exports = { registerRoomHandlers };
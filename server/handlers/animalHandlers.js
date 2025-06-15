// В обработчике takeAnimalHome удаляем обновления currentWeight
const mongoose = require('mongoose');

function registerAnimalHandlers({
  io,
  socket,
  User,
  Item,
  itemCache,
  activeSockets,
  userCurrentRoom
}) {
  socket.on('renameAnimal', async ({ animalId, newName }, callback) => {
    try {
      if (!socket.userData || !socket.userData.userId) {
        return callback({ success: false, message: 'Пользователь не аутентифицирован' });
      }

      const animal = await User.findOne({ userId: animalId, isHuman: false });
      if (!animal) {
        return callback({ success: false, message: 'Животное не найдено' });
      }
      if (animal.owner !== socket.userData.userId) {
        return callback({ success: false, message: 'Вы не являетесь владельцем этого животного' });
      }

      const trimmedName = newName.trim();
      if (!trimmedName) {
        return callback({ success: false, message: 'Имя не может быть пустым' });
      }

      await User.updateOne(
        { userId: animalId },
        { name: trimmedName }
      );

      await Item.updateOne(
        { animalId, name: 'Паспорт животного', owner: `user_${socket.userData.userId}` },
        { description: `Ваш питомец - ${trimmedName}` }
      );

      const animalSocket = activeSockets.get(animalId);
      if (animalSocket) {
        animalSocket.emit('userUpdate', {
          userId: animalId,
          name: trimmedName
        });
      }

      callback({ success: true });
    } catch (err) {
      console.error('Error renaming animal:', err.message, err.stack);
      callback({ success: false, message: 'Ошибка сервера' });
    }
  });

  socket.on('setFreeRoam', async ({ animalId, freeRoam }, callback) => {
    try {
      if (!socket.userData || !socket.userData.userId) {
        return callback({ success: false, message: 'Пользователь не аутентифицирован' });
      }

      const animal = await User.findOne({ userId: animalId, isHuman: false });
      if (!animal) {
        return callback({ success: false, message: 'Животное не найдено' });
      }
      if (animal.owner !== socket.userData.userId) {
        return callback({ success: false, message: 'Вы не являетесь владельцем этого животного' });
      }

      await User.updateOne(
        { userId: animalId },
        { freeRoam }
      );

      const animalSocket = activeSockets.get(animalId);
      console.log('Animal socket exists for setFreeRoam:', !!animalSocket, 'animalId:', animalId);
      if (animalSocket) {
        animalSocket.emit('userUpdate', {
          userId: animalId,
          freeRoam,
          isHuman: false,
          name: animal.name,
          animalType: animal.animalType,
          onLeash: animal.onLeash,
          owner: animal.owner,
          homeless: animal.homeless,
          lastRoom: animal.lastRoom
        });
        console.log(`Sent userUpdate with freeRoam=${freeRoam} to animal ${animalId}`);
      }

      callback({ success: true });
    } catch (err) {
      console.error('Error setting free roam:', err.message, err.stack);
      callback({ success: false, message: 'Ошибка сервера' });
    }
  });

  socket.on('getAnimalInfo', async ({ animalId }, callback) => {
    try {
      const animal = await User.findOne({ userId: animalId });
      if (!animal || animal.isHuman) {
        return callback({ success: false, message: 'Животное не найдено' });
      }
      callback({
        success: true,
        animal: {
          name: animal.name,
          animalType: animal.animalType,
          lastRoom: animal.lastRoom,
          onLeash: animal.onLeash,
          freeRoam: animal.freeRoam
        },
      });
    } catch (err) {
      console.error('Error fetching animal info:', err.message, err.stack);
      callback({ success: false, message: 'Ошибка сервера' });
    }
  });

  socket.on('toggleLeash', async ({ animalId, onLeash }) => {
    try {
      const animal = await User.findOne({ userId: animalId });
      if (!animal || animal.isHuman) {
        socket.emit('error', { message: 'Животное не найдено' });
        return;
      }
      if (animal.owner !== socket.userData.userId) {
        socket.emit('error', { message: 'Вы не являетесь владельцем этого животного' });
        return;
      }

      await User.updateOne(
        { userId: animalId },
        { onLeash }
      );

      console.log(`Animal ${animalId} leash status updated to ${onLeash}`);

      const animalSocket = activeSockets.get(animalId);
      if (animalSocket) {
        animalSocket.emit('leashStatus', { onLeash });
      }
    } catch (err) {
      console.error('Error toggling leash:', err.message, err.stack);
      socket.emit('error', { message: 'Ошибка сервера' });
    }
  });

  socket.on('takeAnimalHome', async ({ animalId, animalName }) => {
    let session;
    try {
      if (!socket.userData || !socket.userData.userId) {
        socket.emit('error', { message: 'Пользователь не аутентифицирован' });
        return;
      }

      const humanUser = await User.findOne({ userId: socket.userData.userId });
      if (!humanUser || !humanUser.isHuman) {
        socket.emit('error', { message: 'Только люди могут забирать животных домой' });
        return;
      }

      const animalUser = await User.findOne({ userId: animalId });
      if (!animalUser || animalUser.isHuman || !animalUser.homeless || animalUser.onLeash) {
        socket.emit('error', { message: 'Животное не найдено или уже забрано' });
        return;
      }

      const currentRoom = userCurrentRoom.get(socket.userData.userId);
      if (currentRoom !== 'Приют для животных "Кошкин дом"') {
        socket.emit('error', { message: 'Вы должны находиться в приюте, чтобы забрать животное' });
        return;
      }

      const userOwnerKey = `user_${socket.userData.userId}`;
      const animalOwnerKey = `user_${animalId}`;

      const collar = await Item.findOne({ owner: userOwnerKey, name: 'Ошейник' });
      const leash = await Item.findOne({ owner: userOwnerKey, name: 'Поводок' });
      if (!collar || !leash) {
        socket.emit('error', { message: 'Чтобы забрать питомца из приюта, вам нужен ошейник и поводок.' });
        return;
      }

      session = await mongoose.startSession();
      session.startTransaction();

      let passport;
      let newCollar;
      try {
        // Удаляем ошейник пользователя
        await Item.deleteOne({ _id: collar._id }, { session });

        // Создаём новый ошейник для животного (вес сохраняется)
        newCollar = new Item({
          owner: animalOwnerKey,
          name: 'Ошейник',
          description: 'С ним вы можете взять себе питомца из приюта.',
          rarity: 'Обычный',
          weight: 0.5, // Сохраняем вес
          cost: 250,
          effect: 'Вы всегда знаете где находится ваш питомец.',
        });
        await newCollar.save({ session });

        // Обновляем данные животного
        await User.updateOne(
          { userId: animalId },
          {
            owner: socket.userData.userId,
            onLeash: true,
            homeless: false,
            residence: humanUser.residence || 'Не указано',
          },
          { session }
        );

        // Создаём паспорт животного (вес сохраняется)
        passport = new Item({
          owner: userOwnerKey,
          name: 'Паспорт животного',
          description: `Ваш питомец - ${animalName || 'Без имени'}`,
          rarity: 'Обычный',
          weight: 0.1, // Сохраняем вес
          cost: 100,
          effect: 'Вы чувствуете ответственность за кого-то.',
          animalId,
        });
        await passport.save({ session });

        await session.commitTransaction();
        console.log(`Successfully committed transaction for animal ${animalId}`);
      } catch (err) {
        await session.abortTransaction();
        console.error('Transaction aborted due to error:', err.message, err.stack);
        socket.emit('error', { message: 'Ошибка при обработке предметов и данных животного' });
        return;
      } finally {
        session.endSession();
      }

      // Обновляем кэш предметов
      let humanItems = itemCache.get(userOwnerKey) || [];
      humanItems = humanItems.filter(i => i._id.toString() !== collar._id.toString());
      if (passport) {
        humanItems.push(passport);
      }
      itemCache.set(userOwnerKey, humanItems);

      let animalItems = itemCache.get(animalOwnerKey) || [];
      if (newCollar) {
        animalItems.push(newCollar);
      }
      itemCache.set(animalOwnerKey, animalItems);

      // Обновляем список животных в приюте
      const shelterAnimals = await User.find({
        lastRoom: 'Приют для животных "Кошкин дом"',
        homeless: true,
        onLeash: false,
        isHuman: false,
        owner: null,
      }).select('userId name photoUrl lastActivity isHuman animalType owner');

      const now = new Date();
      const animalsWithStatus = shelterAnimals.map(animal => ({
        userId: animal.userId,
        name: animal.name,
        photoUrl: animal.photoUrl,
        isOnline: (now - new Date(animal.lastActivity || 0)) < 5 * 60 * 1000,
        animalType: animal.animalType,
        owner: animal.owner,
        homeless: animal.homeless,
      }));

      io.to('Приют для животных "Кошкин дом"').emit('shelterAnimals', animalsWithStatus);

      // Отправляем обновлённые данные предметов
      const updatedHumanItems = await Item.find({ owner: userOwnerKey });
      socket.emit('items', { owner: userOwnerKey, items: updatedHumanItems });

      const updatedAnimalItems = await Item.find({ owner: animalOwnerKey });
      const animalSocket = activeSockets.get(animalId);
      if (animalSocket) {
        animalSocket.emit('items', { owner: animalOwnerKey, items: updatedAnimalItems });
      }

      socket.emit('takeAnimalHomeSuccess', {
        animalId,
        owner: socket.userData.userId,
        animal: {
          userId: updatedAnimal.userId,
          name: updatedAnimal.name,
          animalType: updatedAnimal.animalType,
          photoUrl: updatedAnimal.photoUrl,
          onLeash: updatedAnimal.onLeash,
          owner: updatedAnimal.owner,
          homeless: updatedAnimal.homeless,
          residence: updatedAnimal.residence,
        },
      });

      if (animalSocket) {
        animalSocket.emit('userUpdate', {
          userId: animalId,
          isRegistered: true,
          isHuman: false,
          name: updatedAnimal.name,
          animalType: updatedAnimal.animalType,
          onLeash: true,
          owner: socket.userData.userId,
          ownerOnline: true,
          homeless: false,
          residence: updatedAnimal.residence || 'Не указано',
        });
      }

      console.log(`User ${socket.userData.userId} successfully took animal ${animalId} home`);
    } catch (err) {
      console.error('Error in takeAnimalHome:', err.message, err.stack);
      socket.emit('error', { message: 'Ошибка при попытке забрать животное домой' });
    }
  });
}

module.exports = { registerAnimalHandlers };
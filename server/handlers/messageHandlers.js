const { isLovecParkTime, isLovecDachnyTime } = require('../src/utils/npcUtils');
const { updateRoomUsers } = require('../utils/roomUtils');

function registerMessageHandlers({
  io,
  socket,
  User,
  Message,
  roomUsers,
  userCurrentRoom
}) {
  socket.on('sendMessage', async (message) => {
    if (!socket.userData || !message || !message.room) {
      console.error('Invalid message data:', message);
      socket.emit('error', { message: 'Некорректные данные сообщения' });
      return;
    }

    try {
      const user = await User.findOne({ userId: socket.userData.userId });
      if (!user) {
        console.error('User not found for userId:', socket.userData.userId);
        socket.emit('error', { message: 'Пользователь не найден' });
        return;
      }

      const newMessage = new Message({
        userId: socket.userData.userId,
        text: message.text,
        firstName: user.firstName || '',
        username: user.username || '',
        lastName: user.lastName || '',
        photoUrl: user.photoUrl || '',
        name: user.name || '',
        isHuman: user.isHuman,
        animalType: user.animalType,
        room: message.room,
        timestamp: message.timestamp || new Date().toISOString(),
        animalText: message.animalText || undefined
      });
      await newMessage.save();

      await User.updateOne(
        { userId: socket.userData.userId },
        { lastActivity: new Date() }
      );

      console.log('Message saved:', { text: newMessage.text, animalText: newMessage.animalText });
      io.to(message.room).emit('message', newMessage);

      const isAnimal = !user.isHuman && (user.animalType === 'Кошка' || user.animalType === 'Собака');
      const isCatchableLocation = message.room === 'Парк' || message.room === 'Район Дачный';
      const hasAnimalCatcher = (
        (message.room === 'Парк' && isLovecParkTime()) ||
        (message.room === 'Район Дачный' && isLovecDachnyTime())
      );

      if (isAnimal && isCatchableLocation && hasAnimalCatcher && !user.owner && Math.random() < 0.1) {
        const newRoom = 'Приют для животных "Кошкин дом"';
        console.log(`Attempting to update lastRoom for user ${socket.userData.userId} to ${newRoom}`);

        try {
          const updateResult = await User.updateOne(
            { userId: socket.userData.userId },
            { lastRoom: newRoom }
          );
          console.log(`Update result: ${JSON.stringify(updateResult)}`);
        } catch (error) {
          console.error(`Error updating lastRoom for user ${socket.userData.userId}:`, error);
        }

        socket.emit('forceRoomChange', { newRoom });

        updateRoomUsers({
          io,
          roomUsers,
          userCurrentRoom,
          userId: socket.userData.userId,
          oldRoom: message.room,
          newRoom,
          userData: {
            userId: socket.userData.userId,
            firstName: socket.userData.firstName,
            username: socket.userData.username,
            lastName: socket.userData.lastName,
            photoUrl: socket.userData.photoUrl,
            name: user.name,
            isHuman: user.isHuman,
            owner: user.owner,
            homeless: user.homeless
          }
        });

        const messages = await Message.find({ room: newRoom }).sort({ timestamp: 1 }).limit(100);
        socket.emit('messageHistory', messages);
      }
    } catch (err) {
      console.error('Error saving message:', err.message, err.stack);
      socket.emit('error', { message: 'Ошибка при сохранении сообщения' });
    }
  });

  socket.on('sendSystemMessage', async (message) => {
    if (!socket.userData || !message || !message.room || !message.text) {
      console.error('Invalid system message data:', message);
      socket.emit('error', { message: 'Некорректные данные системного сообщения' });
      return;
    }

    try {
      const newMessage = new Message({
        userId: null,
        text: message.text,
        room: message.room,
        timestamp: message.timestamp || new Date().toISOString(),
        isSystem: true
      });
      await newMessage.save();

      console.log('System message saved:', { text: newMessage.text });
      io.to(message.room).emit('systemMessage', newMessage);
    } catch (err) {
      console.error('Error saving system message:', err.message, err.stack);
      socket.emit('error', { message: 'Ошибка при сохранении системного сообщения' });
    }
  });
}

module.exports = { registerMessageHandlers };
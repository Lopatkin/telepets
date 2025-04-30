function updateRoomUsers({ io, roomUsers, userCurrentRoom, userId, oldRoom, newRoom, userData }) {
    if (oldRoom && roomUsers[oldRoom]) {
      roomUsers[oldRoom].forEach(user => {
        if (user.userId === userId) {
          roomUsers[oldRoom].delete(user);
        }
      });
      io.to(oldRoom).emit('roomUsers', Array.from(roomUsers[oldRoom]));
    }
  
    if (newRoom) {
      userCurrentRoom.set(userId, newRoom);
      if (!roomUsers[newRoom]) roomUsers[newRoom] = new Set();
      roomUsers[newRoom].forEach(user => {
        if (user.userId === userId) {
          roomUsers[newRoom].delete(user);
        }
      });
      roomUsers[newRoom].add(userData);
      io.to(newRoom).emit('roomUsers', Array.from(roomUsers[newRoom]));
    }
  }
  
  module.exports = { updateRoomUsers };
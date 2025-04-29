const isLovecParkTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 8 * 60; // 8:00
    const endMinutes = 23 * 60; // 23:00
    return totalMinutes >= startMinutes && totalMinutes <= endMinutes && hours % 2 === 0;
  };
  
  const isLovecDachnyTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 7 * 60; // 7:00
    const endMinutes = 22 * 60; // 22:00
    return totalMinutes >= startMinutes && totalMinutes <= endMinutes && hours % 2 !== 0;
  };
  
  module.exports = {
    isLovecParkTime,
    isLovecDachnyTime
  };
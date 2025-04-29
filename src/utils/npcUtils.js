// Функции для проверки времени появления NPC

// Проверка времени для ловцов животных в Парке (8:00–23:00, чётные часы)
const isLovecParkTime = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  const startMinutes = 8 * 60; // 8:00
  const endMinutes = 23 * 60; // 23:00
  return totalMinutes >= startMinutes && totalMinutes <= endMinutes && hours % 2 === 0;
};

// Проверка времени для ловцов животных в Районе Дачном (7:00–22:00, нечётные часы)
const isLovecDachnyTime = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  const startMinutes = 7 * 60; // 7:00
  const endMinutes = 22 * 60; // 22:00
  return totalMinutes >= startMinutes && totalMinutes <= endMinutes && hours % 2 !== 0;
};

// Проверка времени для появления бабушек (6:00–7:00)
const isBabushkaTime = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return hours === 6 && minutes >= 0 && minutes <= 59;
};

// Проверка времени для волонтёров Иры и Кати (8:03–20:05)
const isIraKatyaTime = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  const startMinutes = 8 * 60 + 3; // 8:03
  const endMinutes = 20 * 60 + 5;  // 20:05
  return totalMinutes >= startMinutes && totalMinutes <= endMinutes;
};

// Проверка времени для волонтёра Жанны (19:53–8:12 следующего дня)
const isZhannaTime = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  const startMinutes = 19 * 60 + 53; // 19:53
  const endMinutes = 8 * 60 + 12;    // 8:12
  return totalMinutes >= startMinutes || totalMinutes <= endMinutes;
};

module.exports = {
  isLovecParkTime,
  isLovecDachnyTime,
  isBabushkaTime,
  isIraKatyaTime,
  isZhannaTime
};
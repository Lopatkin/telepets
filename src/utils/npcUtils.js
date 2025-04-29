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

// Данные NPC
const npcData = {
  'Парк': [
    { userId: 'npc_belochka', firstName: 'Белочка', photoUrl: '/images/npc_belochka.jpg', isHuman: false },
    { userId: 'npc_lovec_park', firstName: 'Ловец животных', photoUrl: '/images/lovec_1.jpg', isHuman: true, condition: isLovecParkTime }
  ],
  'Лес': [
    { userId: 'npc_fox', firstName: 'Лисичка', photoUrl: '/images/npc_fox.jpg', isHuman: false },
    { userId: 'npc_ezhik', firstName: 'Ёжик', photoUrl: '/images/npc_ezhik.jpg', isHuman: false }
  ],
  'Район Дачный': [
    { userId: 'npc_security', firstName: 'Охранник', photoUrl: '/images/npc_security.jpg', isHuman: true },
    { userId: 'npc_lovec_dachny', firstName: 'Ловец животных', photoUrl: '/images/lovec_2.jpg', isHuman: true, condition: isLovecDachnyTime }
  ],
  'Завод': [
    { userId: 'npc_guard', firstName: 'Сторож', photoUrl: '/images/npc_guard.jpg', isHuman: true }
  ],
  'Автобусная остановка': [
    { userId: 'npc_babushka_galya', firstName: 'Бабушка Галя', photoUrl: '/images/babushka_1.jpg', isHuman: true, condition: isBabushkaTime },
    { userId: 'npc_babushka_vera', firstName: 'Бабушка Вера', photoUrl: '/images/babushka_2.jpg', isHuman: true, condition: isBabushkaTime },
    { userId: 'npc_babushka_zina', firstName: 'Бабушка Зина', photoUrl: '/images/babushka_3.jpg', isHuman: true, condition: isBabushkaTime }
  ],
  'Приют для животных "Кошкин дом"': [
    { userId: 'npc_volonter_ira', firstName: 'Волонтёр Ира', photoUrl: '/images/volonter_Ira.jpg', isHuman: true, condition: isIraKatyaTime },
    { userId: 'npc_volonter_katya', firstName: 'Волонтёр Катя', photoUrl: '/images/volonter_Katya.jpg', isHuman: true, condition: isIraKatyaTime },
    { userId: 'npc_volonter_zhanna', firstName: 'Волонтёр Жанна', photoUrl: '/images/volonter_Zhanna.jpg', isHuman: true, condition: isZhannaTime }
  ],
  'Магазин "Всё на свете"': [
    { userId: 'npc_prodavec_sveta', firstName: 'Продавщица Света', photoUrl: '/images/prodavec_Sveta.jpg', isHuman: true }
  ],
  'Под мостом': [
    { userId: 'npc_lost_dog', firstName: 'Потерявшийся пёс', photoUrl: '/images/lost_dog_1.jpg', isHuman: false },
    { userId: 'npc_small_dog', firstName: 'Маленький бездомный пёсик', photoUrl: '/images/small_dog_1.jpg', isHuman: false },
    { userId: 'npc_ill_dog', firstName: 'Больная бездомная собака', photoUrl: '/images/ill_dog_1.jpg', isHuman: false },
    { userId: 'npc_limp_dog', firstName: 'Хромая бездомная собака', photoUrl: '/images/limp_dog_1.jpg', isHuman: false },
    { userId: 'npc_sad_dog', firstName: 'Грустная бездомная собака', photoUrl: '/images/sad_dog_1.jpg', isHuman: false },
    { userId: 'npc_mad_dog_1', firstName: 'Злая бездомная собака', photoUrl: '/images/mad_dog_1.jpg', isHuman: false },
    { userId: 'npc_mad_dog_2', firstName: 'Злой бездомный пёс', photoUrl: '/images/mad_dog_2.jpg', isHuman: false }
  ]
};

// Функция для получения активных NPC в комнате
const getActiveNPCs = (room) => {
  const npcs = npcData[room] || [];
  return npcs.filter(npc => !npc.condition || npc.condition());
};

module.exports = {
  isLovecParkTime,
  isLovecDachnyTime,
  isBabushkaTime,
  isIraKatyaTime,
  isZhannaTime,
  getActiveNPCs
};
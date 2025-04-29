// Импорты изображений NPC
import belochkaImg from '../images/npc_belochka.jpg';
import lovec1Img from '../images/lovec_1.jpg';
import foxImg from '../images/npc_fox.jpg';
import ezhikImg from '../images/npc_ezhik.jpg';
import securityImg from '../images/npc_security.jpg';
import lovec2Img from '../images/lovec_2.jpg';
import guardImg from '../images/npc_guard.jpg';
import babushka1Img from '../images/babushka_1.jpg';
import babushka2Img from '../images/babushka_2.jpg';
import babushka3Img from '../images/babushka_3.jpg';
import volonterIraImg from '../images/volonter_Ira.jpg';
import volonterKatyaImg from '../images/volonter_Katya.jpg';
import volonterZhannaImg from '../images/volonter_Zhanna.jpg';
import prodavecSvetaImg from '../images/prodavec_Sveta.jpg';
import lostDogImg from '../images/lost_dog_1.jpg';
import smallDogImg from '../images/small_dog_1.jpg';
import illDogImg from '../images/ill_dog_1.jpg';
import limpDogImg from '../images/limp_dog_1.jpg';
import sadDogImg from '../images/sad_dog_1.jpg';
import madDog1Img from '../images/mad_dog_1.jpg';
import madDog2Img from '../images/mad_dog_2.jpg';

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
    { userId: 'npc_belochka', firstName: 'Белочка', photoUrl: belochkaImg, isHuman: false },
    { userId: 'npc_lovec_park', firstName: 'Ловец животных', photoUrl: lovec1Img, isHuman: true, condition: isLovecParkTime }
  ],
  'Лес': [
    { userId: 'npc_fox', firstName: 'Лисичка', photoUrl: foxImg, isHuman: false },
    { userId: 'npc_ezhik', firstName: 'Ёжик', photoUrl: ezhikImg, isHuman: false }
  ],
  'Район Дачный': [
    { userId: 'npc_security', firstName: 'Охранник', photoUrl: securityImg, isHuman: true },
    { userId: 'npc_lovec_dachny', firstName: 'Ловец животных', photoUrl: lovec2Img, isHuman: true, condition: isLovecDachnyTime }
  ],
  'Завод': [
    { userId: 'npc_guard', firstName: 'Сторож', photoUrl: guardImg, isHuman: true }
  ],
  'Автобусная остановка': [
    { userId: 'npc_babushka_galya', firstName: 'Бабушка Галя', photoUrl: babushka1Img, isHuman: true, condition: isBabushkaTime },
    { userId: 'npc_babushka_vera', firstName: 'Бабушка Вера', photoUrl: babushka2Img, isHuman: true, condition: isBabushkaTime },
    { userId: 'npc_babushka_zina', firstName: 'Бабушка Зина', photoUrl: babushka3Img, isHuman: true, condition: isBabushkaTime }
  ],
  'Приют для животных "Кошкин дом"': [
    { userId: 'npc_volonter_ira', firstName: 'Волонтёр Ира', photoUrl: volonterIraImg, isHuman: true, condition: isIraKatyaTime },
    { userId: 'npc_volonter_katya', firstName: 'Волонтёр Катя', photoUrl: volonterKatyaImg, isHuman: true, condition: isIraKatyaTime },
    { userId: 'npc_volonter_zhanna', firstName: 'Волонтёр Жанна', photoUrl: volonterZhannaImg, isHuman: true, condition: isZhannaTime }
  ],
  'Магазин "Всё на свете"': [
    { userId: 'npc_prodavec_sveta', firstName: 'Продавщица Света', photoUrl: prodavecSvetaImg, isHuman: true }
  ],
  'Под мостом': [
    { userId: 'npc_lost_dog', firstName: 'Потерявшийся пёс', photoUrl: lostDogImg, isHuman: false },
    { userId: 'npc_small_dog', firstName: 'Маленький бездомный пёсик', photoUrl: smallDogImg, isHuman: false },
    { userId: 'npc_ill_dog', firstName: 'Больная бездомная собака', photoUrl: illDogImg, isHuman: false },
    { userId: 'npc_limp_dog', firstName: 'Хромая бездомная собака', photoUrl: limpDogImg, isHuman: false },
    { userId: 'npc_sad_dog', firstName: 'Грустная бездомная собака', photoUrl: sadDogImg, isHuman: false },
    { userId: 'npc_mad_dog_1', firstName: 'Злая бездомная собака', photoUrl: madDog1Img, isHuman: false },
    { userId: 'npc_mad_dog_2', firstName: 'Злой бездомный пёс', photoUrl: madDog2Img, isHuman: false }
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
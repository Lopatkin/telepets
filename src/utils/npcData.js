import {
  isLovecParkTime,
  isLovecDachnyTime,
  isBabushkaTime,
  isIraKatyaTime,
  isZhannaTime
} from './npcUtils';

// Импорты изображений NPC
import belochkaImg from '../images/npc_belochka.jpg';
import lovec1Img from '../images/npc_lovec_1.jpg';
import foxImg from '../images/npc_fox.jpg';
import ezhikImg from '../images/npc_ezhik.jpg';
import securityImg from '../images/npc_security.jpg';
import lovec2Img from '../images/npc_lovec_2.jpg';
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
// Добавляем импорты для новых NPC (замените пути на актуальные изображения)
import mouseImg from '../images/npc_mouse.jpg';
import wolfImg from '../images/npc_wolf.jpg';
import boarImg from '../images/npc_boar.jpg';
import bearImg from '../images/npc_bear.jpg';

// Данные NPC
const npcData = {
  'Парк': [
    { userId: 'npc_belochka', firstName: 'Белочка', photoUrl: belochkaImg, isHuman: false },
    { userId: 'npc_lovec_park', firstName: 'Ловец животных', photoUrl: lovec1Img, isHuman: true, condition: isLovecParkTime }
  ],
  'Лес': [
    {
      userId: 'npc_fox',
      firstName: 'Лисичка',
      photoUrl: foxImg,
      isHuman: false,
      stats: {
        health: 40,
        attack: 10,
        defense: 10
      }
    },
    {
      userId: 'npc_ezhik',
      firstName: 'Ёжик',
      photoUrl: ezhikImg,
      isHuman: false,
      stats: {
        health: 20,
        attack: 3,
        defense: 5
      }
    },
    // Добавляем Мышку
    {
      userId: 'npc_mouse',
      firstName: 'Мышка',
      photoUrl: mouseImg,
      isHuman: false,
      stats: {
        health: 10,
        attack: 2,
        defense: 2
      }
    },
    // Добавляем Волка
    {
      userId: 'npc_wolf',
      firstName: 'Волк',
      photoUrl: wolfImg, // Замените на wolfImg, когда добавите изображение
      isHuman: false,
      stats: {
        health: 100,
        attack: 50,
        defense: 30
      }
    },
    // Добавляем Кабана
    {
      userId: 'npc_boar',
      firstName: 'Кабан',
      photoUrl: boarImg, // Замените на boarImg, когда добавите изображение
      isHuman: false,
      stats: {
        health: 200,
        attack: 90,
        defense: 120
      }
    },
    // Добавляем Медведя
    {
      userId: 'npc_bear',
      firstName: 'Медведь',
      photoUrl: bearImg, // Замените на bearImg, когда добавите изображение
      isHuman: false,
      stats: {
        health: 900,
        attack: 300,
        defense: 600
      }
    }
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
export const getActiveNPCs = (room) => {
  const npcs = npcData[room] || [];
  return npcs.filter(npc => !npc.condition || npc.condition());
};
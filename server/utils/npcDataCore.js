const npcData = {
    'Парк': [
      { userId: 'npc_belochka', firstName: 'Белочка', isHuman: false },
      { userId: 'npc_lovec_park', firstName: 'Ловец животных', isHuman: true, condition: 'isLovecParkTime' }
    ],
    'Лес': [
      {
        userId: 'npc_fox',
        firstName: 'Лисичка',
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
        isHuman: false,
        stats: {
          health: 20,
          attack: 3,
          defense: 5
        }
      },
      {
        userId: 'npc_mouse',
        firstName: 'Мышка',
        isHuman: false,
        stats: {
          health: 10,
          attack: 2,
          defense: 2
        }
      },
      {
        userId: 'npc_wolf',
        firstName: 'Волк',
        isHuman: false,
        stats: {
          health: 100,
          attack: 50,
          defense: 30
        }
      },
      {
        userId: 'npc_boar',
        firstName: 'Кабан',
        isHuman: false,
        stats: {
          health: 200,
          attack: 90,
          defense: 120
        }
      },
      {
        userId: 'npc_bear',
        firstName: 'Медведь',
        isHuman: false,
        stats: {
          health: 900,
          attack: 300,
          defense: 600
        }
      }
    ],
    'Район Дачный': [
      { userId: 'npc_security', firstName: 'Охранник', isHuman: true },
      { userId: 'npc_lovec_dachny', firstName: 'Ловец животных', isHuman: true, condition: 'isLovecDachnyTime' }
    ],
    'Завод': [
      { userId: 'npc_guard', firstName: 'Сторож', isHuman: true }
    ],
    'Автобусная остановка': [
      { userId: 'npc_babushka_galya', firstName: 'Бабушка Галя', isHuman: true, condition: 'isBabushkaTime' },
      { userId: 'npc_babushka_vera', firstName: 'Бабушка Вера', isHuman: true, condition: 'isBabushkaTime' },
      { userId: 'npc_babushka_zina', firstName: 'Бабушка Зина', isHuman: true, condition: 'isBabushkaTime' }
    ],
    'Приют для животных "Кошкин дом"': [
      { userId: 'npc_volonter_ira', firstName: 'Волонтёр Ира', isHuman: true, condition: 'isIraKatyaTime' },
      { userId: 'npc_volonter_katya', firstName: 'Волонтёр Катя', isHuman: true, condition: 'isIraKatyaTime' },
      { userId: 'npc_volonter_zhanna', firstName: 'Волонтёр Жанна', isHuman: true, condition: 'isZhannaTime' }
    ],
    'Магазин "Всё на свете"': [
      { userId: 'npc_prodavec_sveta', firstName: 'Продавщица Света', isHuman: true }
    ],
    'Под мостом': [
      { userId: 'npc_lost_dog', firstName: 'Потерявшийся пёс', isHuman: false },
      { userId: 'npc_small_dog', firstName: 'Маленький бездомный пёсик', isHuman: false },
      { userId: 'npc_ill_dog', firstName: 'Больная бездомная собака', isHuman: false },
      { userId: 'npc_limp_dog', firstName: 'Хромая бездомная собака', isHuman: false },
      { userId: 'npc_sad_dog', firstName: 'Грустная бездомная собака', isHuman: false },
      { userId: 'npc_mad_dog_1', firstName: 'Злая бездомная собака', isHuman: false },
      { userId: 'npc_mad_dog_2', firstName: 'Злой бездомный пёс', isHuman: false }
    ]
  };
  
  module.exports = npcData;
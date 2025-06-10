// Конфигурация обработчиков действий для handleButtonClick
const actionHandlers = {
  'Найти палку': {
    item: {
      name: 'Палка',
      description: 'Многофункциональная вещь',
      rarity: 'Обычный',
      weight: 1,
      cost: 5,
      effect: 'Вы чувствуете себя более уверенно в тёмное время суток',
    },
    successMessage: 'Вы нашли палку!',
    cooldownKey: 'findStick',
  },
  'Найти ягоды': {
    item: {
      name: 'Лесные ягоды',
      description: 'Вкусные и свежие',
      rarity: 'Обычный',
      weight: 0.1,
      cost: 10,
      effect: 'Слегка утоляют голод и повышают настроение',
    },
    successMessage: 'Вы нашли лесные ягоды!',
    cooldownKey: 'findBerries',
  },
  'Найти грибы': {
    item: {
      name: 'Лесные грибы',
      description: 'Вкусные и полезные, если не ядовитые',
      rarity: 'Обычный',
      weight: 0.3,
      cost: 10,
      effect: 'Слегка утоляют голод и повышают настроение, если правильно приготовить',
    },
    successMessage: 'Вы нашли лесные грибы!',
    cooldownKey: 'findMushrooms',
  },
  'Утилизировать мусор': {
    action: 'utilizeTrash',
    successMessage: 'Мусор утилизирован!',
  },
  'Попросить еды': {
    systemMessage: user => `${user.name} хочет есть`,
    successMessage: 'Запрос еды отправлен хозяину!',
    requiresOwner: true,
  },
  'Помяукать': {
    systemMessage: user => `${user.name} мяукает`,
    successMessage: 'Вы помяукали!',
  },
  'Погавкать': {
    systemMessage: user => `${user.name} гавкает`,
    successMessage: 'Вы погавкали!',
  },
  'Поспать': {
    systemMessage: user => `${user.name} лёг спать`,
    successMessage: 'Вы уютно заснули!',
  },
  'Попросить поиграть': {
    systemMessage: user => `${user.name} хочет поиграть`,
    successMessage: 'Запрос на игру отправлен хозяину!',
    requiresOwner: true,
  },
  'Поиграть с другими животными': {
    systemMessage: user => `${user.name} играет с другими животными`,
    successMessage: 'Вы весело поиграли!',
  },
  'Поесть из миски': {
    systemMessage: user => `${user.name} ест из миски`,
    successMessage: 'Вы поели!',
  },
  'Охотиться': {
    action: 'hunt',
    successMessage: 'Бой начался!',
    cooldownKey: 'hunt'
  },
};

export default actionHandlers;
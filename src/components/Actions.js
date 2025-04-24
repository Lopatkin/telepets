import React, { useState, useEffect, useMemo } from 'react';
import {
  ProgressBarContainer, Progress, StartButton, CheckboxContainer, CheckboxLabel, Checkbox,
  SliderContainer, SliderLabel, Slider, SliderValue, Select, MaterialsText,
  ActionsContainer, ActionGrid, ContentContainer, ActionCard, ActionTitle,
  ActionDescription, ModalOverlay, ModalContent, ModalTitle, ModalDescription,
  CloseButton, ActionButton, ProgressBar, Notification, TimerDisplay
} from '../styles/ActionsStyles';
import { FaTimes } from 'react-icons/fa';

const homeActions = [
  {
    id: 1,
    title: 'Поспать',
    description: 'Вы ложитесь спать',
    modalTitle: 'Поспать',
    modalDescription: 'Вы ложитесь спать, чтобы восстановить силы. В час восстанавливается около 10% Здоровья',
    buttonText: 'Заснуть',
  },
  {
    id: 2,
    title: 'Поесть',
    description: 'Время подкрепиться!',
    modalTitle: 'Поесть',
    modalDescription: 'Вы чувствуете голод и решаете немного перекусить. За один приём пищи восстанавливается 30% сытости',
    buttonText: 'Поесть',
  },
  {
    id: 3,
    title: 'Тренировка',
    description: 'Поддержание физической формы',
    modalTitle: 'Тренировка',
    modalDescription: 'Вы решаете потренироваться, чтобы держать своё тело в тонусе. Восстанавливает здоровье и улучшает настроение, но также пробуждает аппетит',
    buttonText: 'Потренить',
  },
  {
    id: 4,
    title: 'Почитать',
    description: 'Вы читаете книгу',
    modalTitle: 'Почитать',
    modalDescription: 'Вы решаете отдохнуть, полежать и почитать книгу. Пусть дела подождут. Повышает настроение',
    buttonText: 'Почитать',
  },
  {
    id: 5,
    title: 'Прибраться',
    description: 'Вы убираетесь в доме',
    modalTitle: 'Прибраться',
    modalDescription: 'Вы решаете навести порядок в доме',
    buttonText: 'Прибраться',
  },
];

const busStopActions = [
  {
    id: 6,
    title: 'Присесть',
    description: 'Присесть на скамейку',
    modalTitle: 'Присесть',
    modalDescription: 'Вы садитесь на скамейку в ожидании автобуса.',
    buttonText: 'Сесть',
  },
  {
    id: 7,
    title: 'Почитать объявления',
    description: 'На остановке много расклеенных объявлений.',
    modalTitle: 'Почитать',
    modalDescription: 'Пока ждёте транспорт Вы решаете почитать объявления, расклеенные на остановке. Вдруг что-то полезное или интересное?',
    buttonText: 'Почитать',
  },
  {
    id: 8,
    title: 'Закурить',
    description: 'Хоть это и вредно',
    modalTitle: 'Закурить',
    modalDescription: 'Как известно, если закурить сигарету, то автобус тут же приедет. Проверите?',
    buttonText: 'Закурить',
  },
];

const forestActions = [
  {
    id: 9,
    title: 'Найти палку',
    description: 'Палка - очень полезный предмет',
    modalTitle: 'Найти палку',
    modalDescription: 'Вы ходите по лесу и ищете палку. Палка - полезный и многофункциональный предмет, может пригодиться в самых разных жизненных ситуациях.',
    buttonText: 'Подобрать',
  },
  {
    id: 16,
    title: 'Найти ягоды',
    description: 'Вкусные и свежие',
    modalTitle: 'Найти ягоды',
    modalDescription: 'Вы ходите по лесу и ищете ягоды. Ежевика, брусника, черника, земляника. Съешьте сами или продайте.',
    buttonText: 'Найти',
  },
  {
    id: 17,
    title: 'Найти грибы',
    description: 'Выбирайте только съедобные',
    modalTitle: 'Найти грибы',
    modalDescription: 'Вы ходите по лесу и ищете грибы. Белый гриб, подберёзович, лисички, опята. Съешьте сами или продайте.',
    buttonText: 'Найти',
  },
];

const disposalActions = [
  {
    id: 10,
    title: 'Утилизировать мусор',
    description: 'Избавьтесь от ненужного хлама',
    modalTitle: 'Утилизировать мусор',
    modalDescription: 'Вы сдаёте мусор на переработку. Это очищает ваш инвентарь от предметов с названием "Мусор".',
    buttonText: 'Утилизировать',
  },
];

const workshopActions = [
  {
    id: 11,
    title: 'Столярная мастерская',
    description: 'Создавайте деревянные изделия',
    modalTitle: 'Столярная мастерская',
    modalDescription: 'Используйте инструменты, чтобы смастерить что-то полезное',
    buttonText: 'Создать',
    craftableItems: [
      { name: 'Доска', materials: { sticks: 2, boards: 0 }, clicksRequired: 4 },
      { name: 'Стул', materials: { sticks: 4, boards: 1 }, clicksRequired: 10 },
      { name: 'Стол', materials: { sticks: 4, boards: 2 }, clicksRequired: 12 },
      { name: 'Шкаф', materials: { sticks: 2, boards: 8 }, clicksRequired: 20 },
      { name: 'Кровать', materials: { sticks: 4, boards: 6 }, clicksRequired: 20 },
    ],
  },
];

const animalActions = (animalType) => [
  {
    id: 12,
    title: 'Попросить еды',
    description: 'Попросить хозяина покормить вас',
    modalTitle: 'Попросить еды',
    modalDescription: 'Вы просите хозяина дать вам еды. Это отправит уведомление вашему владельцу.',
    buttonText: 'Попросить'
  },
  {
    id: 13,
    title: animalType === 'Собака' ? 'Погавкать' : 'Помяукать',
    description: animalType === 'Собака' ? 'Громко гавкнуть' : 'Мяукнуть, чтобы привлечь внимание',
    modalTitle: animalType === 'Собака' ? 'Погавкать' : 'Помяукать',
    modalDescription: animalType === 'Собака' ? 'Вы громко гавкаете, чтобы привлечь внимание хозяина.' : 'Вы мяукаете, чтобы хозяин обратил на вас внимание.',
    buttonText: animalType === 'Собака' ? 'Гав!' : 'Мяу!'
  },
  {
    id: 14,
    title: 'Поспать',
    description: 'Улечься и поспать',
    modalTitle: 'Поспать',
    modalDescription: 'Вы находите уютное место и засыпаете, чтобы восстановить силы.',
    buttonText: 'Заснуть'
  },
  {
    id: 15,
    title: 'Попросить поиграть',
    description: 'Попросить хозяина поиграть с вами',
    modalTitle: 'Попросить поиграть',
    modalDescription: 'Вы просите хозяина поиграть с вами. Это отправит уведомление вашему владельцу.',
    buttonText: 'Попросить'
  }
];

function Actions({ theme, currentRoom, userId, socket, personalItems, user }) {
  const [selectedAction, setSelectedAction] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [isCooldown, setIsCooldown] = useState({ findStick: false, findBerries: false, findMushrooms: false });
  const [timeLeft, setTimeLeft] = useState({ findStick: 0, findBerries: 0, findMushrooms: 0 });
  const [progress, setProgress] = useState({ findStick: 100, findBerries: 100, findMushrooms: 100 });
  const [selectedCraftItem, setSelectedCraftItem] = useState('Доска');
  const [sliderValues, setSliderValues] = useState({ sticks: 0, boards: 0 });
  const [checkboxes, setCheckboxes] = useState({
    prepareMachine: false,
    measureAndMark: false,
    secureMaterials: false,
  });
  const [clickCount, setClickCount] = useState(0);
  const [craftingProgress, setCraftingProgress] = useState(0);

  const COOLDOWN_DURATION = 10 * 1000;
  const COOLDOWN_KEYS = useMemo(() => ({
    findStick: `findStickCooldown_${userId}`,
    findBerries: `findBerriesCooldown_${userId}`,
    findMushrooms: `findMushroomsCooldown_${userId}`,
  }), [userId]);

  // Восстановление состояния таймера при монтировании компонента
  useEffect(() => {
    Object.keys(COOLDOWN_KEYS).forEach((key) => {
      const savedCooldown = localStorage.getItem(COOLDOWN_KEYS[key]);
      if (savedCooldown) {
        const { startTime } = JSON.parse(savedCooldown);
        const elapsed = Date.now() - startTime;
        const remaining = COOLDOWN_DURATION - elapsed;

        if (remaining > 0) {
          setIsCooldown((prev) => ({ ...prev, [key]: true }));
          setTimeLeft((prev) => ({ ...prev, [key]: Math.ceil(remaining / 1000) }));
          setProgress((prev) => ({ ...prev, [key]: (remaining / COOLDOWN_DURATION) * 100 }));
        } else {
          localStorage.removeItem(COOLDOWN_KEYS[key]);
          setIsCooldown((prev) => ({ ...prev, [key]: false }));
          setTimeLeft((prev) => ({ ...prev, [key]: 0 }));
          setProgress((prev) => ({ ...prev, [key]: 100 }));
        }
      }
    });
  }, [COOLDOWN_DURATION, COOLDOWN_KEYS]);

  // Таймер обратного отсчёта для каждого действия
  useEffect(() => {
    const timers = Object.keys(COOLDOWN_KEYS).map((key) =>
      setInterval(() => {
        if (isCooldown[key] && timeLeft[key] > 0) {
          const savedCooldown = localStorage.getItem(COOLDOWN_KEYS[key]);
          if (!savedCooldown) return;

          const { startTime } = JSON.parse(savedCooldown);
          const elapsed = Date.now() - startTime;
          const remaining = COOLDOWN_DURATION - elapsed;

          if (remaining <= 0) {
            setIsCooldown((prev) => ({ ...prev, [key]: false }));
            setTimeLeft((prev) => ({ ...prev, [key]: 0 }));
            setProgress((prev) => ({ ...prev, [key]: 0 }));
            localStorage.removeItem(COOLDOWN_KEYS[key]);
          } else {
            setTimeLeft((prev) => ({ ...prev, [key]: Math.ceil(remaining / 1000) }));
            setProgress((prev) => ({ ...prev, [key]: (remaining / COOLDOWN_DURATION) * 100 }));
          }
        }
      }, 1000)
    );

    return () => timers.forEach((timer) => clearInterval(timer));
  }, [isCooldown, timeLeft, COOLDOWN_DURATION, COOLDOWN_KEYS]);

  const handleActionClick = (action) => {
    const actionKey = {
      'Найти палку': 'findStick',
      'Найти ягоды': 'findBerries',
      'Найти грибы': 'findMushrooms',
    }[action.title];

    if (actionKey && isCooldown[actionKey]) {
      setNotification({ show: true, message: 'Действие недоступно, подождите' });
      setTimeout(() => setNotification({ show: false, message: '' }), 2000);
      return;
    }

    setSelectedAction(action);

    if (action.title === 'Столярная мастерская') {
      setSelectedCraftItem(action.craftableItems[0].name);
      setSliderValues({ sticks: 0, boards: 0 });
      setCheckboxes({ prepareMachine: false, measureAndMark: false, secureMaterials: false });
      setClickCount(0);
      setCraftingProgress(0);
    }
  };

  const handleCloseModal = () => {
    setSelectedAction(null);
    setClickCount(0);
    setCraftingProgress(0);
  };

  const handleCraftItemChange = (e) => {
    setSelectedCraftItem(e.target.value);
    setSliderValues({ sticks: 0, boards: 0 });
    setCheckboxes({ prepareMachine: false, measureAndMark: false, secureMaterials: false });
    setClickCount(0);
    setCraftingProgress(0);
  };

  const handleSliderChange = (type, value) => {
    setSliderValues(prev => ({ ...prev, [type]: parseInt(value, 10) }));
  };

  const handleCheckboxChange = (key) => {
    setCheckboxes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const hasEnoughMaterials = () => {
    if (!selectedAction || selectedAction.title !== 'Столярная мастерская') return false;
    const item = selectedAction.craftableItems.find(i => i.name === selectedCraftItem);
    const requiredSticks = item.materials.sticks;
    const requiredBoards = item.materials.boards;

    const stickCount = personalItems.filter(i => i.name === 'Палка').length;
    const boardCount = personalItems.filter(i => i.name === 'Доска').length;

    return stickCount >= requiredSticks && boardCount >= requiredBoards;
  };

  const canStartCrafting = () => {
    if (!selectedAction || selectedAction.title !== 'Столярная мастерская') return false;
    const item = selectedAction.craftableItems.find(i => i.name === selectedCraftItem);
    const requiredSticks = item.materials.sticks;
    const requiredBoards = item.materials.boards;

    const slidersCorrect = sliderValues.sticks === requiredSticks && sliderValues.boards === requiredBoards;
    const checkboxesChecked = checkboxes.prepareMachine && checkboxes.measureAndMark && checkboxes.secureMaterials;
    const materialsAvailable = hasEnoughMaterials();

    return slidersCorrect && checkboxesChecked && materialsAvailable;
  };

  const handleButtonClick = () => {
    if (!socket) {
      console.error('Socket is not initialized');
      setNotification({ show: true, message: 'Ошибка соединения' });
      setTimeout(() => setNotification({ show: false, message: '' }), 2000);
      return;
    }

    if (selectedAction.title === 'Найти палку') {
      const newItem = {
        name: 'Палка',
        description: 'Многофункциональная вещь',
        rarity: 'Обычный',
        weight: 1,
        cost: 5,
        effect: 'Вы чувствуете себя более уверенно в тёмное время суток',
      };
      socket.emit('addItem', { owner: `user_${userId}`, item: newItem }, (response) => {
        if (response && response.success) {
          setSelectedAction(null);
          setNotification({ show: true, message: 'Вы нашли палку!' });
          setTimeout(() => {
            setNotification({ show: false, message: '' });
          }, 2000);
          setIsCooldown((prev) => ({ ...prev, findStick: true }));
          setTimeLeft((prev) => ({ ...prev, findStick: Math.floor(COOLDOWN_DURATION / 1000) }));
          setProgress((prev) => ({ ...prev, findStick: 100 }));
          localStorage.setItem(COOLDOWN_KEYS.findStick, JSON.stringify({ startTime: Date.now() }));
        } else {
          setSelectedAction(null);
          setNotification({ show: true, message: response?.message || 'Ошибка при добавлении предмета' });
          setTimeout(() => setNotification({ show: false, message: '' }), 2000);
        }
      });
    } else if (selectedAction.title === 'Найти ягоды') {
      const newItem = {
        name: 'Лесные ягоды',
        description: 'Вкусные и свежие',
        rarity: 'Обычный',
        weight: 0.1,
        cost: 10,
        effect: 'Слегка утоляют голод и повышают настроение',
      };
      socket.emit('addItem', { owner: `user_${userId}`, item: newItem }, (response) => {
        if (response && response.success) {
          setSelectedAction(null);
          setNotification({ show: true, message: 'Вы нашли лесные ягоды!' });
          setTimeout(() => {
            setNotification({ show: false, message: '' });
          }, 2000);
          setIsCooldown((prev) => ({ ...prev, findBerries: true }));
          setTimeLeft((prev) => ({ ...prev, findBerries: Math.floor(COOLDOWN_DURATION / 1000) }));
          setProgress((prev) => ({ ...prev, findBerries: 100 }));
          localStorage.setItem(COOLDOWN_KEYS.findBerries, JSON.stringify({ startTime: Date.now() }));
        } else {
          setSelectedAction(null);
          setNotification({ show: true, message: response?.message || 'Ошибка при добавлении предмета' });
          setTimeout(() => setNotification({ show: false, message: '' }), 2000);
        }
      });
    } else if (selectedAction.title === 'Найти грибы') {
      const newItem = {
        name: 'Лесные грибы',
        description: 'Вкусные и полезные, если не ядовитые',
        rarity: 'Обычный',
        weight: 0.3,
        cost: 10,
        effect: 'Слегка утоляют голод и повышают настроение, если правильно приготовить',
      };
      socket.emit('addItem', { owner: `user_${userId}`, item: newItem }, (response) => {
        if (response && response.success) {
          setSelectedAction(null);
          setNotification({ show: true, message: 'Вы нашли лесные грибы!' });
          setTimeout(() => {
            setNotification({ show: false, message: '' });
          }, 2000);
          setIsCooldown((prev) => ({ ...prev, findMushrooms: true }));
          setTimeLeft((prev) => ({ ...prev, findMushrooms: Math.floor(COOLDOWN_DURATION / 1000) }));
          setProgress((prev) => ({ ...prev, findMushrooms: 100 }));
          localStorage.setItem(COOLDOWN_KEYS.findMushrooms, JSON.stringify({ startTime: Date.now() }));
        } else {
          setSelectedAction(null);
          setNotification({ show: true, message: response?.message || 'Ошибка при добавлении предмета' });
          setTimeout(() => setNotification({ show: false, message: '' }), 2000);
        }
      });
    } else if (selectedAction.title === 'Утилизировать мусор') {
      socket.emit('utilizeTrash', (response) => {
        if (response && response.success) {
          setSelectedAction(null);
          setNotification({ show: true, message: response.message });
          setTimeout(() => setNotification({ show: false, message: '' }), 2000);
          socket.emit('getItems', { owner: `user_${userId}` });
        } else {
          setSelectedAction(null);
          setNotification({ show: true, message: response?.message || 'Ошибка при утилизации' });
          setTimeout(() => setNotification({ show: false, message: '' }), 2000);
        }
      });
    } else if (selectedAction.title === 'Столярная мастерская') {
      const item = selectedAction.craftableItems.find(i => i.name === selectedCraftItem);
      const requiredSticks = item.materials.sticks;
      const requiredBoards = item.materials.boards;

      if (sliderValues.sticks !== requiredSticks || sliderValues.boards !== requiredBoards) {
        setNotification({ show: true, message: 'Установите правильное количество материалов!' });
        setTimeout(() => setNotification({ show: false, message: '' }), 2000);
        return;
      }

      if (!checkboxes.prepareMachine || !checkboxes.measureAndMark || !checkboxes.secureMaterials) {
        setNotification({ show: true, message: 'Необходимо выполнить все шаги подготовки!' });
        setTimeout(() => setNotification({ show: false, message: '' }), 2000);
        return;
      }

      if (!hasEnoughMaterials()) {
        setNotification({ show: true, message: 'Недостаточно материалов в инвентаре!' });
        setTimeout(() => setNotification({ show: false, message: '' }), 2000);
        return;
      }

      setNotification({ show: true, message: `Нажмите "СТАРТ" для создания: ${selectedCraftItem}` });
      setTimeout(() => setNotification({ show: false, message: '' }), 2000);
    } else if (selectedAction.title === 'Попросить еды') {
      if (!user.owner) {
        setNotification({ show: true, message: 'У вас нет владельца!' });
        setTimeout(() => setNotification({ show: false, message: '' }), 2000);
        return;
      }
      socket.emit('sendSystemMessage', {
        text: `${user.name} хочет есть`,
        room: currentRoom,
        timestamp: new Date().toISOString()
      }, () => {
        setSelectedAction(null);
        setNotification({ show: true, message: 'Запрос еды отправлен хозяину!' });
        setTimeout(() => setNotification({ show: false, message: '' }), 2000);
      });
    } else if (selectedAction.title === 'Помяукать') {
      socket.emit('sendSystemMessage', {
        text: `${user.name} мяукает`,
        room: currentRoom,
        timestamp: new Date().toISOString()
      }, () => {
        setSelectedAction(null);
        setNotification({ show: true, message: 'Вы помяукали!' });
        setTimeout(() => setNotification({ show: false, message: '' }), 2000);
      });
    } else if (selectedAction.title === 'Поспать') {
      socket.emit('sendSystemMessage', {
        text: `${user.name} лёг спать`,
        room: currentRoom,
        timestamp: new Date().toISOString()
      }, () => {
        setSelectedAction(null);
        setNotification({ show: true, message: 'Вы уютно заснули!' });
        setTimeout(() => setNotification({ show: false, message: '' }), 2000);
      });
    } else if (selectedAction.title === 'Попросить поиграть') {
      if (!user.owner) {
        setNotification({ show: true, message: 'У вас нет владельца!' });
        setTimeout(() => setNotification({ show: false, message: '' }), 2000);
        return;
      }
      socket.emit('sendSystemMessage', {
        text: `${user.name} хочет поиграть с вами`,
        room: currentRoom,
        timestamp: new Date().toISOString()
      }, () => {
        setSelectedAction(null);
        setNotification({ show: true, message: 'Запрос на игру отправлен хозяину!' });
        setTimeout(() => setNotification({ show: false, message: '' }), 2000);
      });
    }
  };

  const handleStartClick = () => {
    if (!canStartCrafting()) {
      setNotification({ show: true, message: 'Не все условия выполнены!' });
      setTimeout(() => setNotification({ show: false, message: '' }), 2000);
      return;
    }

    const item = selectedAction.craftableItems.find(i => i.name === selectedCraftItem);
    const clicksRequired = item.clicksRequired;

    setClickCount(prev => prev + 1);
    const newClickCount = clickCount + 1;
    const newProgress = (newClickCount / clicksRequired) * 100;
    setCraftingProgress(newProgress);

    if (newClickCount < clicksRequired) {
      setNotification({ show: true, message: `Осталось нажатий: ${clicksRequired - newClickCount}` });
      setTimeout(() => setNotification({ show: false, message: '' }), 1000);
      return;
    }

    const craftedItem = {
      name: selectedCraftItem,
      description: getItemDescription(selectedCraftItem),
      rarity: 'Обычный',
      weight: getItemWeight(selectedCraftItem),
      cost: getItemCost(selectedCraftItem),
      effect: getItemEffect(selectedCraftItem),
    };

    const requiredSticks = item.materials.sticks;
    const requiredBoards = item.materials.boards;

    if (requiredSticks > 0) {
      socket.emit('removeItems', {
        owner: `user_${userId}`,
        name: 'Палка',
        count: requiredSticks,
      });
    }
    if (requiredBoards > 0) {
      socket.emit('removeItems', {
        owner: `user_${userId}`,
        name: 'Доска',
        count: requiredBoards,
      });
    }

    setSelectedAction(null);
    setClickCount(0);
    setCraftingProgress(0);

    socket.emit('addItem', { owner: 'Мастерская', item: craftedItem }, (response) => {
      if (response && response.success) {
        setNotification({ show: true, message: `Вы успешно создали: ${selectedCraftItem}!` });
        setTimeout(() => {
          setNotification({ show: false, message: '' });
          setSelectedAction(null);
          setClickCount(0);
          setCraftingProgress(0);
        }, 2000);
      } else {
        setNotification({ show: true, message: response?.message || 'Ошибка при создании предмета' });
        setTimeout(() => setNotification({ show: false, message: '' }), 2000);
      }
    });
  };

  const getItemDescription = (name) => {
    switch (name) {
      case 'Доска': return 'Материал для изготовления';
      case 'Стул': return 'Предмет мебели';
      case 'Стол': return 'Предмет мебели';
      case 'Шкаф': return 'Предмет мебели';
      case 'Кровать': return 'Предмет мебели';
      default: return '';
    }
  };

  const getItemWeight = (name) => {
    switch (name) {
      case 'Доска': return 2;
      case 'Стул': return 6;
      case 'Стол': return 8;
      case 'Шкаф': return 18;
      case 'Кровать': return 16;
      default: return 0;
    }
  };

  const getItemCost = (name) => {
    switch (name) {
      case 'Доска': return 15;
      case 'Стул': return 53;
      case 'Стол': return 75;
      case 'Шкаф': return 195;
      case 'Кровать': return 165;
      default: return 0;
    }
  };

  const getItemEffect = (name) => {
    switch (name) {
      case 'Доска': return 'Начало чего-то грандиозного. Или не очень. Но точно полезного!';
      case 'Стул': return 'На нём можно сидеть.';
      case 'Стол': return 'На нём можно есть.';
      case 'Шкаф': return 'В него можно повесить одежду';
      case 'Кровать': return 'На ней можно спать.';
      default: return '';
    }
  };

  let availableActions = [];
  if (user && !user.isHuman && currentRoom && currentRoom.startsWith(`myhome_${user.owner}`)) {
    availableActions = animalActions(user.animalType);
  } else if (currentRoom && currentRoom.startsWith(`myhome_${userId}`)) {
    availableActions = homeActions;
  } else if (currentRoom === 'Автобусная остановка') {
    availableActions = busStopActions;
  } else if (currentRoom === 'Лес') {
    availableActions = forestActions;
  } else if (currentRoom === 'Полигон утилизации') {
    availableActions = disposalActions;
  } else if (currentRoom === 'Мастерская') {
    availableActions = workshopActions;
  }

  const getMaterialsText = () => {
    if (!selectedAction || selectedAction.title !== 'Столярная мастерская') return '';
    const item = selectedAction.craftableItems.find(i => i.name === selectedCraftItem);
    const materials = [];
    if (item.materials.sticks > 0) materials.push(`${item.materials.sticks} палки`);
    if (item.materials.boards > 0) materials.push(`${item.materials.boards} доски`);
    return materials.length > 0 ? `Необходимо: ${materials.join(', ')}` : 'Материалы не требуются';
  };

  const renderSliders = () => {
    if (!selectedAction || selectedAction.title !== 'Столярная мастерская') return null;
    const item = selectedAction.craftableItems.find(i => i.name === selectedCraftItem);
    const sliders = [];

    if (item.materials.sticks > 0) {
      sliders.push(
        <SliderContainer key="sticks">
          <SliderLabel theme={theme}>
            Палки: {sliderValues.sticks}
            <SliderValue theme={theme}>/ {item.materials.sticks}</SliderValue>
          </SliderLabel>
          <Slider
            min="0"
            max="10"
            value={sliderValues.sticks}
            onChange={(e) => handleSliderChange('sticks', e.target.value)}
            theme={theme}
          />
        </SliderContainer>
      );
    }

    if (item.materials.boards > 0) {
      sliders.push(
        <SliderContainer key="boards">
          <SliderLabel theme={theme}>
            Доски: {sliderValues.boards}
            <SliderValue theme={theme}>/ {item.materials.boards}</SliderValue>
          </SliderLabel>
          <Slider
            min="0"
            max="10"
            value={sliderValues.boards}
            onChange={(e) => handleSliderChange('boards', e.target.value)}
            theme={theme}
          />
        </SliderContainer>
      );
    }

    return sliders;
  };

  const renderCheckboxes = () => {
    if (!selectedAction || selectedAction.title !== 'Столярная мастерская') return null;
    return (
      <CheckboxContainer>
        <CheckboxLabel theme={theme}>
          <Checkbox
            checked={checkboxes.prepareMachine}
            onChange={() => handleCheckboxChange('prepareMachine')}
          />
          Подготовить станок
        </CheckboxLabel>
        <CheckboxLabel theme={theme}>
          <Checkbox
            checked={checkboxes.measureAndMark}
            onChange={() => handleCheckboxChange('measureAndMark')}
          />
          Отмерить и разметить
        </CheckboxLabel>
        <CheckboxLabel theme={theme}>
          <Checkbox
            checked={checkboxes.secureMaterials}
            onChange={() => handleCheckboxChange('secureMaterials')}
          />
          Закрепить материалы
        </CheckboxLabel>
      </CheckboxContainer>
    );
  };

  return (
    <ActionsContainer theme={theme}>
      <ContentContainer>
        <ActionGrid>
          {availableActions.length > 0 ? (
            availableActions.map((action) => {
              const actionKey = {
                'Найти палку': 'findStick',
                'Найти ягоды': 'findBerries',
                'Найти грибы': 'findMushrooms',
              }[action.title] || null;
              return (
                <ActionCard
                  key={action.id}
                  theme={theme}
                  onClick={() => handleActionClick(action)}
                  disabled={actionKey && isCooldown[actionKey]}
                >
                  <div>
                    <ActionTitle theme={theme}>{action.title}</ActionTitle>
                    <ActionDescription theme={theme}>{action.description}</ActionDescription>
                  </div>
                  {actionKey && isCooldown[actionKey] && (
                    <>
                      <ProgressBar progress={progress[actionKey]} />
                      <TimerDisplay theme={theme}>
                        Осталось: {timeLeft[actionKey]} сек
                      </TimerDisplay>
                    </>
                  )}
                </ActionCard>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', color: theme === 'dark' ? '#ccc' : '#666' }}>
              Действия недоступны в этой комнате
            </div>
          )}
        </ActionGrid>
      </ContentContainer>
      {selectedAction && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <CloseButton theme={theme} onClick={handleCloseModal}><FaTimes /></CloseButton>
            <ModalTitle theme={theme}>{selectedAction.modalTitle}</ModalTitle>
            {selectedAction.title === 'Столярная мастерская' ? (
              <>
                <Select
                  value={selectedCraftItem}
                  onChange={handleCraftItemChange}
                  theme={theme}
                >
                  {selectedAction.craftableItems.map(item => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </Select>
                <MaterialsText theme={theme}>{getMaterialsText()}</MaterialsText>
                {renderSliders()}
                {renderCheckboxes()}
                <ProgressBarContainer theme={theme}>
                  <Progress progress={craftingProgress} />
                </ProgressBarContainer>
                <StartButton onClick={handleStartClick} disabled={!canStartCrafting()}>
                  СТАРТ
                </StartButton>
              </>
            ) : (
              <>
                <ModalDescription theme={theme}>{selectedAction.modalDescription}</ModalDescription>
                <ActionButton onClick={handleButtonClick}>
                  {selectedAction.buttonText}
                </ActionButton>
              </>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
      <Notification show={notification.show}>{notification.message}</Notification>
    </ActionsContainer>
  );
}

export default Actions;
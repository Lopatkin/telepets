import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ProgressBarContainer, Progress, StartButton, CheckboxContainer, CheckboxLabel, Checkbox,
  SliderContainer, SliderLabel, Slider, SliderValue, Select, MaterialsText,
  ActionsContainer, ActionGrid, ContentContainer, ActionCard, ActionTitle,
  ActionDescription, ModalOverlay, ModalContent, ModalTitle, ModalDescription,
  CloseButton, ActionButton, ProgressBar, Notification, TimerDisplay
} from '../styles/ActionsStyles';
import { FaTimes } from 'react-icons/fa';

// Объединяем действия в единый объект
const actionsConfig = {
  home: [
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
  ],
  busStop: [
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
  ],
  forest: [
    {
      id: 9,
      title: 'Найти палку',
      description: 'Палка - очень полезный предмет',
      modalTitle: 'Найти палку',
      modalDescription: 'Вы ходите по лесу и ищете палку. Палка - полезный и многофункциональный предмет, может пригодиться в самых разных жизненных ситуациях.',
      buttonText: 'Подобрать',
      cooldownKey: 'findStick',
    },
    {
      id: 16,
      title: 'Найти ягоды',
      description: 'Вкусные и свежие',
      modalTitle: 'Найти ягоды',
      modalDescription: 'Вы ходите по лесу и ищете ягоды. Ежевика, брусника, черника, земляника. Съешьте сами или продайте.',
      buttonText: 'Найти',
      cooldownKey: 'findBerries',
    },
    {
      id: 17,
      title: 'Найти грибы',
      description: 'Выбирайте только съедобные',
      modalTitle: 'Найти грибы',
      modalDescription: 'Вы ходите по лесу и ищете грибы. Белый гриб, подберёзовик, лисички, опята. Съешьте сами или продайте.',
      buttonText: 'Найти',
      cooldownKey: 'findMushrooms',
    },
  ],
  disposal: [
    {
      id: 10,
      title: 'Утилизировать мусор',
      description: 'Избавьтесь от ненужного хлама',
      modalTitle: 'Утилизировать мусор',
      modalDescription: 'Вы сдаёте мусор на переработку. Это очищает ваш инвентарь от предметов с названием "Мусор".',
      buttonText: 'Утилизировать',
    },
  ],
  workshop: [
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
  ],
  shelterAnimal: [
    {
      id: 18,
      title: 'Поиграть с другими животными',
      description: 'Весело провести время в приюте',
      modalTitle: 'Поиграть',
      modalDescription: 'Вы бегаете и играете с другими животными в приюте. Это поднимает настроение!',
      buttonText: 'Играть',
    },
    {
      id: 19,
      title: 'Поесть из миски',
      description: 'Поесть корма в приюте',
      modalTitle: 'Поесть',
      modalDescription: 'Вы находите миску с кормом и решаете поесть. Это утоляет голод.',
      buttonText: 'Поесть',
    },
  ],
};

// Функция для получения действий для животных
const getAnimalActions = (animalType, isShelter) => {
  const baseActions = [
    {
      id: 12,
      title: 'Попросить еды',
      description: 'Попросить хозяина покормить вас',
      modalTitle: 'Попросить еды',
      modalDescription: 'Вы просите хозяина дать вам еды.',
      buttonText: 'Попросить',
    },
    {
      id: 13,
      title: animalType === 'Собака' ? 'Погавкать' : 'Помяукать',
      description: animalType === 'Собака' ? 'Громко гавкнуть' : 'Мяукнуть, чтобы привлечь внимание',
      modalTitle: animalType === 'Собака' ? 'Погавкать' : 'Помяукать',
      modalDescription: animalType === 'Собака' ? 'Вы громко гавкаете, чтобы привлечь внимание хозяина.' : 'Вы мяукаете, чтобы хозяин обратил на вас внимание.',
      buttonText: animalType === 'Собака' ? 'Гав!' : 'Мяу!',
    },
    {
      id: 14,
      title: 'Поспать',
      description: 'Улечься и поспать',
      modalTitle: 'Поспать',
      modalDescription: 'Вы находите уютное место и засыпаете, чтобы восстановить силы.',
      buttonText: 'Заснуть',
    },
    {
      id: 15,
      title: 'Попросить поиграть',
      description: 'Попросить хозяина поиграть с вами',
      modalTitle: 'Попросить поиграть',
      modalDescription: 'Вы просите хозяина поиграть с вами. Это отправит уведомление вашему владельцу.',
      buttonText: 'Попросить',
    },
  ];
  return isShelter ? [...actionsConfig.shelterAnimal, ...baseActions] : baseActions;
};

function Actions({ theme, currentRoom, userId, socket, personalItems, user }) {
  const [selectedAction, setSelectedAction] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [cooldowns, setCooldowns] = useState({
    findStick: { active: false, timeLeft: 0, progress: 100 },
    findBerries: { active: false, timeLeft: 0, progress: 100 },
    findMushrooms: { active: false, timeLeft: 0, progress: 100 },
  });
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

  // Восстановление состояния кулдаунов
  useEffect(() => {
    Object.entries(COOLDOWN_KEYS).forEach(([key, storageKey]) => {
      const savedCooldown = localStorage.getItem(storageKey);
      if (savedCooldown) {
        const { startTime } = JSON.parse(savedCooldown);
        const elapsed = Date.now() - startTime;
        const remaining = COOLDOWN_DURATION - elapsed;

        if (remaining > 0) {
          setCooldowns(prev => ({
            ...prev,
            [key]: { active: true, timeLeft: Math.ceil(remaining / 1000), progress: (remaining / COOLDOWN_DURATION) * 100 },
          }));
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    });
  }, [COOLDOWN_KEYS, COOLDOWN_DURATION]);

  // Единый таймер для кулдаунов
  useEffect(() => {
    const timer = setInterval(() => {
      setCooldowns(prev => {
        const updated = { ...prev };
        Object.entries(COOLDOWN_KEYS).forEach(([key, storageKey]) => {
          if (updated[key].active && updated[key].timeLeft > 0) {
            const savedCooldown = localStorage.getItem(storageKey);
            if (!savedCooldown) return;

            const { startTime } = JSON.parse(savedCooldown);
            const elapsed = Date.now() - startTime;
            const remaining = COOLDOWN_DURATION - elapsed;

            if (remaining <= 0) {
              updated[key] = { active: false, timeLeft: 0, progress: 100 };
              localStorage.removeItem(storageKey);
            } else {
              updated[key] = {
                active: true,
                timeLeft: Math.ceil(remaining / 1000),
                progress: (remaining / COOLDOWN_DURATION) * 100,
              };
            }
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [COOLDOWN_KEYS, COOLDOWN_DURATION]);

  const showNotification = useCallback((message, duration = 2000) => {
    setNotification({ show: true, message });
    setTimeout(() => setNotification({ show: false, message: '' }), duration);
  }, []);

  const handleActionClick = useCallback((action) => {
    if (action.cooldownKey && cooldowns[action.cooldownKey].active) {
      showNotification('Действие недоступно, подождите');
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
  }, [cooldowns, showNotification]);

  const handleCloseModal = useCallback(() => {
    setSelectedAction(null);
    setClickCount(0);
    setCraftingProgress(0);
  }, []);

  const handleCraftItemChange = useCallback((e) => {
    setSelectedCraftItem(e.target.value);
    setSliderValues({ sticks: 0, boards: 0 });
    setCheckboxes({ prepareMachine: false, measureAndMark: false, secureMaterials: false });
    setClickCount(0);
    setCraftingProgress(0);
  }, []);

  const handleSliderChange = useCallback((type, value) => {
    setSliderValues(prev => ({ ...prev, [type]: parseInt(value, 10) }));
  }, []);

  const handleCheckboxChange = useCallback((key) => {
    setCheckboxes(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const hasEnoughMaterials = useCallback(() => {
    if (!selectedAction || selectedAction.title !== 'Столярная мастерская') return false;
    const item = selectedAction.craftableItems.find(i => i.name === selectedCraftItem);
    const requiredSticks = item.materials.sticks;
    const requiredBoards = item.materials.boards;

    const stickCount = personalItems.filter(i => i.name === 'Палка').length;
    const boardCount = personalItems.filter(i => i.name === 'Доска').length;

    return stickCount >= requiredSticks && boardCount >= requiredBoards;
  }, [selectedAction, selectedCraftItem, personalItems]);

  const canStartCrafting = useCallback(() => {
    if (!selectedAction || selectedAction.title !== 'Столярная мастерская') return false;
    const item = selectedAction.craftableItems.find(i => i.name === selectedCraftItem);
    const requiredSticks = item.materials.sticks;
    const requiredBoards = item.materials.boards;

    const slidersCorrect = sliderValues.sticks === requiredSticks && sliderValues.boards === requiredBoards;
    const checkboxesChecked = checkboxes.prepareMachine && checkboxes.measureAndMark && checkboxes.secureMaterials;
    const materialsAvailable = hasEnoughMaterials();

    return slidersCorrect && checkboxesChecked && materialsAvailable;
  }, [selectedAction, selectedCraftItem, sliderValues, checkboxes, hasEnoughMaterials]);

  const handleButtonClick = useCallback(() => {
    if (!socket) {
      console.error('Socket is not initialized');
      showNotification('Ошибка соединения');
      return;
    }

    const actions = {
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
        systemMessage: `${user.name} хочет есть`,
        successMessage: 'Запрос еды отправлен хозяину!',
        requiresOwner: true,
      },
      'Помяукать': {
        systemMessage: `${user.name} мяукает`,
        successMessage: 'Вы помяукали!',
      },
      'Погавкать': {
        systemMessage: `${user.name} гавкает`,
        successMessage: 'Вы погавкали!',
      },
      'Поспать': {
        systemMessage: `${user.name} лёг спать`,
        successMessage: 'Вы уютно заснули!',
      },
      'Попросить поиграть': {
        systemMessage: `${user.name} хочет поиграть`,
        successMessage: 'Запрос на игру отправлен хозяину!',
        requiresOwner: true,
      },
      'Поиграть с другими животными': {
        systemMessage: `${user.name} играет с другими животными`,
        successMessage: 'Вы весело поиграли!',
      },
      'Поесть из миски': {
        systemMessage: `${user.name} ест из миски`,
        successMessage: 'Вы поели!',
      },
    };

    const action = actions[selectedAction.title];
    if (!action) {
      showNotification('Действие не поддерживается');
      return;
    }

    if (action.requiresOwner && !user.owner) {
      showNotification('У вас нет владельца!');
      return;
    }

    if (action.item) {
      socket.emit('addItem', { owner: `user_${userId}`, item: action.item }, (response) => {
        if (response && response.success) {
          setSelectedAction(null);
          showNotification(action.successMessage);
          if (action.cooldownKey) {
            setCooldowns(prev => ({
              ...prev,
              [action.cooldownKey]: { active: true, timeLeft: Math.floor(COOLDOWN_DURATION / 1000), progress: 100 },
            }));
            localStorage.setItem(COOLDOWN_KEYS[action.cooldownKey], JSON.stringify({ startTime: Date.now() }));
          }
        } else {
          setSelectedAction(null);
          showNotification(response?.message || 'Ошибка при добавлении предмета');
        }
      });
    } else if (action.action === 'utilizeTrash') {
      socket.emit('utilizeTrash', (response) => {
        if (response && response.success) {
          setSelectedAction(null);
          showNotification(response.message);
          socket.emit('getItems', { owner: `user_${userId}` });
        } else {
          setSelectedAction(null);
          showNotification(response?.message || 'Ошибка при утилизации');
        }
      });
    } else if (action.systemMessage) {
      socket.emit('sendSystemMessage', {
        text: action.systemMessage,
        room: currentRoom,
        timestamp: new Date().toISOString(),
      }, () => {
        setSelectedAction(null);
        showNotification(action.successMessage);
      });
    }
  }, [socket, selectedAction, user, userId, currentRoom, COOLDOWN_DURATION, COOLDOWN_KEYS, showNotification]);

  const handleStartClick = useCallback(() => {
    if (!canStartCrafting()) {
      showNotification('Не все условия выполнены!');
      return;
    }

    const item = selectedAction.craftableItems.find(i => i.name === selectedCraftItem);
    const clicksRequired = item.clicksRequired;

    setClickCount(prev => prev + 1);
    const newClickCount = clickCount + 1;
    const newProgress = (newClickCount / clicksRequired) * 100;
    setCraftingProgress(newProgress);

    if (newClickCount < clicksRequired) {
      showNotification(`Осталось нажатий: ${clicksRequired - newClickCount}`, 1000);
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

    socket.emit('addItem', { owner: 'Мастерская', item: craftedItem }, (response) => {
      if (response && response.success) {
        showNotification(`Вы успешно создали: ${selectedCraftItem}!`);
        setSelectedAction(null);
        setClickCount(0);
        setCraftingProgress(0);
      } else {
        showNotification(response?.message || 'Ошибка при создании предмета');
      }
    });
  }, [canStartCrafting, selectedAction, selectedCraftItem, clickCount, socket, userId, showNotification]);

  const getItemDescription = useCallback((name) => {
    const descriptions = {
      'Доска': 'Материал для изготовления',
      'Стул': 'Предмет мебели',
      'Стол': 'Предмет мебели',
      'Шкаф': 'Предмет мебели',
      'Кровать': 'Предмет мебели',
    };
    return descriptions[name] || '';
  }, []);

  const getItemWeight = useCallback((name) => {
    const weights = {
      'Доска': 2,
      'Стул': 6,
      'Стол': 8,
      'Шкаф': 18,
      'Кровать': 16,
    };
    return weights[name] || 0;
  }, []);

  const getItemCost = useCallback((name) => {
    const costs = {
      'Доска': 15,
      'Стул': 53,
      'Стол': 75,
      'Шкаф': 195,
      'Кровать': 165,
    };
    return costs[name] || 0;
  }, []);

  const getItemEffect = useCallback((name) => {
    const effects = {
      'Доска': 'Начало чего-то грандиозного. Или не очень. Но точно полезного!',
      'Стул': 'На нём можно сидеть.',
      'Стол': 'На нём можно есть.',
      'Шкаф': 'В него можно повесить одежду',
      'Кровать': 'На ней можно спать.',
    };
    return effects[name] || '';
  }, []);

  // Определяем доступные действия
  const availableActions = useMemo(() => {
    if (!user || !currentRoom) return [];
    if (user.isHuman) {
      if (currentRoom.startsWith(`myhome_${userId}`)) return actionsConfig.home;
      if (currentRoom === 'Автобусная остановка') return actionsConfig.busStop;
      if (currentRoom === 'Лес') return actionsConfig.forest;
      if (currentRoom === 'Полигон утилизации') return actionsConfig.disposal;
      if (currentRoom === 'Мастерская') return actionsConfig.workshop;
    } else {
      if (currentRoom === 'Приют для животных "Кошкин дом"') {
        return getAnimalActions(user.animalType, true);
      }
      if (currentRoom.startsWith(`myhome_${user.owner}`)) {
        return getAnimalActions(user.animalType, false);
      }
    }
    return [];
  }, [user, currentRoom, userId]);

  const getMaterialsText = useCallback(() => {
    if (!selectedAction || selectedAction.title !== 'Столярная мастерская') return '';
    const item = selectedAction.craftableItems.find(i => i.name === selectedCraftItem);
    const materials = [];
    if (item.materials.sticks > 0) materials.push(`${item.materials.sticks} палки`);
    if (item.materials.boards > 0) materials.push(`${item.materials.boards} доски`);
    return materials.length > 0 ? `Необходимо: ${materials.join(', ')}` : 'Материалы не требуются';
  }, [selectedAction, selectedCraftItem]);

  const renderSliders = useCallback(() => {
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
  }, [selectedAction, selectedCraftItem, sliderValues, theme, handleSliderChange]);

  const renderCheckboxes = useCallback(() => {
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
  }, [selectedAction, checkboxes, theme, handleCheckboxChange]);

  return (
    <ActionsContainer theme={theme}>
      <ContentContainer>
        <ActionGrid>
          {availableActions.length > 0 ? (
            availableActions.map((action) => (
              <ActionCard
                key={action.id}
                theme={theme}
                onClick={() => handleActionClick(action)}
                disabled={action.cooldownKey && cooldowns[action.cooldownKey].active}
              >
                <div>
                  <ActionTitle theme={theme}>{action.title}</ActionTitle>
                  <ActionDescription theme={theme}>{action.description}</ActionDescription>
                </div>
                {action.cooldownKey && cooldowns[action.cooldownKey].active && (
                  <>
                    <ProgressBar progress={cooldowns[action.cooldownKey].progress} />
                    <TimerDisplay theme={theme}>
                      Осталось: {cooldowns[action.cooldownKey].timeLeft} сек
                    </TimerDisplay>
                  </>
                )}
              </ActionCard>
            ))
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
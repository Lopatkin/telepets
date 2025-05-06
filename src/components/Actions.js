import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ProgressBarContainer, Progress, StartButton, CheckboxContainer, CheckboxLabel, Checkbox,
  SliderContainer, SliderLabel, Slider, SliderValue, Select, MaterialsText,
  ActionsContainer, ActionGrid, ContentContainer, ActionCard, ActionTitle,
  ActionDescription, ModalOverlay, ModalContent, ModalTitle, ModalDescription,
  CloseButton, ActionButton, ProgressBar, Notification, TimerDisplay
} from '../styles/ActionsStyles';
import { FaTimes } from 'react-icons/fa';
import actionsConfig from './constants/actionsConfig';
import actionHandlers from './handlers/actionHandlers';
import useCooldowns from './hooks/useCooldowns';

function Actions({ theme, currentRoom, userId, socket, personalItems, user }) {
  const [selectedAction, setSelectedAction] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [cooldowns, setCooldowns, startCooldown] = useCooldowns(userId, COOLDOWN_DURATION);
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

    const action = actionHandlers[selectedAction.title];
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
            startCooldown(action.cooldownKey); // Используем startCooldown вместо прямой записи
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
        text: typeof action.systemMessage === 'function' ? action.systemMessage(user) : action.systemMessage,
        room: currentRoom,
        timestamp: new Date().toISOString(),
      }, () => {
        setSelectedAction(null);
        showNotification(action.successMessage);
      });
    }
  }, [socket, selectedAction, user, userId, currentRoom, COOLDOWN_DURATION, showNotification, startCooldown]);

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

  // Исправление: добавлены зависимости getItemCost, getItemDescription, getItemEffect, getItemWeight
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
  }, [
    canStartCrafting,
    selectedAction,
    selectedCraftItem,
    clickCount,
    socket,
    userId,
    showNotification,
    getItemCost,
    getItemDescription,
    getItemEffect,
    getItemWeight,
  ]);

  // Обновлённая логика определения доступных действий
  const availableActions = useMemo(() => {
    if (!user || !currentRoom) return [];

    // Маппинг комнат на ключи actionsConfig
    const roomMap = {
      home: currentRoom.startsWith(`myhome_${user.isHuman ? userId : user.owner}`),
      busStop: currentRoom === 'Автобусная остановка',
      forest: currentRoom === 'Лес',
      disposal: currentRoom === 'Полигон утилизации',
      workshop: currentRoom === 'Мастерская',
      shelter: currentRoom === 'Приют для животных "Кошкин дом"',
    };

    // Находим подходящую локацию
    const locationKey = Object.keys(roomMap).find(key => roomMap[key]);
    if (!locationKey || !actionsConfig[locationKey]) return [];

    // Выбираем действия в зависимости от типа игрока
    const actions = user.isHuman
      ? actionsConfig[locationKey].humanActions
      : actionsConfig[locationKey].animalActions;

    // Для животных динамически подстраиваем действие "Погавкать"/"Помяукать"
    if (!user.isHuman) {
      return actions.map(action => {
        if (action.animalSpecific && action.title === 'Погавкать' && user.animalType === 'Кот') {
          return {
            ...action,
            title: 'Помяукать',
            modalTitle: 'Помяукать',
            description: 'Мяукнуть, чтобы привлечь внимание',
            modalDescription: 'Вы мяукаете, чтобы хозяин обратил на вас внимание.',
            buttonText: 'Мяу!',
          };
        }
        return action;
      });
    }

    return actions;
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
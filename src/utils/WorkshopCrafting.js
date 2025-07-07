import React, { useState, useCallback } from 'react';
import {
  ProgressBarContainer, Progress, StartButton, CheckboxContainer, CheckboxLabel, Checkbox,
  SliderContainer, SliderLabel, Slider, SliderValue, Select, MaterialsText,
} from '../styles/ActionsStyles';
import { ClipLoader } from 'react-spinners';

// Компонент для логики крафта в Столярной мастерской
const WorkshopCrafting = ({
  theme,
  selectedAction,
  personalItems,
  socket,
  userId,
  showNotification,
  setSelectedAction,
}) => {
  const [selectedCraftItem, setSelectedCraftItem] = useState('Доска');
  const [sliderValues, setSliderValues] = useState({ sticks: 0, boards: 0 });
  const [checkboxes, setCheckboxes] = useState({
    prepareMachine: false,
    measureAndMark: false,
    secureMaterials: false,
  });
  const [clickCount, setClickCount] = useState(0);
  const [craftingProgress, setCraftingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCraftItemChange = useCallback((e) => {
    setSelectedCraftItem(e.target.value);
    setSliderValues({ sticks: 0, boards: 0 });
    setCheckboxes({ prepareMachine: false, measureAndMark: false, secureMaterials: false });
    setClickCount(0);
    setCraftingProgress(0);
  }, []);

  const handleSliderChange = useCallback((type, value) => {
    setSliderValues((prev) => ({ ...prev, [type]: parseInt(value, 10) }));
  }, []);

  const handleCheckboxChange = useCallback((key) => {
    setCheckboxes((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const hasEnoughMaterials = useCallback(() => {
    if (!selectedAction || selectedAction.title !== 'Столярная мастерская') return false;
    const item = selectedAction.craftableItems.find((i) => i.name === selectedCraftItem);
    const requiredSticks = item.materials.sticks;
    const requiredBoards = item.materials.boards;

    const stickCount = personalItems.filter((i) => i.name === 'Палка').length;
    const boardCount = personalItems.filter((i) => i.name === 'Доска').length;
    console.log('personalitems:', personalItems.length);

    return stickCount >= requiredSticks && boardCount >= requiredBoards;
  }, [selectedAction, selectedCraftItem, personalItems]);

  const canStartCrafting = useCallback(() => {
    if (!selectedAction || selectedAction.title !== 'Столярная мастерская') return false;
    const item = selectedAction.craftableItems.find((i) => i.name === selectedCraftItem);
    const requiredSticks = item.materials.sticks;
    const requiredBoards = item.materials.boards;

    const slidersCorrect = sliderValues.sticks === requiredSticks && sliderValues.boards === requiredBoards;
    const checkboxesChecked = checkboxes.prepareMachine && checkboxes.measureAndMark && checkboxes.secureMaterials;
    const materialsAvailable = hasEnoughMaterials();

    return slidersCorrect && checkboxesChecked && materialsAvailable;
  }, [selectedAction, selectedCraftItem, sliderValues, checkboxes, hasEnoughMaterials]);

  const getMaterialsText = useCallback(() => {
    if (!selectedAction || selectedAction.title !== 'Столярная мастерская') return '';
    const item = selectedAction.craftableItems.find((i) => i.name === selectedCraftItem);
    const materials = [];
    if (item.materials.sticks > 0) materials.push(`${item.materials.sticks} палки`);
    if (item.materials.boards > 0) materials.push(`${item.materials.boards} доски`);
    return materials.length > 0 ? `Необходимо: ${materials.join(', ')}` : 'Материалы не требуются';
  }, [selectedAction, selectedCraftItem]);

  const handleStartClick = useCallback(() => {
    if (!canStartCrafting()) {
      showNotification('Не все условия выполнены!');
      return;
    }

    if (isProcessing) {
      showNotification('Крафт уже выполняется, подождите!');
      return;
    }

    const item = selectedAction.craftableItems.find((i) => i.name === selectedCraftItem);
    const clicksRequired = item.clicksRequired;

    setClickCount((prev) => prev + 1);
    const newClickCount = clickCount + 1;
    const newProgress = (newClickCount / clicksRequired) * 100;
    setCraftingProgress(newProgress);

    if (newClickCount < clicksRequired) {
      showNotification(
        `Осталось нажатий: ${clicksRequired - newClickCount}`,
        'info',
        { autoClose: 1000 } // ← так правильно задаётся длительность
      );
      return;
    }

    setIsProcessing(true);

    const craftedItem = {
      name: item.name,
      description: item.description,
      rarity: item.rarity,
      weight: item.weight,
      cost: item.cost,
      effect: item.effect,
    };

    const materials = {
      sticks: item.materials.sticks,
      boards: item.materials.boards,
    };

    // Отправляем один запрос craftItem
    socket.emit('craftItem', { owner: `user_${userId}`, craftedItem, materials }, (response) => {
      setIsProcessing(false);
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
    setSelectedAction,
    isProcessing,
  ]);

  const renderSliders = useCallback(() => {
    if (!selectedAction || selectedAction.title !== 'Столярная мастерская') return null;
    const item = selectedAction.craftableItems.find((i) => i.name === selectedCraftItem);
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
    <>
      <Select
        value={selectedCraftItem}
        onChange={handleCraftItemChange}
        theme={theme}
      >
        {selectedAction.craftableItems.map((item) => (
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
      <StartButton onClick={handleStartClick} disabled={!canStartCrafting() || isProcessing}>
        {isProcessing ? <ClipLoader color="#fff" size={20} /> : 'СТАРТ'}
      </StartButton>
    </>
  );
};

export default WorkshopCrafting;
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';

const SliderContainer = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

const SliderLabel = styled.label`
  display: block;
  font-size: 14px;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
  margin-bottom: 5px;
`;

const Slider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  -webkit-appearance: none;
  height: 8px;
  border-radius: 4px;
  background: ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #007AFF;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #007AFF;
    cursor: pointer;
  }
`;

const SliderValue = styled.span`
  font-size: 12px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  margin-left: 10px;
`;

// Добавляем новый стиль для выпадающего списка
const Select = styled.select`
  width: 100%;
  padding: 8px;
  margin-bottom: 15px;
  border-radius: 4px;
  border: 1px solid ${props => props.theme === 'dark' ? '#555' : '#ddd'};
  background: ${props => props.theme === 'dark' ? '#444' : '#fff'};
  color: ${props => props.theme === 'dark' ? '#fff' : '#000'};
  font-size: 14px;
`;

// Добавляем стиль для текста с материалами
const MaterialsText = styled.p`
  font-size: 14px;
  margin: 0 0 20px 0;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
`;

const ActionsContainer = styled.div`
  height: 100%;
  padding: 20px;
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  overflow-y: auto;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 600px;
  margin: 0 auto;
`;

const ActionCard = styled.div`
  background: ${props => props.theme === 'dark' ? '#444' : '#f9f9f9'};
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: transform 0.2s;
  position: relative;
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    transform: ${props => (props.disabled ? 'none' : 'translateY(-5px)')};
  }
`;

const ActionTitle = styled.h4`
  font-size: 16px;
  margin: 0 0 10px 0;
  color: ${props => props.theme === 'dark' ? '#fff' : '#000'};
`;

const ActionDescription = styled.p`
  font-size: 12px;
  margin: 0;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  position: relative;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  margin: 0 0 10px 0;
  color: ${props => props.theme === 'dark' ? '#fff' : '#000'};
`;

const ModalDescription = styled.p`
  font-size: 14px;
  margin: 0 0 20px 0;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  cursor: pointer;
`;

const ActionButton = styled.button`
  background: ${props => props.disabled ? '#ccc' : '#007AFF'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.disabled ? '#ccc' : '#0056b3'};
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  width: ${props => props.progress}%;
  transition: width 1s linear; /* Обновляем каждую секунду */
  z-index: 1;
`;

const Notification = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #32CD32;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 1001;
  opacity: ${props => (props.show ? 1 : 0)};
  transition: opacity 0.5s;
`;

const TimerDisplay = styled.div`
  font-size: 12px;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
  margin-top: 10px;
  text-align: center;
  white-space: nowrap; /* Запрещаем перенос текста */
  z-index: 2;
`;

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
    buttonText: 'Создать', // Обновляем текст кнопки
    craftableItems: [
      { name: 'Доска', materials: { sticks: 2, boards: 0 } },
      { name: 'Стул', materials: { sticks: 4, boards: 1 } },
      { name: 'Стол', materials: { sticks: 4, boards: 2 } },
      { name: 'Шкаф', materials: { sticks: 2, boards: 8 } },
      { name: 'Кровать', materials: { sticks: 4, boards: 6 } },
    ],
  },
];

function Actions({ theme, currentRoom, userId, socket }) {
  const [selectedAction, setSelectedAction] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [isCooldown, setIsCooldown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(100);
  const [selectedCraftItem, setSelectedCraftItem] = useState('Доска'); // По умолчанию "Доска"
  const [sliderValues, setSliderValues] = useState({ sticks: 0, boards: 0 }); // Значения ползунков

  const COOLDOWN_DURATION = 20 * 1000; // 20 секунд в миллисекундах
  const COOLDOWN_KEY = `findStickCooldown_${userId}`; // Уникальный ключ для localStorage

  // Восстановление состояния таймера при монтировании компонента
  useEffect(() => {
    const savedCooldown = localStorage.getItem(COOLDOWN_KEY);
    if (savedCooldown) {
      const { startTime } = JSON.parse(savedCooldown);
      const elapsed = Date.now() - startTime;
      const remaining = COOLDOWN_DURATION - elapsed;

      if (remaining > 0) {
        setIsCooldown(true);
        setTimeLeft(Math.ceil(remaining / 1000));
        setProgress((remaining / COOLDOWN_DURATION) * 100);
      } else {
        localStorage.removeItem(COOLDOWN_KEY);
        setIsCooldown(false);
        setTimeLeft(0);
        setProgress(100);
      }
    }
  }, [COOLDOWN_DURATION, COOLDOWN_KEY]);

  // Таймер обратного отсчёта
  useEffect(() => {
    let timer;
    if (isCooldown && timeLeft > 0) {
      timer = setInterval(() => {
        const elapsed = Date.now() - JSON.parse(localStorage.getItem(COOLDOWN_KEY)).startTime;
        const remaining = COOLDOWN_DURATION - elapsed;

        if (remaining <= 0) {
          setIsCooldown(false);
          setTimeLeft(0);
          setProgress(0);
          localStorage.removeItem(COOLDOWN_KEY);
          clearInterval(timer);
        } else {
          setTimeLeft(Math.ceil(remaining / 1000));
          setProgress((remaining / COOLDOWN_DURATION) * 100);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCooldown, COOLDOWN_DURATION, COOLDOWN_KEY, timeLeft]);

  const handleActionClick = (action) => {
    if (isCooldown && action.title === 'Найти палку') {
      setNotification({ show: true, message: 'Действие недоступно, подождите' });
      setTimeout(() => setNotification({ show: false, message: '' }), 2000);
      return;
    }
    setSelectedAction(action);
    // Сбрасываем выбор предмета при открытии модального окна
    if (action.title === 'Столярная мастерская') {
      setSelectedCraftItem(action.craftableItems[0].name);
      setSliderValues({ sticks: 0, boards: 0 });
    }
  };

  const handleCloseModal = () => {
    setSelectedAction(null);
  };

  const handleCraftItemChange = (e) => {
    setSelectedCraftItem(e.target.value);
    setSliderValues({ sticks: 0, boards: 0 });
  };

  const handleSliderChange = (type, value) => {
    setSliderValues(prev => ({ ...prev, [type]: parseInt(value, 10) }));
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
          setNotification({ show: true, message: 'Вы нашли палку!' });
          setTimeout(() => setNotification({ show: false, message: '' }), 2000);
          setIsCooldown(true);
          setTimeLeft(Math.floor(COOLDOWN_DURATION / 1000));
          setProgress(100);
          localStorage.setItem(COOLDOWN_KEY, JSON.stringify({ startTime: Date.now() }));
        } else {
          setNotification({ show: true, message: response?.message || 'Ошибка при добавлении предмета' });
          setTimeout(() => setNotification({ show: false, message: '' }), 2000);
        }
      });
    } else if (selectedAction.title === 'Утилизировать мусор') {
      socket.emit('utilizeTrash', (response) => {
        if (response && response.success) {
          setNotification({ show: true, message: response.message }); // Используем сообщение от сервера
          setTimeout(() => setNotification({ show: false, message: '' }), 2000);
          socket.emit('getItems', { owner: `user_${userId}` }); // Обновляем список предметов
        } else {
          setNotification({ show: true, message: response?.message || 'Ошибка при утилизации' });
          setTimeout(() => setNotification({ show: false, message: '' }), 2000);
        }
      });
    } else if (selectedAction.title === 'Столярная мастерская') {
      const item = selectedAction.craftableItems.find(i => i.name === selectedCraftItem);
      const requiredSticks = item.materials.sticks;
      const requiredBoards = item.materials.boards;

      // Проверяем, совпадают ли значения ползунков с требуемыми материалами
      if (sliderValues.sticks !== requiredSticks || sliderValues.boards !== requiredBoards) {
        setNotification({ show: true, message: 'Установите правильное количество материалов!' });
        setTimeout(() => setNotification({ show: false, message: '' }), 2000);
        return;
      }

      setNotification({ show: true, message: `Вы начали создавать: ${selectedCraftItem}` });
      setTimeout(() => setNotification({ show: false, message: '' }), 2000);
    } else {
      console.log(`Выполнено действие: ${selectedAction.modalTitle}`);
    }
    setSelectedAction(null);
  };

  let availableActions = [];
  if (currentRoom && currentRoom.startsWith(`myhome_${userId}`)) {
    availableActions = homeActions;
  } else if (currentRoom === 'Автобусная остановка') {
    availableActions = busStopActions;
  } else if (currentRoom === 'Лес') {
    availableActions = forestActions;
  } else if (currentRoom === 'Полигон утилизации') {
    availableActions = disposalActions;
  } else if (currentRoom === 'Мастерская') { // Добавляем "Мастерскую"
    availableActions = workshopActions;
  }

  // Функция для отображения необходимых материалов
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

  return (
    <ActionsContainer theme={theme}>
      <ActionGrid>
        {availableActions.length > 0 ? (
          availableActions.map((action) => (
            <ActionCard
              key={action.id}
              theme={theme}
              onClick={() => handleActionClick(action)}
              disabled={isCooldown && action.title === 'Найти палку'}
            >
              <div>
                <ActionTitle theme={theme}>{action.title}</ActionTitle>
                <ActionDescription theme={theme}>{action.description}</ActionDescription>
              </div>
              {isCooldown && action.title === 'Найти палку' && (
                <>
                  <ProgressBar progress={progress} />
                  <TimerDisplay theme={theme}>
                    Осталось: {timeLeft} сек
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
              </>
            ) : (
              <ModalDescription theme={theme}>{selectedAction.modalDescription}</ModalDescription>
            )}
            <ActionButton onClick={handleButtonClick}>
              {selectedAction.buttonText}
            </ActionButton>
          </ModalContent>
        </ModalOverlay>
      )}
      <Notification show={notification.show}>{notification.message}</Notification>
    </ActionsContainer>
  );
}

export default Actions;
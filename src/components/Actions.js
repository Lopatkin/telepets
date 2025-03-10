import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';

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

function Actions({ theme, currentRoom, userId, socket }) {
  const [selectedAction, setSelectedAction] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [isCooldown, setIsCooldown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(100);

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
  }, [isCooldown, COOLDOWN_DURATION, COOLDOWN_KEY]);

  const handleActionClick = (action) => {
    if (isCooldown && action.title === 'Найти палку') {
      setNotification({ show: true, message: 'Действие недоступно, подождите' });
      setTimeout(() => setNotification({ show: false, message: '' }), 2000);
      return;
    }
    setSelectedAction(action);
  };

  const handleCloseModal = () => {
    setSelectedAction(null);
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
          // Запускаем таймер и прогресс-бар только после успешного ответа
          setIsCooldown(true);
          setTimeLeft(Math.floor(COOLDOWN_DURATION / 1000));
          setProgress(100);
          // Сохраняем время начала задержки в localStorage
          localStorage.setItem(COOLDOWN_KEY, JSON.stringify({ startTime: Date.now() }));
        } else {
          setNotification({ show: true, message: response?.message || 'Ошибка при добавлении предмета' });
          setTimeout(() => setNotification({ show: false, message: '' }), 2000);
        }
      });
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
  }

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
            <ModalDescription theme={theme}>{selectedAction.modalDescription}</ModalDescription>
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
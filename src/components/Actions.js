import React, { useState, useMemo, useCallback } from 'react';
import {
  ActionsContainer, ActionGrid, ContentContainer, ActionCard, ActionTitle,
  ActionDescription, ModalOverlay, ModalContent, ModalTitle, ModalDescription,
  CloseButton, ActionButton, ProgressBar, Notification, TimerDisplay
} from '../styles/ActionsStyles';
import { FaTimes } from 'react-icons/fa';
import actionsConfig from './constants/actionsConfig';
import actionHandlers from './handlers/actionHandlers';
import useCooldowns from './hooks/useCooldowns';
import WorkshopCrafting from '../utils/WorkshopCrafting';
import { COOLDOWN_DURATION_CONST, NOTIFICATION_DURATION_CONST } from './constants/settings';

function Actions({ theme, currentRoom, userId, socket, personalItems, user }) {
  const [selectedAction, setSelectedAction] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [cooldowns, , startCooldown] = useCooldowns(userId, COOLDOWN_DURATION_CONST);

  const showNotification = useCallback((message, duration = NOTIFICATION_DURATION_CONST) => {
    setNotification({ show: true, message });
    setTimeout(() => setNotification({ show: false, message: '' }), duration);
  }, []);

  const handleActionClick = useCallback((action) => {
    if (action.cooldownKey && cooldowns[action.cooldownKey].active) {
      showNotification('Действие недоступно, подождите');
      return;
    }
    setSelectedAction(action);
    // Добавляем запрос на получение актуального списка предметов при выборе "Столярная мастерская"
    if (action.title === 'Столярная мастерская' && socket && userId) {
      socket.emit('getItems', { owner: `user_${userId}` });
    }
  }, [cooldowns, showNotification, socket, userId]);
  
  const handleCloseModal = useCallback(() => {
    setSelectedAction(null);
  }, []);

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
  }, [socket, selectedAction, user, userId, currentRoom, showNotification, startCooldown]);

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
              <WorkshopCrafting
                theme={theme}
                selectedAction={selectedAction}
                personalItems={personalItems}
                socket={socket}
                userId={userId}
                showNotification={showNotification}
                setSelectedAction={setSelectedAction}
              />
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
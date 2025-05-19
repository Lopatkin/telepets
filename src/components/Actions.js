import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import Fight from './Fight';
import { COOLDOWN_DURATION_CONST, NOTIFICATION_DURATION_CONST } from './constants/settings';
import { ClipLoader } from 'react-spinners';
import { getActiveNPCs } from '../utils/npcData';

function Actions({ userId, currentRoom, theme, socket, personalItems, onItemsUpdate, user, updateUser }) {
  const [selectedAction, setSelectedAction] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [cooldowns, , startCooldown] = useCooldowns(userId, COOLDOWN_DURATION_CONST);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedNPC, setSelectedNPC] = useState(null);
  const [npcs, setNpcs] = useState([]);

  useEffect(() => {
    if (socket && onItemsUpdate) {
      // console.log('Subscribing to items event in Actions');
      socket.on('items', onItemsUpdate);
      // console.log('Emitting getItems for user in Actions:', `user_${userId}`);
      socket.emit('getItems', { owner: `user_${userId}` });
      return () => {
        // console.log('Unsubscribing from items event in Actions');
        socket.off('items', onItemsUpdate);
      };
    }
  }, [socket, userId, onItemsUpdate]);

  useEffect(() => {
    // console.log('Received personalItems in Actions:', personalItems);
    setIsLoading(personalItems.length === 0);
  }, [personalItems]);

  // Загружаем NPC для действия "Охотиться" на локации "Лес"
  useEffect(() => {
    if (selectedAction?.title === 'Охотиться' && currentRoom === 'Лес') {
      const activeNPCs = getActiveNPCs('Лес');
      // Преобразуем NPC в нужный формат, включая photoUrl и stats
      const formattedNPCs = activeNPCs.map(npc => ({
        id: npc.userId,
        name: npc.firstName,
        description: {
          'npc_fox': 'Хитрая лисичка, быстрая и ловкая',
          'npc_ezhik': 'Маленький ёжик, осторожный и колючий',
          'npc_mouse': 'Проворная мышка, маленькая и шустрая',
          'npc_wolf': 'Грозный волк, сильный и опасный',
          'npc_boar': 'Мощный кабан, крепкий и агрессивный',
          'npc_bear': 'Громадный медведь, невероятно сильный'
        }[npc.userId] || 'Неизвестное существо',
        photoUrl: npc.photoUrl,
        stats: npc.stats // Сохраняем поле stats
      }));
      setNpcs(formattedNPCs);
      console.log('Loaded NPCs for hunting:', formattedNPCs);
    } else {
      setNpcs([]);
    }
  }, [selectedAction, currentRoom]);

  const showNotification = useCallback((message, duration = NOTIFICATION_DURATION_CONST) => {
    setNotification({ show: true, message });
    setTimeout(() => setNotification({ show: false, message: '' }), duration);
  }, []);

  const handleActionClick = useCallback((action) => {
    if (action.cooldownKey && cooldowns[action.cooldownKey]?.active) {
      showNotification('Действие недоступно, подождите');
      return;
    }
    // console.log('Selected action:', action.title, 'personalItems:', personalItems);
    setSelectedAction(action);
    // }, [cooldowns, showNotification, personalItems]);
  }, [cooldowns, showNotification]);


  const handleCloseModal = useCallback(() => {
    setSelectedAction(null);
    setSelectedNPC(null);
  }, []);

  const handleNPCClick = useCallback((npc) => {
    setSelectedNPC(npc);
  }, []);

  const handleButtonClick = useCallback(() => {
    if (!socket) {
      console.error('Socket is not initialized');
      showNotification('Ошибка соединения');
      return;
    }

    if (isProcessing) {
      showNotification('Действие уже выполняется, подождите');
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

    if (action.cooldownKey && cooldowns[action.cooldownKey]?.active) {
      showNotification('Действие недоступно, подождите');
      return;
    }

    if (action.item) {
      setIsProcessing(true);
      socket.emit('addItem', { owner: `user_${userId}`, item: action.item }, (response) => {
        setIsProcessing(false);
        if (response && response.success) {
          setSelectedAction(null);
          showNotification(action.successMessage);
          if (action.cooldownKey) {
            startCooldown(action.cooldownKey);
          }
        } else {
          setSelectedAction(null);
          showNotification(response?.message || 'Ошибка при добавлении предмета');
        }
      });
    } else if (action.action === 'utilizeTrash') {
      setIsProcessing(true);
      socket.emit('utilizeTrash', (response) => {
        setIsProcessing(false);
        if (response && response.success) {
          setSelectedAction(null);
          showNotification(response.message);
          socket.emit('getItems', { owner: `user_${userId}` });
        } else {
          setSelectedAction(null);
          showNotification(response?.message || 'Ошибка при утилизации');
        }
      });
    } else if (action.action === 'hunt') {
      return;
    } else if (action.systemMessage) {
      setIsProcessing(true);
      socket.emit('sendSystemMessage', {
        text: typeof action.systemMessage === 'function' ? action.systemMessage(user) : action.systemMessage,
        room: currentRoom,
        timestamp: new Date().toISOString(),
      }, () => {
        setIsProcessing(false);
        setSelectedAction(null);
        showNotification(action.successMessage);
      });
    }
  }, [socket, selectedAction, user, userId, currentRoom, showNotification, startCooldown, isProcessing, cooldowns]);

  const availableActions = useMemo(() => {
    if (!user || !currentRoom) return [];

    const roomMap = {
      home: currentRoom.startsWith(`myhome_${user.isHuman ? userId : user.owner}`),
      busStop: currentRoom === 'Автобусная остановка',
      forest: currentRoom === 'Лес',
      disposal: currentRoom === 'Полигон утилизации',
      workshop: currentRoom === 'Мастерская',
      shelter: currentRoom === 'Приют для животных "Кошкин дом"',
    };

    const locationKey = Object.keys(roomMap).find(key => roomMap[key]);
    if (!locationKey || !actionsConfig[locationKey]) return [];

    const actions = user.isHuman
      ? actionsConfig[locationKey].humanActions
      : actionsConfig[locationKey].animalActions;

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

  if (isLoading) {
    return (
      <ActionsContainer theme={theme}>
        <ContentContainer>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <ClipLoader color="#007AFF" size={40} />
            <p style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>Загрузка предметов...</p>
          </div>
        </ContentContainer>
      </ActionsContainer>
    );
  }

  return (
    <ActionsContainer theme={theme}>
      <ContentContainer>
        <ActionGrid>
          {availableActions.length > 0 ? (
            availableActions.map((action) => {
              // console.log('Rendering action:', action.title, 'cooldownKey:', action.cooldownKey);
              return (
                <ActionCard
                  key={action.id}
                  theme={theme}
                  onClick={() => handleActionClick(action)}
                  disabled={action.cooldownKey && cooldowns[action.cooldownKey]?.active}
                >
                  <div>
                    <ActionTitle theme={theme}>{action.title}</ActionTitle>
                    <ActionDescription theme={theme}>{action.description}</ActionDescription>
                  </div>
                  {action.cooldownKey && cooldowns[action.cooldownKey]?.active && (
                    <>
                      <ProgressBar progress={cooldowns[action.cooldownKey].progress} />
                      <TimerDisplay theme={theme}>
                        Осталось: {cooldowns[action.cooldownKey].timeLeft} сек
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
      {selectedAction && !selectedNPC && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <CloseButton theme={theme} onClick={handleCloseModal}><FaTimes /></CloseButton>
            <ModalTitle theme={theme}>{selectedAction.modalTitle}</ModalTitle>
            {selectedAction.title === 'Охотиться' ? (
              <div>
                <ModalDescription theme={theme}>{selectedAction.modalDescription}</ModalDescription>
                {npcs.length > 0 ? (
                  npcs.map((npc) => (
                    <ActionCard
                      key={npc.id}
                      theme={theme}
                      onClick={() => handleNPCClick(npc)}
                    >
                      <ActionTitle theme={theme}>{npc.name}</ActionTitle>
                      <ActionDescription theme={theme}>{npc.description}</ActionDescription>
                    </ActionCard>
                  ))
                ) : (
                  <ModalDescription theme={theme}>Животные не найдены</ModalDescription>
                )}
              </div>
            ) : selectedAction.title === 'Столярная мастерская' ? (
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
                <ActionButton
                  onClick={handleButtonClick}
                  disabled={isProcessing || (selectedAction?.cooldownKey && cooldowns[selectedAction.cooldownKey]?.active)}
                >
                  {isProcessing ? <ClipLoader color="#fff" size={20} /> : selectedAction.buttonText}
                </ActionButton>
              </>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
      {selectedNPC && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <Fight
              theme={theme}
              socket={socket}
              user={user}
              npc={selectedNPC} // Используем selectedNPC напрямую
              onClose={handleCloseModal}
              showNotification={showNotification}
              updateUser={updateUser} // Передаем updateUser
            />
          </ModalContent>
        </ModalOverlay>
      )}
      <Notification show={notification.show}>{notification.message}</Notification>
    </ActionsContainer>
  );
}

export default Actions;
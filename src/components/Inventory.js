import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

// Анимация исчезновения с движением вправо (для текущего пользователя)
const fadeOutRight = keyframes`
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(100px);
  }
`;

// Анимация исчезновения с движением влево (для текущего пользователя)
const fadeOutLeft = keyframes`
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-100px);
  }
`;

// Анимация уменьшения в точку (для других пользователей)
const shrinkToPoint = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0);
  }
`;

// Анимация появления с увеличением из точки (для других пользователей)
const growFromPoint = keyframes`
  0% {
    opacity: 0;
    transform: scale(0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const InventoryContainer = styled.div`
  height: 100%;
  padding: 20px;
  background: ${props => props.theme === 'dark' ? '#1A1A1A' : '#f5f5f5'};
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  overflow-y: auto;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  margin-bottom: 20px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 10px;
  background: ${props => props.active ? '#007AFF' : 'transparent'};
  color: ${props => props.active ? 'white' : (props.theme === 'dark' ? '#ccc' : '#333')};
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.active ? '#005BBB' : (props.theme === 'dark' ? '#333' : '#f0f0f0')};
  }
`;

const ItemList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
`;

const ItemCard = styled.div`
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  animation: ${props => {
    if (props.isAnimating === 'move') return fadeOutRight;
    if (props.isAnimating === 'pickup') return fadeOutLeft;
    if (props.isAnimating === 'shrink') return shrinkToPoint;
    if (props.isAnimating === 'grow') return growFromPoint;
    return 'none';
  }};
  animation-duration: 0.5s;
  animation-fill-mode: forwards;
`;

const ItemTitle = styled.h4`
  font-size: 16px;
  margin: 0 0 10px 0;
  color: ${props => props.theme === 'dark' ? '#fff' : '#000'};
`;

const ItemDetail = styled.p`
  font-size: 14px;
  margin: 5px 0;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
`;

const WeightLimit = styled.div`
  margin-bottom: 20px;
  font-size: 14px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  font-size: 14px;
  transition: background 0.2s;
  opacity: ${props => (props.disabled ? 0.5 : 1)};

  &:hover {
    opacity: ${props => (props.disabled ? 0.5 : 0.9)};
  }
`;

const MoveButton = styled(ActionButton)`
  background: #007AFF;
  color: white;
`;

const PickupButton = styled(ActionButton)`
  background: #32CD32;
  color: white;
`;

const DeleteButton = styled(ActionButton)`
  background: #FF0000;
  color: white;
`;

function Inventory({ userId, currentRoom, theme, socket }) {
  const [activeSubTab, setActiveSubTab] = useState('personal');
  const [personalItems, setPersonalItems] = useState([]);
  const [locationItems, setLocationItems] = useState([]);
  const [personalLimit, setPersonalLimit] = useState(null);
  const [locationLimit, setLocationLimit] = useState(null);
  const [error, setError] = useState(null);
  const [animatingItem, setAnimatingItem] = useState(null); // { itemId, action }
  const [pendingItems, setPendingItems] = useState([]); // Предметы, ожидающие добавления после анимации
  const [isActionCooldown, setIsActionCooldown] = useState(false); // Состояние задержки

  const userOwnerKey = `user_${userId}`;
  const locationOwnerKey = currentRoom && currentRoom.startsWith('myhome_') ? `myhome_${userId}` : currentRoom;

  // Обработчик обновления предметов
  const handleItemsUpdate = useCallback((data) => {
    const { owner, items } = data;
    if (owner === userOwnerKey) {
      setPersonalItems(items);
    } else if (owner === locationOwnerKey) {
      if (!pendingItems.some(item => item.owner === locationOwnerKey)) {
        setLocationItems(items);
      }
    }
  }, [userOwnerKey, locationOwnerKey, pendingItems]);

  // Обработчик обновления лимитов
  const handleLimitUpdate = useCallback((limit) => {
    if (limit.owner === userOwnerKey) setPersonalLimit(limit);
    else if (limit.owner === locationOwnerKey) setLocationLimit(limit);
  }, [userOwnerKey, locationOwnerKey]);

  // Обработчик действий с предметами (для анимаций у других пользователей)
  const handleItemAction = useCallback((data) => {
    const { action, owner, itemId, item } = data;

    if (action === 'remove' && owner === locationOwnerKey) {
      setAnimatingItem({ itemId, action: 'shrink' });
      setTimeout(() => {
        setLocationItems(prevItems => prevItems.filter(i => i._id.toString() !== itemId));
        setAnimatingItem(null);
      }, 500);
    } else if (action === 'add' && owner === locationOwnerKey) {
      setPendingItems(prev => [...prev, item]);
      setAnimatingItem({ itemId: item._id.toString(), action: 'grow' });
      setTimeout(() => {
        setLocationItems(prevItems => [...prevItems, item]);
        setPendingItems(prev => prev.filter(i => i._id.toString() !== item._id.toString()));
        setAnimatingItem(null);
      }, 500);
    }
  }, [locationOwnerKey]);

  useEffect(() => {
    if (!socket || !userId) return;

    socket.emit('getItems', { owner: userOwnerKey });
    socket.emit('getItems', { owner: locationOwnerKey });
    socket.emit('getInventoryLimit', { owner: userOwnerKey });
    socket.emit('getInventoryLimit', { owner: locationOwnerKey });

    socket.on('items', handleItemsUpdate);
    socket.on('inventoryLimit', handleLimitUpdate);
    socket.on('itemAction', handleItemAction);
    socket.on('error', ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 3000);
    });

    return () => {
      socket.off('items', handleItemsUpdate);
      socket.off('inventoryLimit', handleLimitUpdate);
      socket.off('itemAction', handleItemAction);
      socket.off('error');
    };
  }, [socket, userId, currentRoom, userOwnerKey, locationOwnerKey, handleItemsUpdate, handleLimitUpdate, handleItemAction]);

  const handleMoveItem = (itemId, newOwner) => {
    if (isActionCooldown) return; // Блокируем действие во время задержки

    // Устанавливаем задержку
    setIsActionCooldown(true);

    // Запускаем анимацию исчезновения вправо
    setAnimatingItem({ itemId, action: 'move' });

    // После завершения анимации (500ms) обновляем состояние и отправляем запрос
    setTimeout(() => {
      const updatedPersonalItems = personalItems.filter(item => item._id.toString() !== itemId);
      setPersonalItems(updatedPersonalItems);
      setAnimatingItem(null);
      socket.emit('moveItem', { itemId, newOwner });

      // Устанавливаем дополнительную задержку 1 секунду после анимации
      setTimeout(() => {
        setIsActionCooldown(false); // Разблокируем действия
      }, 1000); // Задержка 1 секунда
    }, 500); // Длительность анимации
  };

  const handlePickupItem = (itemId) => {
    if (isActionCooldown) return; // Блокируем действие во время задержки

    // Устанавливаем задержку
    setIsActionCooldown(true);

    // Запускаем анимацию исчезновения влево
    setAnimatingItem({ itemId, action: 'pickup' });

    // После завершения анимации (500ms) обновляем состояние и отправляем запрос
    setTimeout(() => {
      const updatedLocationItems = locationItems.filter(item => item._id.toString() !== itemId);
      setLocationItems(updatedLocationItems);
      setAnimatingItem(null);
      socket.emit('pickupItem', { itemId });

      // Устанавливаем дополнительную задержку 1 секунду после анимации
      setTimeout(() => {
        setIsActionCooldown(false); // Разблокируем действия
      }, 1000); // Задержка 1 секунда
    }, 500); // Длительность анимации
  };

  const handleDeleteItem = (itemId) => {
    const updatedItems = activeSubTab === 'personal'
      ? personalItems.filter(item => item._id.toString() !== itemId)
      : locationItems.filter(item => item._id.toString() !== itemId);
    if (activeSubTab === 'personal') setPersonalItems(updatedItems);
    else setLocationItems(updatedItems);
    socket.emit('deleteItem', { itemId });
  };

  return (
    <InventoryContainer theme={theme}>
      <Tabs>
        <Tab
          active={activeSubTab === 'personal'}
          onClick={() => setActiveSubTab('personal')}
          theme={theme}
        >
          Личные вещи
        </Tab>
        <Tab
          active={activeSubTab === 'location'}
          onClick={() => setActiveSubTab('location')}
          theme={theme}
        >
          Локация
        </Tab>
      </Tabs>
      {error && (
        <div style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      {activeSubTab === 'personal' && personalLimit && (
        <WeightLimit theme={theme}>
          Вес: {personalLimit.currentWeight} кг / {personalLimit.maxWeight} кг
        </WeightLimit>
      )}
      {activeSubTab === 'location' && locationLimit && (
        <WeightLimit theme={theme}>
          Вес: {locationLimit.currentWeight} кг / {locationLimit.maxWeight} кг
        </WeightLimit>
      )}
      <ItemList>
        {activeSubTab === 'personal' && personalItems.map(item => (
          <ItemCard
            key={item._id}
            theme={theme}
            isAnimating={animatingItem && animatingItem.itemId === item._id.toString() ? animatingItem.action : null}
          >
            <ItemTitle theme={theme}>{item.name}</ItemTitle>
            <ItemDetail theme={theme}>Описание: {item.description}</ItemDetail>
            <ItemDetail theme={theme}>Редкость: {item.rarity}</ItemDetail>
            <ItemDetail theme={theme}>Вес: {item.weight}</ItemDetail>
            <ItemDetail theme={theme}>Стоимость: {item.cost}</ItemDetail>
            <ItemDetail theme={theme}>Эффект: {item.effect}</ItemDetail>
            <ActionButtons>
              {locationOwnerKey && (
                <MoveButton
                  onClick={() => handleMoveItem(item._id, locationOwnerKey)}
                  disabled={isActionCooldown}
                >
                  Оставить на локации
                </MoveButton>
              )}
              <DeleteButton onClick={() => handleDeleteItem(item._id)}>
                Удалить
              </DeleteButton>
            </ActionButtons>
          </ItemCard>
        ))}
        {activeSubTab === 'location' && locationItems.map(item => (
          <ItemCard
            key={item._id}
            theme={theme}
            isAnimating={animatingItem && animatingItem.itemId === item._id.toString() ? animatingItem.action : null}
          >
            <ItemTitle theme={theme}>{item.name}</ItemTitle>
            <ItemDetail theme={theme}>Описание: {item.description}</ItemDetail>
            <ItemDetail theme={theme}>Редкость: {item.rarity}</ItemDetail>
            <ItemDetail theme={theme}>Вес: {item.weight}</ItemDetail>
            <ItemDetail theme={theme}>Стоимость: {item.cost}</ItemDetail>
            <ItemDetail theme={theme}>Эффект: {item.effect}</ItemDetail>
            <ActionButtons>
              <PickupButton
                onClick={() => handlePickupItem(item._id)}
                disabled={isActionCooldown}
              >
                Подобрать
              </PickupButton>
              <DeleteButton onClick={() => handleDeleteItem(item._id)}>
                Удалить
              </DeleteButton>
            </ActionButtons>
          </ItemCard>
        ))}
        {activeSubTab === 'personal' && personalItems.length === 0 && (
          <div style={{ textAlign: 'center', color: theme === 'dark' ? '#ccc' : '#666' }}>
            У вас пока нет предметов
          </div>
        )}
        {activeSubTab === 'location' && locationItems.length === 0 && (
          <div style={{ textAlign: 'center', color: theme === 'dark' ? '#ccc' : '#666' }}>
            На этой локации нет предметов
          </div>
        )}
      </ItemList>
    </InventoryContainer>
  );
}

export default Inventory;
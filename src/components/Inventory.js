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

// Анимация расщепления на куски и исчезновения с более сложными стадиями
const splitAndFade = keyframes`
  0% {
    opacity: 1;
    transform: scale(1) translate(0, 0);
  }
  20% {
    opacity: 0.9;
    transform: scale(1.1);
    clip-path: polygon(0% 0%, 40% 0%, 30% 100%, 0% 100%);
  }
  40% {
    opacity: 0.7;
    transform: scale(1.3) translate(10px, -15px);
    clip-path: polygon(40% 0%, 70% 0%, 60% 100%, 30% 100%);
  }
  60% {
    opacity: 0.5;
    transform: scale(1.5) translate(-20px, 20px);
    clip-path: polygon(70% 0%, 100% 0%, 100% 100%, 60% 100%);
  }
  80% {
    opacity: 0.3;
    transform: scale(1.7) translate(30px, -30px);
    clip-path: polygon(0% 0%, 100% 0%, 100% 40%, 0% 60%);
  }
  100% {
    opacity: 0;
    transform: scale(2) translate(-40px, 40px);
    clip-path: polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%);
  }
`;

// Анимация заполнения прогресс-бара
const fillProgress = keyframes`
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
`;

const InventoryContainer = styled.div`
  height: 100%;
  padding: 5px;
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
  gap: 15px;
  ${props => props.subTab === 'personal' && `
    grid-template-columns: 1fr;
  `}
  ${props => props.subTab === 'location' && `
    grid-template-columns: repeat(2, 1fr);
  `}
`;

const ItemCard = styled.div`
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  animation: ${props => {
    if (props.isAnimating === 'move') return fadeOutRight;
    if (props.isAnimating === 'pickup') return fadeOutLeft;
    if (props.isAnimating === 'shrink') return shrinkToPoint;
    if (props.isAnimating === 'grow') return growFromPoint;
    if (props.isAnimating === 'split') return splitAndFade;
    return 'none';
  }};
  animation-duration: 1s;
  animation-fill-mode: forwards;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#333' : '#f0f0f0'};
  }
`;

const ItemInfo = styled.div`
  cursor: pointer;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#f0f0f0'};
  }
`;

const ItemTitle = styled.h4`
  font-size: 14px;
  margin: 0 0 5px 0;
  color: ${props => props.theme === 'dark' ? '#fff' : '#000'};
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const ItemDetail = styled.p`
  font-size: 12px;
  margin: 2px 0;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const WeightLimit = styled.div`
  margin-bottom: 10px;
  font-size: 12px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 5px;
  margin-top: 5px;
`;

const ActionButton = styled.button`
  position: relative;
  padding: 5px 10px;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  font-size: 12px;
  transition: background 0.2s;
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: ${props => (props.disabled ? 0.5 : 0.9)};
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  animation: ${fillProgress} 1.5s linear forwards;
`;

const MoveButton = styled(ActionButton)`
  background: #007AFF;
  color: white;
`;

const DeleteButton = styled(ActionButton)`
  background: #FF0000;
  color: white;
`;

const PickupButton = styled(ActionButton)`
  background: #32CD32;
  color: white;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => (props.isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;

  &:hover {
    cursor: ${props => props.isConfirm ? 'auto' : 'pointer'};
  }
`;

const ModalContent = styled.div`
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  text-align: center;
`;

const ConfirmModalContent = styled(ModalContent)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ConfirmText = styled.p`
  font-size: 16px;
  margin-bottom: 20px;
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: 20px;
`;

const ConfirmButton = styled(ActionButton)`
  width: 80px;
  height: 40px;
  background: ${props => props.type === 'yes' ? '#32CD32' : '#FF0000'};
  color: white;
  font-size: 16px;
  padding: 0;

  &:hover {
    opacity: ${props => props.disabled ? 0.5 : 0.9};
  }
`;

function Inventory({ userId, currentRoom, theme, socket, onItemsUpdate, closeActionModal, setIsModalOpen }) {
  const [activeSubTab, setActiveSubTab] = useState('personal');
  const [personalItems, setPersonalItems] = useState([]);
  const [locationItems, setLocationItems] = useState([]);
  const [personalLimit, setPersonalLimit] = useState(null);
  const [locationLimit, setLocationLimit] = useState(null);
  const [error, setError] = useState(null);
  const [animatingItem, setAnimatingItem] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [isActionCooldown, setIsActionCooldown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const userOwnerKey = `user_${userId}`;
  const locationOwnerKey = currentRoom && currentRoom.startsWith('myhome_') ? `myhome_${userId}` : currentRoom;

  const handleItemsUpdate = useCallback((data) => {
    if (!data) {
      console.error('Received null or undefined data in handleItemsUpdate:', data);
      return;
    }
    if (typeof data !== 'object' || !('owner' in data) || !('items' in data)) {
      console.error('Invalid items data received:', data);
      return;
    }

    const { owner, items } = data;
    if (owner === userOwnerKey) {
      const updatedItems = items.map(item => ({
        ...item,
        _id: item._id.toString(),
      }));
      setPersonalItems(updatedItems);
      onItemsUpdate(updatedItems);
    } else if (owner === locationOwnerKey) {
      if (!pendingItems.some(item => item.owner === locationOwnerKey)) {
        setLocationItems(items);
      }
    }
  }, [userOwnerKey, locationOwnerKey, pendingItems, onItemsUpdate]);

  const handleLimitUpdate = useCallback((limit) => {
    if (limit.owner === userOwnerKey) setPersonalLimit(limit);
    else if (limit.owner === locationOwnerKey) setLocationLimit(limit);
  }, [userOwnerKey, locationOwnerKey]);

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
    if (isActionCooldown) return;

    setIsActionCooldown(true);
    setAnimatingItem({ itemId, action: 'move' });

    setTimeout(() => {
      const updatedPersonalItems = personalItems.filter(item => item._id.toString() !== itemId);
      setPersonalItems(updatedPersonalItems);
      setAnimatingItem(null);
      socket.emit('moveItem', { itemId, newOwner });

      setTimeout(() => {
        setIsActionCooldown(false);
      }, 1000);
    }, 500);
  };

  const handlePickupItem = (itemId) => {
    if (isActionCooldown) return;

    setIsActionCooldown(true);
    setAnimatingItem({ itemId, action: 'pickup' });
    console.log('Calling closeActionModal and setIsModalOpen(false)');
    closeActionModal(); // Оставляем для совместимости
    setIsModalOpen(false); // Закрываем модальное окно в Actions.js

    setTimeout(() => {
      const updatedLocationItems = locationItems.filter(item => item._id.toString() !== itemId);
      setLocationItems(updatedLocationItems);
      setAnimatingItem(null);
      socket.emit('pickupItem', { itemId });

      setTimeout(() => {
        setIsActionCooldown(false);
      }, 1000);
    }, 500);
  };

  const handleDeleteItem = (itemId) => {
    if (isActionCooldown) return;

    setConfirmDelete(itemId);
  };

  const confirmDeleteItem = (confirmed) => {
    if (confirmed && confirmDelete) {
      const itemId = confirmDelete;
      const itemToDelete = personalItems.find(item => item._id.toString() === itemId);
      if (!itemToDelete) return;

      setIsActionCooldown(true);
      setAnimatingItem({ itemId, action: 'split' });

      setTimeout(() => {
        const updatedItems = personalItems.filter(item => item._id.toString() !== itemId);
        const trashItem = {
          _id: `temp_${Date.now()}`,
          name: 'Мусор',
          description: 'Раньше это было чем-то полезным',
          rarity: 'Бесполезный',
          weight: itemToDelete.weight,
          cost: 1,
          effect: 'Чувство обременения чем-то бесполезным',
        };
        setPersonalItems([...updatedItems, trashItem]);
        socket.emit('deleteItem', { itemId });

        setAnimatingItem(null);
        setTimeout(() => {
          setIsActionCooldown(false);
        }, 1000);
      }, 1000);
    }

    setConfirmDelete(null);
  };

  const openModal = (item) => {
    setSelectedItem(item);
  };

  const closeModal = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedItem(null);
      setConfirmDelete(null);
    }
  };

  return (
    <InventoryContainer theme={theme}>
      <Tabs>
        <Tab active={activeSubTab === 'personal'} onClick={() => setActiveSubTab('personal')} theme={theme}>
          Личные вещи
        </Tab>
        <Tab active={activeSubTab === 'location'} onClick={() => setActiveSubTab('location')} theme={theme}>
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
      <ItemList subTab={activeSubTab}>
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
                  Выложить
                  {isActionCooldown && <ProgressBar />}
                </MoveButton>
              )}
              {item.name !== 'Мусор' && (
                <DeleteButton
                  onClick={() => handleDeleteItem(item._id)}
                  disabled={isActionCooldown}
                >
                  Сломать
                  {isActionCooldown && <ProgressBar />}
                </DeleteButton>
              )}
            </ActionButtons>
          </ItemCard>
        ))}
        {activeSubTab === 'location' && locationItems.map(item => (
          <ItemCard
            key={item._id}
            theme={theme}
            isAnimating={animatingItem && animatingItem.itemId === item._id.toString() ? animatingItem.action : null}
          >
            <ItemInfo theme={theme} onClick={() => openModal(item)}>
              <ItemTitle theme={theme}>{item.name}</ItemTitle>
              <ItemDetail theme={theme}>{item.description}</ItemDetail>
            </ItemInfo>
            <ActionButtons>
              <PickupButton
                onClick={() => handlePickupItem(item._id)}
                disabled={isActionCooldown}
              >
                Подобрать
                {isActionCooldown && <ProgressBar />}
              </PickupButton>
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
      <Modal isOpen={!!selectedItem || !!confirmDelete} theme={theme} onClick={closeModal} isConfirm={!!confirmDelete}>
        {selectedItem && (
          <ModalContent theme={theme}>
            <ItemTitle theme={theme}>{selectedItem.name}</ItemTitle>
            <ItemDetail theme={theme}>Описание: {selectedItem.description}</ItemDetail>
            <ItemDetail theme={theme}>Редкость: {selectedItem.rarity}</ItemDetail>
            <ItemDetail theme={theme}>Вес: {selectedItem.weight}</ItemDetail>
            <ItemDetail theme={theme}>Стоимость: {selectedItem.cost}</ItemDetail>
            <ItemDetail theme={theme}>Эффект: {selectedItem.effect}</ItemDetail>
          </ModalContent>
        )}
        {confirmDelete && (
          <ConfirmModalContent theme={theme}>
            <ConfirmText>Вы уверены, что хотите сломать этот предмет?</ConfirmText>
            <ConfirmButtons>
              <ConfirmButton type="yes" onClick={() => confirmDeleteItem(true)} disabled={isActionCooldown}>
                Да
              </ConfirmButton>
              <ConfirmButton type="no" onClick={() => confirmDeleteItem(false)} disabled={isActionCooldown}>
                Нет
              </ConfirmButton>
            </ConfirmButtons>
          </ConfirmModalContent>
        )}
      </Modal>
    </InventoryContainer>
  );
}

export default Inventory;
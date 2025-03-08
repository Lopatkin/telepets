import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

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
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    opacity: 0.9;
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

  const userOwnerKey = `user_${userId}`;
  const locationOwnerKey = currentRoom && currentRoom.startsWith('myhome_') ? `myhome_${userId}` : currentRoom;

  // Обработчик обновления предметов
  const handleItemsUpdate = useCallback((items) => {
    const userItems = items.filter(item => item.owner === userOwnerKey);
    const locationItemsFiltered = items.filter(item => item.owner === locationOwnerKey);
    if (userItems.length > 0) setPersonalItems(userItems);
    if (locationItemsFiltered.length > 0) setLocationItems(locationItemsFiltered);
  }, [userOwnerKey, locationOwnerKey]);

  // Обработчик обновления лимитов
  const handleLimitUpdate = useCallback((limit) => {
    if (limit.owner === userOwnerKey) setPersonalLimit(limit);
    else if (limit.owner === locationOwnerKey) setLocationLimit(limit);
  }, [userOwnerKey, locationOwnerKey]);

  useEffect(() => {
    if (!socket || !userId) return;

    // Инициализация данных
    socket.emit('getItems', { owner: userOwnerKey });
    socket.emit('getItems', { owner: locationOwnerKey });
    socket.emit('getInventoryLimit', { owner: userOwnerKey });
    socket.emit('getInventoryLimit', { owner: locationOwnerKey });

    // Подписка на обновления
    socket.on('items', handleItemsUpdate);
    socket.on('inventoryLimit', handleLimitUpdate);
    socket.on('error', ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 3000);
    });

    // Очистка подписок
    return () => {
      socket.off('items', handleItemsUpdate);
      socket.off('inventoryLimit', handleLimitUpdate);
      socket.off('error');
    };
  }, [socket, userId, currentRoom, userOwnerKey, locationOwnerKey, handleItemsUpdate, handleLimitUpdate]);

  const handleMoveItem = (itemId, newOwner) => {
    const updatedPersonalItems = personalItems.filter(item => item._id.toString() !== itemId);
    setPersonalItems(updatedPersonalItems); // Локальное обновление
    socket.emit('moveItem', { itemId, newOwner });
  };

  const handlePickupItem = (itemId) => {
    const updatedLocationItems = locationItems.filter(item => item._id.toString() !== itemId);
    setLocationItems(updatedLocationItems); // Локальное обновление
    socket.emit('pickupItem', { itemId });
  };

  const handleDeleteItem = (itemId) => {
    const updatedItems = activeSubTab === 'personal'
      ? personalItems.filter(item => item._id.toString() !== itemId)
      : locationItems.filter(item => item._id.toString() !== itemId);
    if (activeSubTab === 'personal') setPersonalItems(updatedItems);
    else setLocationItems(updatedItems); // Локальное обновление
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
          <ItemCard key={item._id} theme={theme}>
            <ItemTitle theme={theme}>{item.name}</ItemTitle>
            <ItemDetail theme={theme}>Описание: {item.description}</ItemDetail>
            <ItemDetail theme={theme}>Редкость: {item.rarity}</ItemDetail>
            <ItemDetail theme={theme}>Вес: {item.weight}</ItemDetail>
            <ItemDetail theme={theme}>Стоимость: {item.cost}</ItemDetail>
            <ItemDetail theme={theme}>Эффект: {item.effect}</ItemDetail>
            <ActionButtons>
              {locationOwnerKey && (
                <MoveButton onClick={() => handleMoveItem(item._id, locationOwnerKey)}>
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
          <ItemCard key={item._id} theme={theme}>
            <ItemTitle theme={theme}>{item.name}</ItemTitle>
            <ItemDetail theme={theme}>Описание: {item.description}</ItemDetail>
            <ItemDetail theme={theme}>Редкость: {item.rarity}</ItemDetail>
            <ItemDetail theme={theme}>Вес: {item.weight}</ItemDetail>
            <ItemDetail theme={theme}>Стоимость: {item.cost}</ItemDetail>
            <ItemDetail theme={theme}>Эффект: {item.effect}</ItemDetail>
            <ActionButtons>
              <PickupButton onClick={() => handlePickupItem(item._id)}>
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
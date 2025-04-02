import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

const SubTabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  margin-bottom: 15px;
`;

const SubTab = styled.button`
  flex: 1;
  padding: 8px;
  background: ${props => props.active ? '#007AFF' : 'transparent'};
  color: ${props => props.active ? 'white' : (props.theme === 'dark' ? '#ccc' : '#333')};
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.active ? '#005BBB' : (props.theme === 'dark' ? '#333' : '#f0f0f0')};
  }
`;

const AnimalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 5px; /* Небольшие отступы слева и справа */
  width: 100%; /* Убеждаемся, что сам список занимает всю ширину */
`;

const AnimalCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
`;

const StatusCircle = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.isOnline ? 'green' : 'gray'};
  margin-right: 10px;
`;

const Avatar = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
`;

const AnimalName = styled.span`
  font-size: 14px;
  color: ${props => props.theme === 'dark' ? '#fff' : '#000'};
  flex-grow: 1; /* Растягиваем имя, чтобы заполнить пространство */
`;

const TakeHomeButton = styled.button`
  padding: 5px 10px;
  background: #32CD32;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: #28A828;
  }
`;

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
  background: ${props => props.theme === 'dark' ? '#1A1A1A' : '#f5f5f5'};
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  display: flex;
  flex-direction: column;
  padding: 10; /* Убираем отступы сверху */
  box-sizing: border-box;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  margin-bottom: 10px; /* Как в Map.js */
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

const ContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 5px; /* Отступы для контента, а не вкладок */
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

const ItemCount = styled.span`
  font-size: 12px;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
  margin-left: 5px;
`;

const QuantityModalContent = styled(ModalContent)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const QuantitySlider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  margin: 10px 0;
`;

const QuantityText = styled.p`
  font-size: 14px;
  margin: 10px 0;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
`;

function Inventory({ userId, currentRoom, theme, socket, onItemsUpdate, user }) {
  const [activeTab, setActiveTab] = useState('personal');
  const [activeLocationSubTab, setActiveLocationSubTab] = useState('items');
  const [personalItems, setPersonalItems] = useState([]);
  const [locationItems, setLocationItems] = useState([]);
  const [shelterAnimals, setShelterAnimals] = useState([]);
  const [personalLimit, setPersonalLimit] = useState(null);
  const [locationLimit, setLocationLimit] = useState(null);
  const [error, setError] = useState(null);
  const [animatingItem, setAnimatingItem] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [isActionCooldown, setIsActionCooldown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionQuantity, setActionQuantity] = useState({ itemName: null, weight: null, count: 1, action: null });

  const userOwnerKey = `user_${userId}`;
  const locationOwnerKey = currentRoom;
  const isShelter = currentRoom === 'Приют для животных "Кошкин дом"';

  const groupItemsByNameAndWeight = (items) => {
    const grouped = items.reduce((acc, item) => {
      const key = `${item.name}_${item.weight}`;
      if (!acc[key]) {
        acc[key] = { item, count: 0, ids: [] };
      }
      acc[key].count += 1;
      acc[key].ids.push(item._id);
      return acc;
    }, {});
    return Object.values(grouped);
  };

  const handleItemsUpdate = useCallback((data) => {
    const { owner, items } = data;
    const updatedItems = items.map(item => ({
      ...item,
      _id: item._id.toString(),
    }));
    if (owner === userOwnerKey) {
      setPersonalItems(updatedItems);
      onItemsUpdate(updatedItems);
    } else if (owner === locationOwnerKey) {
      if (!pendingItems.some(item => item.owner === locationOwnerKey)) {
        setLocationItems(updatedItems);
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

  const handleShelterAnimals = useCallback((animals) => {
    setShelterAnimals(animals);
  }, []);

  // Временное логирование для отладки
  useEffect(() => {
    console.log('Inventory props:', { userId, currentRoom, user });
  }, [userId, currentRoom, user]);

  useEffect(() => {
    if (!socket || !userId) return;

    socket.emit('getItems', { owner: userOwnerKey });
    socket.emit('getItems', { owner: locationOwnerKey });
    socket.emit('getInventoryLimit', { owner: userOwnerKey });
    socket.emit('getInventoryLimit', { owner: locationOwnerKey });

    if (isShelter) {
      socket.emit('getShelterAnimals');
    }

    socket.on('items', handleItemsUpdate);
    socket.on('inventoryLimit', handleLimitUpdate);
    socket.on('itemAction', handleItemAction);
    socket.on('shelterAnimals', handleShelterAnimals);
    socket.on('error', ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 3000);
    });

    return () => {
      socket.off('items', handleItemsUpdate);
      socket.off('inventoryLimit', handleLimitUpdate);
      socket.off('itemAction', handleItemAction);
      socket.off('shelterAnimals', handleShelterAnimals);
      socket.off('error');
    };
  }, [socket, userId, currentRoom, userOwnerKey, locationOwnerKey, isShelter, handleItemsUpdate, handleLimitUpdate, handleItemAction, handleShelterAnimals]);

  const handleTakeHome = (animalId) => {
    if (!socket || !userId) {
      console.error('Socket or userId not available');
      return;
    }
    socket.emit('takeAnimalHome', { animalId });
    console.log(`Sent takeAnimalHome request for animal ID: ${animalId}`);
  };

  const handleMoveItem = (itemName, weight, maxCount) => {
    if (isActionCooldown) return;
    setActionQuantity({ itemName, weight, count: 1, action: 'move', maxCount });
  };

  const handlePickupItem = (itemId) => {
    if (isActionCooldown) return;

    setIsActionCooldown(true);
    setAnimatingItem({ itemId, action: 'pickup' });

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

  const handleDeleteItem = (itemName, weight, maxCount) => {
    if (isActionCooldown) return;
    setActionQuantity({ itemName, weight, count: 1, action: 'delete', maxCount });
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

  const confirmActionQuantity = () => {
    if (!actionQuantity.itemName || isActionCooldown) return;

    setIsActionCooldown(true);
    const { itemName, weight, count, action } = actionQuantity;

    if (action === 'move') {
      setAnimatingItem({ itemId: `${itemName}_${weight}_move`, action: 'move' });
      setTimeout(() => {
        const itemsToMove = personalItems.filter(item => item.name === itemName && item.weight === weight).slice(0, count);
        const itemIds = itemsToMove.map(item => item._id);
        setPersonalItems(prev => prev.filter(item => !itemIds.includes(item._id)));
        socket.emit('moveItem', { itemIds, newOwner: locationOwnerKey });
        setAnimatingItem(null);
        setTimeout(() => setIsActionCooldown(false), 1000);
      }, 500);
    } else if (action === 'delete') {
      setAnimatingItem({ itemId: `${itemName}_${weight}_delete`, action: 'split' });
      setTimeout(() => {
        const itemsToDelete = personalItems.filter(item => item.name === itemName && item.weight === weight).slice(0, count);
        const itemIds = itemsToDelete.map(item => item._id);
        const updatedItems = personalItems.filter(item => !itemIds.includes(item._id));
        const trashItems = itemsToDelete.map(item => ({
          _id: `temp_${Date.now()}_${Math.random()}`,
          name: 'Мусор',
          description: 'Раньше это было чем-то полезным',
          rarity: 'Бесполезный',
          weight: item.weight,
          cost: 1,
          effect: 'Чувство обременения чем-то бесполезным',
        }));
        setPersonalItems([...updatedItems, ...trashItems]);
        itemIds.forEach(itemId => socket.emit('deleteItem', { itemId }));
        setAnimatingItem(null);
        setTimeout(() => setIsActionCooldown(false), 1000);
      }, 1000);
    }

    setActionQuantity({ itemName: null, weight: null, count: 1, action: null });
  };

  const openModal = (item) => {
    setSelectedItem(item);
  };

  const closeModal = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedItem(null);
      setConfirmDelete(null);
      setActionQuantity({ itemName: null, weight: null, count: 1, action: null });
    }
  };

  return (
    <InventoryContainer theme={theme}>
      <Tabs>
        <Tab
          active={activeTab === 'personal'}
          onClick={() => setActiveTab('personal')}
          theme={theme}
        >
          Личные вещи
        </Tab>
        <Tab
          active={activeTab === 'location'}
          onClick={() => setActiveTab('location')}
          theme={theme}
        >
          Локация
        </Tab>
      </Tabs>
      <ContentContainer>
        {activeTab === 'location' && isShelter && (
          <SubTabs>
            <SubTab
              active={activeLocationSubTab === 'items'}
              onClick={() => setActiveLocationSubTab('items')}
              theme={theme}
            >
              Предметы
            </SubTab>
            <SubTab
              active={activeLocationSubTab === 'animals'}
              onClick={() => setActiveLocationSubTab('animals')}
              theme={theme}
            >
              Животные
            </SubTab>
          </SubTabs>
        )}
        {error && (
          <div style={{ textAlign: 'center', color: 'red', marginBottom: '10px' }}>
            {error}
          </div>
        )}
        {activeTab === 'personal' && personalLimit && (
          <WeightLimit theme={theme}>
            Вес: {personalLimit.currentWeight} кг / {personalLimit.maxWeight} кг
          </WeightLimit>
        )}
        {activeTab === 'location' && locationLimit && (
          <WeightLimit theme={theme}>
            Вес: {locationLimit.currentWeight} кг / {locationLimit.maxWeight} кг
          </WeightLimit>
        )}
        {activeTab === 'location' && isShelter && activeLocationSubTab === 'animals' ? (
          <AnimalList>
            {shelterAnimals.map(animal => (
              <AnimalCard key={animal.userId} theme={theme}>
                <StatusCircle isOnline={animal.isOnline} />
                <Avatar src={animal.photoUrl || '/default-animal-avatar.png'} alt="Аватар" />
                <AnimalName theme={theme}>{animal.name}</AnimalName>
                {!animal.owner && user?.isHuman && (
                  <TakeHomeButton onClick={() => handleTakeHome(animal.userId)}>
                    Забрать домой
                  </TakeHomeButton>
                )}
              </AnimalCard>
            ))}
            {shelterAnimals.length === 0 && (
              <div style={{ textAlign: 'center', color: theme === 'dark' ? '#ccc' : '#666' }}>
                В приюте нет животных
              </div>
            )}
          </AnimalList>
        ) : (
          <ItemList subTab={activeTab}>
            {activeTab === 'personal' && groupItemsByNameAndWeight(personalItems).map(({ item, count }) => (
              <ItemCard
                key={item._id}
                theme={theme}
                isAnimating={
                  animatingItem && (
                    (animatingItem.itemId === `${item.name}_${item.weight}_move`) ||
                    (animatingItem.itemId === `${item.name}_${item.weight}_delete`)
                  ) ? animatingItem.action : null
                }
              >
                <ItemTitle theme={theme}>{item.name} <ItemCount theme={theme}>x{count}</ItemCount></ItemTitle>
                {item.description === 'Кошка' || item.description === 'Собака' ? (
                  <ItemDetail theme={theme}>{item.description}</ItemDetail>
                ) : (
                  <>
                    <ItemDetail theme={theme}>Описание: {item.description}</ItemDetail>
                    <ItemDetail theme={theme}>Редкость: {item.rarity}</ItemDetail>
                    <ItemDetail theme={theme}>Вес: {item.weight}</ItemDetail>
                    <ItemDetail theme={theme}>Стоимость: {item.cost}</ItemDetail>
                    <ItemDetail theme={theme}>Эффект: {item.effect}</ItemDetail>
                  </>
                )}
                <ActionButtons>
                  {locationOwnerKey && (
                    <MoveButton
                      onClick={() => handleMoveItem(item.name, item.weight, count)}
                      disabled={isActionCooldown}
                    >
                      Выложить
                      {isActionCooldown && <ProgressBar />}
                    </MoveButton>
                  )}
                  {item.name !== 'Мусор' && (
                    <DeleteButton
                      onClick={() => handleDeleteItem(item.name, item.weight, count)}
                      disabled={isActionCooldown}
                    >
                      Сломать
                      {isActionCooldown && <ProgressBar />}
                    </DeleteButton>
                  )}
                </ActionButtons>
              </ItemCard>
            ))}
            {activeTab === 'location' && !isShelter && groupItemsByNameAndWeight(locationItems).map(({ item, count }) => (
              <ItemCard
                key={item._id}
                theme={theme}
                isAnimating={animatingItem && animatingItem.itemId === item._id.toString() ? animatingItem.action : null}
              >
                <ItemInfo theme={theme} onClick={() => openModal(item)}>
                  <ItemTitle theme={theme}>{item.name} <ItemCount theme={theme}>x{count}</ItemCount></ItemTitle>
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
            {activeTab === 'location' && isShelter && activeLocationSubTab === 'items' && groupItemsByNameAndWeight(locationItems).map(({ item, count }) => (
              <ItemCard
                key={item._id}
                theme={theme}
                isAnimating={animatingItem && animatingItem.itemId === item._id.toString() ? animatingItem.action : null}
              >
                <ItemInfo theme={theme} onClick={() => openModal(item)}>
                  <ItemTitle theme={theme}>{item.name} <ItemCount theme={theme}>x{count}</ItemCount></ItemTitle>
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
            {activeTab === 'personal' && personalItems.length === 0 && (
              <div style={{ textAlign: 'center', color: theme === 'dark' ? '#ccc' : '#666' }}>
                У вас пока нет предметов
              </div>
            )}
            {activeTab === 'location' && !isShelter && locationItems.length === 0 && (
              <div style={{ textAlign: 'center', color: theme === 'dark' ? '#ccc' : '#666' }}>
                На этой локации нет предметов
              </div>
            )}
            {activeTab === 'location' && isShelter && activeLocationSubTab === 'items' && locationItems.length === 0 && (
              <div style={{ textAlign: 'center', color: theme === 'dark' ? '#ccc' : '#666' }}>
                На этой локации нет предметов
              </div>
            )}
          </ItemList>
        )}
      </ContentContainer>
      <Modal
        isOpen={!!selectedItem || !!confirmDelete || (!!(actionQuantity.itemName && actionQuantity.weight))}
        theme={theme}
        onClick={closeModal}
        isConfirm={!!confirmDelete || (!!(actionQuantity.itemName && actionQuantity.weight))}
      >
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
        {actionQuantity.itemName && actionQuantity.weight && (
          <QuantityModalContent theme={theme}>
            <ConfirmText>
              {actionQuantity.action === 'move' ? 'Выложить' : 'Сломать'} {actionQuantity.itemName}
            </ConfirmText>
            <QuantityText theme={theme}>
              Количество: {actionQuantity.count}
            </QuantityText>
            <QuantitySlider
              min="1"
              max={actionQuantity.maxCount}
              value={actionQuantity.count}
              onChange={(e) => setActionQuantity(prev => ({ ...prev, count: parseInt(e.target.value) }))}
            />
            <ConfirmButtons>
              <ConfirmButton type="yes" onClick={confirmActionQuantity} disabled={isActionCooldown}>
                Подтвердить
              </ConfirmButton>
              <ConfirmButton
                type="no"
                onClick={() => setActionQuantity({ itemName: null, weight: null, count: 1, action: null })}
                disabled={isActionCooldown}
              >
                Отмена
              </ConfirmButton>
            </ConfirmButtons>
          </QuantityModalContent>
        )}
      </Modal>
    </InventoryContainer>
  );
}

export default Inventory;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as S from './InventoryStyles';

function Inventory({ userId, currentRoom, theme, socket, onItemsUpdate, user }) {
  const [credits, setCredits] = useState(0);
  const [shopItems, setShopItems] = useState([]);
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

  const groupItemsByNameAndWeight = useCallback((items) => {
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
  }, []);

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

  const handleCreditsUpdate = useCallback((newCredits) => {
    console.log('Inventory.js: Received creditsUpdate:', newCredits);
    if (typeof newCredits === 'number') {
      setCredits(newCredits);
    } else {
      console.error('Inventory.js: Invalid credits value:', newCredits);
    }
  }, []);

  const shopStaticItems = useMemo(() => [
    {
      _id: 'shop_collar',
      name: 'Ошейник',
      description: 'С ним вы можете взять себе питомца из приюта.',
      rarity: 'Обычный',
      weight: 0.5,
      cost: 250,
      effect: 'Вы всегда знаете где находится ваш питомец.',
    },
    {
      _id: 'shop_leash',
      name: 'Поводок',
      description: 'Ваш питомец всегда следует за вами.',
      rarity: 'Обычный',
      weight: 0.5,
      cost: 200,
      effect: 'Вы чувствуете власть над кем-то. Приятно.',
    },
  ], []);

  useEffect(() => {
    if (!socket || !userId) return;

    console.log('Inventory.js: Setting up socket listeners for userId:', userId, 'Socket ID:', socket.id);

    socket.on('items', handleItemsUpdate);
    socket.on('inventoryLimit', handleLimitUpdate);
    socket.on('itemAction', handleItemAction);
    socket.on('shelterAnimals', handleShelterAnimals);
    socket.on('error', ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 3000);
    });
    socket.on('creditsUpdate', handleCreditsUpdate);

    socket.emit('getItems', { owner: userOwnerKey });
    socket.emit('getItems', { owner: locationOwnerKey });
    socket.emit('getInventoryLimit', { owner: userOwnerKey });
    socket.emit('getInventoryLimit', { owner: locationOwnerKey });

    if (isShelter) {
      socket.emit('getShelterAnimals');
    }

    return () => {
      socket.off('items', handleItemsUpdate);
      socket.off('inventoryLimit', handleLimitUpdate);
      socket.off('itemAction', handleItemAction);
      socket.off('shelterAnimals', handleShelterAnimals);
      socket.off('error');
      socket.off('creditsUpdate', handleCreditsUpdate);
    };
  }, [socket, userId, userOwnerKey, locationOwnerKey, isShelter, handleItemsUpdate, handleLimitUpdate, handleItemAction, handleShelterAnimals, handleCreditsUpdate]);

  useEffect(() => {
    if (!socket || !userId) return;

    socket.emit('getCredits', ({ success, credits }) => {
      console.log('Inventory.js: Received getCredits response:', { success, credits });
      if (success && typeof credits === 'number') {
        setCredits(credits);
      }
    });

    if (currentRoom === 'Магазин "Всё на свете"' && user?.isHuman) {
      setShopItems(shopStaticItems);
    } else {
      setShopItems([]);
    }
  }, [socket, userId, currentRoom, user, shopStaticItems]);

  const handleBuyItem = useCallback((item) => {
    if (isActionCooldown) return;

    console.log('Inventory.js: Attempting to buy item:', item, 'Current credits:', credits);
    if (credits < item.cost) {
      setError('Недостаточно кредитов для покупки');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsActionCooldown(true);
    socket.emit('buyItem', {
      owner: userOwnerKey,
      item: {
        name: item.name,
        description: item.description,
        rarity: item.rarity,
        weight: item.weight,
        cost: item.cost,
        effect: item.effect,
      },
    }, (response) => {
      console.log('Inventory.js: Buy item response:', response);
      if (response.success) {
        setCredits(prev => prev - item.cost);
      } else {
        setError(response.message || 'Ошибка при покупке');
        setTimeout(() => setError(null), 3000);
      }
      setTimeout(() => setIsActionCooldown(false), 1000);
    });
  }, [isActionCooldown, credits, socket, userOwnerKey]);

  const handleTakeHome = useCallback((animalId) => {
    if (!socket || !userId) {
      console.error('Socket or userId not available');
      return;
    }
    socket.emit('takeAnimalHome', { animalId });
    console.log(`Sent takeAnimalHome request for animal ID: ${animalId}`);
  }, [socket, userId]);

  const handleMoveItem = useCallback((itemName, weight, maxCount) => {
    if (isActionCooldown) return;
    setActionQuantity({ itemName, weight, count: 1, action: 'move', maxCount });
  }, [isActionCooldown]);

  const handlePickupItem = useCallback((itemId) => {
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
  }, [isActionCooldown, locationItems, socket]);

  const handleDeleteItem = useCallback((itemName, weight, maxCount) => {
    if (isActionCooldown) return;
    setActionQuantity({ itemName, weight, count: 1, action: 'delete', maxCount });
  }, [isActionCooldown]);

  const confirmDeleteItem = useCallback((confirmed) => {
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
  }, [confirmDelete, personalItems, socket]);

  const confirmActionQuantity = useCallback(() => {
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
  }, [actionQuantity, isActionCooldown, personalItems, socket, locationOwnerKey]);

  const openModal = useCallback((item) => {
    setSelectedItem(item);
  }, []);

  const closeModal = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setSelectedItem(null);
      setConfirmDelete(null);
      setActionQuantity({ itemName: null, weight: null, count: 1, action: null });
    }
  }, []);

  // Рендеринг остаётся без изменений
  return (
    <S.InventoryContainer theme={theme}>
      <S.Tabs>
        <S.Tab
          active={activeTab === 'personal'}
          onClick={() => setActiveTab('personal')}
          theme={theme}
        >
          Личные вещи
        </S.Tab>
        <S.Tab
          active={activeTab === 'location'}
          onClick={() => setActiveTab('location')}
          theme={theme}
        >
          Локация
        </S.Tab>
      </S.Tabs>
      <S.ContentContainer>
        {activeTab === 'location' && isShelter && (
          <S.SubTabs>
            <S.SubTab
              active={activeLocationSubTab === 'items'}
              onClick={() => setActiveLocationSubTab('items')}
              theme={theme}
            >
              Предметы
            </S.SubTab>
            <S.SubTab
              active={activeLocationSubTab === 'animals'}
              onClick={() => setActiveLocationSubTab('animals')}
              theme={theme}
            >
              Животные
            </S.SubTab>
          </S.SubTabs>
        )}
        {error && (
          <div style={{ textAlign: 'center', color: 'red', marginBottom: '10px' }}>
            {error}
          </div>
        )}
        {activeTab === 'personal' && personalLimit && (
          <S.WeightLimit theme={theme}>
            Вес: {personalLimit.currentWeight} кг / {personalLimit.maxWeight} кг
          </S.WeightLimit>
        )}
        {activeTab === 'location' && locationLimit && (
          <S.WeightLimit theme={theme}>
            Вес: {locationLimit.currentWeight} кг / {locationLimit.maxWeight} кг
          </S.WeightLimit>
        )}
        {activeTab === 'location' && isShelter && activeLocationSubTab === 'animals' ? (
          <S.AnimalList>
            {shelterAnimals.map(animal => (
              <S.AnimalCard key={animal.userId} theme={theme}>
                <S.StatusCircle isOnline={animal.isOnline} />
                <S.Avatar src={animal.photoUrl || '/default-animal-avatar.png'} alt="Аватар" />
                <S.AnimalName theme={theme}>{animal.name}</S.AnimalName>
                {!animal.owner && user?.isHuman && (
                  <S.TakeHomeButton onClick={() => handleTakeHome(animal.userId)}>
                    Забрать домой
                  </S.TakeHomeButton>
                )}
              </S.AnimalCard>
            ))}
            {shelterAnimals.length === 0 && (
              <div style={{ textAlign: 'center', color: theme === 'dark' ? '#ccc' : '#666' }}>
                В приюте нет животных
              </div>
            )}
          </S.AnimalList>
        ) : (
          <S.ItemList subTab={activeTab}>
            {activeTab === 'personal' && groupItemsByNameAndWeight(personalItems).map(({ item, count }) => (
              <S.ItemCard
                key={item._id}
                theme={theme}
                isAnimating={
                  animatingItem && (
                    (animatingItem.itemId === `${item.name}_${item.weight}_move`) ||
                    (animatingItem.itemId === `${item.name}_${item.weight}_delete`)
                  ) ? animatingItem.action : null
                }
              >
                <S.ItemTitle theme={theme}>{item.name} <S.ItemCount theme={theme}>x{count}</S.ItemCount></S.ItemTitle>
                {item.description === 'Кошка' || item.description === 'Собака' ? (
                  <S.ItemDetail theme={theme}>{item.description}</S.ItemDetail>
                ) : (
                  <>
                    <S.ItemDetail theme={theme}>Описание: {item.description}</S.ItemDetail>
                    <S.ItemDetail theme={theme}>Редкость: {item.rarity}</S.ItemDetail>
                    <S.ItemDetail theme={theme}>Вес: {item.weight}</S.ItemDetail>
                    <S.ItemDetail theme={theme}>Стоимость: {item.cost}</S.ItemDetail>
                    <S.ItemDetail theme={theme}>Эффект: {item.effect}</S.ItemDetail>
                  </>
                )}
                <S.ActionButtons>
                  {locationOwnerKey && (
                    <S.MoveButton
                      onClick={() => handleMoveItem(item.name, item.weight, count)}
                      disabled={isActionCooldown}
                    >
                      Выложить
                      {isActionCooldown && <S.ProgressBar />}
                    </S.MoveButton>
                  )}
                  {item.name !== 'Мусор' && (
                    <S.DeleteButton
                      onClick={() => handleDeleteItem(item.name, item.weight, count)}
                      disabled={isActionCooldown}
                    >
                      Сломать
                      {isActionCooldown && <S.ProgressBar />}
                    </S.DeleteButton>
                  )}
                </S.ActionButtons>
              </S.ItemCard>
            ))}
            {activeTab === 'location' && !isShelter && currentRoom === 'Магазин "Всё на свете"' && user?.isHuman ? (
              <S.ItemList subTab={activeTab}>
                {shopItems.map(item => (
                  <S.ItemCard
                    key={item._id}
                    theme={theme}
                    isAnimating={animatingItem && animatingItem.itemId === item._id.toString() ? animatingItem.action : null}
                  >
                    <S.ItemInfo theme={theme} onClick={() => openModal(item)}>
                      <S.ItemTitle theme={theme}>{item.name}</S.ItemTitle>
                      <S.ItemDetail theme={theme}>{item.description}</S.ItemDetail>
                    </S.ItemInfo>
                    <S.ActionButtons>
                      <S.PickupButton
                        onClick={() => handleBuyItem(item)}
                        disabled={isActionCooldown}
                      >
                        Купить за {item.cost} кредитов
                        {isActionCooldown && <S.ProgressBar />}
                      </S.PickupButton>
                    </S.ActionButtons>
                  </S.ItemCard>
                ))}
                {shopItems.length === 0 && (
                  <div style={{ textAlign: 'center', color: theme === 'dark' ? '#ccc' : '#666' }}>
                    В магазине нет товаров
                  </div>
                )}
              </S.ItemList>
            ) : activeTab === 'location' && !isShelter ? (
              <S.ItemList subTab={activeTab}>
                {groupItemsByNameAndWeight(locationItems).map(({ item, count }) => (
                  <S.ItemCard
                    key={item._id}
                    theme={theme}
                    isAnimating={animatingItem && animatingItem.itemId === item._id.toString() ? animatingItem.action : null}
                  >
                    <S.ItemInfo theme={theme} onClick={() => openModal(item)}>
                      <S.ItemTitle theme={theme}>{item.name} <S.ItemCount theme={theme}>x{count}</S.ItemCount></S.ItemTitle>
                      <S.ItemDetail theme={theme}>{item.description}</S.ItemDetail>
                    </S.ItemInfo>
                    <S.ActionButtons>
                      <S.PickupButton
                        onClick={() => handlePickupItem(item._id)}
                        disabled={isActionCooldown}
                      >
                        Подобрать
                        {isActionCooldown && <S.ProgressBar />}
                      </S.PickupButton>
                    </S.ActionButtons>
                  </S.ItemCard>
                ))}
                {locationItems.length === 0 && (
                  <div style={{ textAlign: 'center', color: theme === 'dark' ? '#ccc' : '#666' }}>
                    На этой локации нет предметов
                  </div>
                )}
              </S.ItemList>
            ) : null}
            {activeTab === 'location' && isShelter && activeLocationSubTab === 'items' && groupItemsByNameAndWeight(locationItems).map(({ item, count }) => (
              <S.ItemCard
                key={item._id}
                theme={theme}
                isAnimating={animatingItem && animatingItem.itemId === item._id.toString() ? animatingItem.action : null}
              >
                <S.ItemInfo theme={theme} onClick={() => openModal(item)}>
                  <S.ItemTitle theme={theme}>{item.name} <S.ItemCount theme={theme}>x{count}</S.ItemCount></S.ItemTitle>
                  <S.ItemDetail theme={theme}>{item.description}</S.ItemDetail>
                </S.ItemInfo>
                <S.ActionButtons>
                  <S.PickupButton
                    onClick={() => handlePickupItem(item._id)}
                    disabled={isActionCooldown}
                  >
                    Подобрать
                    {isActionCooldown && <S.ProgressBar />}
                  </S.PickupButton>
                </S.ActionButtons>
              </S.ItemCard>
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
          </S.ItemList>
        )}
      </S.ContentContainer>
      <S.Modal
        isOpen={!!selectedItem || !!confirmDelete || (!!(actionQuantity.itemName && actionQuantity.weight))}
        theme={theme}
        onClick={closeModal}
        isConfirm={!!confirmDelete || (!!(actionQuantity.itemName && actionQuantity.weight))}
      >
        {selectedItem && (
          <S.ModalContent theme={theme}>
            <S.ItemTitle theme={theme}>{selectedItem.name}</S.ItemTitle>
            <S.ItemDetail theme={theme}>Описание: {selectedItem.description}</S.ItemDetail>
            <S.ItemDetail theme={theme}>Редкость: {selectedItem.rarity}</S.ItemDetail>
            <S.ItemDetail theme={theme}>Вес: {selectedItem.weight}</S.ItemDetail>
            <S.ItemDetail theme={theme}>Стоимость: {selectedItem.cost}</S.ItemDetail>
            <S.ItemDetail theme={theme}>Эффект: {selectedItem.effect}</S.ItemDetail>
          </S.ModalContent>
        )}
        {confirmDelete && (
          <S.ConfirmModalContent theme={theme}>
            <S.ConfirmText>Вы уверены, что хотите сломать этот предмет?</S.ConfirmText>
            <S.ConfirmButtons>
              <S.ConfirmButton type="yes" onClick={() => confirmDeleteItem(true)} disabled={isActionCooldown}>
                Да
              </S.ConfirmButton>
              <S.ConfirmButton type="no" onClick={() => confirmDeleteItem(false)} disabled={isActionCooldown}>
                Нет
              </S.ConfirmButton>
            </S.ConfirmButtons>
          </S.ConfirmModalContent>
        )}
        {actionQuantity.itemName && actionQuantity.weight && (
          <S.QuantityModalContent theme={theme}>
            <S.ConfirmText>
              {actionQuantity.action === 'move' ? 'Выложить' : 'Сломать'} {actionQuantity.itemName}
            </S.ConfirmText>
            <S.QuantityText theme={theme}>
              Количество: {actionQuantity.count}
            </S.QuantityText>
            <S.QuantitySlider
              min="1"
              max={actionQuantity.maxCount}
              value={actionQuantity.count}
              onChange={(e) => setActionQuantity(prev => ({ ...prev, count: parseInt(e.target.value) }))}
            />
            <S.ConfirmButtons>
              <S.ConfirmButton type="yes" onClick={confirmActionQuantity} disabled={isActionCooldown}>
                Подтвердить
              </S.ConfirmButton>
              <S.ConfirmButton
                type="no"
                onClick={() => setActionQuantity({ itemName: null, weight: null, count: 1, action: null })}
                disabled={isActionCooldown}
              >
                Отмена
              </S.ConfirmButton>
            </S.ConfirmButtons>
          </S.QuantityModalContent>
        )}
      </S.Modal>
    </S.InventoryContainer>
  );
}

export default Inventory;
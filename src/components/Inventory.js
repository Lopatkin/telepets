import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as S from '../styles/InventoryStyles';
import { FaEdit } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

function Inventory({ userId, currentRoom, theme, socket, onItemsUpdate, user, personalItems }) {
  const [shopItems, setShopItems] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');
  const [activeLocationSubTab, setActiveLocationSubTab] = useState('items');
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
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [newAnimalName, setNewAnimalName] = useState('');
  const [freeRoam, setFreeRoam] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Новое состояние для отслеживания загрузки

  const userOwnerKey = `user_${userId}`;
  const locationOwnerKey = currentRoom;
  const isShelter = currentRoom === 'Приют для животных "Кошкин дом"';

  // Функция для обработки переименования животного
  const handleRenameAnimal = (animalId, newName) => {
    socket.emit('renameAnimal', { animalId, newName }, (response) => {
      if (response.success) {
        setSelectedItem(prev => ({
          ...prev,
          animalName: newName,
          description: `Ваш питомец - ${newName}`
        }));
        setRenameModalOpen(false);
        setNewAnimalName('');
      } else {
        setError(response.message || 'Ошибка при переименовании животного');
        setTimeout(() => setError(null), 3000);
      }
    });
  };

  // Функция для обработки изменения "Свободного выгула"
  const handleFreeRoamChange = (animalId, checked) => {
    socket.emit('setFreeRoam', { animalId, freeRoam: checked }, (response) => {
      if (response.success) {
        socket.emit('getAnimalInfo', { animalId }, (infoResponse) => {
          if (infoResponse.success) {
            setSelectedItem(prev => ({
              ...prev,
              freeRoam: infoResponse.animal.freeRoam || false
            }));
            setFreeRoam(infoResponse.animal.freeRoam || false);
            setError(`Свободный выгул ${checked ? 'включён' : 'выключён'}`);
            setTimeout(() => setError(null), 3000);
          } else {
            setError(infoResponse.message || 'Ошибка при получении данных животного');
            setTimeout(() => setError(null), 3000);
          }
        });
      } else {
        setError(response.message || 'Ошибка при изменении статуса выгула');
        setTimeout(() => setError(null), 3000);
      }
    });
  };

  // Группировка предметов
  const groupItemsByNameAndWeight = (items) => {
    const grouped = items.reduce((acc, item) => {
      const key = item.name === 'Паспорт животного' && item.animalId
        ? `${item.name}_${item.weight}_${item.animalId}`
        : `${item.name}_${item.weight}`;
      if (!acc[key]) {
        acc[key] = { item, count: 0, ids: [] };
      }
      acc[key].count += 1;
      acc[key].ids.push(item._id);
      return acc;
    }, {});
    return Object.values(grouped);
  };

  // Обработка обновления предметов
  const handleItemsUpdate = useCallback((data) => {
    const { owner, items } = data;
    const updatedItems = items.map(item => ({
      ...item,
      _id: item._id.toString(),
    }));
    if (owner === userOwnerKey) {
      onItemsUpdate(updatedItems);
      setIsLoading(false); // Завершаем загрузку при получении personalItems
    } else if (owner === locationOwnerKey) {
      if (!pendingItems.some(item => item.owner === locationOwnerKey)) {
        setLocationItems(updatedItems);
      }
    }
  }, [userOwnerKey, locationOwnerKey, pendingItems, onItemsUpdate]);

  // Обработка лимитов инвентаря
  const handleLimitUpdate = useCallback((limit) => {
    if (limit.owner === userOwnerKey) setPersonalLimit(limit);
    else if (limit.owner === locationOwnerKey) setLocationLimit(limit);
  }, [userOwnerKey, locationOwnerKey]);

  // Обработка действий с предметами
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

  // Обработка животных в приюте
  const handleShelterAnimals = useCallback((animals) => {
    setShelterAnimals(animals);
  }, []);

  // Статические предметы магазина
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

  // Загрузка данных при монтировании
  useEffect(() => {
    if (!socket || !userId) {
      setIsLoading(false); // Если нет сокета или userId, завершаем загрузку
      return;
    }

    // Запрашиваем только предметы локации и лимиты, так как personalItems приходят через пропсы
    socket.emit('getItems', { owner: locationOwnerKey });
    socket.emit('getInventoryLimit', { owner: userOwnerKey });
    socket.emit('getInventoryLimit', { owner: locationOwnerKey });

    if (isShelter) {
      socket.emit('getShelterAnimals');
    }

    // Устанавливаем предметы магазина
    if (currentRoom === 'Магазин "Всё на свете"' && user?.isHuman) {
      setShopItems(shopStaticItems);
    } else {
      setShopItems([]);
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
  }, [socket, userId, currentRoom, userOwnerKey, locationOwnerKey, isShelter, user, shopStaticItems, handleItemsUpdate, handleLimitUpdate, handleItemAction, handleShelterAnimals]);

  // Проверяем, завершена ли загрузка personalItems
  useEffect(() => {
    if (personalItems) {
      setIsLoading(false); // Завершаем загрузку, когда personalItems получены
    }
  }, [personalItems]);

  // Обработка покупки
  const handleBuyItem = async (item) => {
    if (isActionCooldown) return;

    try {
      setIsActionCooldown(true);

      const creditsResponse = await new Promise((resolve) => {
        socket.emit('getCredits', {}, resolve);
      });

      if (!creditsResponse?.success) {
        setError('Не удалось проверить баланс');
        setIsActionCooldown(false);
        return;
      }

      if (creditsResponse.credits < item.cost) {
        setError('Недостаточно кредитов');
        setIsActionCooldown(false);
        return;
      }

      const addItemResponse = await new Promise((resolve) => {
        socket.emit('addItem', {
          owner: userOwnerKey,
          item: {
            name: item.name,
            description: item.description,
            rarity: item.rarity,
            weight: item.weight,
            cost: item.cost,
            effect: item.effect,
          },
        }, resolve);
      });

      if (!addItemResponse?.success) {
        setError(addItemResponse?.message || 'Ошибка при покупке');
        setIsActionCooldown(false);
        return;
      }

      const spendResponse = await new Promise((resolve) => {
        socket.emit('spendCredits', {
          amount: item.cost,
          purpose: `Покупка: ${item.name}`
        }, resolve);
      });

      if (!spendResponse?.success) {
        setError(spendResponse?.message || 'Ошибка при списании кредитов');
      }

      setIsActionCooldown(false);
    } catch (err) {
      console.error('Ошибка при покупке:', err);
      setError('Ошибка при покупке');
      setIsActionCooldown(false);
    }
  };

  // Обработка забора животного
  const handleTakeHome = (animalId, animalName) => {
    if (!socket || !userId) {
      console.error('Socket or userId not available');
      setError('Ошибка: пользователь не аутентифицирован');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const hasCollar = personalItems.some(item => item.name === 'Ошейник');
    const hasLeash = personalItems.some(item => item.name === 'Поводок');

    if (!hasCollar || !hasLeash) {
      setError('Чтобы забрать питомца из приюта, вам нужен ошейник и поводок.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    socket.emit('takeAnimalHome', { animalId, animalName });
  };

  // Обработка перемещения предметов
  const handleMoveItem = (itemName, weight, maxCount) => {
    if (isActionCooldown) return;
    setActionQuantity({ itemName, weight, count: 1, action: 'move', maxCount });
  };

  // Обработка подбора предметов
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

  // Обработка удаления предметов
  const handleDeleteItem = (itemName, weight, maxCount) => {
    if (isActionCooldown) return;
    setActionQuantity({ itemName, weight, count: 1, action: 'delete', maxCount });
  };

  // Подтверждение удаления предмета
  const confirmDeleteItem = (confirmed) => {
    if (confirmed && confirmDelete) {
      const itemId = confirmDelete;
      const itemToDelete = personalItems.find(item => item._id.toString() === itemId);
      if (!itemToDelete) return;

      setIsActionCooldown(true);
      setAnimatingItem({ itemId, action: 'split' });

      setTimeout(() => {
        socket.emit('deleteItem', { itemId });
        setAnimatingItem(null);
        setTimeout(() => {
          setIsActionCooldown(false);
        }, 1000);
      }, 1000);
    }

    setConfirmDelete(null);
  };

  // Подтверждение действия с количеством
  const confirmActionQuantity = () => {
    if (!actionQuantity.itemName || isActionCooldown) return;

    setIsActionCooldown(true);
    const { itemName, weight, count, action } = actionQuantity;

    if (action === 'move') {
      setAnimatingItem({ itemId: `${itemName}_${weight}_move`, action: 'move' });
      setTimeout(() => {
        const itemsToMove = personalItems.filter(item => item.name === itemName && item.weight === weight).slice(0, count);
        const itemIds = itemsToMove.map(item => item._id);
        socket.emit('moveItem', { itemIds, newOwner: locationOwnerKey });
        setAnimatingItem(null);
        setTimeout(() => setIsActionCooldown(false), 1000);
      }, 500);
    } else if (action === 'delete') {
      setAnimatingItem({ itemId: `${itemName}_${weight}_delete`, action: 'split' });
      setTimeout(() => {
        const itemsToDelete = personalItems.filter(item => item.name === itemName && item.weight === weight).slice(0, count);
        const itemIds = itemsToDelete.map(item => item._id);
        itemIds.forEach(itemId => socket.emit('deleteItem', { itemId }));
        setAnimatingItem(null);
        setTimeout(() => setIsActionCooldown(false), 1000);
      }, 1000);
    }

    setActionQuantity({ itemName: null, weight: null, count: 1, action: null });
  };

  // Обработка просмотра паспорта животного
  const handleViewPassport = (item) => {
    socket.emit('getAnimalInfo', { animalId: item.animalId }, (response) => {
      if (response.success) {
        setSelectedItem({
          ...item,
          animalName: response.animal.name,
          animalType: response.animal.animalType,
          lastRoom: response.animal.lastRoom,
          onLeash: response.animal.onLeash,
          freeRoam: response.animal.freeRoam || false
        });
        setFreeRoam(response.animal.freeRoam || false);
      } else {
        setError(response.message || 'Ошибка при получении данных животного');
        setTimeout(() => setError(null), 3000);
      }
    });
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
        {activeTab === 'personal' && personalLimit && isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <ClipLoader color={theme === 'dark' ? '#ccc' : '#007AFF'} size={30} />
            <p>Загрузка инвентаря...</p>
          </div>
        ) : (
          activeTab === 'location' && isShelter && activeLocationSubTab === 'animals' ? (
            <S.AnimalList>
              {shelterAnimals.map(animal => (
                <S.AnimalCard key={animal.userId} theme={theme}>
                  <S.StatusCircle isOnline={animal.isOnline} />
                  <S.Avatar src={animal.photoUrl || '/default-animal-avatar.png'} alt="Аватар" />
                  <S.AnimalName theme={theme}>{animal.name}</S.AnimalName>
                  {!animal.owner && user?.isHuman && (
                    <S.TakeHomeButton onClick={() => handleTakeHome(animal.userId, animal.name)}>
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
                  {item.name === 'Паспорт животного' ? (
                    <>
                      <S.ItemDetail theme={theme}>Описание: {item.description}</S.ItemDetail>
                      <S.ItemDetail theme={theme}>Редкость: {item.rarity}</S.ItemDetail>
                      <S.ItemDetail theme={theme}>Вес: {item.weight}</S.ItemDetail>
                      <S.ItemDetail theme={theme}>Стоимость: {item.cost}</S.ItemDetail>
                      <S.ItemDetail theme={theme}>Эффект: {item.effect}</S.ItemDetail>
                    </>
                  ) : item.description === 'Кошка' || item.description === 'Собака' ? (
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
                    {item.name === 'Паспорт животного' ? (
                      <S.PickupButton
                        onClick={() => handleViewPassport(item)}
                        disabled={isActionCooldown}
                      >
                        Посмотреть
                        {isActionCooldown && <S.ProgressBar />}
                      </S.PickupButton>
                    ) : (
                      <>
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
                      </>
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
              {activeTab === 'personal' && personalItems.length === 0 && !isLoading && (
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
          )
        )}
      </S.ContentContainer>
      <S.Modal
        isOpen={!!selectedItem || !!confirmDelete || (!!(actionQuantity.itemName && actionQuantity.weight))}
        theme={theme}
        onClick={closeModal}
        isConfirm={!!confirmDelete || (!!(actionQuantity.itemName && actionQuantity.weight))}
      >
        {selectedItem && selectedItem.name === 'Паспорт животного' && (
          <S.ModalContent theme={theme}>
            <S.ItemTitle theme={theme}>Паспорт животного</S.ItemTitle>
            <S.ItemDetail theme={theme}>
              Имя: {selectedItem.animalName || 'Неизвестно'}
              <S.RenameIcon
                as={FaEdit}
                onClick={() => {
                  setNewAnimalName(selectedItem.animalName || '');
                  setRenameModalOpen(true);
                }}
                theme={theme}
              />
            </S.ItemDetail>
            <S.ItemDetail theme={theme}>
              Тип: {selectedItem.animalType || 'Неизвестно'}
            </S.ItemDetail>
            <S.ItemDetail theme={theme}>
              Локация: {selectedItem.lastRoom?.startsWith('myhome_') ? 'Дома' : selectedItem.lastRoom || 'Неизвестно'}
            </S.ItemDetail>
            <S.FreeRoamCheckbox theme={theme}>
              <input
                type="checkbox"
                checked={freeRoam}
                onChange={(e) => handleFreeRoamChange(selectedItem.animalId, e.target.checked)}
                disabled={isActionCooldown}
              />
              <label>Свободный выгул</label>
            </S.FreeRoamCheckbox>
            <S.ActionButtons>
              <S.PickupButton
                onClick={() => {
                  socket.emit('toggleLeash', { animalId: selectedItem.animalId, onLeash: !selectedItem.onLeash });
                  setSelectedItem(null);
                }}
                disabled={isActionCooldown}
              >
                {selectedItem.onLeash ? 'Отвязать поводок' : 'Привязать поводок'}
                {isActionCooldown && <S.ProgressBar />}
              </S.PickupButton>
            </S.ActionButtons>
          </S.ModalContent>
        )}
        {renameModalOpen && (
          <S.Modal isOpen={true} theme={theme}>
            <S.RenameModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
              <S.ItemTitle theme={theme}>Переименовать животное</S.ItemTitle>
              <S.RenameInput
                type="text"
                value={newAnimalName}
                onChange={(e) => setNewAnimalName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Введите новое имя"
                theme={theme}
              />
              <S.ConfirmButtons>
                <S.ConfirmButton
                  type="yes"
                  onClick={() => handleRenameAnimal(selectedItem.animalId, newAnimalName)}
                  disabled={isActionCooldown || !newAnimalName.trim()}
                >
                  ОК
                </S.ConfirmButton>
                <S.ConfirmButton
                  type="no"
                  onClick={() => setRenameModalOpen(false)}
                  disabled={isActionCooldown}
                >
                  Отмена
                </S.ConfirmButton>
              </S.ConfirmButtons>
            </S.RenameModalContent>
          </S.Modal>
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
                ОК
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
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as S from '../styles/InventoryStyles';
import { FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { INVENTORY_WEIGHT_LIMIT } from './constants/settings';

import stickImage from '../images/items/stick.jpg';
import defaultItemImage from '../images/items/default-item.png';
import boardImage from '../images/items/board.png';
import collarImage from '../images/items/collar.png';
import garbageImage from '../images/items/garbage.png';
import leashImage from '../images/items/leash.png';
import passportImage from '../images/items/passport.png';
import berrysImage from '../images/items/berrys.jpg';
import mushroomsImage from '../images/items/mushrooms.jpg';
import chairImage from '../images/items/chair.jpg';
import bedImage from '../images/items/sofa.jpg';
import wardrobeImage from '../images/items/wardrobe.jpg';
import tableImage from '../images/items/table.jpg';
import chestImage from '../images/items/chest.jpg';
import firstAidKitImage from '../images/items/first-aid-kit.jpg';
import bandageImage from '../images/items/bandage.jpg';
import cannedFoodImage from '../images/items/canned-food.jpg';
import chocolateImage from '../images/items/chocolate.jpg';
import coffeeImage from '../images/items/coffee.jpg';

import { useNotification } from '../utils/NotificationContext';

function Inventory({ userId, currentRoom, theme, socket, personalItems, onItemsUpdate, user }) {
  const [shopItems, setShopItems] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');
  const [activeLocationSubTab, setActiveLocationSubTab] = useState('items');
  const [locationItems, setLocationItems] = useState([]);
  const [shelterAnimals, setShelterAnimals] = useState([]);
  const { showNotification } = useNotification();
  const [animatingItem, setAnimatingItem] = useState(null);
  const [isActionCooldown, setIsActionCooldown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionQuantity, setActionQuantity] = useState({ itemName: null, weight: null, count: 1, action: null });
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [newAnimalName, setNewAnimalName] = useState('');
  const [freeRoam, setFreeRoam] = useState(false);
  const [tempPersonalItems, setTempPersonalItems] = useState(personalItems);
  const [applyModal, setApplyModal] = useState({ isOpen: false, item: null });

  const userOwnerKey = `user_${userId}`;
  const locationOwnerKey = currentRoom;
  const isShelter = currentRoom === 'Приют для животных "Кошкин дом"';

  const currentPersonalWeight = useMemo(() => {
    return tempPersonalItems.reduce((total, item) => total + (parseFloat(item.weight) || 0), 0);
  }, [tempPersonalItems]);

  const currentLocationWeight = useMemo(() => {
    return locationItems.reduce((total, item) => total + (parseFloat(item.weight) || 0), 0);
  }, [locationItems]);

  const maxPersonalWeight = user?.isHuman ? INVENTORY_WEIGHT_LIMIT.human : INVENTORY_WEIGHT_LIMIT.animal;
  const maxLocationWeight = INVENTORY_WEIGHT_LIMIT.location;

  const personalWeightPercentage = Math.min((currentPersonalWeight / maxPersonalWeight) * 100, 100);
  const locationWeightPercentage = Math.min((currentLocationWeight / maxLocationWeight) * 100, 100);

  useEffect(() => {
    // console.log('Received personalItems in Inventory:', personalItems);
    setTempPersonalItems(personalItems);
  }, [personalItems]);

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
        showNotification('Имя животного успешно изменено', 'success');
      } else {
        showNotification(response.message || 'Ошибка при переименовании животного', 'error');
      }
    });
  };

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
            showNotification(`Свободный выгул ${checked ? 'включён' : 'выключён'}`, 'success');
          } else {
            showNotification(infoResponse.message || 'Ошибка при получении данных животного', 'error');
          }
        });
      } else {
        showNotification(response.message || 'Ошибка при изменении статуса выгула', 'error');
      }
    });
  };

  const groupItemsByNameAndWeight = (items) => {
    // console.log('Grouping items:', items);
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

  const handleItemAction = useCallback((data) => {
    const { action, owner, itemId, item, itemIds } = data;

    if (owner === locationOwnerKey) {
      if (action === 'remove') {
        setAnimatingItem({ itemId, action: 'shrink' });
        setTimeout(() => {
          setLocationItems(prevItems => prevItems.filter(i => !itemIds?.includes(i._id.toString()) && i._id.toString() !== itemId));
          setAnimatingItem(null);
        }, 500);
      } else if (action === 'add') {
        setAnimatingItem({ itemId: item._id.toString(), action: 'grow' });
        setTimeout(() => {
          setLocationItems(prevItems => {
            const exists = prevItems.some(i => i._id.toString() === item._id.toString());
            if (!exists) {
              return [...prevItems, { ...item, _id: item._id.toString() }];
            }
            return prevItems;
          });
          setAnimatingItem(null);
        }, 500);
      }
      socket.emit('getItems', { owner: locationOwnerKey });
    } else if (owner === userOwnerKey) {
      if (action === 'remove') {
        setAnimatingItem({ itemId, action: 'shrink' });
        setTimeout(() => {
          setTempPersonalItems(prevItems => prevItems.filter(i => !itemIds?.includes(i._id.toString()) && i._id.toString() !== itemId));
          setAnimatingItem(null);
        }, 500);
      } else if (action === 'add') {
        setAnimatingItem({ itemId: item._id.toString(), action: 'grow' });
        setTimeout(() => {
          setTempPersonalItems(prevItems => {
            const exists = prevItems.some(i => i._id.toString() === item._id.toString());
            if (!exists) {
              return [...prevItems, { ...item, _id: item._id.toString() }];
            }
            return prevItems;
          });
          setAnimatingItem(null);
        }, 500);
      }
      socket.emit('getItems', { owner: userOwnerKey });
    }
  }, [locationOwnerKey, userOwnerKey, socket]);

  const handleShelterAnimals = useCallback((animals) => {
    setShelterAnimals(animals);
  }, []);

  const shopStaticItems = useMemo(() => [
    {
      _id: 'shop_collar',
      name: 'Ошейник',
      description: 'С ним вы можете взять себе питомца из приюта.',
      rarity: 'Обычный',
      weight: 0.3,
      cost: 250,
      effect: 'Вы всегда знаете где находится ваш питомец.',
    },
    {
      _id: 'shop_leash',
      name: 'Поводок',
      description: 'Ваш питомец всегда следует за вами.',
      rarity: 'Обычный',
      weight: 0.3,
      cost: 200,
      effect: 'Вы чувствуете власть над кем-то. Приятно.',
    }, {
      _id: 'shop_first_aid_kit',
      name: 'Аптечка',
      description: 'Поможет подлечиться при проблемах со здоровьем',
      rarity: 'Обычный',
      weight: 0.5,
      cost: 300,
      effect: 'Одноразовая. Вы почувствуете себя гораздо лучше.',
    },
    {
      _id: 'shop_bandage',
      name: 'Бинт',
      description: 'Поможет подлечить небольшие раны',
      rarity: 'Обычный',
      weight: 0.1,
      cost: 50,
      effect: 'Одноразовый. Поможет при небольших повреждениях',
    },
    {
      _id: 'shop_canned_food',
      name: 'Консервы',
      description: 'Вкусные, сытные!',
      rarity: 'Обычный',
      weight: 0.5,
      cost: 150,
      effect: 'Отлично утоляет голод!',
    },
    {
      _id: 'shop_chocolate',
      name: 'Шоколадка',
      description: 'Настоящий шоколад! Перекус на бегу.',
      rarity: 'Обычный',
      weight: 0.1,
      cost: 30,
      effect: 'Слегка утоляет голод.',
    },
    {
      _id: 'shop_coffee',
      name: 'Кофе',
      description: 'Бодрит и восстанавливает немного энергии.',
      rarity: 'Обычный',
      weight: 0.2,
      cost: 100,
      effect: 'Восстанавливает энергию и слегка утоляет голод.',
    },
  ], []);

  useEffect(() => {
    // console.log('Inventory props:', { userId, currentRoom, user, personalItems });
  }, [userId, currentRoom, user, personalItems]);

  useEffect(() => {
    if (!socket || !userId) return;

    // console.log('Emitting getItems for location:', locationOwnerKey);
    socket.emit('getItems', { owner: locationOwnerKey });
    // console.log('Emitting getItems for user:', userOwnerKey);
    socket.emit('getItems', { owner: userOwnerKey });

    if (isShelter) {
      socket.emit('getShelterAnimals');
    }

    if (currentRoom === 'Магазин "Всё на свете"' && user?.isHuman) {
      setShopItems(shopStaticItems.filter(item =>
        ['Ошейник', 'Поводок', 'Аптечка', 'Бинт', 'Консервы', 'Шоколадка'].includes(item.name)
      ));
    } else if (currentRoom === 'Кофейня "Ля Фафан"' && user?.isHuman) {
      setShopItems(shopStaticItems.filter(item => item.name === 'Кофе'));
    } else {
      setShopItems([]);
    }

    const handleItems = (data) => {
      const { owner, items } = data;
      // console.log('Received items event:', data);
      if (owner === locationOwnerKey) {
        setLocationItems(items.map(item => ({
          ...item,
          _id: item._id.toString(),
        })));
      } else if (owner === userOwnerKey) {
        setTempPersonalItems(items.map(item => ({
          ...item,
          _id: item._id.toString(),
        })));
        onItemsUpdate(data);
      }
    };

    socket.on('items', handleItems);
    socket.on('itemAction', handleItemAction);
    socket.on('shelterAnimals', handleShelterAnimals);

    return () => {
      socket.off('items', handleItems);
      socket.off('itemAction', handleItemAction);
      socket.off('shelterAnimals', handleShelterAnimals);

    };
  }, [socket, userId, currentRoom, userOwnerKey, locationOwnerKey, isShelter, handleItemAction, handleShelterAnimals, user, shopStaticItems, onItemsUpdate]);

  const handleBuyItem = async (item) => {
    if (isActionCooldown) return;

    try {
      setIsActionCooldown(true);

      const creditsResponse = await new Promise((resolve) => {
        socket.emit('getCredits', {}, resolve);
      });

      if (!creditsResponse?.success) {
        showNotification('Не удалось проверить баланс', 'error');
        setIsActionCooldown(false);
        return;
      }

      if (creditsResponse.credits < item.cost) {
        showNotification('Недостаточно кредитов', 'error');
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
        showNotification(addItemResponse?.message || 'Ошибка при покупке', 'error');
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
        showNotification(spendResponse?.message || 'Ошибка при списании кредитов', 'error');
      } else {
        showNotification(`Успешно куплен предмет: ${item.name}`, 'success');
      }

      setTempPersonalItems(prev => [...prev, {
        ...item,
        _id: addItemResponse.itemId?.toString() || `temp_${Date.now()}`,
      }]);

      setIsActionCooldown(false);
    } catch (err) {
      showNotification('Ошибка при покупке', 'error');
      setIsActionCooldown(false);
    }
  };

  const handleTakeHome = (animalId, animalName) => {
    if (!socket || !userId) {

      showNotification('Ошибка: пользователь не аутентифицирован', 'error');
      return;
    }

    const hasCollar = tempPersonalItems.some(item => item.name === 'Ошейник');
    const hasLeash = tempPersonalItems.some(item => item.name === 'Поводок');

    if (!hasCollar || !hasLeash) {
      showNotification('Чтобы забрать питомца из приюта, вам нужен ошейник и поводок.', 'error');
      return;
    }

    socket.emit('takeAnimalHome', { animalId, animalName });
    console.log(`Sent takeAnimalHome request for animal ID: ${animalId}, Name: ${animalName}`);
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
      socket.emit('pickupItem', { itemId }, (response) => {
        if (!response?.success) {
          showNotification(response?.message || 'Ошибка при подборе предмета', 'error');
        }
        socket.emit('getItems', { owner: userOwnerKey });
        socket.emit('getItems', { owner: locationOwnerKey });
      });
      setAnimatingItem(null);
      setTimeout(() => {
        setIsActionCooldown(false);
      }, 1000);
    }, 500);
  };

  const handleDeleteItem = (itemName, weight, maxCount) => {
    if (isActionCooldown) return;
    setActionQuantity({ itemName, weight, count: 1, action: 'delete', maxCount });
  };

  const handleEatItem = (itemName, weight, maxCount) => {
    if (isActionCooldown) return;
    console.log(`Открытие модального окна для "Съесть": ${itemName}, вес: ${weight}`);
    const item = tempPersonalItems.find(i => i.name === itemName && i.weight === parseFloat(weight));
    setApplyModal({ isOpen: true, item });
  };

  const handleUseItem = (itemName, weight, maxCount) => {
    if (isActionCooldown) return;
    console.log(`Открытие модального окна для "Использовать": ${itemName}, вес: ${weight}`);
    const item = tempPersonalItems.find(i => i.name === itemName && i.weight === parseFloat(weight));
    setApplyModal({ isOpen: true, item });
  };

  const handleApplyItem = () => {
    if (!applyModal.item || isActionCooldown) return;

    setIsActionCooldown(true);
    setAnimatingItem({ itemId: applyModal.item._id, action: 'split' });

    setTimeout(() => {
      socket.emit('useItem', { itemId: applyModal.item._id }, (response) => {
        if (response.success) {
          setTempPersonalItems(prev => prev.filter(item => item._id !== applyModal.item._id));
          socket.emit('getItems', { owner: userOwnerKey });
          showNotification(response.message, 'success');
        } else {
          showNotification(response.message || 'Ошибка при использовании предмета', 'error');
        }
        setApplyModal({ isOpen: false, item: null });
        setAnimatingItem(null);
        setTimeout(() => setIsActionCooldown(false), 1000);
      });
    }, 500);
  };

  const confirmActionQuantity = () => {
    if (!actionQuantity.itemName || isActionCooldown) return;

    setIsActionCooldown(true);
    const { itemName, weight, count, action } = actionQuantity;

    if (action === 'move') {
      setAnimatingItem({ itemId: `${itemName}_${weight}_move`, action: 'move' });
      setTimeout(() => {
        const itemsToMove = tempPersonalItems.filter(item => item.name === itemName && item.weight === parseFloat(weight)).slice(0, count);
        const itemIds = itemsToMove.map(item => item._id);
        socket.emit('moveItem', { itemIds, newOwner: locationOwnerKey }, (response) => {
          if (!response?.success) {
            showNotification(response?.message || 'Ошибка при перемещении предметов', 'error');
          }
          socket.emit('getItems', { owner: userOwnerKey });
          socket.emit('getItems', { owner: locationOwnerKey });
        });
        setAnimatingItem(null);
        setTimeout(() => setIsActionCooldown(false), 1000);
      }, 500);
    } else if (action === 'delete') {
      setAnimatingItem({ itemId: `${itemName}_${weight}_delete`, action: 'split' });
      setTimeout(() => {
        const itemsToDelete = tempPersonalItems.filter(item => item.name === itemName && item.weight === parseFloat(weight)).slice(0, count);
        const itemIds = itemsToDelete.map(item => item._id);

        setTempPersonalItems(prev => {
          const newItems = prev.filter(item => !itemIds.includes(item._id));
          const trashItems = itemsToDelete.map(item => ({
            _id: `temp_${Date.now()}_${Math.random()}`,
            name: 'Мусор',
            description: 'Раньше это было чем-то полезным',
            rarity: 'Бесполезный',
            weight: item.weight,
            cost: 1,
            effect: 'Чувство обременения чем-то бесполезным',
            owner: userOwnerKey
          }));
          return [...newItems, ...trashItems];
        });

        itemIds.forEach(itemId => {
          socket.emit('deleteItem', { itemId }, () => {
            socket.emit('getItems', { owner: userOwnerKey });
          });
        });

        setAnimatingItem(null);
        setTimeout(() => setIsActionCooldown(false), 1000);
      }, 500);
    } else if (action === 'eat') {
      console.log(`Подтверждено действие: Съесть ${itemName} x${count}`);
      setTimeout(() => {
        setIsActionCooldown(false);
        setAnimatingItem(null);
      }, 500);
    } else if (action === 'use') {
      console.log(`Подтверждено действие: Использовать ${itemName} x${count}`);
      setTimeout(() => {
        setIsActionCooldown(false);
        setAnimatingItem(null);
      }, 500);
    }

    setActionQuantity({ itemName: null, weight: null, count: 1, action: null });
  };

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
      }
    });
  };

  const closeModal = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedItem(null);
      setActionQuantity({ itemName: null, weight: null, count: 1, action: null });
      setApplyModal({ isOpen: false, item: null });
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
      {activeTab === 'personal' && (
        <S.WeightWidget theme={theme}>
          <S.ProgressBarContainer>
            <S.ProgressBarFill percentage={personalWeightPercentage} theme={theme} />
          </S.ProgressBarContainer>
        </S.WeightWidget>
      )}
      {activeTab === 'location' && (
        <S.WeightWidget theme={theme}>
          <S.ProgressBarContainer>
            <S.ProgressBarFill percentage={locationWeightPercentage} theme={theme} />
          </S.ProgressBarContainer>
        </S.WeightWidget>
      )}
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

        {activeTab === 'location' && isShelter && activeLocationSubTab === 'animals' ? (
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
            {activeTab === 'personal' && groupItemsByNameAndWeight(tempPersonalItems).map(({ item, count }) => (
              <S.ItemCard
                key={item._id}
                theme={theme}
                isAnimating={
                  animatingItem && (
                    (animatingItem.itemId === `${item.name}_${item.weight}_move`) ||
                    (animatingItem.itemId === `${item.name}_${item.weight}_delete`) ||
                    (animatingItem.itemId === item._id && animatingItem.action === 'split')
                  ) ? animatingItem.action : null
                }
              >
                <S.ItemTitle theme={theme}>{item.name} <S.ItemCount theme={theme}>x{count}</S.ItemCount></S.ItemTitle>
                <S.ItemContentWrapper>
                  <S.ItemImage
                    src={
                      item.name === 'Палка' ? stickImage :
                        item.name === 'Доска' ? boardImage :
                          item.name === 'Ошейник' ? collarImage :
                            item.name === 'Мусор' ? garbageImage :
                              item.name === 'Поводок' ? leashImage :
                                item.name === 'Паспорт животного' ? passportImage :
                                  item.name === 'Лесные ягоды' ? berrysImage :
                                    item.name === 'Лесные грибы' ? mushroomsImage :
                                      item.name === 'Стул' ? chairImage :
                                        item.name === 'Кровать' ? bedImage :
                                          item.name === 'Шкаф' ? wardrobeImage :
                                            item.name === 'Стол' ? tableImage :
                                              item.name === 'Тумба' ? chestImage :
                                                item.name === 'Аптечка' ? firstAidKitImage :
                                                  item.name === 'Бинт' ? bandageImage :
                                                    item.name === 'Консервы' ? cannedFoodImage :
                                                      item.name === 'Шоколадка' ? chocolateImage :
                                                        item.name === 'Кофе' ? coffeeImage :
                                                          defaultItemImage
                    }
                    alt={item.name}
                  />
                  <S.ItemDetailsWrapper>
                    {item.name === 'Паспорт животного' || item.description === 'Кошка' || item.description === 'Собака' ? (
                      item.name === 'Паспорт животного' ? (
                        <>
                          <S.ItemDetail theme={theme}>{item.description}</S.ItemDetail>
                          <S.ItemDetail theme={theme}>Редкость: {item.rarity}</S.ItemDetail>
                          <S.WeightCostWrapper>
                            <S.ItemDetail theme={theme}>Вес: {item.weight} кг</S.ItemDetail>
                            <S.ItemDetail theme={theme}> | Стоимость: {item.cost} кредитов</S.ItemDetail>
                          </S.WeightCostWrapper>
                        </>
                      ) : (
                        <S.ItemDetail theme={theme}>{item.description}</S.ItemDetail>
                      )
                    ) : (
                      <>
                        <S.ItemDetail theme={theme}>{item.description}</S.ItemDetail>
                        <S.ItemDetail theme={theme}>Редкость: {item.rarity}</S.ItemDetail>
                        <S.WeightCostWrapper>
                          <S.ItemDetail theme={theme}>Вес: {item.weight} кг</S.ItemDetail>
                          <S.ItemDetail theme={theme}> | Стоимость: {item.cost} кредитов</S.ItemDetail>
                        </S.WeightCostWrapper>
                      </>
                    )}
                  </S.ItemDetailsWrapper>
                </S.ItemContentWrapper>
                {(item.name === 'Паспорт животного' || item.description === 'Кошка' || item.description === 'Собака') ? null : (
                  <S.ItemEffect theme={theme}>Эффект: {item.effect}</S.ItemEffect>
                )}
                {item.name === 'Паспорт животного' && (
                  <S.ItemEffect theme={theme}>Эффект: {item.effect}</S.ItemEffect>
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
                      {(item.name === 'Лесные ягоды' || item.name === 'Лесные грибы' || item.name === 'Шоколадка' || item.name === 'Консервы') && (
                        <S.GreenActionButton
                          onClick={() => handleEatItem(item.name, item.weight, count)}
                          disabled={isActionCooldown}
                        >
                          Съесть
                          {isActionCooldown && <S.ProgressBar />}
                        </S.GreenActionButton>
                      )}
                      {item.name === 'Кофе' && (
                        <S.GreenActionButton
                          onClick={() => handleEatItem(item.name, item.weight, count)}
                          disabled={isActionCooldown}
                        >
                          Выпить
                          {isActionCooldown && <S.ProgressBar />}
                        </S.GreenActionButton>
                      )}
                      {(item.name === 'Бинт' || item.name === 'Аптечка') && (
                        <S.GreenActionButton
                          onClick={() => handleUseItem(item.name, item.weight, count)}
                          disabled={isActionCooldown}
                        >
                          Использовать
                          {isActionCooldown && <S.ProgressBar />}
                        </S.GreenActionButton>
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
            {activeTab === 'location' && (
              <S.ItemList subTab={activeTab}>
                {(currentRoom === 'Магазин "Всё на свете"' || currentRoom === 'Кофейня "Ля Фафан"') && user?.isHuman ? (
                  shopItems.map(item => (
                    <S.ItemCard
                      key={item._id}
                      theme={theme}
                      isAnimating={animatingItem && animatingItem.itemId === item._id.toString() ? animatingItem.action : null}
                    >
                      <S.ItemTitle theme={theme}>{item.name}</S.ItemTitle>
                      <S.ItemContentWrapper>
                        <S.ItemImage
                          src={
                            item.name === 'Ошейник' ? collarImage :
                              item.name === 'Поводок' ? leashImage :
                                item.name === 'Аптечка' ? firstAidKitImage :
                                  item.name === 'Бинт' ? bandageImage :
                                    item.name === 'Консервы' ? cannedFoodImage :
                                      item.name === 'Шоколадка' ? chocolateImage :
                                        item.name === 'Кофе' ? coffeeImage :
                                          defaultItemImage
                          }
                          alt={item.name}
                        />
                        <S.ItemDetailsWrapper>
                          <S.ItemDetail theme={theme}>{item.description}</S.ItemDetail>
                          <S.ItemDetail theme={theme}>Редкость: {item.rarity}</S.ItemDetail>
                          <S.WeightCostWrapper>
                            <S.ItemDetail theme={theme}>Вес: {item.weight} кг</S.ItemDetail>
                            <S.ItemDetail theme={theme}> | Стоимость: {item.cost} кредитов</S.ItemDetail>
                          </S.WeightCostWrapper>
                        </S.ItemDetailsWrapper>
                      </S.ItemContentWrapper>
                      <S.ItemEffect theme={theme}>Эффект: {item.effect}</S.ItemEffect>
                      <S.ActionButtons>
                        <S.PickupButton
                          onClick={() => handleBuyItem(item)}
                          disabled={isActionCooldown}
                        >
                          {item.cost} кредитов
                          {isActionCooldown && <S.ProgressBar />}
                        </S.PickupButton>
                      </S.ActionButtons>
                    </S.ItemCard>
                  ))
                ) : (
                  activeLocationSubTab === 'items' &&
                  groupItemsByNameAndWeight(locationItems).map(({ item, count }) => (
                    <S.ItemCard
                      key={item._id}
                      theme={theme}
                      isAnimating={animatingItem && animatingItem.itemId === item._id.toString() ? animatingItem.action : null}
                    >
                      <S.ItemTitle theme={theme}>{item.name} <S.ItemCount theme={theme}>x{count}</S.ItemCount></S.ItemTitle>
                      <S.ItemContentWrapper>
                        <S.ItemImage
                          src={
                            item.name === 'Палка' ? stickImage :
                              item.name === 'Доска' ? boardImage :
                                item.name === 'Ошейник' ? collarImage :
                                  item.name === 'Мусор' ? garbageImage :
                                    item.name === 'Поводок' ? leashImage :
                                      item.name === 'Паспорт животного' ? passportImage :
                                        item.name === 'Лесные ягоды' ? berrysImage :
                                          item.name === 'Лесные грибы' ? mushroomsImage :
                                            item.name === 'Стул' ? chairImage :
                                              item.name === 'Кровать' ? bedImage :
                                                item.name === 'Шкаф' ? wardrobeImage :
                                                  item.name === 'Стол' ? tableImage :
                                                    item.name === 'Тумба' ? chestImage :
                                                      item.name === 'Аптечка' ? firstAidKitImage :
                                                        item.name === 'Бинт' ? bandageImage :
                                                          item.name === 'Консервы' ? cannedFoodImage :
                                                            item.name === 'Шоколадка' ? chocolateImage :
                                                              item.name === 'Кофе' ? coffeeImage :
                                                                defaultItemImage
                          }
                          alt={item.name}
                        />
                        <S.ItemDetailsWrapper>
                          <S.ItemDetail theme={theme}>{item.description}</S.ItemDetail>
                          <S.ItemDetail theme={theme}>Редкость: {item.rarity}</S.ItemDetail>
                          <S.WeightCostWrapper>
                            <S.ItemDetail theme={theme}>Вес: {item.weight} кг</S.ItemDetail>
                            <S.ItemDetail theme={theme}> | Стоимость: {item.cost} кредитов</S.ItemDetail>
                          </S.WeightCostWrapper>
                        </S.ItemDetailsWrapper>
                      </S.ItemContentWrapper>
                      {item.name !== 'Паспорт животного' && (
                        <S.ItemEffect theme={theme}>Эффект: {item.effect}</S.ItemEffect>
                      )}
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
                  ))
                )}
                {((currentRoom === 'Магазин "Всё на свете"' && shopItems.length === 0) ||
                  (activeLocationSubTab === 'items' && locationItems.length === 0)) && (
                    <div style={{ textAlign: 'center', color: theme === 'dark' ? '#ccc' : '#666' }}>
                      На этой локации нет предметов
                    </div>
                  )}
              </S.ItemList>
            )}
            {activeTab === 'personal' && tempPersonalItems.length === 0 && (
              <div style={{ textAlign: 'center', color: theme === 'dark' ? '#ccc' : '#666' }}>
                У вас пока нет предметов
              </div>
            )}
          </S.ItemList>
        )}
      </S.ContentContainer>
      <S.Modal
        isOpen={!!selectedItem || (actionQuantity.itemName && actionQuantity.weight) || applyModal.isOpen}
        theme={theme}
        onClick={closeModal}
        isConfirm={!!(actionQuantity.itemName && actionQuantity.weight) || applyModal.isOpen}
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
                  <FaCheck /> {/* Заменяем текст "ОК" на иконку галочки */}
                </S.ConfirmButton>
                <S.ConfirmButton
                  type="no"
                  onClick={() => setRenameModalOpen(false)}
                  disabled={isActionCooldown}
                >
                  <FaTimes /> {/* Заменяем текст "Отмена" на иконку крестика */}
                </S.ConfirmButton>
              </S.ConfirmButtons>
            </S.RenameModalContent>
          </S.Modal>
        )}
        {actionQuantity.itemName && actionQuantity.weight && (
          <S.QuantityModalContent theme={theme}>
            <S.ConfirmText>
              {actionQuantity.action === 'move' ? 'Выложить' :
                actionQuantity.action === 'delete' ? 'Сломать' :
                  actionQuantity.action === 'eat' ? 'Съесть' :
                    'Использовать'} {actionQuantity.itemName}
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
                <FaCheck /> {/* Заменяем текст "ОК" на иконку галочки */}
              </S.ConfirmButton>
              <S.ConfirmButton
                type="no"
                onClick={() => setActionQuantity({ itemName: null, weight: null, count: 1, action: null })}
                disabled={isActionCooldown}
              >
                <FaTimes /> {/* Заменяем текст "Отмена" на иконку крестика */}
              </S.ConfirmButton>
            </S.ConfirmButtons>
          </S.QuantityModalContent>
        )}
        {applyModal.isOpen && applyModal.item && (
          <S.ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <S.ItemTitle theme={theme}>{applyModal.item.name}</S.ItemTitle>
            <S.ItemDetail theme={theme}>{applyModal.item.description}</S.ItemDetail>
            <S.ConfirmButtons>
              <S.ConfirmButton
                type="yes"
                onClick={handleApplyItem}
                disabled={isActionCooldown}
              >
                <FaCheck /> {/* Заменяем текст "Применить" на иконку галочки */}
              </S.ConfirmButton>
              <S.ConfirmButton
                type="no"
                onClick={() => setApplyModal({ isOpen: false, item: null })}
                disabled={isActionCooldown}
              >
                <FaTimes /> {/* Заменяем текст "Отмена" на иконку крестика */}
              </S.ConfirmButton>
            </S.ConfirmButtons>
          </S.ModalContent>
        )}
      </S.Modal>
    </S.InventoryContainer>
  );
}

export default Inventory;
const { WEIGHT_LIMITS } = require('../../src/components/constants/settings'); // Импортируем константы лимитов
const userLastAction = new Map(); // Для хранения времени последнего действия пользователя
const MIN_ACTION_INTERVAL = 1000; // Минимальный интервал между действиями (1 секунда)

// Вспомогательная функция для расчета текущего веса
const calculateCurrentWeight = (items) => {
    return items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
};

// Вспомогательная функция для получения лимита веса
const getWeightLimit = async (owner, userId) => {
    if (owner.startsWith('user_')) {
        const user = await User.findOne({ userId: owner.replace('user_', '') });
        return user.isHuman ? WEIGHT_LIMITS.HUMAN : WEIGHT_LIMITS.ANIMAL;
    }
    return WEIGHT_LIMITS.LOCATION;
};

function registerInventoryHandlers({
    io,
    socket,
    Item,
    User,
    itemCache,
    itemLocks,
    userCurrentRoom
}) {
    socket.on('getItems', async ({ owner }) => {
        try {
            const items = await Item.find({ owner });
            // Добавляем текущий вес в ответ
            const currentWeight = calculateCurrentWeight(items);
            const maxWeight = await getWeightLimit(owner, socket.userData.userId);
            socket.emit('items', { owner, items, currentWeight, maxWeight });
        } catch (err) {
            console.error('Error fetching items:', err.message, err.stack);
        }
    });

    /* Обновляем обработчик useItem для удаления предмета без создания Мусора */
    socket.on('useItem', async ({ itemId }, callback) => {
        try {
            if (itemLocks.has(itemId)) {
                callback({ success: false, message: 'Этот предмет уже обрабатывается' });
                return;
            }

            itemLocks.set(itemId, true);

            const item = await Item.findById(itemId);
            if (!item) {
                itemLocks.delete(itemId);
                callback({ success: false, message: 'Предмет не найден' });
                return;
            }

            const owner = item.owner;
            const userId = owner.replace('user_', '');
            const user = await User.findOne({ userId });
            if (!user) {
                itemLocks.delete(itemId);
                callback({ success: false, message: 'Пользователь не найден' });
                return;
            }

            const itemEffects = {
                'Лесные ягоды': {
                    health: Math.floor(Math.random() * 16) - 5,
                    mood: Math.floor(Math.random() * 16) - 5,
                    satiety: Math.floor(Math.random() * 16) - 5
                },
                'Лесные грибы': {
                    health: Math.floor(Math.random() * 31) - 10,
                    mood: Math.floor(Math.random() * 23) - 7,
                    satiety: Math.floor(Math.random() * 23) - 7
                },
                'Шоколадка': {
                    health: Math.floor(Math.random() * 6),
                    mood: Math.floor(Math.random() * 16) + 5,
                    satiety: Math.floor(Math.random() * 16) + 5
                },
                'Консервы': {
                    satiety: Math.floor(Math.random() * 11) + 20,
                    mood: Math.floor(Math.random() * 6) + 5,
                    health: Math.floor(Math.random() * 6) + 5
                },
                'Бинт': {
                    health: Math.floor(Math.random() * 11) + 10
                },
                'Аптечка': {
                    health: Math.floor(Math.random() * 11) + 30
                },
                'Кофе': {
                    energy: Math.floor(Math.random() * 11) + 20,
                    satiety: Math.floor(Math.random() * 6)
                }
            };

            const effect = itemEffects[item.name];
            if (!effect) {
                itemLocks.delete(itemId);
                callback({ success: false, message: 'Этот предмет нельзя использовать' });
                return;
            }

            const updatedStats = {
                health: Math.min(Math.max(user.stats.health + (effect.health || 0), 0), user.stats.maxHealth),
                mood: Math.min(Math.max(user.stats.mood + (effect.mood || 0), 0), user.stats.maxMood),
                satiety: Math.min(Math.max(user.stats.satiety + (effect.satiety || 0), 0), user.stats.maxSatiety),
                energy: Math.min(Math.max(user.stats.energy + (effect.energy || 0), 0), user.stats.maxEnergy)
            };

            await User.updateOne(
                { userId },
                {
                    $set: {
                        'stats.health': updatedStats.health,
                        'stats.mood': updatedStats.mood,
                        'stats.satiety': updatedStats.satiety,
                        'stats.energy': updatedStats.energy
                    }
                }
            );

            await Item.deleteOne({ _id: itemId });

            const ownerItems = itemCache.get(owner) || [];
            const updatedItems = ownerItems.filter(i => i._id.toString() !== itemId);
            itemCache.set(owner, updatedItems);

            const updatedUser = await User.findOne({ userId });

            socket.emit('userUpdate', {
                userId: updatedUser.userId,
                firstName: updatedUser.firstName,
                username: updatedUser.username,
                lastName: updatedUser.lastName,
                photoUrl: updatedUser.photoUrl,
                isRegistered: updatedUser.isRegistered,
                isHuman: updatedUser.isHuman,
                animalType: updatedUser.animalType,
                name: updatedUser.name,
                owner: updatedUser.owner,
                homeless: updatedUser.homeless,
                credits: updatedUser.credits || 0,
                onLeash: updatedUser.onLeash,
                freeRoam: updatedUser.freeRoam || false,
                stats: updatedUser.stats
            });

            io.to(owner).emit('items', {
                owner,
                items: updatedItems,
                currentWeight: calculateCurrentWeight(updatedItems),
                maxWeight: await getWeightLimit(owner, userId)
            });
            const currentRoom = userCurrentRoom.get(userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'remove', owner, itemId });
                io.to(currentRoom).emit('items', {
                    owner,
                    items: updatedItems,
                    currentWeight: calculateCurrentWeight(updatedItems),
                    maxWeight: await getWeightLimit(owner, userId)
                });
            }

            itemLocks.delete(itemId);
            callback({ success: true, message: `Предмет ${item.name} использован` });
        } catch (err) {
            console.error('Error using item:', err.message, err.stack);
            itemLocks.delete(itemId);
            callback({ success: false, message: 'Ошибка при использовании предмета' });
        }
    });

    // Добавляем обработчик для обновления позиций предметов
    socket.on('updateItemPositions', async ({ owner, positions }, callback) => {
        try {
            const now = Date.now();
            const lastActionTime = userLastAction.get(owner) || 0;
            if (now - lastActionTime < MIN_ACTION_INTERVAL) {
                if (callback) callback({ success: false, message: 'Слишком частые действия, подождите' });
                return;
            }
            userLastAction.set(owner, now);

            for (const [itemId, pos] of Object.entries(positions)) {
                const itemKey = itemId.replace('item_', '');
                await Item.updateOne(
                    { _id: itemKey, owner },
                    { $set: { x: pos.x, y: pos.y, scaleFactor: pos.scaleFactor, zIndex: pos.zIndex } }
                );
            }

            const updatedItems = await Item.find({ owner });
            itemCache.set(owner, updatedItems);

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemPositionsUpdate', { owner, items: updatedItems });
                io.to(currentRoom).emit('items', {
                    owner,
                    items: updatedItems,
                    currentWeight: calculateCurrentWeight(updatedItems),
                    maxWeight: await getWeightLimit(owner, socket.userData.userId)
                });
            }

            if (callback) callback({ success: true, message: 'Позиции предметов обновлены' });
        } catch (err) {
            console.error('Error updating item positions:', err.message, err.stack);
            if (callback) callback({ success: false, message: 'Ошибка при обновлении позиций предметов' });
        }
    });

    socket.on('craftItem', async ({ owner, craftedItem, materials }, callback) => {
        try {
            console.log('Received craftItem data:', { owner, craftedItem, materials });
            if (!craftedItem || typeof craftedItem !== 'object' || !materials || typeof materials !== 'object') {
                console.error('Invalid craftItem data:', { craftedItem, materials });
                if (callback) callback({ success: false, message: 'Некорректные данные предмета или материалов' });
                return;
            }

            const now = Date.now();
            const lastActionTime = userLastAction.get(owner) || 0;
            if (now - lastActionTime < MIN_ACTION_INTERVAL) {
                if (callback) callback({ success: false, message: 'Слишком частые действия, подождите' });
                return;
            }
            userLastAction.set(owner, now);

            const requiredSticks = materials.sticks || 0;
            const requiredBoards = materials.boards || 0;
            const stickItems = requiredSticks > 0 ? await Item.find({ owner, name: 'Палка' }).limit(requiredSticks) : [];
            const boardItems = requiredBoards > 0 ? await Item.find({ owner, name: 'Доска' }).limit(requiredBoards) : [];

            if (stickItems.length < requiredSticks || boardItems.length < requiredBoards) {
                if (callback) callback({ success: false, message: 'Недостаточно материалов для крафта' });
                return;
            }

            const ownerItems = await Item.find({ owner });
            const currentWeight = calculateCurrentWeight(ownerItems);
            const craftedItemWeight = parseFloat(craftedItem.weight) || 0;
            const materialsWeight = stickItems.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0) +
                boardItems.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
            const weightDifference = craftedItemWeight - materialsWeight;
            const maxWeight = await getWeightLimit(owner, socket.userData.userId);

            if (currentWeight + weightDifference > maxWeight) {
                if (callback) callback({ success: false, message: 'Превышен лимит веса инвентаря' });
                return;
            }

            const stickIds = stickItems.map(item => item._id);
            const boardIds = boardItems.map(item => item._id);
            await Item.deleteMany({ _id: { $in: [...stickIds, ...boardIds] } });

            const newItem = await Item.create({ owner, ...craftedItem });
            console.log('Crafted item:', newItem);

            const updatedItems = await Item.find({ owner });
            itemCache.set(owner, updatedItems);

            socket.emit('items', {
                owner,
                items: updatedItems,
                currentWeight: calculateCurrentWeight(updatedItems),
                maxWeight
            });
            io.to(owner).emit('items', {
                owner,
                items: updatedItems,
                currentWeight: calculateCurrentWeight(updatedItems),
                maxWeight
            });

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'remove', owner, itemIds: [...stickIds, ...boardIds] });
                io.to(currentRoom).emit('itemAction', { action: 'add', owner, item: newItem });
                io.to(currentRoom).emit('items', {
                    owner,
                    items: updatedItems,
                    currentWeight: calculateCurrentWeight(updatedItems),
                    maxWeight
                });
            }

            if (callback) callback({ success: true, item: newItem });
        } catch (err) {
            console.error('Error crafting item:', err.message, err.stack);
            if (callback) callback({ success: false, message: 'Ошибка при создании предмета' });
        }
    });

    socket.on('getInventoryLimit', async ({ owner }) => {
        try {
            const items = await Item.find({ owner });
            const currentWeight = calculateCurrentWeight(items);
            const maxWeight = await getWeightLimit(owner, socket.userData.userId);
            socket.emit('inventoryLimit', { owner, currentWeight, maxWeight });
        } catch (err) {
            console.error('Error fetching inventory limit:', err.message, err.stack);
        }
    });

    socket.on('addItem', async ({ owner, item }, callback) => {
        try {
            console.log('Received item data:', { owner, item });
            if (!item || typeof item !== 'object') {
                console.error('Invalid item data:', item);
                if (callback) callback({ success: false, message: 'Некорректные данные предмета' });
                return;
            }

            const now = Date.now();
            const lastActionTime = userLastAction.get(owner) || 0;
            if (now - lastActionTime < MIN_ACTION_INTERVAL) {
                if (callback) callback({ success: false, message: 'Слишком частые действия, подождите' });
                return;
            }
            userLastAction.set(owner, now);

            if (item._id) {
                itemLocks.set(item._id, true);
            }

            const ownerItems = await Item.find({ owner });
            const currentWeight = calculateCurrentWeight(ownerItems);
            const itemWeight = parseFloat(item.weight) || 0;
            const maxWeight = await getWeightLimit(owner, socket.userData.userId);

            if (currentWeight + itemWeight > maxWeight) {
                if (item._id) itemLocks.delete(item._id);
                if (callback) callback({ success: false, message: 'Превышен лимит веса' });
                return;
            }

            const newItem = await Item.create({ owner, ...item });
            console.log('Saved item:', newItem);

            const ownerItemsUpdated = [...ownerItems, newItem];
            itemCache.set(owner, ownerItemsUpdated);

            const updatedCurrentWeight = calculateCurrentWeight(ownerItemsUpdated);
            socket.emit('inventoryLimit', { owner, currentWeight: updatedCurrentWeight, maxWeight });

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'add', owner, item: newItem });
                io.to(currentRoom).emit('items', {
                    owner,
                    items: ownerItemsUpdated,
                    currentWeight: updatedCurrentWeight,
                    maxWeight
                });
                io.to(currentRoom).emit('inventoryLimit', { owner, currentWeight: updatedCurrentWeight, maxWeight });
            }

            io.to(owner).emit('items', {
                owner,
                items: ownerItemsUpdated,
                currentWeight: updatedCurrentWeight,
                maxWeight
            });

            if (callback) callback({ success: true, item: newItem });
            if (item._id) itemLocks.delete(item._id);
        } catch (err) {
            console.error('Error adding item:', err.message, err.stack);
            if (item._id) itemLocks.delete(item._id);
            if (callback) callback({ success: false, message: 'Ошибка при добавлении предмета' });
        }
    });

    socket.on('moveItem', async ({ itemIds, newOwner }) => {
        try {
            let ids = Array.isArray(itemIds) ? itemIds : [itemIds];
            const items = await Item.find({ _id: { $in: ids } });
            if (items.length !== ids.length) {
                socket.emit('error', { message: 'Некоторые предметы не найдены' });
                return;
            }

            const oldOwner = items[0].owner;
            const totalWeight = calculateCurrentWeight(items);

            const newOwnerItems = await Item.find({ owner: newOwner });
            const newOwnerCurrentWeight = calculateCurrentWeight(newOwnerItems);
            const newOwnerMaxWeight = await getWeightLimit(newOwner, socket.userData.userId);

            if (newOwnerCurrentWeight + totalWeight > newOwnerMaxWeight) {
                socket.emit('error', { message: 'Превышен лимит веса в месте назначения' });
                return;
            }

            await Item.updateMany({ _id: { $in: ids } }, { owner: newOwner });

            const updatedItems = await Item.find({ _id: { $in: ids } });
            updatedItems.forEach(item => {
                const cachedOldOwnerItems = itemCache.get(oldOwner) || [];
                itemCache.set(oldOwner, cachedOldOwnerItems.filter(i => i._id.toString() !== item._id.toString()));
                const cachedNewOwnerItems = itemCache.get(newOwner) || [];
                itemCache.set(newOwner, [...cachedNewOwnerItems, item]);
            });

            const oldOwnerItems = await Item.find({ owner: oldOwner });
            const oldOwnerCurrentWeight = calculateCurrentWeight(oldOwnerItems);
            const oldOwnerMaxWeight = await getWeightLimit(oldOwner, socket.userData.userId);

            const newOwnerUpdatedItems = await Item.find({ owner: newOwner });
            const newOwnerUpdatedCurrentWeight = calculateCurrentWeight(newOwnerUpdatedItems);

            socket.emit('inventoryLimit', { owner: oldOwner, currentWeight: oldOwnerCurrentWeight, maxWeight: oldOwnerMaxWeight });
            socket.emit('inventoryLimit', { owner: newOwner, currentWeight: newOwnerUpdatedCurrentWeight, maxWeight: newOwnerMaxWeight });
            io.to(oldOwner).emit('items', {
                owner: oldOwner,
                items: oldOwnerItems,
                currentWeight: oldOwnerCurrentWeight,
                maxWeight: oldOwnerMaxWeight
            });
            io.to(newOwner).emit('items', {
                owner: newOwner,
                items: newOwnerUpdatedItems,
                currentWeight: newOwnerUpdatedCurrentWeight,
                maxWeight: newOwnerMaxWeight
            });

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'remove', owner: oldOwner, itemId: ids });
                io.to(currentRoom).emit('itemAction', { action: 'add', owner: newOwner, item: updatedItems[0] });
                io.to(currentRoom).emit('inventoryLimit', { owner: oldOwner, currentWeight: oldOwnerCurrentWeight, maxWeight: oldOwnerMaxWeight });
                io.to(currentRoom).emit('inventoryLimit', { owner: newOwner, currentWeight: newOwnerUpdatedCurrentWeight, maxWeight: newOwnerMaxWeight });
            }
        } catch (err) {
            console.error('Error moving items:', err.message, err.stack);
            socket.emit('error', { message: 'Ошибка при перемещении предметов' });
        }
    });

    socket.on('pickupItem', async ({ itemId }) => {
        try {
            if (itemLocks.has(itemId)) {
                socket.emit('error', { message: 'Этот предмет уже обрабатывается другим пользователем' });
                return;
            }

            itemLocks.set(itemId, true);

            const item = await Item.findById(itemId);
            if (!item) {
                itemLocks.delete(itemId);
                socket.emit('error', { message: 'Предмет не найден' });
                return;
            }

            const userOwnerKey = `user_${socket.userData.userId}`;
            const oldOwner = item.owner;
            const itemWeight = parseFloat(item.weight) || 0;

            const userItems = await Item.find({ owner: userOwnerKey });
            const userCurrentWeight = calculateCurrentWeight(userItems);
            const userMaxWeight = await getWeightLimit(userOwnerKey, socket.userData.userId);

            if (userCurrentWeight + itemWeight > userMaxWeight) {
                itemLocks.delete(itemId);
                socket.emit('error', { message: 'Превышен лимит веса у пользователя' });
                return;
            }

            item.owner = userOwnerKey;
            await item.save();

            const oldOwnerItems = await Item.find({ owner: oldOwner });
            const oldOwnerCurrentWeight = calculateCurrentWeight(oldOwnerItems);
            const oldOwnerMaxWeight = await getWeightLimit(oldOwner, socket.userData.userId);

            const userUpdatedItems = await Item.find({ owner: userOwnerKey });
            const userUpdatedCurrentWeight = calculateCurrentWeight(userUpdatedItems);

            itemCache.set(oldOwner, oldOwnerItems);
            itemCache.set(userOwnerKey, userUpdatedItems);

            socket.emit('inventoryLimit', { owner: oldOwner, currentWeight: oldOwnerCurrentWeight, maxWeight: oldOwnerMaxWeight });
            socket.emit('inventoryLimit', { owner: userOwnerKey, currentWeight: userUpdatedCurrentWeight, maxWeight: userMaxWeight });

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'remove', owner: oldOwner, itemId });
                io.to(currentRoom).emit('itemAction', { action: 'add', owner: userOwnerKey, item });
                io.to(currentRoom).emit('items', {
                    owner: oldOwner,
                    items: oldOwnerItems,
                    currentWeight: oldOwnerCurrentWeight,
                    maxWeight: oldOwnerMaxWeight
                });
                io.to(currentRoom).emit('items', {
                    owner: userOwnerKey,
                    items: userUpdatedItems,
                    currentWeight: userUpdatedCurrentWeight,
                    maxWeight: userMaxWeight
                });
                io.to(currentRoom).emit('inventoryLimit', { owner: oldOwner, currentWeight: oldOwnerCurrentWeight, maxWeight: oldOwnerMaxWeight });
                io.to(currentRoom).emit('inventoryLimit', { owner: userOwnerKey, currentWeight: userUpdatedCurrentWeight, maxWeight: userMaxWeight });
            }

            itemLocks.delete(itemId);
        } catch (err) {
            console.error('Error picking up item:', err.message, err.stack);
            itemLocks.delete(itemId);
            socket.emit('error', { message: 'Ошибка при подборе предмета' });
        }
    });

    socket.on('deleteItem', async ({ itemId }) => {
        try {
            if (itemLocks.has(itemId)) {
                socket.emit('error', { message: 'Этот предмет уже обрабатывается другим пользователем' });
                return;
            }

            itemLocks.set(itemId, true);

            const item = await Item.findById(itemId);
            if (!item) {
                itemLocks.delete(itemId);
                socket.emit('error', { message: 'Предмет не найден' });
                return;
            }

            const owner = item.owner;
            const itemWeight = parseFloat(item.weight) || 0;

            await Item.deleteOne({ _id: itemId });

            let trashItem = null;
            if (item.name !== 'Мусор') {
                trashItem = new Item({
                    name: 'Мусор',
                    description: 'Раньше это было чем-то полезным',
                    rarity: 'Бесполезный',
                    weight: itemWeight,
                    cost: 1,
                    effect: 'Чувство обременения чем-то бесполезным',
                    owner: owner
                });
                await trashItem.save();
                console.log('Created trash item:', trashItem);
            }

            const updatedItems = await Item.find({ owner });
            itemCache.set(owner, updatedItems);

            const currentWeight = calculateCurrentWeight(updatedItems);
            const maxWeight = await getWeightLimit(owner, socket.userData.userId);

            socket.emit('inventoryLimit', { owner, currentWeight, maxWeight });

            console.log('Sending updated items after delete:', updatedItems);
            io.to(owner).emit('items', { owner, items: updatedItems, currentWeight, maxWeight });

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('items', { owner, items: updatedItems, currentWeight, maxWeight });
                io.to(currentRoom).emit('inventoryLimit', { owner, currentWeight, maxWeight });
            }

            itemLocks.delete(itemId);
        } catch (err) {
            console.error('Error deleting item:', err.message, err.stack);
            itemLocks.delete(itemId);
            socket.emit('error', { message: 'Ошибка при удалении предмета' });
        }
    });

    socket.on('utilizeTrash', async (callback) => {
        if (!socket.userData || !socket.userData.userId) {
            if (callback) callback({ success: false, message: 'Пользователь не аутентифицирован' });
            return;
        }

        try {
            const owner = `user_${socket.userData.userId}`;
            const trashItems = await Item.find({ owner, name: 'Мусор' });

            if (trashItems.length === 0) {
                if (callback) callback({ success: false, message: 'У вас нет мусора для утилизации' });
                return;
            }

            let totalWeight = 0;
            let totalCredits = 0;
            for (const item of trashItems) {
                totalWeight += parseFloat(item.weight) || 0;
                totalCredits += parseFloat(item.cost) || 0;
                await Item.deleteOne({ _id: item._id });
            }

            const creditsEarned = Math.floor(totalCredits);

            const user = await User.findOneAndUpdate(
                { userId: socket.userData.userId },
                { $inc: { credits: creditsEarned } },
                { new: true }
            );

            if (user) {
                socket.emit('userUpdate', {
                    userId: user.userId,
                    credits: user.credits
                });
            }

            const updatedItems = await Item.find({ owner });
            itemCache.set(owner, updatedItems);
            const currentWeight = calculateCurrentWeight(updatedItems);
            const maxWeight = await getWeightLimit(owner, socket.userData.userId);

            console.log('Trash items deleted for:', owner);
            console.log('Credits earned:', creditsEarned);
            console.log('Sending updated items:', updatedItems);
            io.to(owner).emit('items', { owner, items: updatedItems, currentWeight, maxWeight });
            io.to(owner).emit('inventoryLimit', { owner, currentWeight, maxWeight });

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('items', { owner, items: updatedItems, currentWeight, maxWeight });
                io.to(currentRoom).emit('inventoryLimit', { owner, currentWeight, maxWeight });
            }

            if (callback) callback({ success: true, message: `Мусор утилизирован. Получено ${creditsEarned} кредитов.` });
        } catch (err) {
            console.error('Error utilizing trash:', err.message, err.stack);
            if (callback) callback({ success: false, message: 'Ошибка при утилизации мусора' });
        }
    });

    // Модифицировать обработчик removeItems
    socket.on('removeItems', async (data) => {
        try {
            const { owner, name, count } = data;

            const now = Date.now();
            const lastActionTime = userLastAction.get(owner) || 0;
            if (now - lastActionTime < MIN_ACTION_INTERVAL) {
                socket.emit('error', { message: 'Слишком частые действия, подождите' });
                return;
            }
            userLastAction.set(owner, now);

            const items = await Item.find({ owner, name }).limit(count);

            if (items.length < count) {
                socket.emit('error', { message: `Недостаточно предметов "${name}" для удаления` });
                return;
            }

            const itemIds = items.map(item => item._id);

            await Item.deleteMany({ _id: { $in: itemIds } });

            const updatedItems = await Item.find({ owner });
            itemCache.set(owner, updatedItems);

            const currentWeight = calculateCurrentWeight(updatedItems);
            const maxWeight = await getWeightLimit(owner, socket.userData.userId);

            io.to(owner).emit('items', { owner, items: updatedItems, currentWeight, maxWeight });
            io.to(owner).emit('inventoryLimit', { owner, currentWeight, maxWeight });

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'remove', owner, itemIds });
                io.to(currentRoom).emit('items', { owner, items: updatedItems, currentWeight, maxWeight });
                io.to(currentRoom).emit('inventoryLimit', { owner, currentWeight, maxWeight });
            }
        } catch (err) {
            console.error('Error removing items:', err.message, err.stack);
            socket.emit('error', { message: 'Ошибка при удалении предметов' });
        }
    });
}

module.exports = { registerInventoryHandlers };
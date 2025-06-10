const { INVENTORY_LIMITS } = require('../../src/components/constants/settings.js'); // userSettings.js
const userLastAction = new Map(); // Для хранения времени последнего действия пользователя
const MIN_ACTION_INTERVAL = 1000; // Минимальный интервал между действиями (1 секунда)


function registerInventoryHandlers({
    io,
    socket,
    Item,
    User,
    InventoryLimit,
    itemCache,
    itemLocks,
    userCurrentRoom
}) {
    socket.on('getItems', async ({ owner }) => {
        try {
            const items = await Item.find({ owner });
            // Вычисляем текущий вес
            const currentWeight = items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
            // Определяем лимит веса
            let maxWeight;
            if (owner.startsWith('user_')) {
                const userId = owner.replace('user_', '');
                const user = await User.findOne({ userId });
                maxWeight = user && user.isHuman ? INVENTORY_LIMITS.HUMAN : INVENTORY_LIMITS.ANIMAL;
            } else {
                maxWeight = INVENTORY_LIMITS.LOCATION;
            }
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
                    health: Math.floor(Math.random() * 31) - 10, // от -10 до +20
                    mood: Math.floor(Math.random() * 23) - 7,    // от -7 до +15
                    satiety: Math.floor(Math.random() * 23) - 7  // от -7 до +15
                },
                'Шоколадка': {
                    health: Math.floor(Math.random() * 6),       // от 0 до +5
                    mood: Math.floor(Math.random() * 16) + 5,   // от +5 до +20
                    satiety: Math.floor(Math.random() * 16) + 5 // от +5 до +20
                },
                'Консервы': {
                    satiety: Math.floor(Math.random() * 11) + 20, // от +20 до +30
                    mood: Math.floor(Math.random() * 6) + 5,     // от +5 до +10
                    health: Math.floor(Math.random() * 6) + 5    // от +5 до +10
                },
                'Бинт': {
                    health: Math.floor(Math.random() * 11) + 10 // от +10 до +20
                },
                'Аптечка': {
                    health: Math.floor(Math.random() * 11) + 30 // от +30 до +40
                },
                'Кофе': {
                    energy: Math.floor(Math.random() * 11) + 20, // от +20 до +30
                    satiety: Math.floor(Math.random() * 6)       // от 0 до +5
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

            // Пересчитываем текущий вес после удаления предмета
            const currentWeight = updatedItems.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
            const maxWeight = user.isHuman ? INVENTORY_LIMITS.HUMAN : INVENTORY_LIMITS.ANIMAL;
            io.to(owner).emit('items', { owner, items: updatedItems, currentWeight, maxWeight });

            const currentRoom = userCurrentRoom.get(userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'remove', owner, itemId });
                io.to(currentRoom).emit('items', { owner, items: updatedItems, currentWeight, maxWeight });
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
            // Проверяем интервал между действиями
            const now = Date.now();
            const lastActionTime = userLastAction.get(owner) || 0;
            if (now - lastActionTime < MIN_ACTION_INTERVAL) {
                if (callback) callback({ success: false, message: 'Слишком частые действия, подождите' });
                return;
            }
            userLastAction.set(owner, now);

            // Обновляем позиции предметов в базе данных
            for (const [itemId, pos] of Object.entries(positions)) {
                const itemKey = itemId.replace('item_', '');
                await Item.updateOne(
                    { _id: itemKey, owner },
                    { $set: { x: pos.x, y: pos.y, scaleFactor: pos.scaleFactor, zIndex: pos.zIndex } }
                );
            }

            // Получаем обновленные предметы
            const updatedItems = await Item.find({ owner });
            itemCache.set(owner, updatedItems);

            // Отправляем обновленные предметы всем в комнате
            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemPositionsUpdate', { owner, items: updatedItems });
                io.to(currentRoom).emit('items', { owner, items: updatedItems });
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

            // Проверка интервала между действиями
            const now = Date.now();
            const lastActionTime = userLastAction.get(owner) || 0;
            if (now - lastActionTime < MIN_ACTION_INTERVAL) {
                if (callback) callback({ success: false, message: 'Слишком частые действия, подождите' });
                return;
            }
            userLastAction.set(owner, now);

            // Проверка наличия материалов
            const requiredSticks = materials.sticks || 0;
            const requiredBoards = materials.boards || 0;
            const stickItems = requiredSticks > 0 ? await Item.find({ owner, name: 'Палка' }).limit(requiredSticks) : [];
            const boardItems = requiredBoards > 0 ? await Item.find({ owner, name: 'Доска' }).limit(requiredBoards) : [];

            if (stickItems.length < requiredSticks || boardItems.length < requiredBoards) {
                if (callback) callback({ success: false, message: 'Недостаточно материалов для крафта' });
                return;
            }

            // Проверка лимитов инвентаря
            const ownerLimit = await InventoryLimit.findOne({ owner });
            if (!ownerLimit) {
                if (callback) callback({ success: false, message: 'Лимиты инвентаря не найдены' });
                return;
            }

            const craftedItemWeight = parseFloat(craftedItem.weight) || 0;
            const materialsWeight = stickItems.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0) +
                boardItems.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
            const weightDifference = craftedItemWeight - materialsWeight;

            if (ownerLimit.currentWeight + weightDifference > ownerLimit.maxWeight) {
                if (callback) callback({ success: false, message: 'Превышен лимит веса инвентаря' });
                return;
            }

            // Удаление материалов
            const stickIds = stickItems.map(item => item._id);
            const boardIds = boardItems.map(item => item._id);
            await Item.deleteMany({ _id: { $in: [...stickIds, ...boardIds] } });

            // Создание нового предмета
            const newItem = await Item.create({ owner, ...craftedItem });
            console.log('Crafted item:', newItem);

            // Обновление веса инвентаря
            await InventoryLimit.updateOne(
                { owner },
                { $inc: { currentWeight: weightDifference } }
            );

            // Обновление кэша
            const ownerItems = itemCache.get(owner) || [];
            const updatedItems = ownerItems
                .filter(i => !stickIds.includes(i._id) && !boardIds.includes(i._id))
                .concat([newItem]);
            itemCache.set(owner, updatedItems);

            // Получение обновленных лимитов
            const updatedLimit = await InventoryLimit.findOne({ owner });

            // Уведомление клиентов
            socket.emit('inventoryLimit', updatedLimit);
            io.to(owner).emit('items', { owner, items: updatedItems });

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'remove', owner, itemIds: [...stickIds, ...boardIds] });
                io.to(currentRoom).emit('itemAction', { action: 'add', owner, item: newItem });
                io.to(currentRoom).emit('items', { owner, items: updatedItems });
                io.to(currentRoom).emit('inventoryLimit', updatedLimit);
            }

            if (callback) callback({ success: true, item: newItem });
        } catch (err) {
            console.error('Error crafting item:', err.message, err.stack);
            if (callback) callback({ success: false, message: 'Ошибка при создании предмета' });
        }
    });

    socket.on('getInventoryLimit', async ({ owner }) => {
        try {
            const limit = await InventoryLimit.findOne({ owner });
            socket.emit('inventoryLimit', limit);
        } catch (err) {
            console.error('Error fetching inventory limit:', err.message, err.stack);
        }
    });

    socket.on('addItem', async ({ owner, item }, callback) => {
        try {
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

            // Проверяем лимит веса
            const items = await Item.find({ owner });
            const currentWeight = items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
            const itemWeight = parseFloat(item.weight) || 0;
            let maxWeight;
            if (owner.startsWith('user_')) {
                const userId = owner.replace('user_', '');
                const user = await User.findOne({ userId });
                maxWeight = user && user.isHuman ? INVENTORY_LIMITS.HUMAN : INVENTORY_LIMITS.ANIMAL;
            } else {
                maxWeight = INVENTORY_LIMITS.LOCATION;
            }

            if (currentWeight + itemWeight > maxWeight) {
                if (item._id) itemLocks.delete(item._id);
                if (callback) callback({ success: false, message: 'Превышен лимит веса' });
                return;
            }

            const newItem = await Item.create({ owner, ...item });
            const updatedItems = [...items, newItem];
            itemCache.set(owner, updatedItems);

            const updatedCurrentWeight = currentWeight + itemWeight;
            socket.emit('items', { owner, items: updatedItems, currentWeight: updatedCurrentWeight, maxWeight });

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'add', owner, item: newItem });
                io.to(currentRoom).emit('items', { owner, items: updatedItems, currentWeight: updatedCurrentWeight, maxWeight });
            }

            io.to(owner).emit('items', { owner, items: updatedItems, currentWeight: updatedCurrentWeight, maxWeight });

            if (callback) callback({ success: true, item: newItem });
            if (item._id) itemLocks.delete(item._id);
        } catch (err) {
            console.error('Error adding item:', err.message, err.stack);
            if (item._id) itemLocks.delete(item._id);
            if (callback) callback({ success: false, message: 'Ошибка при добавлении предмета' });
        }
    });

    socket.on('moveItem', async ({ itemId, fromOwner, toOwner }, callback) => {
        try {
            if (itemLocks.has(itemId)) {
                callback({ success: false, message: 'Этот предмет уже обрабатывается' });
                return;
            }
            itemLocks.set(itemId, true);

            const item = await Item.findById(itemId);
            if (!item || item.owner !== fromOwner) {
                itemLocks.delete(itemId);
                callback({ success: false, message: 'Предмет не найден или не принадлежит владельцу' });
                return;
            }

            // Проверяем лимит веса в целевом инвентаре
            const toItems = await Item.find({ owner: toOwner });
            const toCurrentWeight = toItems.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
            const itemWeight = parseFloat(item.weight) || 0;
            let toMaxWeight;
            if (toOwner.startsWith('user_')) {
                const userId = toOwner.replace('user_', '');
                const user = await User.findOne({ userId });
                toMaxWeight = user && user.isHuman ? INVENTORY_LIMITS.HUMAN : INVENTORY_LIMITS.ANIMAL;
            } else {
                toMaxWeight = INVENTORY_LIMITS.LOCATION;
            }

            if (toCurrentWeight + itemWeight > toMaxWeight) {
                itemLocks.delete(itemId);
                callback({ success: false, message: 'Превышен лимит веса в целевом инвентаре' });
                return;
            }

            // Обновляем владельца предмета
            item.owner = toOwner;
            await item.save();

            // Обновляем кэш для исходного инвентаря
            let fromItems = itemCache.get(fromOwner) || [];
            fromItems = fromItems.filter(i => i._id.toString() !== itemId);
            const fromCurrentWeight = fromItems.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
            itemCache.set(fromOwner, fromItems);

            // Определяем maxWeight для исходного инвентаря
            let fromMaxWeight;
            if (fromOwner.startsWith('user_')) {
                const userId = fromOwner.replace('user_', '');
                const user = await User.findOne({ userId });
                fromMaxWeight = user && user.isHuman ? INVENTORY_LIMITS.HUMAN : INVENTORY_LIMITS.ANIMAL;
            } else {
                fromMaxWeight = INVENTORY_LIMITS.LOCATION;
            }

            // Обновляем кэш для целевого инвентаря
            let toUpdatedItems = itemCache.get(toOwner) || [];
            toUpdatedItems = [...toUpdatedItems, item];
            const toUpdatedCurrentWeight = toCurrentWeight + itemWeight;
            itemCache.set(toOwner, toUpdatedItems);

            // Отправляем обновления клиентам
            io.to(fromOwner).emit('items', { owner: fromOwner, items: fromItems, currentWeight: fromCurrentWeight, maxWeight: fromMaxWeight });
            io.to(toOwner).emit('items', { owner: toOwner, items: toUpdatedItems, currentWeight: toUpdatedCurrentWeight, maxWeight: toMaxWeight });

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'move', fromOwner, toOwner, item });
            }

            itemLocks.delete(itemId);
            callback({ success: true, message: 'Предмет перемещен' });
        } catch (err) {
            console.error('Error moving item:', err.message, err.stack);
            itemLocks.delete(itemId);
            callback({ success: false, message: 'Ошибка при перемещении предмета' });
        }
    });

    socket.on('pickupItem', async ({ itemId }, callback) => {
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

            const fromOwner = item.owner;
            const toOwner = `user_${socket.userData.userId}`;

            // Проверяем лимит веса в личном инвентаре
            const toItems = await Item.find({ owner: toOwner });
            const toCurrentWeight = toItems.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
            const itemWeight = parseFloat(item.weight) || 0;
            const user = await User.findOne({ userId: socket.userData.userId });
            const toMaxWeight = user && user.isHuman ? INVENTORY_LIMITS.HUMAN : INVENTORY_LIMITS.ANIMAL;

            if (toCurrentWeight + itemWeight > toMaxWeight) {
                itemLocks.delete(itemId);
                callback({ success: false, message: 'Превышен лимит веса в вашем инвентаре' });
                return;
            }

            // Обновляем владельца предмета
            item.owner = toOwner;
            await item.save();

            // Обновляем кэш для исходного инвентаря (локации)
            let fromItems = itemCache.get(fromOwner) || [];
            fromItems = fromItems.filter(i => i._id.toString() !== itemId);
            const fromCurrentWeight = fromItems.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
            const fromMaxWeight = INVENTORY_LIMITS.LOCATION;
            itemCache.set(fromOwner, fromItems);

            // Обновляем кэш для целевого инвентаря (игрока)
            let toUpdatedItems = itemCache.get(toOwner) || [];
            toUpdatedItems = [...toUpdatedItems, item];
            const toUpdatedCurrentWeight = toCurrentWeight + itemWeight;
            itemCache.set(toOwner, toUpdatedItems);

            // Отправляем обновления клиентам
            io.to(fromOwner).emit('items', { owner: fromOwner, items: fromItems, currentWeight: fromCurrentWeight, maxWeight: fromMaxWeight });
            io.to(toOwner).emit('items', { owner: toOwner, items: toUpdatedItems, currentWeight: toUpdatedCurrentWeight, maxWeight: toMaxWeight });

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'pickup', fromOwner, toOwner, item });
            }

            itemLocks.delete(itemId);
            callback({ success: true, message: 'Предмет подобран' });
        } catch (err) {
            console.error('Error picking up item:', err.message, err.stack);
            itemLocks.delete(itemId);
            callback({ success: false, message: 'Ошибка при подборе предмета' });
        }
    });

    socket.on('deleteItem', async ({ itemId }, callback) => {
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
            const itemWeight = parseFloat(item.weight) || 0;

            await Item.deleteOne({ _id: itemId });

            // Создаём предмет "Мусор", если удаляемый предмет не был "Мусором"
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

            // Обновляем кэш
            let items = itemCache.get(owner) || [];
            items = items.filter(i => i._id.toString() !== itemId);
            if (trashItem) {
                items.push(trashItem);
            }
            const currentWeight = items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
            itemCache.set(owner, items);

            // Определяем maxWeight
            let maxWeight;
            if (owner.startsWith('user_')) {
                const userId = owner.replace('user_', '');
                const user = await User.findOne({ userId });
                maxWeight = user && user.isHuman ? INVENTORY_LIMITS.HUMAN : INVENTORY_LIMITS.ANIMAL;
            } else {
                maxWeight = INVENTORY_LIMITS.LOCATION;
            }

            // Отправляем обновления клиентам
            io.to(owner).emit('items', { owner, items, currentWeight, maxWeight });

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'remove', owner, itemId });
            }

            itemLocks.delete(itemId);
            callback({ success: true, message: 'Предмет удален' });
        } catch (err) {
            console.error('Error deleting item:', err.message, err.stack);
            itemLocks.delete(itemId);
            callback({ success: false, message: 'Ошибка при удалении предмета' });
        }
    });

    socket.on('utilizeTrash', async ({ items }, callback) => {
        try {
            const owner = `user_${socket.userData.userId}`;
            const itemIds = items.map(item => item.itemId);

            // Блокируем все предметы
            for (const itemId of itemIds) {
                if (itemLocks.has(itemId)) {
                    callback({ success: false, message: 'Один из предметов уже обрабатывается' });
                    return;
                }
                itemLocks.set(itemId, true);
            }

            // Проверяем, что все предметы существуют и принадлежат владельцу
            const foundItems = await Item.find({ _id: { $in: itemIds }, owner });
            if (foundItems.length !== itemIds.length) {
                itemIds.forEach(itemId => itemLocks.delete(itemId));
                callback({ success: false, message: 'Некоторые предметы не найдены или не принадлежат вам' });
                return;
            }

            // Удаляем предметы
            await Item.deleteMany({ _id: { $in: itemIds } });

            // Обновляем кэш
            let cachedItems = itemCache.get(owner) || [];
            cachedItems = cachedItems.filter(item => !itemIds.includes(item._id.toString()));
            const currentWeight = cachedItems.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
            itemCache.set(owner, cachedItems);

            // Определяем maxWeight
            const user = await User.findOne({ userId: socket.userData.userId });
            const maxWeight = user && user.isHuman ? INVENTORY_LIMITS.HUMAN : INVENTORY_LIMITS.ANIMAL;

            // Отправляем обновления клиентам
            io.to(owner).emit('items', { owner, items: cachedItems, currentWeight, maxWeight });

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'remove', owner, itemIds });
            }

            itemIds.forEach(itemId => itemLocks.delete(itemId));
            callback({ success: true, message: 'Предметы утилизированы' });
        } catch (err) {
            console.error('Error utilizing trash:', err.message, err.stack);
            itemIds.forEach(itemId => itemLocks.delete(itemId));
            callback({ success: false, message: 'Ошибка при утилизации предметов' });
        }
    });

    // Модифицировать обработчик removeItems
    socket.on('removeItems', async ({ owner, itemIds }, callback) => {
        try {
            // Блокируем все предметы
            for (const itemId of itemIds) {
                if (itemLocks.has(itemId)) {
                    callback({ success: false, message: 'Один из предметов уже обрабатывается' });
                    return;
                }
                itemLocks.set(itemId, true);
            }

            // Проверяем, что предметы существуют и принадлежат владельцу
            const foundItems = await Item.find({ _id: { $in: itemIds }, owner });
            if (foundItems.length !== itemIds.length) {
                itemIds.forEach(itemId => itemLocks.delete(itemId));
                callback({ success: false, message: 'Некоторые предметы не найдены или не принадлежат владельцу' });
                return;
            }

            // Удаляем предметы
            await Item.deleteMany({ _id: { $in: itemIds } });

            // Обновляем кэш
            let items = itemCache.get(owner) || [];
            items = items.filter(item => !itemIds.includes(item._id.toString()));
            const currentWeight = items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
            itemCache.set(owner, items);

            // Определяем maxWeight
            let maxWeight;
            if (owner.startsWith('user_')) {
                const userId = owner.replace('user_', '');
                const user = await User.findOne({ userId });
                maxWeight = user && user.isHuman ? INVENTORY_LIMITS.HUMAN : INVENTORY_LIMITS.ANIMAL;
            } else {
                maxWeight = INVENTORY_LIMITS.LOCATION;
            }

            // Отправляем обновления клиентам
            io.to(owner).emit('items', { owner, items, currentWeight, maxWeight });

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'remove', owner, itemIds });
            }

            itemIds.forEach(itemId => itemLocks.delete(itemId));
            callback({ success: true, message: 'Предметы удалены' });
        } catch (err) {
            console.error('Error removing items:', err.message, err.stack);
            itemIds.forEach(itemId => itemLocks.delete(itemId));
            callback({ success: false, message: 'Ошибка при удалении предметов' });
        }
    });
}

module.exports = { registerInventoryHandlers };
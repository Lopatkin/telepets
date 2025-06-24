const userLastAction = new Map(); // Для хранения времени последнего действия пользователя
const MIN_ACTION_INTERVAL = 1000; // Минимальный интервал между действиями (1 секунда)

const { INVENTORY_WEIGHT_LIMIT } = require('../../src/components/constants/settings');

// Функция для вычисления текущего веса инвентаря
const calculateInventoryWeight = async (Item, owner) => {
    const items = await Item.find({ owner });
    return items.reduce((total, item) => total + (parseFloat(item.weight) || 0), 0);
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
            socket.emit('items', { owner, items });
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

            // Определяем эффекты предметов
            const itemEffects = {
                'Лесные ягоды': {
                    health: Math.floor(Math.random() * 16) - 5, // от -5 до +10
                    mood: Math.floor(Math.random() * 16) - 5,   // от -5 до +10
                    satiety: Math.floor(Math.random() * 16) - 5 // от -5 до +10
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

            // Обновляем характеристики игрока
            const updatedStats = {
                health: Math.min(Math.max(user.stats.health + (effect.health || 0), 0), user.stats.maxHealth),
                mood: Math.min(Math.max(user.stats.mood + (effect.mood || 0), 0), user.stats.maxMood),
                satiety: Math.min(Math.max(user.stats.satiety + (effect.satiety || 0), 0), user.stats.maxSatiety),
                energy: Math.min(Math.max(user.stats.energy + (effect.energy || 0), 0), user.stats.maxEnergy) // Добавляем обновление энергии
            };

            // Обновляем пользователя в базе данных
            await User.updateOne(
                { userId },
                {
                    $set: {
                        'stats.health': updatedStats.health,
                        'stats.mood': updatedStats.mood,
                        'stats.satiety': updatedStats.satiety,
                        'stats.energy': updatedStats.energy // Добавляем обновление энергии
                    }
                }
            );

            // Удаляем использованный предмет
            await Item.deleteOne({ _id: itemId });

            // Обновляем кэш
            const ownerItems = itemCache.get(owner) || [];
            const updatedItems = ownerItems.filter(i => i._id.toString() !== itemId);
            itemCache.set(owner, updatedItems);

            // Получаем обновленного пользователя
            const updatedUser = await User.findOne({ userId });

            // Отправляем userUpdate
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
                exp: updatedUser.exp || 0,
                onLeash: updatedUser.onLeash,
                freeRoam: updatedUser.freeRoam || false,
                stats: updatedUser.stats
            });

            // Отправляем обновленный список предметов
            io.to(owner).emit('items', { owner, items: updatedItems });
            const currentRoom = userCurrentRoom.get(userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'remove', owner, itemId });
                io.to(currentRoom).emit('items', { owner, items: updatedItems });
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

    socket.on('addItem', async ({ owner, item }, callback) => {
        try {
            // console.log('Received item data:', { owner, item });
            if (!item || typeof item !== 'object') {
                console.error('Invalid item data:', item);
                if (callback) callback({ success: false, message: 'Некорректные данные предмета' });
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

            // Проверка лимита веса
            const currentWeight = await calculateInventoryWeight(Item, owner);
            const newItemWeight = parseFloat(item.weight) || 0;
            const isUserInventory = owner.startsWith('user_');
            const weightLimit = isUserInventory
                ? (await User.findOne({ userId: owner.replace('user_', '') }))?.isHuman
                    ? INVENTORY_WEIGHT_LIMIT.human
                    : INVENTORY_WEIGHT_LIMIT.animal
                : INVENTORY_WEIGHT_LIMIT.location;

            if (currentWeight + newItemWeight > weightLimit) {
                if (callback) callback({ success: false, message: 'Превышен лимит веса инвентаря' });
                return;
            }

            if (item._id) {
                itemLocks.set(item._id, true);
            }

            const newItem = await Item.create({ owner, ...item });
            // console.log('Saved item:', newItem);

            const ownerItems = itemCache.get(owner) || [];
            itemCache.set(owner, [...ownerItems, newItem]);

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'add', owner, item: newItem });
                io.to(currentRoom).emit('items', { owner, items: itemCache.get(owner) });
            }

            io.to(owner).emit('items', { owner, items: itemCache.get(owner) });

            // Добавляем логику для уменьшения энергии и начисления опыта
            const energyConsumingItems = ['Палка', 'Лесные ягоды', 'Лесные грибы'];
            if (energyConsumingItems.includes(item.name)) {
                const userId = owner.replace('user_', '');
                const user = await User.findOne({ userId });
                if (user) {
                    const newEnergy = Math.max(user.stats.energy - 1, 0); // Уменьшаем энергию на 1, но не ниже 0
                    // Начисляем случайное количество опыта (от 1 до 5) за указанные предметы
                    const expGain = Math.floor(Math.random() * 5) + 1; // Случайное число от 1 до 5
                    const newExp = (user.exp || 0) + expGain;

                    await User.updateOne(
                        { userId },
                        {
                            $set: {
                                'stats.energy': newEnergy,
                                exp: newExp
                            }
                        }
                    );
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
                        exp: updatedUser.exp || 0,
                        onLeash: updatedUser.onLeash,
                        freeRoam: updatedUser.freeRoam || false,
                        stats: updatedUser.stats
                    });
                }
            }

            if (callback) callback({ success: true, item: newItem, expGain: expGain || 0 }); // Добавляем expGain в ответ
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

            // Проверка лимита веса для нового владельца
            const currentWeight = await calculateInventoryWeight(Item, newOwner);
            const itemsWeight = items.reduce((total, item) => total + (parseFloat(item.weight) || 0), 0);
            const isNewOwnerUser = newOwner.startsWith('user_');
            const weightLimit = isNewOwnerUser
                ? (await User.findOne({ userId: newOwner.replace('user_', '') }))?.isHuman
                    ? INVENTORY_WEIGHT_LIMIT.human
                    : INVENTORY_WEIGHT_LIMIT.animal
                : INVENTORY_WEIGHT_LIMIT.location;

            if (currentWeight + itemsWeight > weightLimit) {
                socket.emit('error', { message: 'Превышен лимит веса инвентаря' });
                return;
            }

            const oldOwner = items[0].owner;

            await Item.updateMany({ _id: { $in: ids } }, { owner: newOwner });

            const updatedItems = await Item.find({ _id: { $in: ids } });
            updatedItems.forEach(item => {
                const cachedOldOwnerItems = itemCache.get(oldOwner) || [];
                itemCache.set(oldOwner, cachedOldOwnerItems.filter(i => i._id.toString() !== item._id.toString()));
                const cachedNewOwnerItems = itemCache.get(newOwner) || [];
                itemCache.set(newOwner, [...cachedNewOwnerItems, item]);
            });

            io.to(oldOwner).emit('items', { owner: oldOwner, items: itemCache.get(oldOwner) });
            io.to(newOwner).emit('items', { owner: newOwner, items: itemCache.get(newOwner) });

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'remove', owner: oldOwner, itemId: ids });
                io.to(currentRoom).emit('itemAction', { action: 'add', owner: newOwner, item: updatedItems[0] });
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

            // Проверка лимита веса личного инвентаря
            const currentWeight = await calculateInventoryWeight(Item, userOwnerKey);
            const itemWeight = parseFloat(item.weight) || 0;
            const user = await User.findOne({ userId: socket.userData.userId });
            const weightLimit = user.isHuman ? INVENTORY_WEIGHT_LIMIT.human : INVENTORY_WEIGHT_LIMIT.animal;

            if (currentWeight + itemWeight > weightLimit) {
                itemLocks.delete(itemId);
                socket.emit('error', { message: 'Превышен лимит веса личного инвентаря' });
                return;
            }

            item.owner = userOwnerKey;
            await item.save();

            const oldOwnerItems = itemCache.get(oldOwner) || [];
            itemCache.set(oldOwner, oldOwnerItems.filter(i => i._id.toString() !== itemId));
            const userItems = itemCache.get(userOwnerKey) || [];
            itemCache.set(userOwnerKey, [...userItems, item]);

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'remove', owner: oldOwner, itemId });
                io.to(currentRoom).emit('itemAction', { action: 'add', owner: userOwnerKey, item });
                io.to(currentRoom).emit('items', { owner: oldOwner, items: itemCache.get(oldOwner) });
                io.to(currentRoom).emit('items', { owner: userOwnerKey, items: itemCache.get(userOwnerKey) });
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

            await Item.deleteOne({ _id: itemId });

            let trashItem = null;
            if (item.name !== 'Мусор') {
                trashItem = new Item({
                    name: 'Мусор',
                    description: 'Раньше это было чем-то полезным',
                    rarity: 'Бесполезный',
                    weight: item.weight,
                    cost: 1,
                    effect: 'Чувство обременения чем-то бесполезным',
                    owner: owner
                });
                await trashItem.save();
                // console.log('Created trash item:', trashItem);
            }

            const ownerItems = itemCache.get(owner) || [];
            itemCache.set(owner, ownerItems.filter(i => i._id.toString() !== itemId).concat(trashItem ? [trashItem] : []));

            const updatedItems = await Item.find({ owner });
            // console.log('Sending updated items after delete:', updatedItems);
            io.to(owner).emit('items', { owner, items: updatedItems });

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

            let totalCredits = 0;
            for (const item of trashItems) {
                totalCredits += parseFloat(item.cost) || 0;
                await Item.deleteOne({ _id: item._id });
            }

            const creditsEarned = Math.floor(totalCredits);

            const user = await User.findOneAndUpdate(
                { userId: socket.userData.userId },
                { $inc: { credits: totalCredits } },
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
            // console.log('Trash items deleted for:', owner);
            // console.log('Credits earned:', creditsEarned);
            // console.log('Sending updated items:', updatedItems);
            io.to(owner).emit('items', { owner, items: updatedItems });

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

            // Проверка интервала между действиями
            const now = Date.now();
            const lastActionTime = userLastAction.get(owner) || 0;
            if (now - lastActionTime < MIN_ACTION_INTERVAL) {
                socket.emit('error', { message: 'Слишком частые действия, подождите' });
                return;
            }
            userLastAction.set(owner, now); // Обновляем время последнего действия

            const items = await Item.find({ owner, name }).limit(count);

            if (items.length < count) {
                socket.emit('error', { message: `Недостаточно предметов "${name}" для удаления` });
                return;
            }

            const itemIds = items.map(item => item._id);

            await Item.deleteMany({ _id: { $in: itemIds } });

            const updatedItems = await Item.find({ owner });
            itemCache.set(owner, updatedItems);

            io.to(owner).emit('items', { owner, items: updatedItems });

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'remove', owner, itemIds });
                io.to(currentRoom).emit('items', { owner, items: updatedItems });
            }
        } catch (err) {
            console.error('Error removing items:', err.message, err.stack);
            socket.emit('error', { message: 'Ошибка при удалении предметов' });
        }
    });

    socket.on('craftItem', async ({ owner, craftedItem, materials }, callback) => {
        try {
            // console.log('Received craftItem data:', { owner, craftedItem, materials });
            if (!craftedItem || typeof craftedItem !== 'object' || !materials || typeof materials !== 'object') {
                // console.error('Invalid craftItem data:', { craftedItem, materials });
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

            // Проверка лимита веса
            const currentWeight = await calculateInventoryWeight(Item, owner);
            const newItemWeight = parseFloat(craftedItem.weight) || 0;
            const isUserInventory = owner.startsWith('user_');
            const weightLimit = isUserInventory
                ? (await User.findOne({ userId: owner.replace('user_', '') }))?.isHuman
                    ? INVENTORY_WEIGHT_LIMIT.human
                    : INVENTORY_WEIGHT_LIMIT.animal
                : INVENTORY_WEIGHT_LIMIT.location;

            if (currentWeight + newItemWeight > weightLimit) {
                if (callback) callback({ success: false, message: 'Превышен лимит веса инвентаря' });
                return;
            }

            // Удаление материалов
            const stickIds = stickItems.map(item => item._id);
            const boardIds = boardItems.map(item => item._id);
            await Item.deleteMany({ _id: { $in: [...stickIds, ...boardIds] } });

            // Создание нового предмета
            const newItem = await Item.create({ owner, ...craftedItem });
            // console.log('Crafted item:', newItem);

            // Обновление кэша
            const ownerItems = itemCache.get(owner) || [];
            const updatedItems = ownerItems
                .filter(i => !stickIds.includes(i._id) && !boardIds.includes(i._id))
                .concat([newItem]);
            itemCache.set(owner, updatedItems);

            // Уведомление клиентов
            io.to(owner).emit('items', { owner, items: updatedItems });

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'remove', owner, itemIds: [...stickIds, ...boardIds] });
                io.to(currentRoom).emit('itemAction', { action: 'add', owner, item: newItem });
                io.to(currentRoom).emit('items', { owner, items: updatedItems });
            }

            if (callback) callback({ success: true, item: newItem });
        } catch (err) {
            console.error('Error crafting item:', err.message, err.stack);
            if (callback) callback({ success: false, message: 'Ошибка при создании предмета' });
        }
    });
}

module.exports = { registerInventoryHandlers };
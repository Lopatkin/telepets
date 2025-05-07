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
        console.log('Server: getItems requested for owner:', owner); // Отладка
        try {
            const items = await Item.find({ owner });
            console.log('Server: sending items:', items); // Отладка
            socket.emit('items', { owner, items });
        } catch (err) {
            console.error('Error fetching items:', err.message, err.stack);
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
            console.log('Received item data:', { owner, item });
            if (!item || typeof item !== 'object') {
                console.error('Invalid item data:', item);
                if (callback) callback({ success: false, message: 'Некорректные данные предмета' });
                return;
            }

            if (item._id) {
                itemLocks.set(item._id, true);
            }

            const ownerLimit = await InventoryLimit.findOne({ owner });
            if (!ownerLimit) {
                if (item._id) itemLocks.delete(item._id);
                if (callback) callback({ success: false, message: 'Лимиты инвентаря не найдены' });
                return;
            }

            const itemWeight = parseFloat(item.weight) || 0;
            if (ownerLimit.currentWeight + itemWeight > ownerLimit.maxWeight) {
                if (item._id) itemLocks.delete(item._id);
                if (callback) callback({ success: false, message: 'Превышен лимит веса' });
                return;
            }

            const newItem = await Item.create({ owner, ...item });
            console.log('Saved item:', newItem);

            await InventoryLimit.updateOne(
                { owner },
                { $inc: { currentWeight: itemWeight } }
            );

            const ownerItems = itemCache.get(owner) || [];
            itemCache.set(owner, [...ownerItems, newItem]);

            const updatedLimit = await InventoryLimit.findOne({ owner });
            socket.emit('inventoryLimit', updatedLimit);

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'add', owner, item: newItem });
                io.to(currentRoom).emit('items', { owner, items: itemCache.get(owner) });
                io.to(currentRoom).emit('inventoryLimit', updatedLimit);
            }

            io.to(owner).emit('items', { owner, items: itemCache.get(owner) });

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
            const totalWeight = items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);

            const newOwnerLimit = await InventoryLimit.findOne({ owner: newOwner });
            if (!newOwnerLimit || newOwnerLimit.currentWeight + totalWeight > newOwnerLimit.maxWeight) {
                socket.emit('error', { message: 'Превышен лимит веса в месте назначения' });
                return;
            }

            await Item.updateMany({ _id: { $in: ids } }, { owner: newOwner });
            await InventoryLimit.updateOne({ owner: oldOwner }, { $inc: { currentWeight: -totalWeight } });
            await InventoryLimit.updateOne({ owner: newOwner }, { $inc: { currentWeight: totalWeight } });

            const updatedItems = await Item.find({ _id: { $in: ids } });
            updatedItems.forEach(item => {
                const cachedOldOwnerItems = itemCache.get(oldOwner) || [];
                itemCache.set(oldOwner, cachedOldOwnerItems.filter(i => i._id.toString() !== item._id.toString()));
                const cachedNewOwnerItems = itemCache.get(newOwner) || [];
                itemCache.set(newOwner, [...cachedNewOwnerItems, item]);
            });

            const oldOwnerLimit = await InventoryLimit.findOne({ owner: oldOwner });
            const newOwnerLimitUpdated = await InventoryLimit.findOne({ owner: newOwner });

            socket.emit('inventoryLimit', oldOwnerLimit);
            socket.emit('inventoryLimit', newOwnerLimitUpdated);
            io.to(oldOwner).emit('items', { owner: oldOwner, items: itemCache.get(oldOwner) });
            io.to(newOwner).emit('items', { owner: newOwner, items: itemCache.get(newOwner) });

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'remove', owner: oldOwner, itemId: ids });
                io.to(currentRoom).emit('itemAction', { action: 'add', owner: newOwner, item: updatedItems[0] });
                io.to(currentRoom).emit('inventoryLimit', oldOwnerLimit);
                io.to(currentRoom).emit('inventoryLimit', newOwnerLimitUpdated);
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

            const userLimit = await InventoryLimit.findOne({ owner: userOwnerKey });
            if (userLimit.currentWeight + itemWeight > userLimit.maxWeight) {
                itemLocks.delete(itemId);
                socket.emit('error', { message: 'Превышен лимит веса у пользователя' });
                return;
            }

            const oldOwnerLimit = await InventoryLimit.findOne({ owner: oldOwner });
            if (!oldOwnerLimit) {
                itemLocks.delete(itemId);
                socket.emit('error', { message: 'Лимиты инвентаря не найдены' });
                return;
            }

            item.owner = userOwnerKey;
            await item.save();

            await InventoryLimit.updateOne(
                { owner: oldOwner },
                { $inc: { currentWeight: -itemWeight } }
            );
            await InventoryLimit.updateOne(
                { owner: userOwnerKey },
                { $inc: { currentWeight: itemWeight } }
            );

            const oldOwnerItems = itemCache.get(oldOwner) || [];
            itemCache.set(oldOwner, oldOwnerItems.filter(i => i._id.toString() !== itemId));
            const userItems = itemCache.get(userOwnerKey) || [];
            itemCache.set(userOwnerKey, [...userItems, item]);

            const updatedOldLimit = await InventoryLimit.findOne({ owner: oldOwner });
            const updatedUserLimit = await InventoryLimit.findOne({ owner: userOwnerKey });
            socket.emit('inventoryLimit', updatedOldLimit);
            socket.emit('inventoryLimit', updatedUserLimit);

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'remove', owner: oldOwner, itemId });
                io.to(currentRoom).emit('itemAction', { action: 'add', owner: userOwnerKey, item });
                io.to(currentRoom).emit('items', { owner: oldOwner, items: itemCache.get(oldOwner) });
                io.to(currentRoom).emit('items', { owner: userOwnerKey, items: itemCache.get(userOwnerKey) });
                io.to(currentRoom).emit('inventoryLimit', updatedOldLimit);
                io.to(currentRoom).emit('inventoryLimit', updatedUserLimit);
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

            await InventoryLimit.updateOne(
                { owner },
                { $inc: { currentWeight: trashItem ? 0 : -itemWeight } }
            );

            const ownerItems = itemCache.get(owner) || [];
            itemCache.set(owner, ownerItems.filter(i => i._id.toString() !== itemId).concat(trashItem ? [trashItem] : []));

            const updatedLimit = await InventoryLimit.findOne({ owner });
            socket.emit('inventoryLimit', updatedLimit);

            const updatedItems = await Item.find({ owner });
            console.log('Sending updated items after delete:', updatedItems);
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

            let totalWeight = 0;
            let totalCredits = 0;
            for (const item of trashItems) {
                totalWeight += parseFloat(item.weight) || 0;
                totalCredits += parseFloat(item.cost) || 0;
                await Item.deleteOne({ _id: item._id });
            }

            const creditsEarned = Math.floor(totalCredits);

            await InventoryLimit.updateOne(
                { owner },
                { $inc: { currentWeight: -totalWeight } }
            );

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
            console.log('Trash items deleted for:', owner);
            console.log('Credits earned:', creditsEarned);
            console.log('Sending updated items:', updatedItems);
            io.to(owner).emit('items', { owner, items: updatedItems });

            const updatedLimit = await InventoryLimit.findOne({ owner });
            io.to(owner).emit('inventoryLimit', updatedLimit);

            if (callback) callback({ success: true, message: `Мусор утилизирован. Получено ${creditsEarned} кредитов.` });
        } catch (err) {
            console.error('Error utilizing trash:', err.message, err.stack);
            if (callback) callback({ success: false, message: 'Ошибка при утилизации мусора' });
        }
    });

    socket.on('removeItems', async (data) => {
        try {
            const { owner, name, count } = data;
            const items = await Item.find({ owner, name }).limit(count);

            if (items.length < count) {
                socket.emit('error', { message: `Недостаточно предметов "${name}" для удаления` });
                return;
            }

            const itemIds = items.map(item => item._id);
            const totalWeight = items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);

            await Item.deleteMany({ _id: { $in: itemIds } });

            await InventoryLimit.updateOne(
                { owner },
                { $inc: { currentWeight: -totalWeight } }
            );

            const updatedItems = await Item.find({ owner });
            itemCache.set(owner, updatedItems);

            const updatedLimit = await InventoryLimit.findOne({ owner });
            io.to(owner).emit('items', { owner, items: updatedItems });
            io.to(owner).emit('inventoryLimit', updatedLimit);

            const currentRoom = userCurrentRoom.get(socket.userData.userId);
            if (currentRoom) {
                io.to(currentRoom).emit('itemAction', { action: 'remove', owner, itemIds });
                io.to(currentRoom).emit('items', { owner, items: updatedItems });
                io.to(currentRoom).emit('inventoryLimit', updatedLimit);
            }
        } catch (err) {
            console.error('Error removing items:', err.message, err.stack);
            socket.emit('error', { message: 'Ошибка при удалении предметов' });
        }
    });
}

module.exports = { registerInventoryHandlers };
const { rooms } = require('../../src/components/constants/rooms.js');

function registerUserHandlers({
    io,
    socket,
    User,
    Message,
    Item,
    InventoryLimit,
    roomUsers,
    userCurrentRoom,
    activeSockets,
    itemCache
}) {
    socket.on('auth', async (userData, callback) => {
        if (!userData || !userData.userId) {
            console.error('Invalid user data:', userData);
            if (callback) callback({ success: false, message: 'Некорректные данные пользователя' });
            return;
        }

        let user = await User.findOne({ userId: userData.userId });
        if (!user) {
            user = new User({
                userId: userData.userId.toString(),
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                username: userData.username || '',
                photoUrl: userData.photoUrl || '',
                isRegistered: false,
                lastRoom: 'Полигон утилизации',
                owner: userData.owner || null
            });
            await user.save();
            console.log('New user created:', user.userId);
        }

        socket.userData = {
            userId: user.userId,
            firstName: user.firstName,
            username: user.username,
            lastName: user.lastName,
            photoUrl: user.photoUrl,
            name: user.name,
            isHuman: user.isHuman,
            animalType: user.animalType,
            owner: user.owner,
            homeless: user.homeless
        };
        console.log('Received auth data:', userData);
        console.log('Authenticated user:', socket.userData.userId, 'PhotoURL:', socket.userData.photoUrl);

        if (activeSockets.has(socket.userData.userId)) {
            console.log(`User ${socket.userData.userId} already connected with socket ${activeSockets.get(socket.userData.userId)}. Disconnecting old socket.`);
            const oldSocket = activeSockets.get(socket.userData.userId);
            oldSocket.disconnect();
        }

        activeSockets.set(socket.userData.userId, socket);

        let ownerOnline = false;
        if (user && user.onLeash && user.owner) {
            ownerOnline = activeSockets.has(user.owner);
        }

        socket.emit('userUpdate', {
            userId: user.userId,
            firstName: user.firstName,
            username: user.username,
            lastName: user.lastName,
            photoUrl: user.photoUrl,
            isRegistered: user.isRegistered,
            isHuman: user.isHuman,
            animalType: user.animalType,
            name: user.name,
            onLeash: user.onLeash,
            owner: user.owner,
            ownerOnline,
            homeless: user.homeless,
            credits: user.credits || 0,
            freeRoam: user.freeRoam || false
        });
        console.log('Sent userUpdate on auth with photoUrl:', user.photoUrl);

        const userOwnerKey = `user_${socket.userData.userId}`;
        const myHomeOwnerKey = `myhome_${socket.userData.userId}`;

        const userLimit = await InventoryLimit.findOne({ owner: userOwnerKey });
        if (!userLimit) {
            await InventoryLimit.create({
                owner: userOwnerKey,
                maxWeight: 40
            });
            const stick = new Item({
                name: 'Палка',
                description: 'Многофункциональная вещь',
                rarity: 'Обычный',
                weight: 1,
                cost: 5,
                effect: 'Вы чувствуете себя более уверенно в тёмное время суток',
                owner: userOwnerKey
            });
            await stick.save();
            await InventoryLimit.updateOne(
                { owner: userOwnerKey },
                { $inc: { currentWeight: 1 } }
            );
        }

        const myHomeLimit = await InventoryLimit.findOne({ owner: myHomeOwnerKey });
        if (!myHomeLimit) {
            await InventoryLimit.create({
                owner: myHomeOwnerKey,
                maxWeight: 500
            });
        }

        const workshopLimit = await InventoryLimit.findOne({ owner: 'Мастерская' });
        if (!workshopLimit) {
            await InventoryLimit.create({
                owner: 'Мастерская',
                maxWeight: 1000
            });
        }

        for (const room of rooms) {
            const roomLimit = await InventoryLimit.findOne({ owner: room });
            if (!roomLimit) {
                await InventoryLimit.create({
                    owner: room,
                    maxWeight: 10000,
                });
            }
        }

        console.log('Available static rooms:', rooms);
        console.log('Received lastRoom:', userData.lastRoom);

        const defaultRoom = user.isRegistered ? (user.lastRoom || 'Полигон утилизации') : 'Автобусная остановка';
        console.log('Выбрана стартовая комната:', defaultRoom);

        socket.join(defaultRoom);
        userCurrentRoom.set(socket.userData.userId, defaultRoom);

        if (!roomUsers[defaultRoom]) roomUsers[defaultRoom] = new Set();
        roomUsers[defaultRoom].forEach(user => {
            if (user.userId === socket.userData.userId) {
                roomUsers[defaultRoom].delete(user);
            }
        });

        roomUsers[defaultRoom].add({
            userId: socket.userData.userId,
            firstName: socket.userData.firstName,
            username: socket.userData.username,
            lastName: socket.userData.lastName,
            photoUrl: socket.userData.photoUrl,
            name: user.name,
            isHuman: user.isHuman,
            onLeash: user.onLeash,
            owner: user.owner,
            homeless: user.homeless
        });

        io.to(defaultRoom).emit('roomUsers', Array.from(roomUsers[defaultRoom]));
        console.log(`User ${socket.userData.userId} auto-joined room: ${defaultRoom}`);

        try {
            const messages = await Message.find({ room: defaultRoom }).sort({ timestamp: 1 }).limit(100);
            socket.emit('messageHistory', messages);
        } catch (err) {
            console.error('Error fetching messages for default room:', err.message, err.stack);
            socket.emit('error', { message: 'Ошибка при загрузке сообщений' });
        }

        socket.emit('authSuccess', { defaultRoom, isRegistered: user.isRegistered });
        if (callback) callback({ success: true });
    });

    socket.on('completeRegistration', async (data, callback) => {
        try {
            const user = await User.findOneAndUpdate(
                { userId: data.userId },
                {
                    isRegistered: true,
                    isHuman: data.isHuman,
                    formerProfession: data.formerProfession,
                    residence: data.residence,
                    animalType: data.animalType,
                    name: data.name,
                    photoUrl: data.photoUrl || socket.userData.photoUrl || '',
                    homeless: data.isHuman ? false : true,
                    owner: data.isHuman ? undefined : data.owner
                },
                { new: true }
            );
            if (!user) {
                socket.emit('error', { message: 'User not found' });
                if (callback) callback({ success: false });
                return;
            }
            console.log('Registration completed for user:', user.userId, 'with photoUrl:', user.photoUrl);

            if (!data.isHuman && data.photoUrl) {
                socket.userData.photoUrl = data.photoUrl;
                console.log('Updated socket.userData.photoUrl for animal:', socket.userData.photoUrl);
            }
            if (!data.isHuman && data.name) {
                socket.userData.name = data.name;
            }
            if (!data.isHuman && data.owner !== undefined) {
                socket.userData.owner = data.owner;
            }

            socket.userData.homeless = user.homeless;

            const defaultRoom = 'Автобусная остановка';
            socket.join(defaultRoom);
            userCurrentRoom.set(user.userId, defaultRoom);

            if (!roomUsers[defaultRoom]) roomUsers[defaultRoom] = new Set();
            roomUsers[defaultRoom].forEach(u => {
                if (u.userId === user.userId) {
                    roomUsers[defaultRoom].delete(u);
                }
            });

            roomUsers[defaultRoom].add({
                userId: user.userId,
                firstName: user.firstName,
                username: user.username,
                lastName: user.lastName,
                photoUrl: user.photoUrl,
                name: user.name,
                isHuman: user.isHuman,
                onLeash: user.onLeash,
                owner: user.owner,
                homeless: user.homeless
            });

            io.to(defaultRoom).emit('roomUsers', Array.from(roomUsers[defaultRoom]));
            console.log(`User ${user.userId} joined room after registration: ${defaultRoom}`);

            try {
                const messages = await Message.find({ room: defaultRoom }).sort({ timestamp: 1 }).limit(100);
                socket.emit('messageHistory', messages);
            } catch (err) {
                console.error('Error fetching messages after registration:', err.message, err.stack);
                socket.emit('error', { message: 'Ошибка при загрузке сообщений' });
            }

            socket.emit('userUpdate', {
                userId: user.userId,
                firstName: user.firstName,
                username: user.username,
                lastName: user.lastName,
                photoUrl: user.photoUrl,
                isRegistered: user.isRegistered,
                isHuman: user.isHuman,
                animalType: user.animalType,
                name: user.name,
                owner: user.owner,
                homeless: user.homeless
            });
            console.log('Sent userUpdate with photoUrl:', user.photoUrl);

            if (callback) callback({ success: true });
        } catch (err) {
            console.error('Registration error:', err.message, err.stack);
            socket.emit('error', { message: 'Registration failed' });
            if (callback) callback({ success: false });
        }
    });

    socket.on('getCredits', async (data, callback = () => { }) => {
        if (!socket.userData || !socket.userData.userId) {
            callback({ success: false, message: 'Пользователь не аутентифицирован' });
            return;
        }

        try {
            const user = await User.findOne({ userId: socket.userData.userId });
            callback({
                success: true,
                credits: user?.credits || 0
            });
        } catch (err) {
            console.error('Error fetching credits:', err.message);
            callback({ success: false, message: 'Ошибка при получении кредитов' });
        }
    });

    socket.on('spendCredits', async ({ amount, purpose }, callback = () => { }) => {
        try {
            const user = await User.findOneAndUpdate(
                {
                    userId: socket.userData.userId,
                    credits: { $gte: amount }
                },
                { $inc: { credits: -amount } },
                { new: true }
            );

            if (user) {
                socket.emit('userUpdate', {
                    userId: user.userId,
                    credits: user.credits
                });
            }

            if (!user) {
                return callback({
                    success: false,
                    message: 'Недостаточно кредитов или пользователь не найден'
                });
            }

            socket.emit('userUpdate', {
                userId: user.userId,
                credits: user.credits
            });

            callback({
                success: true,
                newBalance: user.credits
            });
        } catch (err) {
            console.error('Ошибка при списании кредитов:', err);
            callback({ success: false, message: 'Ошибка сервера' });
        }
    });

    socket.on('getPets', async ({ userId }) => {
        try {
            const pets = await User.find({ owner: userId, isHuman: false }).select('userId name animalType photoUrl onLeash owner');
            socket.emit('petsList', pets);
        } catch (err) {
            console.error('Error fetching pets:', err);
            socket.emit('error', { message: 'Ошибка при загрузке питомцев' });
        }
    });

    socket.on('getShelterAnimals', async () => {
        if (!socket.userData || !socket.userData.userId) {
            socket.emit('error', { message: 'Пользователь не аутентифицирован' });
            return;
        }

        const currentRoom = userCurrentRoom.get(socket.userData.userId);
        if (currentRoom !== 'Приют для животных "Кошкин дом"') {
            socket.emit('error', { message: 'Вы не в приюте для животных' });
            return;
        }

        try {
            const shelterAnimals = await User.find({
                lastRoom: 'Приют для животных "Кошкин дом"',
                homeless: true,
                onLeash: false,
                isHuman: false,
                owner: null
            }).select('userId name photoUrl lastActivity isHuman animalType owner');

            const now = new Date();
            const animalsWithStatus = shelterAnimals.map(animal => ({
                userId: animal.userId,
                name: animal.name,
                photoUrl: animal.photoUrl,
                isOnline: (now - new Date(animal.lastActivity || 0)) < 5 * 60 * 1000,
                animalType: animal.animalType,
                owner: animal.owner,
                homeless: animal.homeless
            }));

            socket.emit('shelterAnimals', animalsWithStatus);
        } catch (err) {
            console.error('Error fetching shelter animals:', err.message, err.stack);
            socket.emit('error', { message: 'Ошибка при загрузке списка животных' });
        }
    });
}

module.exports = { registerUserHandlers };
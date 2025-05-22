const { rooms } = require('../../src/components/constants/rooms.js');

// Заменяем константу walkMessages на три отдельных массива для разных типов игроков
const humanMessages = [
    'Прогулялся по парку, размышляя о жизни.',
    'Зашёл в кафе и выпил чашку кофе.',
    'Поболтал с уличным торговцем о погоде.',
    'Помог старушке донести сумку до дома.',
    'Увидел афишу нового фильма в кинотеатре.',
    'Прочитал объявление о местном фестивале.',
    'Сфотографировал красивый закат на телефон.',
    'Понаблюдал за уличными артистами на площади.',
    'Купил свежую булочку в пекарне.',
    'Погладил дружелюбную собаку прохожего.'
];

const catMessages = [
    'Погнался за бабочкой в парке, но не поймал.',
    'Залез на дерево и наблюдал за птицами.',
    'Лениво грелся на тёплой крыше.',
    'Нашёл укромный уголок и вздремнул.',
    'Поиграл с листочком, который гонял ветер.',
    'Попытался поймать солнечный зайчик.',
    'Тёрся о ноги прохожего, выпрашивая еду.',
    'Исследовал мусорный бак в поисках вкусного.',
    'Устроил засаду на голубя, но он улетел.',
    'Ловко запрыгнул на высокий забор.'
];

const dogMessages = [
    'Побегал за мячом, который бросил прохожий.',
    'Понюхал все кусты в парке.',
    'Весело тявкнул на пробегающую кошку.',
    'Нашёл старую кость и погрыз её.',
    'Повалялся в траве, наслаждаясь солнцем.',
    'Радостно поприветствовал другого пса.',
    'Побегал за своим хвостом от скуки.',
    'Копал яму в поисках чего-то интересного.',
    'Увидел белку и попытался её догнать.',
    'Лизнул руку доброму прохожему.'
];

// Функция для получения случайного сообщения в зависимости от типа игрока
const getRandomWalkMessage = (user) => {
    const messages = user.isHuman ? humanMessages : user.animalType === 'Кошка' ? catMessages : dogMessages;
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
};

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
                owner: userData.owner || null,
                diary: [] // Инициализируем пустой diary
            });
            await user.save();
            console.log('New user created:', user.userId);
        }

        // В функции registerUserHandlers, замените блок кода, связанный с созданием записей в diary, на следующий:
        // Расчёт времени отсутствия и добавление записей в diary
        const now = new Date();
        const lastActivity = user.lastActivity || now;
        const hoursPassed = Math.floor((now - lastActivity) / (1000 * 60 * 60)); // Кол-во полных часов

        if (hoursPassed > 0) {
            const diaryEntries = [];
            const freeWill = user.stats?.freeWill || 0; // Получаем freeWill, по умолчанию 0
            for (let i = 0; i < hoursPassed; i++) {
                // Генерируем случайное число от 0 до 100
                const chance = Math.random() * 100;
                if (chance <= freeWill) { // Создаём запись, если шанс меньше или равен freeWill
                    // Генерируем случайное время в пределах часа
                    const randomMinutes = Math.floor(Math.random() * 60);
                    const entryTime = new Date(lastActivity.getTime() + (i * 60 * 60 * 1000) + (randomMinutes * 60 * 1000));
                    diaryEntries.push({
                        timestamp: entryTime,
                        message: getRandomWalkMessage(user) // Используем сообщение в зависимости от типа игрока
                    });
                }
            }
            // Добавляем записи в diary, если они есть
            if (diaryEntries.length > 0) {
                await User.updateOne(
                    { userId: user.userId },
                    {
                        $push: { diary: { $each: diaryEntries } },
                        $set: { lastActivity: now } // Обновляем lastActivity
                    }
                );
                console.log(`Added ${diaryEntries.length} diary entries for user ${user.userId}`);
            } else {
                // Обновляем lastActivity, даже если записей нет
                await User.updateOne(
                    { userId: user.userId },
                    { $set: { lastActivity: now } }
                );
            }
            user = await User.findOne({ userId: user.userId }); // Обновляем user после изменений
        } else {
            // Обновляем lastActivity, если не прошло полного часа
            await User.updateOne(
                { userId: user.userId },
                { $set: { lastActivity: now } }
            );
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
            freeRoam: user.freeRoam || false,
            stats: user.stats,
            diary: user.diary // Отправляем diary клиенту
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

    // Остальной код остаётся без изменений
    socket.on('completeRegistration', async (data, callback) => {
        try {
            const {
                userId,
                isHuman,
                formerProfession,
                residence,
                animalType,
                name,
                photoUrl,
                owner,
                stats,
                isRegistered
            } = data;

            console.log('Получены данные регистрации:', data);

            const maxStats = isHuman
                ? { maxHealth: 100, maxEnergy: 100, maxMood: 100, maxSatiety: 100, freeWill: 100 }
                : animalType === 'Кошка'
                    ? { maxHealth: 30, maxEnergy: 100, maxMood: 100, maxSatiety: 100, freeWill: 100 }
                    : { maxHealth: 50, maxEnergy: 100, maxMood: 100, maxSatiety: 100, freeWill: 100 };

            const updatedStats = {
                health: Math.min(stats.health, maxStats.maxHealth),
                attack: stats.attack,
                defense: stats.defense,
                energy: Math.min(stats.energy, maxStats.maxEnergy),
                mood: Math.min(stats.mood, maxStats.maxMood),
                satiety: Math.min(stats.satiety, maxStats.maxSatiety),
                freeWill: Math.min(stats.freeWill || 0, maxStats.freeWill),
                ...maxStats
            };

            const updateData = {
                isRegistered: isRegistered || true,
                isHuman,
                residence,
                homeless: isHuman ? false : true,
                lastActivity: new Date(),
                stats: updatedStats
            };

            if (isHuman) {
                updateData.formerProfession = formerProfession;
            } else {
                updateData.animalType = animalType;
                updateData.name = name;
                updateData.photoUrl = photoUrl || socket.userData.photoUrl || '';
                updateData.owner = owner;
            }

            const user = await User.findOneAndUpdate(
                { userId },
                { $set: updateData },
                { new: true, upsert: true }
            );

            if (!user) {
                socket.emit('error', { message: 'Пользователь не найден' });
                if (callback) callback({ success: false, message: 'Пользователь не найден' });
                return;
            }

            console.log('Обновлённый пользователь:', user);

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
            console.log(`Пользователь ${user.userId} присоединился к комнате после регистрации: ${defaultRoom}`);

            try {
                const messages = await Message.find({ room: defaultRoom }).sort({ timestamp: 1 }).limit(100);
                socket.emit('messageHistory', messages);
            } catch (err) {
                console.error('Ошибка при загрузке сообщений после регистрации:', err.message, err.stack);
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
                homeless: user.homeless,
                credits: user.credits || 0,
                onLeash: user.onLeash,
                freeRoam: user.freeRoam || false,
                stats: user.stats
            });

            console.log('Отправлен userUpdate с параметрами:', { stats: user.stats });

            if (callback) callback({ success: true, defaultRoom });
        } catch (err) {
            console.error('Ошибка при завершении регистрации:', err.message, err.stack);
            socket.emit('error', { message: 'Не удалось завершить регистрацию' });
            if (callback) callback({ success: false, message: 'Не удалось завершить регистрацию' });
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

    socket.on('updateFreeWill', async ({ userId, freeWill }, callback) => {
        try {
            const user = await User.findOneAndUpdate(
                { userId },
                { $set: { 'stats.freeWill': Math.min(Math.max(freeWill, 0), 100) } },
                { new: true }
            );

            if (!user) {
                callback({ success: false, message: 'Пользователь не найден' });
                return;
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
                homeless: user.homeless,
                credits: user.credits || 0,
                onLeash: user.onLeash,
                freeRoam: user.freeRoam || false,
                stats: user.stats
            });

            callback({ success: true });
        } catch (err) {
            console.error('Ошибка при обновлении freeWill:', err.message);
            callback({ success: false, message: 'Ошибка сервера' });
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
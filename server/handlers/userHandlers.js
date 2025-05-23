const { rooms } = require('../../src/components/constants/rooms.js');

// Заменяем массивы сообщений на новые с эффектами на параметры
const humanMessages = [
    { message: 'Поел в кафе, наслаждаясь вкусным обедом.', effect: { satiety: 10 } },
    { message: 'Прогулялся по парку, дыша свежим воздухом.', effect: { mood: 5, energy: -5 } },
    { message: 'Помог старушке донести тяжёлые сумки.', effect: { mood: 10, energy: -10 } },
    { message: 'Случайно наступил в лужу, промочив обувь.', effect: { mood: -5 } },
    { message: 'Посетил местный музей, вдохновившись экспонатами.', effect: { mood: 10 } },
    { message: 'Поболтал с друзьями в баре.', effect: { mood: 10, satiety: 5 } },
    { message: 'Попал под лёгкий дождь без зонта.', effect: { mood: -5, health: -5 } },
    { message: 'Сфотографировал красивый закат.', effect: { mood: 5 } },
    { message: 'Купил свежие фрукты на рынке.', effect: { satiety: 5 } },
    { message: 'Задержался на работе, решая срочные дела.', effect: { energy: -10, mood: -5 } },
    { message: 'Погладил дружелюбную собаку прохожего.', effect: { mood: 5 } },
    { message: 'Прочитал интересную книгу в кафе.', effect: { mood: 5, energy: -5 } },
    { message: 'Увидел уличное представление и аплодировал артистам.', effect: { mood: 10 } },
    { message: 'Споткнулся о бордюр, слегка ушибся.', effect: { health: -5, mood: -5 } },
    { message: 'Подарил цветы случайному прохожему.', effect: { mood: 10 } },
    { message: 'Провёл время на спортивной площадке.', effect: { health: 5, energy: -10 } },
    { message: 'Попробовал новый десерт в кондитерской.', effect: { satiety: 10, mood: 5 } },
    { message: 'Устал от долгой прогулки по городу.', effect: { energy: -10 } },
    { message: 'Нашёл потерянный кошелёк и вернул владельцу.', effect: { mood: 15 } },
    { message: 'Поскользнулся на мокром асфальте.', effect: { health: -10, mood: -5 } }
];

const catMessages = [
    { message: 'Погнался за бабочкой, но не поймал.', effect: { energy: -5, mood: 5 } },
    { message: 'Залез на дерево и застрял, пришлось спускаться.', effect: { energy: -10, mood: -5 } },
    { message: 'Лениво грелся на тёплой крыше.', effect: { energy: 10, mood: 5 } },
    { message: 'Нашёл укромный уголок и вздремнул.', effect: { energy: 15, satiety: -5 } },
    { message: 'Поиграл с листочком, который гонял ветер.', effect: { mood: 5, energy: -5 } },
    { message: 'Попытался поймать солнечный зайчик.', effect: { energy: -5, mood: 10 } },
    { message: 'Тёрся о ноги прохожего, выпросив еду.', effect: { satiety: 10, mood: 5 } },
    { message: 'Исследовал мусорный бак и нашёл вкусное.', effect: { satiety: 15, health: -5 } },
    { message: 'Устроил засаду на голубя, но он улетел.', effect: { mood: -5, energy: -5 } },
    { message: 'Ловко запрыгнул на высокий забор.', effect: { energy: -5, mood: 5 } },
    { message: 'Поскользнулся, прыгая с забора.', effect: { health: -5, mood: -5 } },
    { message: 'Повалялся в солнечном пятне на траве.', effect: { mood: 10, energy: 5 } },
    { message: 'Поймал мышь и гордо её съел.', effect: { satiety: 10, mood: 10 } },
    { message: 'Попал под дождь, промокнув до нитки.', effect: { health: -5, mood: -10 } },
    { message: 'Играл с клубком шерсти, найденным на улице.', effect: { mood: 5, energy: -5 } },
    { message: 'Заточил когти о старое дерево.', effect: { mood: 5 } },
    { message: 'Увидел собаку и спрятался в кустах.', effect: { mood: -5, energy: -5 } },
    { message: 'Нашёл миску с молоком у дома.', effect: { satiety: 15, mood: 5 } },
    { message: 'Поранился о колючку в траве.', effect: { health: -10, mood: -5 } },
    { message: 'Наблюдал за птицами с подоконника.', effect: { mood: 5 } }
];

const dogMessages = [
    { message: 'Побегал за мячом, который бросил прохожий.', effect: { energy: -10, mood: 10 } },
    { message: 'Понюхал все кусты в парке.', effect: { mood: 5, energy: -5 } },
    { message: 'Весело тявкнул на пробегающую кошку.', effect: { mood: 5, energy: -5 } },
    { message: 'Нашёл старую кость и погрыз её.', effect: { satiety: 10, mood: 5 } },
    { message: 'Повалялся в траве, наслаждаясь солнцем.', effect: { energy: 5, mood: 10 } },
    { message: 'Радостно поприветствовал другого пса.', effect: { mood: 10 } },
    { message: 'Побегал за своим хвостом от скуки.', effect: { energy: -5, mood: 5 } },
    { message: 'Копал яму и испачкался в грязи.', effect: { mood: 5, health: -5 } },
    { message: 'Попытался догнать белку, но не успел.', effect: { energy: -10, mood: -5 } },
    { message: 'Лизнул руку доброму прохожему.', effect: { mood: 10 } },
    { message: 'Нашёл лужу и весело в ней поплескался.', effect: { mood: 10, health: -5 } },
    { message: 'Отдохнул в тени под деревом.', effect: { energy: 10, mood: 5 } },
    { message: 'Съел кусок хлеба, брошенный прохожим.', effect: { satiety: 10, mood: 5 } },
    { message: 'Устал от долгого бега по парку.', effect: { energy: -15 } },
    { message: 'Поранился о острый камень на тропинке.', effect: { health: -10, mood: -5 } },
    { message: 'Играл с палкой, найденной в парке.', effect: { mood: 5, energy: -5 } },
    { message: 'Попал под дождь, весь промок.', effect: { health: -5, mood: -10 } },
    { message: 'Погрыз старый ботинок, найденный на улице.', effect: { mood: 5, satiety: 5 } },
    { message: 'Споткнулся, бегая по неровной дороге.', effect: { health: -5, mood: -5 } },
    { message: 'Получил ласку от прохожего.', effect: { mood: 10 } }
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
        const now = new Date();
        const lastActivity = user.lastActivity || now;
        const hoursPassed = Math.floor((now - lastActivity) / (1000 * 60 * 60)); // Кол-во полных часов

        if (hoursPassed > 0) {
            const diaryEntries = [];
            const statUpdates = {
                health: 0,
                energy: 0,
                mood: 0,
                satiety: 0
            };
            const freeWill = user.stats?.freeWill || 0; // Получаем freeWill, по умолчанию 0
            for (let i = 0; i < hoursPassed; i++) {
                // Генерируем случайное число от 0 до 100
                const chance = Math.random() * 100;
                if (chance <= freeWill) { // Создаём запись, если шанс меньше или равен freeWill
                    // Генерируем случайное время в пределах часа
                    const randomMinutes = Math.floor(Math.random() * 60);
                    const entryTime = new Date(lastActivity.getTime() + (i * 60 * 60 * 1000) + (randomMinutes * 60 * 1000));
                    const entry = getRandomWalkMessage(user);
                    diaryEntries.push({
                        timestamp: entryTime,
                        message: entry.message
                    });
                    // Накапливаем изменения параметров
                    if (entry.effect.health) statUpdates.health += entry.effect.health;
                    if (entry.effect.energy) statUpdates.energy += entry.effect.energy;
                    if (entry.effect.mood) statUpdates.mood += entry.effect.mood;
                    if (entry.effect.satiety) statUpdates.satiety += entry.effect.satiety;
                }
            }
            // Добавляем записи в diary и обновляем параметры, если есть изменения
            if (diaryEntries.length > 0) {
                // Ограничиваем параметры минимальными (0) и максимальными значениями
                const updatedStats = {
                    health: Math.min(Math.max(user.stats.health + statUpdates.health, 0), user.stats.maxHealth),
                    energy: Math.min(Math.max(user.stats.energy + statUpdates.energy, 0), user.stats.maxEnergy),
                    mood: Math.min(Math.max(user.stats.mood + statUpdates.mood, 0), user.stats.maxMood),
                    satiety: Math.min(Math.max(user.stats.satiety + statUpdates.satiety, 0), user.stats.maxSatiety)
                };

                await User.updateOne(
                    { userId: user.userId },
                    {
                        $push: { diary: { $each: diaryEntries, $slice: -100 } }, // Ограничиваем diary до 100 записей
                        $set: {
                            lastActivity: now,
                            'stats.health': updatedStats.health,
                            'stats.energy': updatedStats.energy,
                            'stats.mood': updatedStats.mood,
                            'stats.satiety': updatedStats.satiety
                        }
                    }
                );
                console.log(`Added ${diaryEntries.length} diary entries and updated stats for user ${user.userId}:`, updatedStats);

                // Обновляем user после изменений
                user = await User.findOne({ userId: user.userId });

                // Отправляем userUpdate клиенту
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
                    stats: user.stats,
                    diary: user.diary
                });
            } else {
                // Обновляем lastActivity, если записей нет
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
const { rooms } = require('../../src/components/constants/rooms.js');

// Заменяем массивы сообщений на новые с эффектами на параметры
// Заменяем массивы сообщений на новые с учётом общего состояния игрока
const humanMessages = {
    tragic: [ // Общее состояние < 25
        { message: 'Сидел на скамейке, глядя в пустоту.', effect: { mood: -5 } },
        { message: 'Пытался найти смысл в этом сером дне.', effect: { mood: -5 } },
        { message: 'Промок под дождём, чувствуя холод внутри.', effect: { health: -5, mood: -5 } },
        { message: 'Забыл поесть, желудок сводит от голода.', effect: { satiety: -10 } },
        { message: 'Устал тащиться по улице без цели.', effect: { energy: -10, mood: -5 } },
        { message: 'Смотрел на прохожих, чувствуя одиночество.', effect: { mood: -5 } },
        { message: 'Споткнулся и упал, всё тело болит.', effect: { health: -10, mood: -5 } },
        { message: 'Сидел в тишине, слыша только свои мысли.', effect: { mood: -5 } },
        { message: 'Потерял кошелёк, теперь всё ещё хуже.', effect: { mood: -10 } },
        { message: 'Просто лёг на траву, не в силах идти дальше.', effect: { energy: -10 } }
    ],
    sad: [ // Общее состояние 26–50
        { message: 'Пошёл в кафе, но еда не принесла радости.', effect: { satiety: 5, mood: -3 } },
        { message: 'Прогулялся, но всё кажется таким серым.', effect: { energy: -5 } },
        { message: 'О, ещё один дождливый день, как мило.', effect: { mood: -5, health: -3 } },
        { message: 'Помог прохожему, но кто поможет мне?', effect: { mood: 3, energy: -5 } },
        { message: 'Сфотографировал закат. Ну и что?', effect: { mood: 2 } },
        { message: 'Купил булку, но она оказалась чёрствой.', effect: { satiety: 3, mood: -3 } },
        { message: 'Поболтал с кем-то, но разговор был пустой.', effect: { mood: -3 } },
        { message: 'Сидел в парке, глядя на счастливых людей.', effect: { mood: -5 } },
        { message: 'Устал от всего этого шума вокруг.', effect: { energy: -5, mood: -3 } },
        { message: 'Нашёл монетку. Похоже, это мой лучший момент за день.', effect: { mood: 3 } }
    ],
    good: [ // Общее состояние 51–75
        { message: 'Поел вкусный обед в кафе, настроение поднялось.', effect: { satiety: 10, mood: 5 } },
        { message: 'Прогулялся по парку, наслаждаясь солнцем.', effect: { mood: 5, energy: -5 } },
        { message: 'Помог старушке, приятно чувствовать себя полезным.', effect: { mood: 8, energy: -5 } },
        { message: 'Сфотографировал красивый пейзаж.', effect: { mood: 5 } },
        { message: 'Поболтал с друзьями, было весело.', effect: { mood: 8 } },
        { message: 'Купил свежие фрукты на рынке.', effect: { satiety: 5, mood: 3 } },
        { message: 'Посмотрел уличное представление, впечатлён.', effect: { mood: 5 } },
        { message: 'Побегал в парке, чувствуя прилив сил.', effect: { health: 5, energy: -5 } },
        { message: 'Нашёл интересную книгу в магазине.', effect: { mood: 5 } },
        { message: 'Улыбнулся прохожему, и он ответил тем же.', effect: { mood: 5 } }
    ],
    happy: [ // Общее состояние > 76
        { message: 'Танцевал под музыку уличного артиста, это было круто!', effect: { mood: 10, energy: -5 } },
        { message: 'Съел невероятный десерт в кафе, жизнь прекрасна!', effect: { satiety: 10, mood: 8 } },
        { message: 'Прогулялся по парку, вдыхая аромат цветов.', effect: { mood: 8, energy: -3 } },
        { message: 'Помог прохожему и получил массу благодарности.', effect: { mood: 10 } },
        { message: 'Сфотографировал радугу после дождя.', effect: { mood: 8 } },
        { message: 'Поболтал с друзьями, смеялись до слёз!', effect: { mood: 10, energy: -3 } },
        { message: 'Нашёл идеальный кофе, день удался!', effect: { satiety: 5, mood: 5 } },
        { message: 'Побегал на закате, чувствуя себя живым.', effect: { health: 8, energy: -5 } },
        { message: 'Увидел смешного щенка и не смог сдержать улыбку.', effect: { mood: 8 } },
        { message: 'Танцевал под дождём, как в кино!', effect: { mood: 10, health: -3 } }
    ]
};

const catMessages = {
    tragic: [ // Общее состояние < 25
        { message: 'Лежал в углу, чувствуя себя никому не нужным.', effect: { mood: -5 } },
        { message: 'Пытался поймать мышь, но сил не хватило.', effect: { energy: -10, mood: -5 } },
        { message: 'Промок под дождём, шерсть вся мокрая.', effect: { health: -5, mood: -5 } },
        { message: 'Не нашёл еды, желудок урчит.', effect: { satiety: -10 } },
        { message: 'Спрятался в коробке, чтобы никто не видел.', effect: { mood: -5 } },
        { message: 'Упал с забора, теперь всё болит.', effect: { health: -10, mood: -5 } },
        { message: 'Мяукал в пустоту, но никто не ответил.', effect: { mood: -5 } },
        { message: 'Свернулся клубком, пытаясь забыться.', effect: { energy: -5 } },
        { message: 'Увидел собаку и забился в угол.', effect: { mood: -10 } },
        { message: 'Лежал на холодной земле, дрожа.', effect: { health: -5, mood: -5 } }
    ],
    sad: [ // Общее состояние 26–50
        { message: 'Погнался за бабочкой, но зачем это всё?', effect: { energy: -5, mood: -3 } },
        { message: 'Грелся на крыше, но радости это не принесло.', effect: { energy: 5, mood: -3 } },
        { message: 'Нашёл старую еду, но она невкусная.', effect: { satiety: 5, mood: -3 } },
        { message: 'Спал в коробке, но всё равно устал.', effect: { energy: 5, mood: -3 } },
        { message: 'Смотрел на птиц, но они всё равно улетели.', effect: { mood: -5 } },
        { message: 'Поскользнулся на мокрой крыше, еле удержался.', effect: { health: -3, mood: -3 } },
        { message: 'Тёрся о ноги прохожего, но он меня прогнал.', effect: { mood: -5 } },
        { message: 'Поиграл с листочком, но быстро надоело.', effect: { energy: -5, mood: -3 } },
        { message: 'Сидел на заборе, глядя на серый мир.', effect: { mood: -5 } },
        { message: 'Нашёл лужу и промок, как же всё достало.', effect: { health: -3, mood: -5 } }
    ],
    good: [ // Общее состояние 51–75
        { message: 'Погнался за бабочкой, было весело.', effect: { energy: -5, mood: 5 } },
        { message: 'Грелся на тёплой крыше, мурлыча.', effect: { energy: 5, mood: 5 } },
        { message: 'Нашёл вкусный кусочек рыбы у дома.', effect: { satiety: 10, mood: 3 } },
        { message: 'Вздремнул в укромном уголке.', effect: { energy: 10 } },
        { message: 'Поиграл с солнечным зайчиком.', effect: { energy: -5, mood: 5 } },
        { message: 'Ловко запрыгнул на забор, чувствуя себя ловким.', effect: { health: 3, energy: -3 } },
        { message: 'Тёрся о ноги прохожего, получил ласку.', effect: { mood: 5, satiety: 5 } },
        { message: 'Повалялся в траве, наслаждаясь солнцем.', effect: { mood: 5, energy: 3 } },
        { message: 'Поймал муху, было забавно.', effect: { mood: 5, energy: -3 } },
        { message: 'Наблюдал за птицами с подоконника.', effect: { mood: 5 } }
    ],
    happy: [ // Общее состояние > 76
        { message: 'Носился за бабочкой, как настоящий охотник!', effect: { energy: -5, mood: 10 } },
        { message: 'Грелся на крыше, мурлыча от счастья.', effect: { energy: 8, mood: 8 } },
        { message: 'Нашёл миску с молоком, объелся!', effect: { satiety: 15, mood: 5 } },
        { message: 'Спал в тёплой коробке, мечтая о приключениях.', effect: { energy: 10, mood: 5 } },
        { message: 'Играл с листочком, прыгая от радости.', effect: { energy: -5, mood: 8 } },
        { message: 'Запрыгнул на дерево, чувствуя себя королём!', effect: { health: 5, energy: -5 } },
        { message: 'Тёрся о прохожего, получил вкусняшку!', effect: { satiety: 10, mood: 8 } },
        { message: 'Наблюдал за птицами, мурлыча от удовольствия.', effect: { mood: 8 } },
        { message: 'Поймал мышь и гордо её съел.', effect: { satiety: 10, mood: 10 } },
        { message: 'Катался в траве, наслаждаясь свободой.', effect: { mood: 10, energy: -3 } }
    ]
};

const dogMessages = {
    tragic: [ // Общее состояние < 25
        { message: 'Лежал в углу, скуля от одиночества.', effect: { mood: -5 } },
        { message: 'Пытался найти еду, но всё пусто.', effect: { satiety: -10 } },
        { message: 'Промок под дождём, дрожа от холода.', effect: { health: -5, mood: -5 } },
        { message: 'Устал бродить без цели.', effect: { energy: -10, mood: -5 } },
        { message: 'Спрятался под скамейкой, боясь всего.', effect: { mood: -5 } },
        { message: 'Поранился о мусор, лапа болит.', effect: { health: -10, mood: -5 } },
        { message: 'Скулил, глядя на пустую миску.', effect: { satiety: -5, mood: -5 } },
        { message: 'Лёг на холодную землю, сил нет.', effect: { energy: -10 } },
        { message: 'Увидел кошку, но даже не погнался.', effect: { mood: -5 } },
        { message: 'Сидел под деревом, чувствуя тоску.', effect: { mood: -5 } }
    ],
    sad: [ // Общее состояние 26–50
        { message: 'Погнался за белкой, но она всё равно сбежала.', effect: { energy: -5, mood: -3 } },
        { message: 'Понюхал кусты, но ничего интересного.', effect: { energy: -3, mood: -3 } },
        { message: 'Нашёл кость, но она оказалась старой.', effect: { satiety: 5, mood: -3 } },
        { message: 'Повалялся в траве, но настроение не улучшилось.', effect: { energy: 3, mood: -3 } },
        { message: 'Тявкнул на прохожего, но он не обратил внимания.', effect: { mood: -5 } },
        { message: 'Промок в луже, теперь всё раздражает.', effect: { health: -3, mood: -5 } },
        { message: 'Копал яму, но зачем это всё?', effect: { energy: -5, mood: -3 } },
        { message: 'Лизнул руку прохожего, но он ушёл.', effect: { mood: -5 } },
        { message: 'Сидел на обочине, глядя на проходящих.', effect: { mood: -5 } },
        { message: 'Устал бегать, всё бесполезно.', effect: { energy: -5 } }
    ],
    good: [ // Общее состояние 51–75
        { message: 'Побегал за мячом, было весело.', effect: { energy: -5, mood: 5 } },
        { message: 'Понюхал кусты, нашёл интересный запах.', effect: { mood: 5, energy: -3 } },
        { message: 'Нашёл вкусную кость и погрыз её.', effect: { satiety: 10, mood: 3 } },
        { message: 'Повалялся в траве, наслаждаясь солнцем.', effect: { energy: 5, mood: 5 } },
        { message: 'Радостно тявкнул на другого пса.', effect: { mood: 5 } },
        { message: 'Играл с палкой, чувствуя себя активным.', effect: { energy: -5, mood: 5 } },
        { message: 'Получил ласку от прохожего.', effect: { mood: 5 } },
        { message: 'Побегал по парку, лапы в деле.', effect: { energy: -5, health: 3 } },
        { message: 'Нашёл кусок хлеба, вкусный сюрприз!', effect: { satiety: 5, mood: 3 } },
        { message: 'Лизнул руку доброму человеку.', effect: { mood: 5 } }
    ],
    happy: [ // Общее состояние > 76
        { message: 'Носился за мячом, как чемпион!', effect: { energy: -5, mood: 10 } },
        { message: 'Понюхал цветы, жизнь прекрасна!', effect: { mood: 8, energy: -3 } },
        { message: 'Нашёл огромную кость, пир на весь день!', effect: { satiety: 15, mood: 5 } },
        { message: 'Повалялся в траве, виляя хвостом от счастья.', effect: { energy: 5, mood: 8 } },
        { message: 'Играл с другим псом, веселье на максимум!', effect: { mood: 10, energy: -5 } },
        { message: 'Побегал за белкой, полон энергии!', effect: { energy: -5, mood: 8 } },
        { message: 'Получил вкусняшку от прохожего!', effect: { satiety: 10, mood: 5 } },
        { message: 'Тявкал от радости, встретив друга.', effect: { mood: 8 } },
        { message: 'Плескался в луже, как щенок!', effect: { mood: 10, health: -3 } },
        { message: 'Гонялся за бабочкой, полный восторг!', effect: { energy: -5, mood: 10 } }
    ]
};

// Аналогично для catMessages и dogMessages (оставляем без изменений для примера)

// Новые сообщения, специфичные для комнат
const roomSpecificMessages = {
    human: {
        'Автобусная остановка': {
            tragic: [
                { message: 'Ждал автобус, но он так и не пришёл.', effect: { mood: -5, energy: -5 } },
                { message: 'Смотрел на проезжающие машины, чувствуя себя потерянным.', effect: { mood: -5 } }
            ],
            sad: [
                { message: 'Сел на скамейку, но холод пробирает до костей.', effect: { health: -3, mood: -3 } },
                { message: 'Прочитал объявление на остановке, ничего интересного.', effect: { mood: -3 } }
            ],
            good: [
                { message: 'Поболтал с попутчиком на остановке, стало веселее.', effect: { mood: 5 } },
                { message: 'Увидел смешной стикер на столбе, улыбнулся.', effect: { mood: 5 } }
            ],
            happy: [
                { message: 'Поймал попутку и доехал с ветерком!', effect: { mood: 8, energy: -3 } },
                { message: 'Увидел яркий закат с остановки, настроение взлетело!', effect: { mood: 10 } }
            ]
        },
        'Бар "У бобра" (18+)': {
            tragic: [
                { message: 'Сидел за стойкой, но выпивка не помогла.', effect: { mood: -5, satiety: 3 } },
                { message: 'Слушал пьяные разговоры, чувствуя тоску.', effect: { mood: -5 } }
            ],
            sad: [
                { message: 'Выпил дешёвого пива, настроение не улучшилось.', effect: { satiety: 5, mood: -3 } },
                { message: 'Попытался танцевать, но быстро устал.', effect: { energy: -5, mood: -3 } }
            ],
            good: [
                { message: 'Угостили коктейлем, вечер стал лучше.', effect: { satiety: 5, mood: 5 } },
                { message: 'Пошутил с барменом, посмеялись вместе.', effect: { mood: 5 } }
            ],
            happy: [
                { message: 'Танцевал всю ночь, это было круто!', effect: { mood: 10, energy: -5 } },
                { message: 'Пел караоке с незнакомцами, полный кайф!', effect: { mood: 10 } }
            ]
        },
        'Бизнес центр "Альбион"': {
            tragic: [
                { message: 'Заблудился в коридорах офиса, всё бесит.', effect: { mood: -5, energy: -5 } },
                { message: 'Сидел в холле, чувствуя себя лишним.', effect: { mood: -5 } }
            ],
            sad: [
                { message: 'Пытался найти работу, но все заняты.', effect: { mood: -3 } },
                { message: 'Пил кофе из автомата, невкусный.', effect: { satiety: 3, mood: -3 } }
            ],
            good: [
                { message: 'Поболтал с менеджером, возможно, есть шанс на работу.', effect: { mood: 5 } },
                { message: 'Нашёл уютное кафе в бизнес-центре.', effect: { satiety: 5, mood: 3 } }
            ],
            happy: [
                { message: 'Получил предложение о работе, день удался!', effect: { mood: 10 } },
                { message: 'Заключил выгодную сделку, настроение на высоте!', effect: { mood: 10 } }
            ]
        },
        // Новый блок для дома
        myhome: {
            tragic: [
                { message: 'Лежал на диване, чувствуя пустоту.', effect: { mood: -5, energy: 5 } },
                { message: 'Смотрел в потолок, не зная, чем заняться.', effect: { mood: -5 } }
            ],
            sad: [
                { message: 'Поел остатки холодной еды из холодильника.', effect: { satiety: 5, mood: -3 } },
                { message: 'Сидел у окна, глядя на дождь.', effect: { mood: -3 } }
            ],
            good: [
                { message: 'Приготовил вкусный ужин, настроение улучшилось.', effect: { satiety: 10, mood: 5 } },
                { message: 'Смотрел фильм, уютно устроившись на диване.', effect: { mood: 5, energy: 5 } }
            ],
            happy: [
                { message: 'Устроил домашнюю вечеринку, было весело!', effect: { mood: 10, energy: -5 } },
                { message: 'Танцевал под любимую музыку дома.', effect: { mood: 10, energy: -3 } }
            ]
        }
        // Добавьте сообщения для остальных комнат из rooms.js
        // Добавьте аналогичные сообщения для остальных комнат из rooms.js
        // Для примера пропустим остальные, чтобы не увеличивать объём
    },
    cat: {
        'Автобусная остановка': {
            tragic: [
                { message: 'Спрятался под скамейкой, дрожа от холода.', effect: { health: -5, mood: -5 } },
                { message: 'Мяукал на остановке, но никто не заметил.', effect: { mood: -5 } }
            ],
            sad: [
                { message: 'Гнался за голубем, но он улетел.', effect: { energy: -5, mood: -3 } },
                { message: 'Лежал на асфальте, чувствуя одиночество.', effect: { mood: -5 } }
            ],
            good: [
                { message: 'Нашёл кусочек хлеба у остановки.', effect: { satiety: 5, mood: 3 } },
                { message: 'Грелся на тёплом асфальте.', effect: { energy: 5, mood: 5 } }
            ],
            happy: [
                { message: 'Играл с листочком, унесённым ветром.', effect: { mood: 8, energy: -3 } },
                { message: 'Получил ласку от прохожего на остановке.', effect: { mood: 10 } }
            ]
        },
        'Бар "У бобра" (18+)': {
            tragic: [
                { message: 'Спрятался под столом, напуганный шумом.', effect: { mood: -5 } },
                { message: 'Промок в луже пива, шерсть липкая.', effect: { health: -5, mood: -5 } }
            ],
            sad: [
                { message: 'Пытался стащить еду, но прогнали.', effect: { mood: -5 } },
                { message: 'Сидел в углу, наблюдая за пьяными.', effect: { mood: -3 } }
            ],
            good: [
                { message: 'Нашёл кусочек рыбы под столом.', effect: { satiety: 5, mood: 5 } },
                { message: 'Мурлыкал, сидя у тёплой батареи.', effect: { mood: 5, energy: 3 } }
            ],
            happy: [
                { message: 'Тёрся о ноги доброго посетителя, получил вкусняшку!', effect: { satiety: 10, mood: 8 } },
                { message: 'Играл с пробкой от бутылки, весело!', effect: { mood: 8, energy: -3 } }
            ]
        },
        // Новый блок для дома
        myhome: {
            tragic: [
                { message: 'Лежал в углу дома, чувствуя себя никому не нужным.', effect: { mood: -5 } },
                { message: 'Спрятался под кроватью, боясь шума.', effect: { mood: -5 } }
            ],
            sad: [
                { message: 'Грыз пустую миску, еды нет.', effect: { satiety: -5, mood: -3 } },
                { message: 'Смотрел в окно, но ничего интересного.', effect: { mood: -3 } }
            ],
            good: [
                { message: 'Вздремнул на мягком диване, уютно.', effect: { energy: 10, mood: 5 } },
                { message: 'Нашёл кусочек еды на кухне.', effect: { satiety: 5, mood: 5 } }
            ],
            happy: [
                { message: 'Носился по дому, играя с клубком шерсти!', effect: { mood: 10, energy: -5 } },
                { message: 'Мурлыкал, лёжа на тёплом подоконнике.', effect: { mood: 8, energy: 5 } }
            ]
        }
        // Добавьте для остальных комнат
    },
    dog: {
        'Автобусная остановка': {
            tragic: [
                { message: 'Скулил на остановке, никто не подошёл.', effect: { mood: -5 } },
                { message: 'Лежал на холодном асфальте, дрожа.', effect: { health: -5, mood: -5 } }
            ],
            sad: [
                { message: 'Понюхал мусорку, но ничего съедобного.', effect: { mood: -3 } },
                { message: 'Погнался за голубем, но не догнал.', effect: { energy: -5, mood: -3 } }
            ],
            good: [
                { message: 'Нашёл косточку у скамейки, вкуснятина!', effect: { satiety: 5, mood: 5 } },
                { message: 'Вилял хвостом, встретив доброго человека.', effect: { mood: 5 } }
            ],
            happy: [
                { message: 'Носился по остановке, полный энергии!', effect: { mood: 8, energy: -5 } },
                { message: 'Получил ласку и вкусняшку от прохожего!', effect: { satiety: 10, mood: 10 } }
            ]
        },
        'Бар "У бобра" (18+)': {
            tragic: [
                { message: 'Спрятался под столом, напуганный шумом.', effect: { mood: -5 } },
                { message: 'Скулил, когда кто-то наступил на хвост.', effect: { health: -5, mood: -5 } }
            ],
            sad: [
                { message: 'Попытался стащить еду, но получил шлепок.', effect: { mood: -5 } },
                { message: 'Лежал у входа, чувствуя себя ненужным.', effect: { mood: -3 } }
            ],
            good: [
                { message: 'Нашёл кусок мяса под барной стойкой.', effect: { satiety: 5, mood: 5 } },
                { message: 'Тявкал от радости, когда погладили.', effect: { mood: 5 } }
            ],
            happy: [
                { message: 'Играл с посетителями, виляя хвостом!', effect: { mood: 10, energy: -5 } },
                { message: 'Получил целую тарелку вкусностей!', effect: { satiety: 15, mood: 10 } }
            ]
        },
        // Новый блок для дома
        myhome: {
            tragic: [
                { message: 'Скулил у двери, чувствуя одиночество.', effect: { mood: -5 } },
                { message: 'Лежал на холодном полу, без сил.', effect: { health: -5, mood: -5 } }
            ],
            sad: [
                { message: 'Грыз пустую миску, еды нет.', effect: { satiety: -5, mood: -3 } },
                { message: 'Смотрел на пустой двор через окно.', effect: { mood: -3 } }
            ],
            good: [
                { message: 'Повалялся на мягком ковре, уютно.', effect: { energy: 5, mood: 5 } },
                { message: 'Нашёл старую кость на кухне.', effect: { satiety: 5, mood: 5 } }
            ],
            happy: [
                { message: 'Носился по дому, играя с мячиком!', effect: { mood: 10, energy: -5 } },
                { message: 'Вилял хвостом, поев вкусной еды из миски!', effect: { satiety: 10, mood: 8 } }
            ]
        }
        // Добавьте для остальных комнат
    }
};

// Функция для получения случайного сообщения
const getRandomWalkMessage = (user) => {
    // Рассчитываем общее состояние
    const overallState = (user.stats.health + user.stats.energy + user.stats.mood + user.stats.satiety) / 4;

    // Определяем категорию сообщений
    let messageCategory;
    if (overallState < 25) {
        messageCategory = 'tragic';
    } else if (overallState <= 50) {
        messageCategory = 'sad';
    } else if (overallState <= 75) {
        messageCategory = 'good';
    } else {
        messageCategory = 'happy';
    }

    // Определяем тип игрока
    const playerType = user.isHuman ? 'human' : user.animalType === 'Кошка' ? 'cat' : 'dog';

    // Проверяем, находится ли игрок дома (комната начинается с myhome_)
    const room = user.lastRoom || 'Полигон утилизации';
    let messages;
    if (room.startsWith('myhome_') && roomSpecificMessages[playerType]?.myhome?.[messageCategory]) {
        messages = roomSpecificMessages[playerType].myhome[messageCategory];
    } else if (roomSpecificMessages[playerType]?.[room]?.[messageCategory]) {
        // Используем сообщения для конкретной комнаты
        messages = roomSpecificMessages[playerType][room][messageCategory];
    } else {
        // Используем общие сообщения, если нет специфичных
        messages = user.isHuman ? humanMessages[messageCategory] : user.animalType === 'Кошка' ? catMessages[messageCategory] : dogMessages[messageCategory];
    }

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
                        $push: { diary: { $each: diaryEntries, $slice: -250 } }, // Ограничиваем diary до 250 записей
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
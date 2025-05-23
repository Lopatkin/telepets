const humanMessages = {
    tragic: [
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
    sad: [
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
    good: [
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
    happy: [
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
    tragic: [
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
    sad: [
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
    good: [
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
    happy: [
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
    tragic: [
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
    sad: [
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
    good: [
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
    happy: [
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
        // Добавьте сообщения для остальных комнат
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
        // Добавьте сообщения для остальных комнат
    }
};

module.exports = { humanMessages, catMessages, dogMessages, roomSpecificMessages };
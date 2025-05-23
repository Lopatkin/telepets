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
                { message: 'Сидел на скамейке, глядя на пустую дорогу.', effect: { mood: -3 } },
                { message: 'Ждал автобус, но расписание оказалось устаревшим.', effect: { mood: -2, energy: -2 } },
                { message: 'Пытался укрыться от ветра за остановкой.', effect: { health: -2, mood: -2 } },
                { message: 'Смотрел на мусор, валяющийся у остановки.', effect: { mood: -3 } },
                { message: 'Пропустил автобус, потому что задумался.', effect: { mood: -3, energy: -2 } },
                { message: 'Слушал шум машин, чувствуя тоску.', effect: { mood: -3 } },
                { message: 'Пытался согреться, но ветер пробирал до костей.', effect: { health: -3, mood: -2 } },
                { message: 'Сидел один, чувствуя себя забытым.', effect: { mood: -3 } },
                { message: 'Увидел, как автобус уехал, не остановившись.', effect: { mood: -4 } },
                { message: 'Пытался читать граффити на остановке, но всё бессмысленно.', effect: { mood: -2 } },
                { message: 'Смотрел на серое небо, чувствуя пустоту.', effect: { mood: -3 } },
                { message: 'Поскользнулся на мокром асфальте.', effect: { health: -2, mood: -2 } },
                { message: 'Ждал друга, но он так и не пришёл.', effect: { mood: -3 } },
                { message: 'Слушал гудки машин, раздражаясь.', effect: { mood: -3 } },
                { message: 'Пытался вспомнить, куда мне нужно ехать.', effect: { mood: -2, energy: -2 } },
                { message: 'Замёрз, стоя на остановке.', effect: { health: -3 } },
                { message: 'Увидел, как кто-то выбросил мусор мимо урны.', effect: { mood: -2 } },
                { message: 'Сидел, глядя на проезжающих, без цели.', effect: { mood: -3 } },
                { message: 'Пытался укрыться от мелкого дождя.', effect: { health: -2, mood: -2 } },
                { message: 'Ждал автобус, но он опять опаздывает.', effect: { mood: -3 } },
                { message: 'Смотрел на потрёпанное расписание.', effect: { mood: -2 } },
                { message: 'Пытался согреться, потирая руки.', effect: { health: -2 } },
                { message: 'Сидел, слушая шум ветра.', effect: { mood: -2 } },
                { message: 'Увидел старую афишу, оторванную наполовину.', effect: { mood: -2 } },
                { message: 'Ждал, но мысли путались в голове.', effect: { mood: -3 } },
                { message: 'Смотрел на лужи, отражавшие серое небо.', effect: { mood: -3 } },
                { message: 'Попытался присесть, но скамейка была мокрой.', effect: { mood: -2, health: -2 } },
                { message: 'Слушал, как капает с навеса остановки.', effect: { mood: -2 } },
                { message: 'Пытался найти смысл в ожидании.', effect: { mood: -3 } },
                { message: 'Сидел, глядя на пустую остановку.', effect: { mood: -3 } }
            ],
            sad: [
                { message: 'Сидел на скамейке, наблюдая за спешащими людьми.', effect: { mood: -2 } },
                { message: 'Прочитал объявление, но оно неинтересное.', effect: { mood: -2 } },
                { message: 'Ждал автобус, но он задерживается.', effect: { mood: -2, energy: -2 } },
                { message: 'Смотрел на проезжающие машины, скучая.', effect: { mood: -2 } },
                { message: 'Пытался согреться на холодной скамейке.', effect: { health: -2 } },
                { message: 'Слушал шум города, чувствуя усталость.', effect: { mood: -2, energy: -2 } },
                { message: 'Увидел голубя, клюющего крошки.', effect: { mood: -1 } },
                { message: 'Сидел, глядя на мокрый асфальт.', effect: { mood: -2 } },
                { message: 'Пытался вспомнить расписание автобусов.', effect: { mood: -2 } },
                { message: 'Ждал, но мысли были где-то далеко.', effect: { mood: -2 } },
                { message: 'Смотрел на людей, но чувствовал себя чужим.', effect: { mood: -2 } },
                { message: 'Попытался укрыться от ветра за столбом.', effect: { health: -2 } },
                { message: 'Сидел, слушая далёкий лай собак.', effect: { mood: -2 } },
                { message: 'Увидел, как кто-то уронил билет.', effect: { mood: -1 } },
                { message: 'Пытался разглядеть номера автобусов.', effect: { energy: -2 } },
                { message: 'Сидел, глядя на серые облака.', effect: { mood: -2 } },
                { message: 'Ждал, но время тянулось медленно.', effect: { mood: -2 } },
                { message: 'Смотрел на прохожих, но никто не улыбнулся.', effect: { mood: -2 } },
                { message: 'Пытался согреться, засунув руки в карманы.', effect: { health: -2 } },
                { message: 'Сидел, слушая шум шин по асфальту.', effect: { mood: -2 } },
                { message: 'Увидел старую газету, валяющуюся рядом.', effect: { mood: -2 } },
                { message: 'Пытался занять себя мыслями, но не вышло.', effect: { mood: -2 } },
                { message: 'Сидел, глядя на пустую урну.', effect: { mood: -2 } },
                { message: 'Ждал, но автобус всё не ехал.', effect: { mood: -2, energy: -2 } },
                { message: 'Смотрел на потёртую скамейку.', effect: { mood: -2 } },
                { message: 'Пытался уловить запах дождя.', effect: { mood: -1 } },
                { message: 'Сидел, чувствуя холод асфальта.', effect: { health: -2 } },
                { message: 'Смотрел на проезжающий грузовик.', effect: { mood: -2 } },
                { message: 'Ждал, но мысли были пустыми.', effect: { mood: -2 } },
                { message: 'Сидел, глядя на тёмные окна домов.', effect: { mood: -2 } }
            ],
            good: [
                { message: 'Увидел яркий автобус, настроение поднялось.', effect: { mood: 3 } },
                { message: 'Поболтал с попутчиком, было приятно.', effect: { mood: 3 } },
                { message: 'Нашёл монетку на скамейке.', effect: { mood: 2 } },
                { message: 'Слушал пение птиц неподалёку.', effect: { mood: 2 } },
                { message: 'Увидел смешное граффити на остановке.', effect: { mood: 3 } },
                { message: 'Поймал тёплый луч солнца, сидя на скамейке.', effect: { mood: 2, health: 2 } },
                { message: 'Прочитал забавное объявление на столбе.', effect: { mood: 2 } },
                { message: 'Сидел, наслаждаясь тишиной утра.', effect: { mood: 2 } },
                { message: 'Увидел, как ребёнок кормит голубей.', effect: { mood: 3 } },
                { message: 'Поболтал с водителем автобуса.', effect: { mood: 3 } },
                { message: 'Сидел, глядя на яркие цветы у дороги.', effect: { mood: 2 } },
                { message: 'Увидел, как кто-то делится едой с прохожим.', effect: { mood: 2 } },
                { message: 'Слушал лёгкий ветер, шелестящий листвой.', effect: { mood: 2 } },
                { message: 'Нашёл старый билет, вспомнил поездку.', effect: { mood: 2 } },
                { message: 'Сидел, наблюдая за спешащими людьми.', effect: { mood: 2 } },
                { message: 'Увидел яркую рекламу на остановке.', effect: { mood: 2 } },
                { message: 'Слушал музыку из проезжающей машины.', effect: { mood: 3 } },
                { message: 'Сидел, чувствуя тёплый асфальт под ногами.', effect: { health: 2 } },
                { message: 'Увидел, как кто-то рисует мелом на асфальте.', effect: { mood: 3 } },
                { message: 'Сидел, глядя на облака, похожие на животных.', effect: { mood: 2 } },
                { message: 'Поболтал с бабушкой на остановке.', effect: { mood: 3 } },
                { message: 'Слушал, как голуби воркуют рядом.', effect: { mood: 2 } },
                { message: 'Увидел, как кто-то оставил цветок на скамейке.', effect: { mood: 2 } },
                { message: 'Сидел, наслаждаясь запахом свежескошенной травы.', effect: { mood: 2 } },
                { message: 'Увидел яркий плакат о концерте.', effect: { mood: 3 } },
                { message: 'Слушал, как дети смеются неподалёку.', effect: { mood: 3 } },
                { message: 'Сидел, глядя на отражение в луже.', effect: { mood: 2 } },
                { message: 'Увидел, как кто-то кормит бездомную кошку.', effect: { mood: 3 } },
                { message: 'Сидел, чувствуя лёгкий бриз.', effect: { mood: 2 } },
                { message: 'Увидел, как автобус подъехал вовремя.', effect: { mood: 3 } }
            ],
            happy: [
                { message: 'Увидел радугу над дорогой, настроение взлетело!', effect: { mood: 5 } },
                { message: 'Поболтал с весёлым попутчиком, посмеялись.', effect: { mood: 5 } },
                { message: 'Нашёл монетку и угостился кофе.', effect: { satiety: 3, mood: 3 } },
                { message: 'Слушал уличного музыканта неподалёку.', effect: { mood: 4 } },
                { message: 'Увидел яркий закат с остановки.', effect: { mood: 5 } },
                { message: 'Сидел, наслаждаясь тёплым солнцем.', effect: { mood: 3, health: 3 } },
                { message: 'Прочитал смешной стикер на остановке.', effect: { mood: 4 } },
                { message: 'Увидел, как дети играют рядом.', effect: { mood: 4 } },
                { message: 'Поболтал с кондуктором, было весело.', effect: { mood: 4 } },
                { message: 'Сидел, глядя на цветущие кусты.', effect: { mood: 3 } },
                { message: 'Увидел, как кто-то подарил цветок прохожему.', effect: { mood: 4 } },
                { message: 'Слушал весёлую песню из машины.', effect: { mood: 4 } },
                { message: 'Сидел, наслаждаясь запахом цветов.', effect: { mood: 3 } },
                { message: 'Увидел яркий автобус, разукрашенный граффити.', effect: { mood: 4 } },
                { message: 'Слушал смех детей на остановке.', effect: { mood: 4 } },
                { message: 'Сидел, чувствуя тепло асфальта.', effect: { health: 3 } },
                { message: 'Увидел, как кто-то рисует на асфальте.', effect: { mood: 4 } },
                { message: 'Поболтал с доброй бабушкой.', effect: { mood: 4 } },
                { message: 'Слушал воркование голубей, мило.', effect: { mood: 3 } },
                { message: 'Увидел, как кто-то оставил книгу на скамейке.', effect: { mood: 4 } },
                { message: 'Сидел, наслаждаясь свежим воздухом.', effect: { mood: 3 } },
                { message: 'Увидел, как автобус подъехал быстро.', effect: { mood: 4 } },
                { message: 'Слушал, как ветер шелестит листвой.', effect: { mood: 3 } },
                { message: 'Увидел, как кто-то кормит птиц.', effect: { mood: 4 } },
                { message: 'Сидел, глядя на яркие цветы у дороги.', effect: { mood: 3 } },
                { message: 'Поболтал с весёлым водителем.', effect: { mood: 4 } },
                { message: 'Увидел, как дети пускают мыльные пузыри.', effect: { mood: 4 } },
                { message: 'Сидел, чувствуя тепло солнца.', effect: { health: 3 } },
                { message: 'Увидел яркую афишу о фестивале.', effect: { mood: 4 } },
                { message: 'Слушал, как кто-то играет на гитаре неподалёку.', effect: { mood: 5 } }
            ]
        },
        'Бар "У бобра" (18+)': {
            tragic: [
                { message: 'Сидел за стойкой, но выпивка не помогла.', effect: { mood: -5, satiety: 3 } },
                { message: 'Слушал пьяные разговоры, чувствуя тоску.', effect: { mood: -5 } },
                { message: 'Выпил горький эль, но настроение чуть поднялось.', effect: { mood: 2, satiety: 5, health: -2 } },
                { message: 'Поболтал с незнакомцем, стало немного легче.', effect: { mood: 3, satiety: 2 } },
                { message: 'Съел солёные орешки, но голова закружилась.', effect: { satiety: 5, health: -3 } },
                { message: 'Смотрел на бармена, мечтая о лучшем дне.', effect: { mood: 2 } },
                { message: 'Заказал дешёвый коктейль, вкус не впечатлил.', effect: { satiety: 3, mood: 2, health: -2 } },
                { message: 'Слушал музыку в баре, но мысли всё равно мрачные.', effect: { mood: 3 } },
                { message: 'Кто-то угостил пивом, это немного утешило.', effect: { satiety: 5, mood: 3, health: -2 } },
                { message: 'Сидел в углу, но барная атмосфера чуть отвлекла.', effect: { mood: 2 } },
                { message: 'Попробовал закуску, но желудок недоволен.', effect: { satiety: 4, health: -3 } },
                { message: 'Смотрел на танцующих, мечтая о радости.', effect: { mood: 2 } },
                { message: 'Выпил воды, но всё равно тоскливо.', effect: { satiety: 3, mood: 1 } },
                { message: 'Кто-то рассказал анекдот, слегка улыбнулся.', effect: { mood: 3 } },
                { message: 'Съел чипсы, но дым в баре раздражает.', effect: { satiety: 4, health: -2 } },
                { message: 'Слушал старый джаз, это немного успокоило.', effect: { mood: 3 } },
                { message: 'Бармен налил шот, но радости мало.', effect: { satiety: 3, mood: 2, health: -2 } },
                { message: 'Поболтал с пьяным соседом, стало чуть веселее.', effect: { mood: 3 } },
                { message: 'Нашёл мелочь в кармане, заказал сок.', effect: { satiety: 4, mood: 2 } },
                { message: 'Смотрел на барный декор, отвлёкся от мыслей.', effect: { mood: 2 } },
                { message: 'Съел кусок пиццы, но пересолено.', effect: { satiety: 5, health: -2 } },
                { message: 'Кто-то похлопал по плечу, стало теплее.', effect: { mood: 3 } },
                { message: 'Выпил лимонад, но грусть не уходит.', effect: { satiety: 3, mood: 2 } },
                { message: 'Слушал гитару уличного музыканта через окно.', effect: { mood: 3 } },
                { message: 'Попробовал сырные палочки, но дым в глазах.', effect: { satiety: 4, health: -2 } },
                { message: 'Поболтал о погоде с барменом, немного легче.', effect: { mood: 2 } },
                { message: 'Нашёл конфету в кармане, мелочь, а приятно.', effect: { satiety: 3, mood: 2 } },
                { message: 'Смотрел на огоньки в баре, чуть отвлёкся.', effect: { mood: 2 } },
                { message: 'Выпил травяной чай, но всё равно грустно.', effect: { satiety: 3, mood: 1 } },
                { message: 'Кто-то угостил орешками, это мило.', effect: { satiety: 4, mood: 3 } }
            ],
            sad: [
                { message: 'Выпил дешёвого пива, настроение не улучшилось.', effect: { satiety: 5, mood: -3 } },
                { message: 'Попытался танцевать, но быстро устал.', effect: { energy: -5, mood: -3 } },
                { message: 'Съел хот-дог, но всё ещё грустно.', effect: { satiety: 6, mood: 2, health: -2 } },
                { message: 'Слушал разговоры за стойкой, немного отвлёкся.', effect: { mood: 3 } },
                { message: 'Заказал сок, но дым в баре мешает.', effect: { satiety: 4, health: -2 } },
                { message: 'Пошутил с соседом по стойке, стало легче.', effect: { mood: 4 } },
                { message: 'Попробовал картошку фри, но она жирная.', effect: { satiety: 5, health: -3 } },
                { message: 'Слушал живую музыку, настроение чуть поднялось.', effect: { mood: 3 } },
                { message: 'Кто-то угостил коктейлем, это приятно.', effect: { satiety: 5, mood: 4, health: -2 } },
                { message: 'Смотрел на барную стойку, задумался о жизни.', effect: { mood: 2 } },
                { message: 'Съел пару оливок, но всё ещё тоскливо.', effect: { satiety: 3, mood: 2 } },
                { message: 'Поболтал с барменом о футболе, стало веселее.', effect: { mood: 4 } },
                { message: 'Выпил лимонад, лёгкое облегчение.', effect: { satiety: 4, mood: 3 } },
                { message: 'Смотрел на танцующих, но сам не решился.', effect: { mood: 2 } },
                { message: 'Съел кусок пиццы, но пересолено.', effect: { satiety: 5, health: -2 } },
                { message: 'Кто-то рассказал анекдот, улыбнулся.', effect: { mood: 4 } },
                { message: 'Попробовал сырные палочки, вкусненько.', effect: { satiety: 5, mood: 3, health: -2 } },
                { message: 'Слушал старый рок, немного взбодрился.', effect: { mood: 3 } },
                { message: 'Выпил травяной чай, стало спокойнее.', effect: { satiety: 3, mood: 3 } },
                { message: 'Пошутил с посетителем, посмеялись вместе.', effect: { mood: 4 } },
                { message: 'Съел чипсы, но дым раздражает горло.', effect: { satiety: 4, health: -2 } },
                { message: 'Смотрел на огоньки в баре, задумался.', effect: { mood: 2 } },
                { message: 'Кто-то угостил орешками, мелочь, а приятно.', effect: { satiety: 4, mood: 3 } },
                { message: 'Слушал бармена, его истории интересные.', effect: { mood: 3 } },
                { message: 'Выпил газировку, стало чуть легче.', effect: { satiety: 4, mood: 2 } },
                { message: 'Смотрел на вывеску бара, отвлёкся.', effect: { mood: 2 } },
                { message: 'Попробовал крекеры, но всё ещё грустно.', effect: { satiety: 3, mood: 2 } },
                { message: 'Поболтал о жизни с незнакомцем.', effect: { mood: 3 } },
                { message: 'Съел солёные орешки, но голова побаливает.', effect: { satiety: 4, health: -2 } },
                { message: 'Слушал музыку, немного расслабился.', effect: { mood: 3 } }
            ],
            good: [
                { message: 'Угостили коктейлем, вечер стал лучше.', effect: { satiety: 5, mood: 5 } },
                { message: 'Пошутил с барменом, посмеялись вместе.', effect: { mood: 5 } },
                { message: 'Попробовал новый коктейль, вкус огонь!', effect: { satiety: 6, mood: 6, health: -2 } },
                { message: 'Танцевал под ритмичную музыку, кайф!', effect: { mood: 6, energy: -3 } },
                { message: 'Съел вкусную пиццу, настроение на высоте.', effect: { satiety: 8, mood: 5, health: -2 } },
                { message: 'Поболтал с весёлой компанией, зарядили.', effect: { mood: 6 } },
                { message: 'Выпил крафтовое пиво, отличный вкус.', effect: { satiety: 5, mood: 5, health: -2 } },
                { message: 'Слушал живую музыку, душа поёт.', effect: { mood: 6 } },
                { message: 'Съел сырные палочки, объедение!', effect: { satiety: 6, mood: 5, health: -2 } },
                { message: 'Пошутил с соседом по стойке, посмеялись.', effect: { mood: 5 } },
                { message: 'Заказал лимонад, освежает.', effect: { satiety: 4, mood: 4 } },
                { message: 'Смотрел на барный декор, атмосферно.', effect: { mood: 5 } },
                { message: 'Попробовал картошку фри, хрустящая.', effect: { satiety: 5, mood: 4, health: -2 } },
                { message: 'Слушал анекдоты, настроение поднялось.', effect: { mood: 6 } },
                { message: 'Кто-то угостил шотом, вечер удался.', effect: { satiety: 3, mood: 5, health: -2 } },
                { message: 'Танцевал с незнакомкой, было весело.', effect: { mood: 6, energy: -3 } },
                { message: 'Съел хот-дог, сытно и вкусно.', effect: { satiety: 7, mood: 5, health: -2 } },
                { message: 'Поболтал о музыке с барменом.', effect: { mood: 5 } },
                { message: 'Выпил фруктовый коктейль, настроение лучше.', effect: { satiety: 5, mood: 5, health: -2 } },
                { message: 'Смотрел на танцпол, заряжает.', effect: { mood: 5 } },
                { message: 'Съел орешки, хрустящее удовольствие.', effect: { satiety: 4, mood: 4 } },
                { message: 'Слушал джаз, расслабляет.', effect: { mood: 5 } },
                { message: 'Попробовал новый снэк, понравилось.', effect: { satiety: 5, mood: 4, health: -2 } },
                { message: 'Пошутил с компанией, все ржали.', effect: { mood: 6 } },
                { message: 'Выпил газировку, бодрит.', effect: { satiety: 4, mood: 4 } },
                { message: 'Смотрел на барные огоньки, уютно.', effect: { mood: 5 } },
                { message: 'Съел кусок пиццы, просто класс.', effect: { satiety: 6, mood: 5, health: -2 } },
                { message: 'Поболтал с барменом о жизни.', effect: { mood: 5 } },
                { message: 'Выпил травяной чай, расслабляет.', effect: { satiety: 3, mood: 4 } },
                { message: 'Кто-то угостил чипсами, приятно.', effect: { satiety: 4, mood: 5 } }
            ],
            happy: [
                { message: 'Танцевал всю ночь, это было круто!', effect: { mood: 10, energy: -5 } },
                { message: 'Пел караоке с незнакомцами, полный кайф!', effect: { mood: 10 } },
                { message: 'Попробовал авторский коктейль, взрыв вкуса!', effect: { satiety: 8, mood: 10, health: -2 } },
                { message: 'Танцевал под хиты, энергия бьёт ключом!', effect: { mood: 10, energy: -3 } },
                { message: 'Съел вкуснейший бургер, счастье полное.', effect: { satiety: 10, mood: 8, health: -2 } },
                { message: 'Поболтал с весёлой толпой, ржал до слёз.', effect: { mood: 10 } },
                { message: 'Выпил крафтовое пиво, вечер идеальный.', effect: { satiety: 6, mood: 8, health: -2 } },
                { message: 'Слушал живую группу, мурашки по коже.', effect: { mood: 10 } },
                { message: 'Съел пиццу, лучшая в городе!', effect: { satiety: 8, mood: 8, health: -2 } },
                { message: 'Танцевал с друзьями, это было эпично.', effect: { mood: 10, energy: -3 } },
                { message: 'Попробовал десерт, сладкий рай.', effect: { satiety: 7, mood: 8, health: -2 } },
                { message: 'Пошутил с барменом, все ржали.', effect: { mood: 10 } },
                { message: 'Выпил коктейль, настроение на миллион.', effect: { satiety: 6, mood: 8, health: -2 } },
                { message: 'Смотрел на танцпол, сам зажёг!', effect: { mood: 8, energy: -3 } },
                { message: 'Съел сырные палочки, объедение.', effect: { satiety: 7, mood: 8, health: -2 } },
                { message: 'Пел в караоке, звезда вечера!', effect: { mood: 10 } },
                { message: 'Выпил фруктовый шот, полный восторг.', effect: { satiety: 5, mood: 8, health: -2 } },
                { message: 'Танцевал с незнакомцем, весело!', effect: { mood: 10, energy: -3 } },
                { message: 'Съел хот-дог, сытно и вкусно.', effect: { satiety: 8, mood: 8, health: -2 } },
                { message: 'Слушал рок, это мой вечер!', effect: { mood: 8 } },
                { message: 'Попробовал чипсы с соусом, кайф.', effect: { satiety: 6, mood: 8, health: -2 } },
                { message: 'Поболтал с компанией, все свои.', effect: { mood: 10 } },
                { message: 'Выпил лимонад, свежесть и радость.', effect: { satiety: 5, mood: 8 } },
                { message: 'Смотрел на барные огоньки, душа поёт.', effect: { mood: 8 } },
                { message: 'Съел орешки, хрустящее счастье.', effect: { satiety: 5, mood: 8 } },
                { message: 'Танцевал под джаз, полный релакс.', effect: { mood: 8, energy: -3 } },
                { message: 'Попробовал новый снэк, супер!', effect: { satiety: 6, mood: 8, health: -2 } },
                { message: 'Пошутил с соседом, ржали до упаду.', effect: { mood: 10 } },
                { message: 'Выпил газировку, бодрость и радость.', effect: { satiety: 5, mood: 8 } },
                { message: 'Смотрел на барную атмосферу, кайфую.', effect: { mood: 8 } }
            ]
        },
        'Бизнес центр "Альбион"': {
            tragic: [
                { message: 'Сидел в холле, глядя на мелькающие лица.', effect: { mood: -2, energy: -5 } },
                { message: 'Ждал лифт, но он застрял на другом этаже.', effect: { energy: -5 } },
                { message: 'Пытался сосредоточиться, но шум мешал.', effect: { energy: -3, mood: -2 } },
                { message: 'Забыл, где припарковал машину, и бродил по парковке.', effect: { energy: -5, mood: -3 } },
                { message: 'Сидел в кафе, но еда оказалась невкусной.', effect: { satiety: -3, mood: -2 } },
                { message: 'Пытался найти тихое место, но везде суета.', effect: { energy: -3 } },
                { message: 'Уронил телефон в лифте, экран треснул.', effect: { mood: -3, energy: -2 } },
                { message: 'Ждал встречи, но её отменили в последний момент.', effect: { mood: -3, energy: -3 } },
                { message: 'Пытался выпить кофе, но пролил его на рубашку.', effect: { mood: -2, satiety: -2 } },
                { message: 'Сидел в переговорной, но мысли путались.', effect: { energy: -3 } },
                { message: 'Забыл код от двери, пришлось ждать охрану.', effect: { energy: -5, mood: -2 } },
                { message: 'Пытался поработать, но интернет отключился.', effect: { energy: -3, mood: -2 } },
                { message: 'Сел на неудобный стул, спина затекла.', effect: { energy: -3, health: -1 } },
                { message: 'Ждал курьера, но он опоздал.', effect: { energy: -3 } },
                { message: 'Пытался найти туалет, но заблудился в коридорах.', effect: { energy: -5 } },
                { message: 'Слушал скучную презентацию, глаза слипались.', effect: { energy: -5, mood: -2 } },
                { message: 'Купил сэндвич, но он был вчерашним.', effect: { satiety: -3, mood: -2 } },
                { message: 'Сидел в шумном холле, чувствуя усталость.', effect: { energy: -5 } },
                { message: 'Пытался дозвониться, но телефон разрядился.', effect: { mood: -3, energy: -2 } },
                { message: 'Забыл документы в офисе, пришлось возвращаться.', effect: { energy: -5, mood: -2 } },
                { message: 'Ждал такси у входа, но оно не приехало.', effect: { energy: -3, mood: -2 } },
                { message: 'Сидел в кафе, но официант забыл заказ.', effect: { satiety: -3, mood: -2 } },
                { message: 'Пытался найти Wi-Fi, но сигнал был слабым.', effect: { energy: -3 } },
                { message: 'Сел в лифт, но он остановился между этажами.', effect: { mood: -3, energy: -3 } },
                { message: 'Пытался сосредоточиться на работе, но шум отвлекал.', effect: { energy: -5 } },
                { message: 'Забыл, где оставил сумку, и паниковал.', effect: { mood: -3, energy: -3 } },
                { message: 'Сидел в холодном офисе, мёрзнув.', effect: { health: -1, energy: -3 } },
                { message: 'Пытался найти кофе, но автомат сломался.', effect: { satiety: -2, mood: -2 } },
                { message: 'Ждал коллегу, но он не пришёл.', effect: { mood: -3, energy: -3 } },
                { message: 'Пытался выйти, но двери были закрыты.', effect: { energy: -5, mood: -2 } }
            ],
            sad: [
                { message: 'Сидел в кафе, но кофе был холодным.', effect: { satiety: -2, mood: -2 } },
                { message: 'Ждал лифт, но он был переполнен.', effect: { energy: -3 } },
                { message: 'Пытался поработать, но отвлекали звонки.', effect: { energy: -3, mood: -1 } },
                { message: 'Забыл ручку, пришлось просить у коллеги.', effect: { mood: -2 } },
                { message: 'Сидел в переговорной, но кондиционер шумел.', effect: { energy: -3 } },
                { message: 'Пытался найти место для парковки, но всё занято.', effect: { energy: -5 } },
                { message: 'Купил булочку, но она была сухой.', effect: { satiety: -2, mood: -2 } },
                { message: 'Слушал радио в холле, но музыка раздражала.', effect: { mood: -2 } },
                { message: 'Пытался сосредоточиться, но коллеги шумели.', effect: { energy: -3 } },
                { message: 'Ждал лифт, но он ехал слишком долго.', effect: { energy: -3 } },
                { message: 'Сидел в офисе, но свет мигал.', effect: { energy: -2, mood: -1 } },
                { message: 'Пытался выпить воды, но кулер был пуст.', effect: { satiety: -2 } },
                { message: 'Сидел в холле, но кресло было неудобным.', effect: { energy: -3 } },
                { message: 'Пытался найти выход, но указатели запутали.', effect: { energy: -3 } },
                { message: 'Ждал звонка, но телефон молчал.', effect: { mood: -2 } },
                { message: 'Пытался поесть, но столовая была закрыта.', effect: { satiety: -3, mood: -2 } },
                { message: 'Сидел у окна, но вид был на парковку.', effect: { mood: -2 } },
                { message: 'Пытался зарядить телефон, но розетка не работала.', effect: { energy: -2 } },
                { message: 'Ждал встречи, но она задержалась.', effect: { energy: -3, mood: -1 } },
                { message: 'Пытался найти кофе, но очередь была огромной.', effect: { energy: -3 } },
                { message: 'Сидел в офисе, но было слишком душно.', effect: { energy: -3, health: -1 } },
                { message: 'Пытался напечатать документ, но принтер сломался.', effect: { energy: -3 } },
                { message: 'Сидел в кафе, но Wi-Fi не подключался.', effect: { energy: -2 } },
                { message: 'Пытался найти туалет, но всё занято.', effect: { energy: -3 } },
                { message: 'Ждал такси, но оно застряло в пробке.', effect: { energy: -3, mood: -1 } },
                { message: 'Сидел в переговорной, но стул скрипел.', effect: { energy: -2 } },
                { message: 'Пытался поработать, но отвлекали объявления.', effect: { energy: -3 } },
                { message: 'Ждал лифт, но он был на ремонте.', effect: { energy: -5 } },
                { message: 'Пытался купить еду, но автомат не принимал деньги.', effect: { satiety: -2, mood: -2 } },
                { message: 'Сидел в холле, но было слишком шумно.', effect: { energy: -3, mood: -2 } }
            ],
            good: [
                { message: 'Выпил кофе в кафе, немного взбодрился.', effect: { satiety: 3, energy: -2 } },
                { message: 'Поболтал с коллегой в холле, стало легче.', effect: { mood: 2 } },
                { message: 'Нашёл удобное кресло в офисе.', effect: { energy: -2 } },
                { message: 'Успел на лифт, не пришлось ждать.', effect: { energy: -1 } },
                { message: 'Прочитал интересный постер в холле.', effect: { mood: 2 } },
                { message: 'Поел сэндвич в кафе, неплохо.', effect: { satiety: 3, energy: -2 } },
                { message: 'Нашёл тихий уголок для работы.', effect: { energy: -2 } },
                { message: 'Улыбнулся охраннику, он кивнул в ответ.', effect: { mood: 2 } },
                { message: 'Сидел у окна, наблюдая за облаками.', effect: { mood: 2 } },
                { message: 'Нашёл розетку для зарядки телефона.', effect: { energy: -1 } },
                { message: 'Закончил работу вовремя, без суеты.', effect: { energy: -2 } },
                { message: 'Поболтал с коллегой за кофе.', effect: { mood: 2, satiety: 2 } },
                { message: 'Нашёл удобное место в кафе.', effect: { energy: -2 } },
                { message: 'Успел на встречу без опозданий.', effect: { mood: 2 } },
                { message: 'Прочитал объявление о мероприятии.', effect: { mood: 2 } },
                { message: 'Выпил воды из кулера, освежился.', effect: { satiety: 2, energy: -1 } },
                { message: 'Сидел в переговорной, всё прошло гладко.', effect: { energy: -2 } },
                { message: 'Нашёл парковку недалеко от входа.', effect: { energy: -1 } },
                { message: 'Поглядел в окно, вид немного поднял настроение.', effect: { mood: 2 } },
                { message: 'Поел фрукты в кафе, неплохо.', effect: { satiety: 3, energy: -2 } },
                { message: 'Нашёл Wi-Fi с хорошим сигналом.', effect: { energy: -1 } },
                { message: 'Поболтал с администратором, было приятно.', effect: { mood: 2 } },
                { message: 'Сидел в холле, слушая спокойную музыку.', effect: { mood: 2 } },
                { message: 'Зарядил телефон без проблем.', effect: { energy: -1 } },
                { message: 'Успел напечатать документы вовремя.', effect: { energy: -2 } },
                { message: 'Нашёл удобный стул в офисе.', effect: { energy: -2 } },
                { message: 'Поел суп в кафе, согрелся.', effect: { satiety: 3, energy: -2 } },
                { message: 'Поболтал с коллегой о погоде.', effect: { mood: 2 } },
                { message: 'Нашёл выход без проблем.', effect: { energy: -1 } },
                { message: 'Сидел в кафе, наслаждаясь тишиной.', effect: { mood: 2, energy: -2 } }
            ],
            happy: [
                { message: 'Выпил вкусный кофе, день начался отлично!', effect: { satiety: 5, energy: -2 } },
                { message: 'Поболтал с коллегами, посмеялись вместе.', effect: { mood: 5 } },
                { message: 'Нашёл идеальное место для работы.', effect: { energy: -2 } },
                { message: 'Успел на встречу и получил похвалу.', effect: { mood: 5 } },
                { message: 'Поел вкусный салат в кафе.', effect: { satiety: 5, energy: -2 } },
                { message: 'Нашёл удобное кресло у окна.', effect: { mood: 3, energy: -2 } },
                { message: 'Поболтал с охранником, он был дружелюбен.', effect: { mood: 3 } },
                { message: 'Сидел в холле, наслаждаясь видом.', effect: { mood: 3 } },
                { message: 'Нашёл быстрый Wi-Fi, всё работает!', effect: { energy: -1 } },
                { message: 'Закончил работу раньше, чем ожидал.', effect: { mood: 3, energy: -2 } },
                { message: 'Поел десерт в кафе, настроение взлетело!', effect: { satiety: 5, mood: 3 } },
                { message: 'Поболтал с коллегой о планах на выходные.', effect: { mood: 3 } },
                { message: 'Нашёл идеальную парковку у входа.', effect: { energy: -1 } },
                { message: 'Сидел в переговорной, всё прошло идеально.', effect: { mood: 3 } },
                { message: 'Выпил смузи, чувствуя прилив сил.', effect: { satiety: 5, energy: -2 } },
                { message: 'Нашёл тихое место и сосредоточился.', effect: { energy: -2 } },
                { message: 'Улыбнулся прохожему, он ответил тем же.', effect: { mood: 3 } },
                { message: 'Сидел в кафе, слушая хорошую музыку.', effect: { mood: 3, energy: -2 } },
                { message: 'Успел на лифт с коллегой, поболтали.', effect: { mood: 3 } },
                { message: 'Нашёл интересный журнал в холле.', effect: { mood: 3 } },
                { message: 'Поел горячий суп, согрелся.', effect: { satiety: 5, energy: -2 } },
                { message: 'Поболтал с администратором, было весело.', effect: { mood: 3 } },
                { message: 'Зарядил телефон и успел всё сделать.', effect: { energy: -1 } },
                { message: 'Сидел у окна, наслаждаясь солнцем.', effect: { mood: 3 } },
                { message: 'Нашёл вкусный сэндвич в кафе.', effect: { satiety: 5, energy: -2 } },
                { message: 'Поболтал с коллегой о новостях.', effect: { mood: 3 } },
                { message: 'Нашёл удобное место в переговорной.', effect: { energy: -2 } },
                { message: 'Успел напечатать все документы.', effect: { energy: -2 } },
                { message: 'Сидел в холле, чувствуя себя комфортно.', effect: { mood: 3 } },
                { message: 'Поел фрукты, настроение улучшилось.', effect: { satiety: 5, energy: -2 } }
            ]
        },
        'Вокзал': {
            tragic: [
                { message: 'Сидел на скамейке вокзала, чувствуя безнадёжность.', effect: { mood: -2, energy: -5 } },
                { message: 'Ждал поезда, но он задержался на час.', effect: { energy: -5 } },
                { message: 'Смотрел на толпу, ощущая себя чужим.', effect: { mood: -2 } },
                { message: 'Пытался найти еду, но всё слишком дорого.', effect: { satiety: -5 } },
                { message: 'Забыл билет, пришлось бегать за новым.', effect: { energy: -5, mood: -2 } },
                { message: 'Слушал шум поездов, он раздражал.', effect: { energy: -3 } },
                { message: 'Сидел в зале ожидания, чувствуя усталость.', effect: { energy: -5 } },
                { message: 'Попытался вздремнуть, но скамейка слишком жёсткая.', effect: { energy: -3 } },
                { message: 'Увидел, как кто-то пролил кофе, настроение упало.', effect: { mood: -2 } },
                { message: 'Ждал друга, но он так и не пришёл.', effect: { mood: -2, energy: -3 } },
                { message: 'Пропустил поезд, придётся ждать следующий.', effect: { energy: -5, mood: -2 } },
                { message: 'Смотрел на расписание, ничего не понятно.', effect: { mood: -2 } },
                { message: 'Пытался найти тихое место, но вокзал гудит.', effect: { energy: -3 } },
                { message: 'Купил воду, но она оказалась тёплой.', effect: { satiety: -3 } },
                { message: 'Сидел, глядя на пустые пути.', effect: { mood: -2 } },
                { message: 'Случайно толкнули в толпе, неприятно.', effect: { mood: -2 } },
                { message: 'Пытался зарядить телефон, но розетка не работает.', effect: { energy: -3 } },
                { message: 'Ждал объявления, но громкоговоритель неразборчивый.', effect: { mood: -2 } },
                { message: 'Сидел на холодной скамейке, замёрз.', effect: { energy: -5 } },
                { message: 'Попытался поесть, но еда в кафе невкусная.', effect: { satiety: -3 } },
                { message: 'Слушал чужие разговоры, чувствуя тоску.', effect: { mood: -2 } },
                { message: 'Пытался найти туалет, но всё занято.', effect: { energy: -3 } },
                { message: 'Смотрел на уходящие поезда, чувствуя себя застрявшим.', effect: { mood: -2 } },
                { message: 'Ждал багаж, но его задержали.', effect: { energy: -5 } },
                { message: 'Пытался купить билет, но терминал сломан.', effect: { energy: -3 } },
                { message: 'Сидел в шумном зале, голова болит.', effect: { energy: -3 } },
                { message: 'Потерял перчатку в толпе.', effect: { mood: -2 } },
                { message: 'Ждал поезда в холодном зале ожидания.', effect: { energy: -5 } },
                { message: 'Смотрел на людей, спешащих куда-то, а я никуда не спешу.', effect: { mood: -2 } },
                { message: 'Пытался найти место, чтобы присесть, но всё занято.', effect: { energy: -3 } }
            ],
            sad: [
                { message: 'Купил кофе, но он оказался горьким.', effect: { satiety: -3, mood: -1 } },
                { message: 'Сидел на вокзале, наблюдая за спешащими людьми.', effect: { energy: -3 } },
                { message: 'Ждал поезда, но он опаздывает.', effect: { energy: -3 } },
                { message: 'Попытался почитать, но шум отвлекает.', effect: { energy: -3 } },
                { message: 'Смотрел в окно на серые пути.', effect: { mood: -1 } },
                { message: 'Купил булку, но она сухая.', effect: { satiety: -3 } },
                { message: 'Слушал объявления, но всё равно ничего не понял.', effect: { mood: -1 } },
                { message: 'Сидел в толпе, чувствуя себя не в своей тарелке.', effect: { mood: -1 } },
                { message: 'Пытался найти Wi-Fi, но он не работает.', effect: { energy: -3 } },
                { message: 'Ждал друга, но он опаздывает.', effect: { mood: -1 } },
                { message: 'Сидел на скамейке, но она неудобная.', effect: { energy: -3 } },
                { message: 'Пытался купить еду, но очередь слишком длинная.', effect: { satiety: -3 } },
                { message: 'Смотрел на толпу, чувствуя себя одиноким.', effect: { mood: -1 } },
                { message: 'Ждал поезда, но он всё не идёт.', effect: { energy: -3 } },
                { message: 'Пытался найти укромное место, но вокзал переполнен.', effect: { energy: -3 } },
                { message: 'Слушал шум вокзала, он раздражает.', effect: { mood: -1 } },
                { message: 'Купил журнал, но он оказался неинтересным.', effect: { mood: -1 } },
                { message: 'Сидел в зале ожидания, устав от ожидания.', effect: { energy: -3 } },
                { message: 'Пытался зарядить телефон, но розетки заняты.', effect: { energy: -3 } },
                { message: 'Смотрел на уходящие поезда, чувствуя тоску.', effect: { mood: -1 } },
                { message: 'Ждал багаж, но его всё нет.', effect: { energy: -3 } },
                { message: 'Пытался найти туалет, но очередь огромная.', effect: { energy: -3 } },
                { message: 'Сидел в шумном зале, чувствуя усталость.', effect: { energy: -3 } },
                { message: 'Купил воду, но бутылка оказалась тёплой.', effect: { satiety: -3 } },
                { message: 'Смотрел на расписание, но оно запутанное.', effect: { mood: -1 } },
                { message: 'Пытался вздремнуть, но шум мешает.', effect: { energy: -3 } },
                { message: 'Сидел на холодной скамейке, замёрз.', effect: { energy: -3 } },
                { message: 'Попытался поесть, но еда невкусная.', effect: { satiety: -3 } },
                { message: 'Слушал чужие разговоры, но они неинтересны.', effect: { mood: -1 } },
                { message: 'Ждал объявления, но громкоговоритель не работает.', effect: { mood: -1 } }
            ],
            good: [
                { message: 'Купил вкусный кофе на вокзале.', effect: { satiety: 3, mood: 2 } },
                { message: 'Поболтал с попутчиком, было интересно.', effect: { mood: 2 } },
                { message: 'Нашёл удобное место в зале ожидания.', effect: { energy: -2, mood: 2 } },
                { message: 'Увидел красивый поезд, впечатляет.', effect: { mood: 2 } },
                { message: 'Прочитал интересное объявление на вокзале.', effect: { mood: 2 } },
                { message: 'Съел свежую булочку из киоска.', effect: { satiety: 3, mood: 2 } },
                { message: 'Слушал музыку, ожидая поезда.', effect: { mood: 2 } },
                { message: 'Нашёл розетку и зарядил телефон.', effect: { energy: -2, mood: 2 } },
                { message: 'Погулял по платформе, размялся.', effect: { energy: -3, mood: 2 } },
                { message: 'Увидел смешную рекламу на вокзале.', effect: { mood: 2 } },
                { message: 'Поезд пришёл вовремя, приятно.', effect: { mood: 2 } },
                { message: 'Купил журнал, чтобы скоротать время.', effect: { mood: 2 } },
                { message: 'Сидел в кафе, наблюдая за людьми.', effect: { energy: -2, mood: 2 } },
                { message: 'Нашёл тихое место на вокзале.', effect: { energy: -2, mood: 2 } },
                { message: 'Поболтал с кассиром, он был дружелюбным.', effect: { mood: 2 } },
                { message: 'Съел бутерброд, неплохо.', effect: { satiety: 3, mood: 2 } },
                { message: 'Смотрел на поезда, это успокаивает.', effect: { mood: 2 } },
                { message: 'Нашёл Wi-Fi, подключился.', effect: { mood: 2 } },
                { message: 'Ждал поезда, но время прошло быстро.', effect: { energy: -2 } },
                { message: 'Увидел старого друга на вокзале.', effect: { mood: 2 } },
                { message: 'Сидел на скамейке, наслаждаясь солнцем.', effect: { energy: -2, mood: 2 } },
                { message: 'Купил сувенир на вокзале.', effect: { mood: 2 } },
                { message: 'Слушал объявления, всё чётко.', effect: { mood: 2 } },
                { message: 'Нашёл удобную скамейку для отдыха.', effect: { energy: -2, mood: 2 } },
                { message: 'Съел яблоко, перекусил.', effect: { satiety: 3, mood: 2 } },
                { message: 'Погулял по вокзалу, интересно.', effect: { energy: -3, mood: 2 } },
                { message: 'Увидел красивую вывеску на вокзале.', effect: { mood: 2 } },
                { message: 'Ждал поезда, но настроение всё равно хорошее.', effect: { energy: -2, mood: 2 } },
                { message: 'Сидел в кафе, наблюдая за поездами.', effect: { energy: -2, mood: 2 } },
                { message: 'Поболтал с соседом по скамейке.', effect: { mood: 2 } }
            ],
            happy: [
                { message: 'Увидел яркий поезд, настроение взлетело!', effect: { mood: 3, energy: -2 } },
                { message: 'Поболтал с весёлым попутчиком, посмеялись.', effect: { mood: 3 } },
                { message: 'Съел вкусный хот-дог на вокзале!', effect: { satiety: 5, mood: 3 } },
                { message: 'Поезд пришёл раньше, отличный день!', effect: { mood: 3 } },
                { message: 'Танцевал под музыку уличного артиста на вокзале.', effect: { mood: 3, energy: -3 } },
                { message: 'Нашёл идеальное место для ожидания.', effect: { energy: -2, mood: 3 } },
                { message: 'Сфотографировал красивый вокзал.', effect: { mood: 3 } },
                { message: 'Поболтал с кассиром, он был очень добрым.', effect: { mood: 3 } },
                { message: 'Съел мороженое, наслаждаясь моментом.', effect: { satiety: 5, mood: 3 } },
                { message: 'Слушал живую музыку на вокзале.', effect: { mood: 3 } },
                { message: 'Увидел смешного ребёнка, улыбнулся.', effect: { mood: 3 } },
                { message: 'Нашёл удобное кресло в зале ожидания.', effect: { energy: -2, mood: 3 } },
                { message: 'Купил яркий сувенир на память.', effect: { mood: 3 } },
                { message: 'Погулял по платформе, полный энергии.', effect: { energy: -3, mood: 3 } },
                { message: 'Смотрел на поезда, чувствуя вдохновение.', effect: { mood: 3 } },
                { message: 'Подключился к быстрому Wi-Fi, круто!', effect: { mood: 3 } },
                { message: 'Съел свежий круассан, вкуснятина!', effect: { satiety: 5, mood: 3 } },
                { message: 'Увидел радугу над вокзалом.', effect: { mood: 3 } },
                { message: 'Поболтал с туристами, было весело.', effect: { mood: 3 } },
                { message: 'Сидел в кафе, наслаждаясь видом на поезда.', effect: { energy: -2, mood: 3 } },
                { message: 'Нашёл интересную книгу в киоске.', effect: { mood: 3 } },
                { message: 'Увидел красивый закат с платформы.', effect: { mood: 3 } },
                { message: 'Поезд пришёл вовремя, всё идеально!', effect: { mood: 3 } },
                { message: 'Слушал уличного музыканта, настроение на высоте.', effect: { mood: 3 } },
                { message: 'Съел вкусный сэндвич, день удался!', effect: { satiety: 5, mood: 3 } },
                { message: 'Погулял по вокзалу, полный энтузиазма.', effect: { energy: -3, mood: 3 } },
                { message: 'Увидел смешную рекламу, посмеялся.', effect: { mood: 3 } },
                { message: 'Поболтал с дружелюбным соседом.', effect: { mood: 3 } },
                { message: 'Нашёл удобное место для зарядки телефона.', effect: { energy: -2, mood: 3 } },
                { message: 'Смотрел на прибывающие поезда, вдохновляет.', effect: { mood: 3 } }
            ]
        },
        'ЖК Сфера': {
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
        'Завод': {
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
        'Кофейня "Ляля-Фа"': {
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
        'Лес': {
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
        'Мастерская': {
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
        'Парк': {
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
        'Полигон утилизации': {
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
        'Приют для животных "Кошкин дом"': {
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
        'Район Дачный': {
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
        'Магазин "Всё на свете"': {
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
        'Под мостом': {
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
                { message: 'Сидел на скамейке, глядя на пустую дорогу.', effect: { mood: -3 } },
                { message: 'Ждал автобус, но расписание оказалось устаревшим.', effect: { mood: -2, energy: -2 } },
                { message: 'Пытался укрыться от ветра за остановкой.', effect: { health: -2, mood: -2 } },
                { message: 'Смотрел на мусор, валяющийся у остановки.', effect: { mood: -3 } },
                { message: 'Пропустил автобус, потому что задумался.', effect: { mood: -3, energy: -2 } },
                { message: 'Слушал шум машин, чувствуя тоску.', effect: { mood: -3 } },
                { message: 'Пытался согреться, но ветер пробирал до костей.', effect: { health: -3, mood: -2 } },
                { message: 'Сидел один, чувствуя себя забытым.', effect: { mood: -3 } },
                { message: 'Увидел, как автобус уехал, не остановившись.', effect: { mood: -4 } },
                { message: 'Пытался читать граффити на остановке, но всё бессмысленно.', effect: { mood: -2 } },
                { message: 'Смотрел на серое небо, чувствуя пустоту.', effect: { mood: -3 } },
                { message: 'Поскользнулся на мокром асфальте.', effect: { health: -2, mood: -2 } },
                { message: 'Ждал друга, но он так и не пришёл.', effect: { mood: -3 } },
                { message: 'Слушал гудки машин, раздражаясь.', effect: { mood: -3 } },
                { message: 'Пытался вспомнить, куда мне нужно ехать.', effect: { mood: -2, energy: -2 } },
                { message: 'Замёрз, стоя на остановке.', effect: { health: -3 } },
                { message: 'Увидел, как кто-то выбросил мусор мимо урны.', effect: { mood: -2 } },
                { message: 'Сидел, глядя на проезжающих, без цели.', effect: { mood: -3 } },
                { message: 'Пытался укрыться от мелкого дождя.', effect: { health: -2, mood: -2 } },
                { message: 'Ждал автобус, но он опять опаздывает.', effect: { mood: -3 } },
                { message: 'Смотрел на потрёпанное расписание.', effect: { mood: -2 } },
                { message: 'Пытался согреться, потирая руки.', effect: { health: -2 } },
                { message: 'Сидел, слушая шум ветра.', effect: { mood: -2 } },
                { message: 'Увидел старую афишу, оторванную наполовину.', effect: { mood: -2 } },
                { message: 'Ждал, но мысли путались в голове.', effect: { mood: -3 } },
                { message: 'Смотрел на лужи, отражавшие серое небо.', effect: { mood: -3 } },
                { message: 'Попытался присесть, но скамейка была мокрой.', effect: { mood: -2, health: -2 } },
                { message: 'Слушал, как капает с навеса остановки.', effect: { mood: -2 } },
                { message: 'Пытался найти смысл в ожидании.', effect: { mood: -3 } },
                { message: 'Сидел, глядя на пустую остановку.', effect: { mood: -3 } }
            ],
            sad: [
                { message: 'Сидел на скамейке, наблюдая за спешащими людьми.', effect: { mood: -2 } },
                { message: 'Прочитал объявление, но оно неинтересное.', effect: { mood: -2 } },
                { message: 'Ждал автобус, но он задерживается.', effect: { mood: -2, energy: -2 } },
                { message: 'Смотрел на проезжающие машины, скучая.', effect: { mood: -2 } },
                { message: 'Пытался согреться на холодной скамейке.', effect: { health: -2 } },
                { message: 'Слушал шум города, чувствуя усталость.', effect: { mood: -2, energy: -2 } },
                { message: 'Увидел голубя, клюющего крошки.', effect: { mood: -1 } },
                { message: 'Сидел, глядя на мокрый асфальт.', effect: { mood: -2 } },
                { message: 'Пытался вспомнить расписание автобусов.', effect: { mood: -2 } },
                { message: 'Ждал, но мысли были где-то далеко.', effect: { mood: -2 } },
                { message: 'Смотрел на людей, но чувствовал себя чужим.', effect: { mood: -2 } },
                { message: 'Попытался укрыться от ветра за столбом.', effect: { health: -2 } },
                { message: 'Сидел, слушая далёкий лай собак.', effect: { mood: -2 } },
                { message: 'Увидел, как кто-то уронил билет.', effect: { mood: -1 } },
                { message: 'Пытался разглядеть номера автобусов.', effect: { energy: -2 } },
                { message: 'Сидел, глядя на серые облака.', effect: { mood: -2 } },
                { message: 'Ждал, но время тянулось медленно.', effect: { mood: -2 } },
                { message: 'Смотрел на прохожих, но никто не улыбнулся.', effect: { mood: -2 } },
                { message: 'Пытался согреться, засунув руки в карманы.', effect: { health: -2 } },
                { message: 'Сидел, слушая шум шин по асфальту.', effect: { mood: -2 } },
                { message: 'Увидел старую газету, валяющуюся рядом.', effect: { mood: -2 } },
                { message: 'Пытался занять себя мыслями, но не вышло.', effect: { mood: -2 } },
                { message: 'Сидел, глядя на пустую урну.', effect: { mood: -2 } },
                { message: 'Ждал, но автобус всё не ехал.', effect: { mood: -2, energy: -2 } },
                { message: 'Смотрел на потёртую скамейку.', effect: { mood: -2 } },
                { message: 'Пытался уловить запах дождя.', effect: { mood: -1 } },
                { message: 'Сидел, чувствуя холод асфальта.', effect: { health: -2 } },
                { message: 'Смотрел на проезжающий грузовик.', effect: { mood: -2 } },
                { message: 'Ждал, но мысли были пустыми.', effect: { mood: -2 } },
                { message: 'Сидел, глядя на тёмные окна домов.', effect: { mood: -2 } }
            ],
            good: [
                { message: 'Увидел яркий автобус, настроение поднялось.', effect: { mood: 3 } },
                { message: 'Поболтал с попутчиком, было приятно.', effect: { mood: 3 } },
                { message: 'Нашёл монетку на скамейке.', effect: { mood: 2 } },
                { message: 'Слушал пение птиц неподалёку.', effect: { mood: 2 } },
                { message: 'Увидел смешное граффити на остановке.', effect: { mood: 3 } },
                { message: 'Поймал тёплый луч солнца, сидя на скамейке.', effect: { mood: 2, health: 2 } },
                { message: 'Прочитал забавное объявление на столбе.', effect: { mood: 2 } },
                { message: 'Сидел, наслаждаясь тишиной утра.', effect: { mood: 2 } },
                { message: 'Увидел, как ребёнок кормит голубей.', effect: { mood: 3 } },
                { message: 'Поболтал с водителем автобуса.', effect: { mood: 3 } },
                { message: 'Сидел, глядя на яркие цветы у дороги.', effect: { mood: 2 } },
                { message: 'Увидел, как кто-то делится едой с прохожим.', effect: { mood: 2 } },
                { message: 'Слушал лёгкий ветер, шелестящий листвой.', effect: { mood: 2 } },
                { message: 'Нашёл старый билет, вспомнил поездку.', effect: { mood: 2 } },
                { message: 'Сидел, наблюдая за спешащими людьми.', effect: { mood: 2 } },
                { message: 'Увидел яркую рекламу на остановке.', effect: { mood: 2 } },
                { message: 'Слушал музыку из проезжающей машины.', effect: { mood: 3 } },
                { message: 'Сидел, чувствуя тёплый асфальт под ногами.', effect: { health: 2 } },
                { message: 'Увидел, как кто-то рисует мелом на асфальте.', effect: { mood: 3 } },
                { message: 'Сидел, глядя на облака, похожие на животных.', effect: { mood: 2 } },
                { message: 'Поболтал с бабушкой на остановке.', effect: { mood: 3 } },
                { message: 'Слушал, как голуби воркуют рядом.', effect: { mood: 2 } },
                { message: 'Увидел, как кто-то оставил цветок на скамейке.', effect: { mood: 2 } },
                { message: 'Сидел, наслаждаясь запахом свежескошенной травы.', effect: { mood: 2 } },
                { message: 'Увидел яркий плакат о концерте.', effect: { mood: 3 } },
                { message: 'Слушал, как дети смеются неподалёку.', effect: { mood: 3 } },
                { message: 'Сидел, глядя на отражение в луже.', effect: { mood: 2 } },
                { message: 'Увидел, как кто-то кормит бездомную кошку.', effect: { mood: 3 } },
                { message: 'Сидел, чувствуя лёгкий бриз.', effect: { mood: 2 } },
                { message: 'Увидел, как автобус подъехал вовремя.', effect: { mood: 3 } }
            ],
            happy: [
                { message: 'Увидел радугу над дорогой, настроение взлетело!', effect: { mood: 5 } },
                { message: 'Поболтал с весёлым попутчиком, посмеялись.', effect: { mood: 5 } },
                { message: 'Нашёл монетку и угостился кофе.', effect: { satiety: 3, mood: 3 } },
                { message: 'Слушал уличного музыканта неподалёку.', effect: { mood: 4 } },
                { message: 'Увидел яркий закат с остановки.', effect: { mood: 5 } },
                { message: 'Сидел, наслаждаясь тёплым солнцем.', effect: { mood: 3, health: 3 } },
                { message: 'Прочитал смешной стикер на остановке.', effect: { mood: 4 } },
                { message: 'Увидел, как дети играют рядом.', effect: { mood: 4 } },
                { message: 'Поболтал с кондуктором, было весело.', effect: { mood: 4 } },
                { message: 'Сидел, глядя на цветущие кусты.', effect: { mood: 3 } },
                { message: 'Увидел, как кто-то подарил цветок прохожему.', effect: { mood: 4 } },
                { message: 'Слушал весёлую песню из машины.', effect: { mood: 4 } },
                { message: 'Сидел, наслаждаясь запахом цветов.', effect: { mood: 3 } },
                { message: 'Увидел яркий автобус, разукрашенный граффити.', effect: { mood: 4 } },
                { message: 'Слушал смех детей на остановке.', effect: { mood: 4 } },
                { message: 'Сидел, чувствуя тепло асфальта.', effect: { health: 3 } },
                { message: 'Увидел, как кто-то рисует на асфальте.', effect: { mood: 4 } },
                { message: 'Поболтал с доброй бабушкой.', effect: { mood: 4 } },
                { message: 'Слушал воркование голубей, мило.', effect: { mood: 3 } },
                { message: 'Увидел, как кто-то оставил книгу на скамейке.', effect: { mood: 4 } },
                { message: 'Сидел, наслаждаясь свежим воздухом.', effect: { mood: 3 } },
                { message: 'Увидел, как автобус подъехал быстро.', effect: { mood: 4 } },
                { message: 'Слушал, как ветер шелестит листвой.', effect: { mood: 3 } },
                { message: 'Увидел, как кто-то кормит птиц.', effect: { mood: 4 } },
                { message: 'Сидел, глядя на яркие цветы у дороги.', effect: { mood: 3 } },
                { message: 'Поболтал с весёлым водителем.', effect: { mood: 4 } },
                { message: 'Увидел, как дети пускают мыльные пузыри.', effect: { mood: 4 } },
                { message: 'Сидел, чувствуя тепло солнца.', effect: { health: 3 } },
                { message: 'Увидел яркую афишу о фестивале.', effect: { mood: 4 } },
                { message: 'Слушал, как кто-то играет на гитаре неподалёку.', effect: { mood: 5 } }
            ]
        },
        'Бар "У бобра" (18+)': {
            tragic: [
                { message: 'Спрятался под столом, напуганный шумом.', effect: { mood: -5 } },
                { message: 'Промок в луже пива, шерсть липкая.', effect: { health: -5, mood: -5 } },
                { message: 'Нашёл крошку хлеба, но шум пугает.', effect: { satiety: 3, mood: 2, health: -2 } },
                { message: 'Мяукал под стойкой, но никто не заметил.', effect: { mood: 2 } },
                { message: 'Съел кусочек сыра, но всё ещё грустно.', effect: { satiety: 4, mood: 2, health: -2 } },
                { message: 'Лежал в углу, вдыхая сигаретный дым.', effect: { health: -3, mood: 1 } },
                { message: 'Нашёл орешек, но шум давит.', effect: { satiety: 3, mood: 2 } },
                { message: 'Смотрел на людей, чувствуя одиночество.', effect: { mood: 2 } },
                { message: 'Тёрся о стул, но никто не погладил.', effect: { mood: 2 } },
                { message: 'Нашёл кусочек рыбы, но дым раздражает.', effect: { satiety: 4, health: -2, mood: 2 } },
                { message: 'Спрятался за ящиком, но всё равно страшно.', effect: { mood: 2 } },
                { message: 'Съел крошку пиццы, но радости мало.', effect: { satiety: 3, mood: 2, health: -2 } },
                { message: 'Слушал музыку, но шум пугает.', effect: { mood: 2 } },
                { message: 'Нашёл лужицу молока, чуть лучше.', effect: { satiety: 4, mood: 3 } },
                { message: 'Лежал у батареи, но дым в глазах.', effect: { health: -2, mood: 2 } },
                { message: 'Съел кусочек колбасы, но всё тоскливо.', effect: { satiety: 4, mood: 2, health: -2 } },
                { message: 'Мяукал, но никто не обратил внимания.', effect: { mood: 2 } },
                { message: 'Нашёл оливку, но она невкусная.', effect: { satiety: 3, mood: 2 } },
                { message: 'Смотрел на огоньки, слегка отвлёкся.', effect: { mood: 3 } },
                { message: 'Тёрся о чьи-то ноги, но прогнали.', effect: { mood: 2 } },
                { message: 'Съел крошку хлеба, но дым мешает.', effect: { satiety: 3, health: -2, mood: 2 } },
                { message: 'Лежал в углу, мечтая о тишине.', effect: { mood: 2 } },
                { message: 'Нашёл кусочек мяса, но шум раздражает.', effect: { satiety: 4, mood: 2, health: -2 } },
                { message: 'Смотрел на танцующих, но не до веселья.', effect: { mood: 2 } },
                { message: 'Нашёл каплю соуса, слегка утешило.', effect: { satiety: 3, mood: 2 } },
                { message: 'Мяукал у двери, но никто не помог.', effect: { mood: 2 } },
                { message: 'Съел кусочек сыра, но дым в горле.', effect: { satiety: 4, health: -2, mood: 2 } },
                { message: 'Лежал у стойки, но всё тоскливо.', effect: { mood: 2 } },
                { message: 'Нашёл крошку пиццы, но радости нет.', effect: { satiety: 3, mood: 2, health: -2 } },
                { message: 'Смотрел на бармена, мечтая о ласке.', effect: { mood: 2 } }
            ],
            sad: [
                { message: 'Пытался стащить еду, но прогнали.', effect: { mood: -5 } },
                { message: 'Сидел в углу, наблюдая за пьяными.', effect: { mood: -3 } },
                { message: 'Нашёл кусочек хлеба, но настроение не лучше.', effect: { satiety: 4, mood: 2, health: -2 } },
                { message: 'Тёрся о ноги посетителя, слегка погладили.', effect: { mood: 3 } },
                { message: 'Съел орешек, но дым раздражает.', effect: { satiety: 3, health: -2, mood: 2 } },
                { message: 'Смотрел на танцпол, но не до веселья.', effect: { mood: 2 } },
                { message: 'Нашёл крошку сыра, чуть повеселел.', effect: { satiety: 4, mood: 3, health: -2 } },
                { message: 'Мурлыкал у батареи, но шум мешает.', effect: { mood: 3, health: -2 } },
                { message: 'Съел кусочек колбасы, но всё тоскливо.', effect: { satiety: 4, mood: 2, health: -2 } },
                { message: 'Смотрел на огоньки, немного отвлёкся.', effect: { mood: 3 } },
                { message: 'Нашёл каплю молока, слегка лучше.', effect: { satiety: 4, mood: 3 } },
                { message: 'Тёрся о стул, но никто не заметил.', effect: { mood: 2 } },
                { message: 'Съел крошку пиццы, но дым в глазах.', effect: { satiety: 3, health: -2, mood: 2 } },
                { message: 'Лежал у стойки, мечтая о тишине.', effect: { mood: 2 } },
                { message: 'Нашёл кусочек рыбы, настроение чуть лучше.', effect: { satiety: 5, mood: 3, health: -2 } },
                { message: 'Мяукал, но шум заглушает.', effect: { mood: 2 } },
                { message: 'Съел оливку, но не то.', effect: { satiety: 3, mood: 2 } },
                { message: 'Смотрел на бармена, надеясь на еду.', effect: { mood: 2 } },
                { message: 'Нашёл крошку хлеба, но радости мало.', effect: { satiety: 3, mood: 2, health: -2 } },
                { message: 'Тёрся о ноги, получил лёгкую ласку.', effect: { mood: 3 } },
                { message: 'Съел кусочек мяса, но дым мешает.', effect: { satiety: 4, health: -2, mood: 2 } },
                { message: 'Лежал у батареи, слегка согрелся.', effect: { mood: 3, health: -2 } },
                { message: 'Нашёл каплю соуса, чуть повеселел.', effect: { satiety: 3, mood: 3 } },
                { message: 'Смотрел на танцующих, но не до веселья.', effect: { mood: 2 } },
                { message: 'Съел крошку сыра, но шум раздражает.', effect: { satiety: 4, health: -2, mood: 2 } },
                { message: 'Мяукал у двери, надеясь на ласку.', effect: { mood: 2 } },
                { message: 'Нашёл кусочек хлеба, но всё тоскливо.', effect: { satiety: 3, mood: 2 } },
                { message: 'Смотрел на огоньки, слегка успокоился.', effect: { mood: 3 } },
                { message: 'Съел орешек, но дым в горле.', effect: { satiety: 3, health: -2, mood: 2 } },
                { message: 'Тёрся о стойку, мечтая о еде.', effect: { mood: 2 } }
            ],
            good: [
                { message: 'Нашёл кусочек рыбы под столом.', effect: { satiety: 5, mood: 5 } },
                { message: 'Мурлыкал, сидя у тёплой батареи.', effect: { mood: 5, energy: 3 } },
                { message: 'Съел кусочек колбасы, объедение!', effect: { satiety: 6, mood: 5, health: -2 } },
                { message: 'Тёрся о ноги посетителя, получил ласку.', effect: { mood: 6 } },
                { message: 'Нашёл крошку пиццы, вкуснятина.', effect: { satiety: 5, mood: 5, health: -2 } },
                { message: 'Играл с пробкой, весело.', effect: { mood: 5, energy: -3 } },
                { message: 'Съел орешек, хрустящее удовольствие.', effect: { satiety: 4, mood: 5 } },
                { message: 'Мурлыкал под музыку, уютно.', effect: { mood: 5 } },
                { message: 'Нашёл каплю молока, настроение лучше.', effect: { satiety: 5, mood: 5 } },
                { message: 'Смотрел на огоньки, завораживает.', effect: { mood: 5 } },
                { message: 'Съел кусочек сыра, просто класс.', effect: { satiety: 5, mood: 5, health: -2 } },
                { message: 'Тёрся о бармена, получил ласку.', effect: { mood: 6 } },
                { message: 'Нашёл крошку хлеба, сытно.', effect: { satiety: 4, mood: 5 } },
                { message: 'Играл с ниткой, весело.', effect: { mood: 5, energy: -3 } },
                { message: 'Съел кусочек мяса, вкуснятина.', effect: { satiety: 6, mood: 5, health: -2 } },
                { message: 'Мурлыкал у стойки, все умилялись.', effect: { mood: 6 } },
                { message: 'Нашёл оливку, забавно.', effect: { satiety: 4, mood: 5 } },
                { message: 'Смотрел на танцующих, настроение поднялось.', effect: { mood: 5 } },
                { message: 'Съел крошку пиццы, сытно.', effect: { satiety: 5, mood: 5, health: -2 } },
                { message: 'Тёрся о ноги, получил вкусняшку.', effect: { satiety: 5, mood: 6 } },
                { message: 'Играл с бумажкой, весело.', effect: { mood: 5, energy: -3 } },
                { message: 'Съел кусочек колбасы, объедение.', effect: { satiety: 6, mood: 5, health: -2 } },
                { message: 'Мурлыкал под джаз, расслабляет.', effect: { mood: 5 } },
                { message: 'Нашёл каплю соуса, вкусно.', effect: { satiety: 4, mood: 5 } },
                { message: 'Смотрел на барный декор, уютно.', effect: { mood: 5 } },
                { message: 'Съел орешек, хрустящее удовольствие.', effect: { satiety: 4, mood: 5 } },
                { message: 'Тёрся о стойку, все улыбались.', effect: { mood: 6 } },
                { message: 'Нашёл кусочек сыра, настроение лучше.', effect: { satiety: 5, mood: 5, health: -2 } },
                { message: 'Играл с пробкой, весело.', effect: { mood: 5, energy: -3 } },
                { message: 'Съел крошку хлеба, сытно.', effect: { satiety: 4, mood: 5 } }
            ],
            happy: [
                { message: 'Тёрся о ноги доброго посетителя, получил вкусняшку!', effect: { satiety: 10, mood: 8 } },
                { message: 'Играл с пробкой от бутылки, весело!', effect: { mood: 8, energy: -3 } },
                { message: 'Съел кусок рыбы, мурлыкаю от счастья!', effect: { satiety: 10, mood: 8, health: -2 } },
                { message: 'Мурлыкал под живую музыку, кайф!', effect: { mood: 8 } },
                { message: 'Нашёл миску с молоком, райское наслаждение!', effect: { satiety: 10, mood: 8 } },
                { message: 'Играл с бумажкой, прыгая от радости.', effect: { mood: 8, energy: -3 } },
                { message: 'Съел кусок колбасы, объедение!', effect: { satiety: 8, mood: 8, health: -2 } },
                { message: 'Тёрся о бармена, все умилялись.', effect: { mood: 10 } },
                { message: 'Нашёл кусок мяса, счастье полное.', effect: { satiety: 10, mood: 8, health: -2 } },
                { message: 'Мурлыкал у батареи, полный релакс.', effect: { mood: 8, energy: 3 } },
                { message: 'Съел сыр, вкуснятина!', effect: { satiety: 8, mood: 8, health: -2 } },
                { message: 'Играл с ниткой, весело!', effect: { mood: 8, energy: -3 } },
                { message: 'Нашёл крошку пиццы, объедение.', effect: { satiety: 8, mood: 8, health: -2 } },
                { message: 'Тёрся о ноги, получил много ласки.', effect: { mood: 10 } },
                { message: 'Съел орешек, хрустящее счастье.', effect: { satiety: 6, mood: 8 } },
                { message: 'Мурлыкал под джаз, душа поёт.', effect: { mood: 8 } },
                { message: 'Нашёл каплю соуса, вкусно!', effect: { satiety: 6, mood: 8 } },
                { message: 'Играл с пробкой, полный восторг.', effect: { mood: 8, energy: -3 } },
                { message: 'Съел кусок хлеба, сытно и радостно.', effect: { satiety: 6, mood: 8, health: -2 } },
                { message: 'Тёрся о стойку, все улыбались.', effect: { mood: 10 } },
                { message: 'Нашёл кусок сыра, мурлыкаю!', effect: { satiety: 8, mood: 8, health: -2 } },
                { message: 'Играл с бумажкой, весело!', effect: { mood: 8, energy: -3 } },
                { message: 'Съел кусок мяса, счастье!', effect: { satiety: 8, mood: 8, health: -2 } },
                { message: 'Мурлыкал под музыку, кайфую.', effect: { mood: 8 } },
                { message: 'Нашёл оливку, забавно и вкусно.', effect: { satiety: 6, mood: 8 } },
                { message: 'Тёрся о ноги, получил вкусняшку.', effect: { satiety: 8, mood: 10 } },
                { message: 'Съел крошку пиццы, объедение.', effect: { satiety: 6, mood: 8, health: -2 } },
                { message: 'Играл с ниткой, полный восторг.', effect: { mood: 8, energy: -3 } },
                { message: 'Съел кусок колбасы, мурлыкаю.', effect: { satiety: 8, mood: 8, health: -2 } },
                { message: 'Мурлыкал у стойки, все в восторге.', effect: { mood: 10 } }
            ]
        },
        'Бизнес центр "Альбион"': {
            tragic: [
                { message: 'Спрятался под машиной на парковке, дрожа.', effect: { health: -1, mood: -2 } },
                { message: 'Мяукал в пустом коридоре, но никто не пришёл.', effect: { mood: -2 } },
                { message: 'Пытался найти еду в мусорке, но всё испорчено.', effect: { satiety: -3 } },
                { message: 'Сидел в тени здания, чувствуя одиночество.', effect: { mood: -2 } },
                { message: 'Промок под кондиционером, шерсть мокрая.', effect: { health: -1, mood: -2 } },
                { message: 'Пытался поймать муху, но устал.', effect: { energy: -5, mood: -2 } },
                { message: 'Спрятался за урной, боясь шума.', effect: { mood: -2 } },
                { message: 'Лежал на холодном асфальте, без сил.', effect: { energy: -5 } },
                { message: 'Пытался пролезть в дверь, но её закрыли.', effect: { energy: -3, mood: -2 } },
                { message: 'Сидел в углу парковки, чувствуя тоску.', effect: { mood: -2 } },
                { message: 'Пытался найти тёплое место, но везде холодно.', effect: { energy: -3 } },
                { message: 'Мяукал у входа, но никто не заметил.', effect: { mood: -2 } },
                { message: 'Пытался поймать голубя, но он улетел.', effect: { energy: -5, mood: -2 } },
                { message: 'Лежал под скамейкой, дрожа от холода.', effect: { health: -1, mood: -2 } },
                { message: 'Пытался найти еду, но мусорка была пуста.', effect: { satiety: -3 } },
                { message: 'Сидел в тени, наблюдая за людьми.', effect: { mood: -2 } },
                { message: 'Поскользнулся на мокром полу, лапы болят.', effect: { health: -1, energy: -3 } },
                { message: 'Пытался пролезть в кафе, но прогнали.', effect: { mood: -2 } },
                { message: 'Лежал у стены, чувствуя усталость.', effect: { energy: -5 } },
                { message: 'Пытался поймать муху в холле, но она улетела.', effect: { energy: -3 } },
                { message: 'Сидел в углу, слыша шум машин.', effect: { mood: -2 } },
                { message: 'Пытался найти укрытие, но везде сквозняк.', effect: { energy: -3 } },
                { message: 'Мяукал у двери, но её не открыли.', effect: { mood: -2 } },
                { message: 'Пытался поймать тень, но устал.', effect: { energy: -5 } },
                { message: 'Лежал на асфальте, чувствуя холод.', effect: { health: -1, mood: -2 } },
                { message: 'Пытался найти еду в урне, но ничего нет.', effect: { satiety: -3 } },
                { message: 'Сидел под машиной, боясь прохожих.', effect: { mood: -2 } },
                { message: 'Пытался пролезть в холл, но дверь закрыта.', effect: { energy: -3 } },
                { message: 'Лежал в углу, слыша гул кондиционера.', effect: { energy: -3 } },
                { message: 'Пытался поймать листок, но его унесло ветром.', effect: { energy: -3, mood: -2 } }
            ],
            sad: [
                { message: 'Гнался за мухой, но она улетела.', effect: { energy: -3, mood: -1 } },
                { message: 'Лежал на тёплом асфальте, но радости нет.', effect: { energy: -2 } },
                { message: 'Нашёл крошку еды, но она невкусная.', effect: { satiety: -2 } },
                { message: 'Сидел у входа, но никто не погладил.', effect: { mood: -2 } },
                { message: 'Пытался поймать тень, но быстро устал.', effect: { energy: -3 } },
                { message: 'Лежал в углу холла, слыша шум.', effect: { energy: -2 } },
                { message: 'Пытался пролезть в кафе, но дверь закрыта.', effect: { energy: -3 } },
                { message: 'Сидел под скамейкой, чувствуя одиночество.', effect: { mood: -2 } },
                { message: 'Пытался поймать голубя, но не успел.', effect: { energy: -3 } },
                { message: 'Лежал у стены, наблюдая за машинами.', effect: { energy: -2 } },
                { message: 'Пытался найти еду, но урна пуста.', effect: { satiety: -2 } },
                { message: 'Сидел в тени, но было неуютно.', effect: { mood: -1 } },
                { message: 'Пытался поймать листок, но ветер унёс.', effect: { energy: -3 } },
                { message: 'Лежал на парковке, чувствуя усталость.', effect: { energy: -3 } },
                { message: 'Пытался пролезть в холл, но прогнали.', effect: { mood: -2 } },
                { message: 'Сидел у входа, но люди проходили мимо.', effect: { mood: -2 } },
                { message: 'Пытался поймать муху, но она ускользнула.', effect: { energy: -3 } },
                { message: 'Лежал под машиной, слыша шум города.', effect: { energy: -2 } },
                { message: 'Пытался найти тёплое место, но везде сквозняк.', effect: { energy: -3 } },
                { message: 'Сидел в углу, наблюдая за прохожими.', effect: { mood: -1 } },
                { message: 'Пытался поймать тень, но она исчезла.', effect: { energy: -3 } },
                { message: 'Лежал на асфальте, чувствуя холод.', effect: { energy: -2 } },
                { message: 'Пытался найти еду в мусорке, но ничего нет.', effect: { satiety: -2 } },
                { message: 'Сидел под скамейкой, слыша гул машин.', effect: { mood: -2 } },
                { message: 'Пытался пролезть в дверь, но её закрыли.', effect: { energy: -3 } },
                { message: 'Лежал в тени, но было некомфортно.', effect: { energy: -2 } },
                { message: 'Пытался поймать голубя, но он улетел.', effect: { energy: -3 } },
                { message: 'Сидел у входа, но никто не заметил.', effect: { mood: -2 } },
                { message: 'Пытался поймать листок, но он улетел.', effect: { energy: -3 } },
                { message: 'Лежал в углу парковки, чувствуя тоску.', effect: { mood: -2 } }
            ],
            good: [
                { message: 'Нашёл крошку еды у кафе.', effect: { satiety: 3, energy: -2 } },
                { message: 'Грелся на тёплом асфальте у входа.', effect: { energy: -1, mood: 2 } },
                { message: 'Поймал муху в холле, было забавно.', effect: { mood: 2, energy: -2 } },
                { message: 'Лежал в тени, наблюдая за людьми.', effect: { energy: -1 } },
                { message: 'Получил ласку от прохожего у входа.', effect: { mood: 2 } },
                { message: 'Побегал за листочком на парковке.', effect: { energy: -3, mood: 2 } },
                { message: 'Нашёл тёплое место у батареи.', effect: { energy: -1, mood: 2 } },
                { message: 'Поймал тень в холле, весело.', effect: { energy: -2, mood: 2 } },
                { message: 'Лежал у входа, чувствуя тепло солнца.', effect: { energy: -1 } },
                { message: 'Нашёл кусочек хлеба у урны.', effect: { satiety: 3, energy: -2 } },
                { message: 'Побегал за голубем, но не догнал.', effect: { energy: -3, mood: 2 } },
                { message: 'Лежал в тени, наблюдая за машинами.', effect: { energy: -1 } },
                { message: 'Получил ласку от охранника.', effect: { mood: 2 } },
                { message: 'Поймал листок, унесённый ветром.', effect: { energy: -2, mood: 2 } },
                { message: 'Лежал у стены, наслаждаясь тишиной.', effect: { energy: -1 } },
                { message: 'Нашёл крошку еды в кафе.', effect: { satiety: 3, energy: -2 } },
                { message: 'Побегал за тенью в холле.', effect: { energy: -3, mood: 2 } },
                { message: 'Лежал на тёплом асфальте, мурлыча.', effect: { energy: -1, mood: 2 } },
                { message: 'Поймал муху у окна.', effect: { energy: -2, mood: 2 } },
                { message: 'Лежал у входа, наблюдая за прохожими.', effect: { energy: -1 } },
                { message: 'Нашёл кусочек сыра у кафе.', effect: { satiety: 3, energy: -2 } },
                { message: 'Побегал за листочком, весело.', effect: { energy: -3, mood: 2 } },
                { message: 'Лежал в тени, чувствуя тепло.', effect: { energy: -1 } },
                { message: 'Получил ласку от посетителя.', effect: { mood: 2 } },
                { message: 'Поймал тень на парковке.', effect: { energy: -2, mood: 2 } },
                { message: 'Лежал у батареи, мурлыча.', effect: { energy: -1, mood: 2 } },
                { message: 'Нашёл крошку хлеба у входа.', effect: { satiety: 3, energy: -2 } },
                { message: 'Побегал за мухой, было забавно.', effect: { energy: -3, mood: 2 } },
                { message: 'Лежал в холле, наблюдая за людьми.', effect: { energy: -1 } },
                { message: 'Поймал листок у входа.', effect: { energy: -2, mood: 2 } }
            ],
            happy: [
                { message: 'Носился за мухой в холле, полный азарт!', effect: { energy: -3, mood: 5 } },
                { message: 'Нашёл вкусный кусочек еды у кафе!', effect: { satiety: 5, energy: -2 } },
                { message: 'Грелся на тёплом асфальте, мурлыча от счастья.', effect: { energy: -1, mood: 5 } },
                { message: 'Поймал листок, прыгая от радости.', effect: { energy: -3, mood: 5 } },
                { message: 'Получил ласку от доброго человека.', effect: { mood: 5 } },
                { message: 'Носился за тенью, полный энергии!', effect: { energy: -3, mood: 5 } },
                { message: 'Нашёл кусочек сыра у входа.', effect: { satiety: 5, energy: -2 } },
                { message: 'Лежал у батареи, мурлыча от удовольствия.', effect: { energy: -1, mood: 5 } },
                { message: 'Поймал муху, чувствуя себя охотником.', effect: { energy: -2, mood: 5 } },
                { message: 'Побегал за голубем, весело!', effect: { energy: -3, mood: 5 } },
                { message: 'Нашёл крошку еды в холле.', effect: { satiety: 5, energy: -2 } },
                { message: 'Лежал на тёплом подоконнике, мурлыча.', effect: { energy: -1, mood: 5 } },
                { message: 'Поймал тень, прыгая от радости.', effect: { energy: -3, mood: 5 } },
                { message: 'Получил вкусняшку от прохожего!', effect: { satiety: 5, mood: 5 } },
                { message: 'Носился за листочком, полный восторг!', effect: { energy: -3, mood: 5 } },
                { message: 'Лежал у входа, наслаждаясь солнцем.', effect: { energy: -1, mood: 5 } },
                { message: 'Поймал муху у кафе, весело.', effect: { energy: -2, mood: 5 } },
                { message: 'Нашёл кусочек хлеба у урны.', effect: { satiety: 5, energy: -2 } },
                { message: 'Побегал за тенью, мурлыча.', effect: { energy: -3, mood: 5 } },
                { message: 'Лежал в тени, чувствуя тепло.', effect: { energy: -1, mood: 5 } },
                { message: 'Получил ласку от охранника.', effect: { mood: 5 } },
                { message: 'Поймал листок на парковке.', effect: { energy: -2, mood: 5 } },
                { message: 'Нашёл крошку сыра у входа.', effect: { satiety: 5, energy: -2 } },
                { message: 'Носился за мухой, полный азарт!', effect: { energy: -3, mood: 5 } },
                { message: 'Лежал у батареи, наслаждаясь теплом.', effect: { energy: -1, mood: 5 } },
                { message: 'Поймал тень в холле, весело.', effect: { energy: -2, mood: 5 } },
                { message: 'Нашёл кусочек еды у кафе.', effect: { satiety: 5, energy: -2 } },
                { message: 'Побегал за голубем, полный энергии.', effect: { energy: -3, mood: 5 } },
                { message: 'Лежал на тёплом асфальте, мурлыча.', effect: { energy: -1, mood: 5 } },
                { message: 'Получил вкусняшку от посетителя!', effect: { satiety: 5, mood: 5 } }
            ]
        },
        'Вокзал': {
            tragic: [
                { message: 'Спрятался под скамейкой на вокзале, дрожа.', effect: { mood: -2, energy: -5 } },
                { message: 'Мяукал в толпе, но никто не заметил.', effect: { mood: -2 } },
                { message: 'Пытался найти еду, но всё убирают.', effect: { satiety: -5 } },
                { message: 'Сидел в углу, напуганный шумом поездов.', effect: { mood: -2 } },
                { message: 'Промок под навесом, шерсть мокрая.', effect: { energy: -5 } },
                { message: 'Пытался поймать голубя, но он улетел.', effect: { energy: -5, mood: -2 } },
                { message: 'Свернулся клубком в холодном углу.', effect: { energy: -5 } },
                { message: 'Сидел под вагоном, чувствуя одиночество.', effect: { mood: -2 } },
                { message: 'Пытался стащить еду, но прогнали.', effect: { satiety: -3, mood: -2 } },
                { message: 'Лежал на асфальте, устав от беготни.', effect: { energy: -5 } },
                { message: 'Смотрел на толпу, чувствуя себя потерянным.', effect: { mood: -2 } },
                { message: 'Пытался найти тёплое место, но всё холодное.', effect: { energy: -5 } },
                { message: 'Мяукал у кафе, но еды не дали.', effect: { satiety: -3 } },
                { message: 'Сидел под скамейкой, слушая шум поездов.', effect: { mood: -2 } },
                { message: 'Поскользнулся на мокром асфальте.', effect: { energy: -3 } },
                { message: 'Пытался вздремнуть, но шум мешает.', effect: { energy: -5 } },
                { message: 'Смотрел на уходящие поезда, чувствуя тоску.', effect: { mood: -2 } },
                { message: 'Пытался найти укрытие, но всё занято.', effect: { energy: -3 } },
                { message: 'Сидел в углу, напуганный толпой.', effect: { mood: -2 } },
                { message: 'Пытался поймать муху, но не вышло.', effect: { energy: -3 } },
                { message: 'Лежал на холодной платформе, дрожа.', effect: { energy: -5 } },
                { message: 'Смотрел на людей, но никто не обратил внимания.', effect: { mood: -2 } },
                { message: 'Пытался стащить кусочек еды, но не успел.', effect: { satiety: -3 } },
                { message: 'Сидел под навесом, чувствуя холод.', effect: { energy: -5 } },
                { message: 'Пытался найти коробку, но ничего нет.', effect: { energy: -3 } },
                { message: 'Мяукал у киоска, но еды не дали.', effect: { satiety: -3 } },
                { message: 'Сидел в тени, слушая громкие объявления.', effect: { mood: -2 } },
                { message: 'Пытался поймать листок, но его унесло.', effect: { energy: -3 } },
                { message: 'Свернулся у стены, чувствуя усталость.', effect: { energy: -5 } },
                { message: 'Смотрел на голубей, но они улетели.', effect: { mood: -2 } }
            ],
            sad: [
                { message: 'Погнался за листочком, но быстро устал.', effect: { energy: -3, mood: -1 } },
                { message: 'Лежал на платформе, но радости нет.', effect: { mood: -1 } },
                { message: 'Нашёл крошку хлеба, но она невкусная.', effect: { satiety: -3 } },
                { message: 'Сидел под скамейкой, слушая шум.', effect: { energy: -3 } },
                { message: 'Пытался поймать муху, но не вышло.', effect: { energy: -3 } },
                { message: 'Смотрел на поезда, но ничего интересного.', effect: { mood: -1 } },
                { message: 'Пытался вздремнуть, но шумно.', effect: { energy: -3 } },
                { message: 'Тёрся о ноги прохожего, но он ушёл.', effect: { mood: -1 } },
                { message: 'Сидел у кафе, но еды не дали.', effect: { satiety: -3 } },
                { message: 'Погнался за голубем, но он улетел.', effect: { energy: -3 } },
                { message: 'Лежал на асфальте, чувствуя холод.', effect: { energy: -3 } },
                { message: 'Смотрел на толпу, но никто не заметил.', effect: { mood: -1 } },
                { message: 'Пытался найти тёплое место, но всё занято.', effect: { energy: -3 } },
                { message: 'Сидел под вагоном, слушая шум.', effect: { mood: -1 } },
                { message: 'Пытался стащить еду, но прогнали.', effect: { satiety: -3 } },
                { message: 'Лежал в углу, чувствуя одиночество.', effect: { mood: -1 } },
                { message: 'Пытался поймать листок, но его унесло.', effect: { energy: -3 } },
                { message: 'Сидел на платформе, но всё серое.', effect: { mood: -1 } },
                { message: 'Пытался вздремнуть, но мешает толпа.', effect: { energy: -3 } },
                { message: 'Смотрел на голубей, но они улетели.', effect: { mood: -1 } },
                { message: 'Погнался за мухой, но не поймал.', effect: { energy: -3 } },
                { message: 'Сидел под навесом, но всё равно холодно.', effect: { energy: -3 } },
                { message: 'Тёрся о сумку, но никто не заметил.', effect: { mood: -1 } },
                { message: 'Пытался найти еду, но всё убирают.', effect: { satiety: -3 } },
                { message: 'Лежал у стены, чувствуя усталость.', effect: { energy: -3 } },
                { message: 'Смотрел на поезда, но ничего не меняется.', effect: { mood: -1 } },
                { message: 'Пытался поймать тень, но не вышло.', effect: { energy: -3 } },
                { message: 'Сидел в тени, слушая шум вокзала.', effect: { mood: -1 } },
                { message: 'Пытался найти коробку, но ничего нет.', effect: { energy: -3 } },
                { message: 'Мяукал у киоска, но еды не дали.', effect: { satiety: -3 } }
            ],
            good: [
                { message: 'Нашёл кусочек хлеба у скамейки.', effect: { satiety: 3, mood: 2 } },
                { message: 'Грелся на тёплом асфальте вокзала.', effect: { energy: -2, mood: 2 } },
                { message: 'Погнался за листочком, было весело.', effect: { energy: -3, mood: 2 } },
                { message: 'Тёрся о ноги доброго человека.', effect: { mood: 2 } },
                { message: 'Сидел на подоконнике, наблюдая за поездами.', effect: { mood: 2 } },
                { message: 'Поймал муху, немного развлёкся.', effect: { energy: -3, mood: 2 } },
                { message: 'Нашёл тёплое место под навесом.', effect: { energy: -2, mood: 2 } },
                { message: 'Смотрел на голубей, интересно.', effect: { mood: 2 } },
                { message: 'Играл с обрывком бумаги на платформе.', effect: { energy: -3, mood: 2 } },
                { message: 'Получил ласку от прохожего.', effect: { mood: 2 } },
                { message: 'Нашёл крошку сыра у кафе.', effect: { satiety: 3, mood: 2 } },
                { message: 'Сидел на скамейке, греясь на солнце.', effect: { energy: -2, mood: 2 } },
                { message: 'Погнался за тенью, было забавно.', effect: { energy: -3, mood: 2 } },
                { message: 'Мурлыкал, глядя на поезда.', effect: { mood: 2 } },
                { message: 'Нашёл укромное место под вагоном.', effect: { energy: -2, mood: 2 } },
                { message: 'Поймал листок, унесённый ветром.', effect: { energy: -3, mood: 2 } },
                { message: 'Сидел у кафе, нюхая вкусные запахи.', effect: { mood: 2 } },
                { message: 'Погнался за голубем, почти поймал.', effect: { energy: -3, mood: 2 } },
                { message: 'Тёрся о сумку, получил ласку.', effect: { mood: 2 } },
                { message: 'Нашёл кусочек еды у киоска.', effect: { satiety: 3, mood: 2 } },
                { message: 'Сидел на платформе, наблюдая за людьми.', effect: { mood: 2 } },
                { message: 'Играл с верёвкой, весело.', effect: { energy: -3, mood: 2 } },
                { message: 'Грелся на тёплой скамейке.', effect: { energy: -2, mood: 2 } },
                { message: 'Смотрел на поезда, интересно.', effect: { mood: 2 } },
                { message: 'Поймал тень на платформе.', effect: { energy: -3, mood: 2 } },
                { message: 'Нашёл укромный уголок для отдыха.', effect: { energy: -2, mood: 2 } },
                { message: 'Тёрся о ноги прохожего, получил внимание.', effect: { mood: 2 } },
                { message: 'Нашёл крошку хлеба у мусорки.', effect: { satiety: 3, mood: 2 } },
                { message: 'Сидел на подоконнике, мурлыча.', effect: { mood: 2 } },
                { message: 'Играл с листочком, весело.', effect: { energy: -3, mood: 2 } }
            ],
            happy: [
                { message: 'Носился за листочком, полный восторг!', effect: { energy: -3, mood: 3 } },
                { message: 'Получил вкусняшку от доброго человека!', effect: { satiety: 5, mood: 3 } },
                { message: 'Мурлыкал, греясь на тёплой скамейке.', effect: { energy: -2, mood: 3 } },
                { message: 'Поймал муху, как настоящий охотник!', effect: { energy: -3, mood: 3 } },
                { message: 'Тёрся о ноги прохожего, получил ласку!', effect: { mood: 3 } },
                { message: 'Нашёл вкусный кусочек сыра у кафе.', effect: { satiety: 5, mood: 3 } },
                { message: 'Играл с обрывком бумаги, весело!', effect: { energy: -3, mood: 3 } },
                { message: 'Сидел на подоконнике, наслаждаясь солнцем.', effect: { mood: 3 } },
                { message: 'Погнался за голубем, полный азарта!', effect: { energy: -3, mood: 3 } },
                { message: 'Мурлыкал, наблюдая за поездами.', effect: { mood: 3 } },
                { message: 'Нашёл тёплое место под навесом, уютно.', effect: { energy: -2, mood: 3 } },
                { message: 'Поймал листок, унесённый ветром.', effect: { energy: -3, mood: 3 } },
                { message: 'Тёрся о сумку, получил вкусняшку!', effect: { satiety: 5, mood: 3 } },
                { message: 'Сидел на платформе, мурлыча от радости.', effect: { mood: 3 } },
                { message: 'Играл с тенью, полный энергии!', effect: { energy: -3, mood: 3 } },
                { message: 'Нашёл крошку хлеба, объелся!', effect: { satiety: 5, mood: 3 } },
                { message: 'Грелся на тёплом асфальте, мурлыча.', effect: { energy: -2, mood: 3 } },
                { message: 'Погнался за мухой, почти поймал!', effect: { energy: -3, mood: 3 } },
                { message: 'Сидел у кафе, нюхая вкусные запахи.', effect: { mood: 3 } },
                { message: 'Тёрся о ноги прохожего, получил ласку.', effect: { mood: 3 } },
                { message: 'Играл с верёвкой, весело!', effect: { energy: -3, mood: 3 } },
                { message: 'Нашёл укромное место, полный кайф!', effect: { energy: -2, mood: 3 } },
                { message: 'Поймал тень, как настоящий охотник!', effect: { energy: -3, mood: 3 } },
                { message: 'Сидел на скамейке, мурлыча от счастья.', effect: { mood: 3 } },
                { message: 'Нашёл кусочек еды у киоска.', effect: { satiety: 5, mood: 3 } },
                { message: 'Погнался за листочком, полный азарта!', effect: { energy: -3, mood: 3 } },
                { message: 'Мурлыкал, глядя на поезда.', effect: { mood: 3 } },
                { message: 'Тёрся о сумку, получил внимание.', effect: { mood: 3 } },
                { message: 'Играл с обрывком бумаги, весело!', effect: { energy: -3, mood: 3 } },
                { message: 'Сидел на подоконнике, наслаждаясь моментом.', effect: { mood: 3 } }
            ]
        },
        'ЖК Сфера': {
            tragic: [
                { message: 'Лежал в углу подъезда, чувствуя одиночество.', effect: { mood: -3, satiety: -3 } },
                { message: 'Мяукал у двери, но никто не открыл.', effect: { mood: -3, satiety: -3 } },
                { message: 'Спрятался под лестницей, дрожа.', effect: { health: -2, satiety: -3 } },
                { message: 'Пытался найти еду, но всё пусто.', effect: { satiety: -5 } },
                { message: 'Сидел на холодном полу, тоска.', effect: { mood: -3, satiety: -3 } },
                { message: 'Слышал шум лифта, напугался.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался поймать муху, но не вышло.', effect: { satiety: -3, energy: -2 } },
                { message: 'Лежал на коврике, но еды нет.', effect: { satiety: -3 } },
                { message: 'Смотрел на голубей, но не догнать.', effect: { mood: -3, satiety: -3 } },
                { message: 'Спрятался в углу, чувствуя себя ненужным.', effect: { mood: -3, satiety: -3 } },
                { message: 'Поскользнулся на мокром полу.', effect: { health: -2, satiety: -3 } },
                { message: 'Мяукал у мусорки, но еды не нашёл.', effect: { satiety: -5 } },
                { message: 'Сидел на парковке, но всё серое.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался залезть на дерево, но сил нет.', effect: { energy: -2, satiety: -3 } },
                { message: 'Лежал в тени, но желудок урчит.', effect: { satiety: -3 } },
                { message: 'Слышал лай собак, спрятался.', effect: { mood: -3, satiety: -3 } },
                { message: 'Сидел у окна, но ничего интересного.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался стащить еду, но прогнали.', effect: { satiety: -3 } },
                { message: 'Лежал на асфальте, чувствуя тоску.', effect: { mood: -3, satiety: -3 } },
                { message: 'Смотрел на прохожих, но никто не заметил.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался найти укрытие, но всё занято.', effect: { satiety: -3 } },
                { message: 'Сидел под машиной, но еды нет.', effect: { satiety: -3 } },
                { message: 'Мяукал в подъезде, но эхо пугает.', effect: { mood: -3, satiety: -3 } },
                { message: 'Пытался поймать птицу, но не вышло.', effect: { energy: -2, satiety: -3 } },
                { message: 'Лежал на холодной плитке, дрожа.', effect: { health: -2, satiety: -3 } },
                { message: 'Сидел на подоконнике, но всё скучно.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался найти еду в мусорке, но пусто.', effect: { satiety: -5 } },
                { message: 'Смотрел на дождь, тоска.', effect: { mood: -3, satiety: -3 } },
                { message: 'Лежал в углу двора, без сил.', effect: { mood: -3, satiety: -3 } },
                { message: 'Слышал шум машин, спрятался.', effect: { mood: -2, satiety: -3 } }
            ],
            sad: [
                { message: 'Гнался за листочком, но он улетел.', effect: { energy: -2, satiety: -3 } },
                { message: 'Лежал на тёплой плитке, но еды нет.', effect: { satiety: -3 } },
                { message: 'Смотрел на птиц, но они высоко.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался стащить еду, но не успел.', effect: { satiety: -3 } },
                { message: 'Сидел на подоконнике, но всё серое.', effect: { mood: -2, satiety: -3 } },
                { message: 'Грелся на асфальте, но радости нет.', effect: { satiety: -3 } },
                { message: 'Пытался поймать муху, но она улетела.', effect: { energy: -2, satiety: -3 } },
                { message: 'Сидел в тени, но желудок урчит.', effect: { satiety: -3 } },
                { message: 'Смотрел на прохожих, но они заняты.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался найти еду, но всё закрыто.', effect: { satiety: -5 } },
                { message: 'Лежал на коврике, но настроение упало.', effect: { mood: -2, satiety: -3 } },
                { message: 'Слышал шум лифта, напугался.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался залезть на скамейку, но устал.', effect: { energy: -2, satiety: -3 } },
                { message: 'Сидел под деревом, но еды нет.', effect: { satiety: -3 } },
                { message: 'Смотрел на голубей, но они улетели.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался стащить кусочек хлеба, но уронил.', effect: { satiety: -3 } },
                { message: 'Лежал на парковке, но всё скучно.', effect: { mood: -2, satiety: -3 } },
                { message: 'Слышал лай собак, насторожился.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался поймать бабочку, но не вышло.', effect: { energy: -2, satiety: -3 } },
                { message: 'Сидел на балконе, но ничего интересного.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался найти еду в мусорке, но безуспешно.', effect: { satiety: -5 } },
                { message: 'Лежал под машиной, но радости нет.', effect: { satiety: -3 } },
                { message: 'Смотрел на детей во дворе, но они шумные.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался залезть на дерево, но лапы устали.', effect: { energy: -2, satiety: -3 } },
                { message: 'Сидел у двери, но никто не заметил.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался поймать муху, но она хитрая.', effect: { energy: -2, satiety: -3 } },
                { message: 'Лежал на тёплой плитке, но еды нет.', effect: { satiety: -3 } },
                { message: 'Смотрел на дождь, настроение упало.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался найти укрытие, но всё занято.', effect: { satiety: -3 } },
                { message: 'Сидел в углу, чувствуя тоску.', effect: { mood: -2, satiety: -3 } }
            ],
            good: [
                { message: 'Играл с листочком во дворе.', effect: { mood: 2, satiety: -3 } },
                { message: 'Грелся на тёплой плитке, уютно.', effect: { energy: 2, satiety: -3 } },
                { message: 'Нашёл кусочек хлеба у подъезда.', effect: { satiety: 2, mood: 2 } },
                { message: 'Повалялся на коврике, расслабился.', effect: { energy: 2, satiety: -3 } },
                { message: 'Смотрел на птиц с подоконника.', effect: { mood: 2, satiety: -3 } },
                { message: 'Запрыгнул на скамейку, ловко!', effect: { health: 2, satiety: -3 } },
                { message: 'Тёрся о ноги прохожего, получил ласку.', effect: { mood: 3, satiety: -3 } },
                { message: 'Поймал муху, забавно.', effect: { mood: 2, satiety: -3 } },
                { message: 'Сидел на балконе, наслаждаясь солнцем.', effect: { mood: 2, satiety: -3 } },
                { message: 'Нашёл старый кусочек сыра.', effect: { satiety: 2, mood: 2 } },
                { message: 'Погнался за бабочкой, весело.', effect: { mood: 2, satiety: -3 } },
                { message: 'Лежал в тени, отдыхая.', effect: { energy: 2, satiety: -3 } },
                { message: 'Смотрел на голубей, интересно.', effect: { mood: 2, satiety: -3 } },
                { message: 'Запрыгнул на подоконник, ловко.', effect: { health: 2, satiety: -3 } },
                { message: 'Повалялся на тёплой плитке, уютно.', effect: { energy: 2, satiety: -3 } },
                { message: 'Нашёл крошки у скамейки.', effect: { satiety: 2, mood: 2 } },
                { message: 'Сидел на парковке, наблюдая за людьми.', effect: { mood: 2, satiety: -3 } },
                { message: 'Играл с листочком, унесённым ветром.', effect: { mood: 2, satiety: -3 } },
                { message: 'Тёрся о прохожего, получил внимание.', effect: { mood: 3, satiety: -3 } },
                { message: 'Сидел на балконе, мурлыча.', effect: { mood: 2, satiety: -3 } },
                { message: 'Нашёл кусочек еды у мусорки.', effect: { satiety: 2, mood: 2 } },
                { message: 'Погнался за мухой, весело.', effect: { mood: 2, satiety: -3 } },
                { message: 'Лежал на скамейке, отдыхая.', effect: { energy: 2, satiety: -3 } },
                { message: 'Смотрел на детей во дворе, забавно.', effect: { mood: 2, satiety: -3 } },
                { message: 'Запрыгнул на дерево, ловко.', effect: { health: 2, satiety: -3 } },
                { message: 'Повалялся в тени, расслабился.', effect: { energy: 2, satiety: -3 } },
                { message: 'Нашёл крошки хлеба у подъезда.', effect: { satiety: 2, mood: 2 } },
                { message: 'Сидел на подоконнике, наблюдая за миром.', effect: { mood: 2, satiety: -3 } },
                { message: 'Играл с бумажкой, весело.', effect: { mood: 2, satiety: -3 } },
                { message: 'Тёрся о скамейку, уютно.', effect: { mood: 2, satiety: -3 } }
            ],
            happy: [
                { message: 'Носился за бабочкой во дворе, кайф!', effect: { mood: 5, energy: -2, satiety: -3 } },
                { message: 'Нашёл вкусный кусочек рыбы у подъезда!', effect: { satiety: 5, mood: 5 } },
                { message: 'Мурлыкал на тёплой плитке, счастье!', effect: { mood: 5, satiety: -3 } },
                { message: 'Тёрся о ноги прохожего, получил вкусняшку!', effect: { satiety: 5, mood: 5 } },
                { message: 'Играл с листочком, полный восторг!', effect: { mood: 5, satiety: -3 } },
                { message: 'Запрыгнул на дерево, чувствуя себя королём!', effect: { health: 2, satiety: -3 } },
                { message: 'Повалялся на балконе, мурлыча.', effect: { mood: 5, satiety: -3 } },
                { message: 'Поймал муху, победа!', effect: { mood: 5, satiety: -3 } },
                { message: 'Сидел на подоконнике, наслаждаясь солнцем.', effect: { mood: 5, satiety: -3 } },
                { message: 'Нашёл кусочек сыра у мусорки!', effect: { satiety: 5, mood: 5 } },
                { message: 'Носился за бумажкой, весело!', effect: { mood: 5, energy: -2, satiety: -3 } },
                { message: 'Мурлыкал, лёжа на тёплой скамейке.', effect: { mood: 5, satiety: -3 } },
                { message: 'Тёрся о прохожего, получил ласку!', effect: { mood: 5, satiety: -3 } },
                { message: 'Играл с листочком на ветру, кайф!', effect: { mood: 5, satiety: -3 } },
                { message: 'Запрыгнул на подоконник, ловко!', effect: { health: 2, satiety: -3 } },
                { message: 'Нашёл крошки у подъезда, вкусно!', effect: { satiety: 5, mood: 5 } },
                { message: 'Сидел на балконе, мурлыча от счастья.', effect: { mood: 5, satiety: -3 } },
                { message: 'Поймал бабочку, охотник!', effect: { mood: 5, satiety: -3 } },
                { message: 'Повалялся в тени, полный релакс!', effect: { energy: 2, satiety: -3 } },
                { message: 'Тёрся о скамейку, получил ласку.', effect: { mood: 5, satiety: -3 } },
                { message: 'Нашёл кусочек хлеба, объелся!', effect: { satiety: 5, mood: 5 } },
                { message: 'Носился по двору, полный энергии!', effect: { mood: 5, energy: -2, satiety: -3 } },
                { message: 'Сидел на тёплой плитке, мурлыча.', effect: { mood: 5, satiety: -3 } },
                { message: 'Играл с бумажкой, весело!', effect: { mood: 5, satiety: -3 } },
                { message: 'Запрыгнул на скамейку, ловко!', effect: { health: 2, satiety: -3 } },
                { message: 'Нашёл крошки у мусорки, вкусно!', effect: { satiety: 5, mood: 5 } },
                { message: 'Сидел на подоконнике, наслаждаясь.', effect: { mood: 5, satiety: -3 } },
                { message: 'Поймал муху, победа!', effect: { mood: 5, satiety: -3 } },
                { message: 'Повалялся на балконе, счастье!', effect: { mood: 5, satiety: -3 } },
                { message: 'Тёрся о прохожего, получил вкусняшку!', effect: { satiety: 5, mood: 5 } }
            ]
        },
        'Завод': {
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
        'Кофейня "Ляля-Фа"': {
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
        'Лес': {
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
        'Мастерская': {
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
        'Парк': {
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
        'Полигон утилизации': {
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
        'Приют для животных "Кошкин дом"': {
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
        'Район Дачный': {
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
        'Магазин "Всё на свете"': {
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
        'Под мостом': {
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
                { message: 'Скулил, лёжа на холодном асфальте.', effect: { health: -3, mood: -3 } },
                { message: 'Смотрел на проезжающие машины, чувствуя тоску.', effect: { mood: -3 } },
                { message: 'Лежал под скамейкой, дрожа.', effect: { health: -2, mood: -2 } },
                { message: 'Пытался найти еду в мусорке, но пусто.', effect: { satiety: -2, mood: -2 } },
                { message: 'Скулил, глядя на пустую остановку.', effect: { mood: -3 } },
                { message: 'Промок под мелким дождём.', effect: { health: -3, mood: -2 } },
                { message: 'Лежал, чувствуя холод асфальта.', effect: { health: -2 } },
                { message: 'Смотрел на голубей, но не было сил гнаться.', effect: { mood: -2, energy: -2 } },
                { message: 'Спрятался за урной, боясь шума.', effect: { mood: -3 } },
                { message: 'Скулил, но никто не подошёл.', effect: { mood: -3 } },
                { message: 'Лежал, слушая гудки машин.', effect: { mood: -2 } },
                { message: 'Пытался укрыться от ветра.', effect: { health: -2, mood: -2 } },
                { message: 'Смотрел на серое небо, чувствуя одиночество.', effect: { mood: -3 } },
                { message: 'Лежал на мокром асфальте.', effect: { health: -2 } },
                { message: 'Скулил, глядя на прохожих.', effect: { mood: -3 } },
                { message: 'Пытался согреться, но всё холодно.', effect: { health: -2 } },
                { message: 'Смотрел на лужи, отражавшие облака.', effect: { mood: -2 } },
                { message: 'Лежал, чувствуя себя никому не нужным.', effect: { mood: -3 } },
                { message: 'Пытался поймать листок, но он улетел.', effect: { energy: -2, mood: -2 } },
                { message: 'Скулил, слушая шум города.', effect: { mood: -3 } },
                { message: 'Лежал, чувствуя сырость.', effect: { health: -2 } },
                { message: 'Смотрел на пустую скамейку.', effect: { mood: -2 } },
                { message: 'Пытался укрыться за столбом.', effect: { mood: -2 } },
                { message: 'Скулил, глядя на проезжающий автобус.', effect: { mood: -3 } },
                { message: 'Лежал, слушая капли дождя.', effect: { mood: -2 } },
                { message: 'Пытался найти еду, но всё бесполезно.', effect: { satiety: -2, mood: -2 } },
                { message: 'Смотрел на тени от машин.', effect: { mood: -2 } },
                { message: 'Лежал, чувствуя холод ветра.', effect: { health: -2 } },
                { message: 'Скулил, глядя на пустую дорогу.', effect: { mood: -3 } },
                { message: 'Лежал, пытаясь забыться.', effect: { mood: -2 } }
            ],
            sad: [
                { message: 'Сидел, глядя на голубей, клюющих крошки.', effect: { mood: -2 } },
                { message: 'Понюхал мусорку, но ничего съедобного.', effect: { mood: -2 } },
                { message: 'Погнался за листочком, но он улетел.', effect: { energy: -2, mood: -2 } },
                { message: 'Лежал на асфальте, чувствуя скуку.', effect: { mood: -2 } },
                { message: 'Смотрел на проезжающие машины.', effect: { mood: -2 } },
                { message: 'Пытался согреться на холодном асфальте.', effect: { health: -2 } },
                { message: 'Сидел, слушая шум города.', effect: { mood: -2 } },
                { message: 'Погнался за голубем, но не догнал.', effect: { energy: -2, mood: -2 } },
                { message: 'Лежал, глядя на серое небо.', effect: { mood: -2 } },
                { message: 'Смотрел на прохожих, но никто не заметил.', effect: { mood: -2 } },
                { message: 'Пытался найти еду у скамейки.', effect: { satiety: -2, mood: -2 } },
                { message: 'Сидел, чувствуя холод асфальта.', effect: { health: -2 } },
                { message: 'Смотрел на лужу, отражавшую облака.', effect: { mood: -2 } },
                { message: 'Пытался поймать тень от машины.', effect: { energy: -2 } },
                { message: 'Сидел, слушая шум ветра.', effect: { mood: -2 } },
                { message: 'Лежал, глядя на пустую остановку.', effect: { mood: -2 } },
                { message: 'Пытался согреться под скамейкой.', effect: { health: -2 } },
                { message: 'Смотрел на голубей, но не было сил гнаться.', effect: { mood: -2 } },
                { message: 'Сидел, чувствуя себя одиноко.', effect: { mood: -2 } },
                { message: 'Пытался поймать муху, но она улетела.', effect: { energy: -2, mood: -2 } },
                { message: 'Сидел, слушая далёкий лай собак.', effect: { mood: -2 } },
                { message: 'Смотрел на проезжающий автобус.', effect: { mood: -2 } },
                { message: 'Лежал, чувствуя сырость.', effect: { health: -2 } },
                { message: 'Пытался укрыться за урной.', effect: { mood: -2 } },
                { message: 'Сидел, глядя на мокрый асфальт.', effect: { mood: -2 } },
                { message: 'Смотрел на тени от машин.', effect: { mood: -2 } },
                { message: 'Лежал, слушая шум города.', effect: { mood: -2 } },
                { message: 'Пытался поймать листок ветром.', effect: { energy: -2 } },
                { message: 'Сидел, чувствуя лёгкий холод.', effect: { health: -2 } },
                { message: 'Смотрел на пустую остановку.', effect: { mood: -2 } }
            ],
            good: [
                { message: 'Нашёл косточку у скамейки.', effect: { satiety: 2, mood: 2 } },
                { message: 'Вилял хвостом, встретив прохожего.', effect: { mood: 3 } },
                { message: 'Погнался за листочком, весело.', effect: { energy: -2, mood: 3 } },
                { message: 'Сидел, наслаждаясь тёплым асфальтом.', effect: { health: 2, mood: 2 } },
                { message: 'Понюхал кусты у остановки.', effect: { mood: 2 } },
                { message: 'Играл с тенью от машины.', effect: { energy: -2, mood: 2 } },
                { message: 'Сидел, виляя хвостом на солнце.', effect: { mood: 2 } },
                { message: 'Погнался за голубем, было весело.', effect: { energy: -2, mood: 3 } },
                { message: 'Сидел, глядя на яркие цветы.', effect: { mood: 2 } },
                { message: 'Получил ласку от доброго человека.', effect: { mood: 3 } },
                { message: 'Понюхал свежескошенную траву.', effect: { mood: 2 } },
                { message: 'Играл с обрывком бумаги.', effect: { energy: -2, mood: 2 } },
                { message: 'Сидел, слушая пение птиц.', effect: { mood: 2 } },
                { message: 'Нашёл кусочек еды у мусорки.', effect: { satiety: 2, mood: 2 } },
                { message: 'Сидел, наслаждаясь теплом асфальта.', effect: { health: 2 } },
                { message: 'Погнался за тенью голубя.', effect: { energy: -2, mood: 2 } },
                { message: 'Сидел, виляя хвостом от радости.', effect: { mood: 2 } },
                { message: 'Смотрел на детей, играющих неподалёку.', effect: { mood: 2 } },
                { message: 'Играл с листочком, унесённым ветром.', effect: { energy: -2, mood: 3 } },
                { message: 'Сидел, чувствуя лёгкий бриз.', effect: { mood: 2 } },
                { message: 'Нашёл крошку у скамейки.', effect: { satiety: 2 } },
                { message: 'Сидел, глядя на цветущий куст.', effect: { mood: 2 } },
                { message: 'Погнался за бабочкой, весело.', effect: { energy: -2, mood: 3 } },
                { message: 'Сидел, виляя хвостом на солнце.', effect: { mood: 2 } },
                { message: 'Смотрел на голубей, клюющих крошки.', effect: { mood: 2 } },
                { message: 'Играл с тенью от столба.', effect: { energy: -2, mood: 2 } },
                { message: 'Сидел, наслаждаясь тишиной.', effect: { mood: 2 } },
                { message: 'Нашёл маленький кусочек мяса.', effect: { satiety: 2, mood: 2 } },
                { message: 'Сидел, глядя на облака.', effect: { mood: 2 } },
                { message: 'Получил ласку от прохожего.', effect: { mood: 3 } }
            ],
            happy: [
                { message: 'Носился за листочком, полный восторг!', effect: { energy: -3, mood: 5 } },
                { message: 'Вилял хвостом, греясь на тёплом асфальте.', effect: { health: 3, mood: 4 } },
                { message: 'Нашёл вкусную косточку у скамейки.', effect: { satiety: 3, mood: 3 } },
                { message: 'Играл с тенью голубя, весело!', effect: { energy: -3, mood: 4 } },
                { message: 'Получил ласку от доброго прохожего.', effect: { mood: 5 } },
                { message: 'Погнался за бабочкой, виляя хвостом.', effect: { energy: -3, mood: 4 } },
                { message: 'Сидел, наслаждаясь солнечным теплом.', effect: { health: 3, mood: 3 } },
                { message: 'Поймал муху, чувствуя себя охотником.', effect: { mood: 4, energy: -2 } },
                { message: 'Сидел, глядя на яркие цветы.', effect: { mood: 4 } },
                { message: 'Играл с обрывком бумаги, прыгая.', effect: { energy: -3, mood: 4 } },
                { message: 'Вилял хвостом, сидя на тёплой скамейке.', effect: { mood: 4 } },
                { message: 'Смотрел на детей, играющих с мячом.', effect: { mood: 4 } },
                { message: 'Погнался за тенью от машины.', effect: { energy: -3, mood: 4 } },
                { message: 'Нашёл вкусный кусочек у мусорки.', effect: { satiety: 3, mood: 3 } },
                { message: 'Сидел, наслаждаясь запахом цветов.', effect: { mood: 4 } },
                { message: 'Играл с листочком, унесённым ветром.', effect: { energy: -3, mood: 4 } },
                { message: 'Вилял хвостом, чувствуя тепло солнца.', effect: { health: 3 } },
                { message: 'Смотрел на воробьёв, прыгающих рядом.', effect: { mood: 4 } },
                { message: 'Погнался за мухой, полный азарта.', effect: { energy: -3, mood: 4 } },
                { message: 'Сидел, виляя хвостом от удовольствия.', effect: { mood: 4 } },
                { message: 'Нашёл крошку мяса у скамейки.', effect: { satiety: 3, mood: 3 } },
                { message: 'Играл с тенью от столба.', effect: { energy: -3, mood: 4 } },
                { message: 'Сидел, наслаждаясь лёгким бризом.', effect: { mood: 4 } },
                { message: 'Погнался за листочком, прыгая от радости.', effect: { energy: -3, mood: 4 } },
                { message: 'Вилял хвостом, глядя на цветущий куст.', effect: { mood: 4 } },
                { message: 'Получил вкусняшку от прохожего.', effect: { satiety: 3, mood: 5 } },
                { message: 'Сидел, наслаждаясь пением птиц.', effect: { mood: 4 } },
                { message: 'Играл с обрывком газеты.', effect: { energy: -3, mood: 4 } },
                { message: 'Вилял хвостом, греясь на солнце.', effect: { health: 3, mood: 4 } },
                { message: 'Смотрел на голубей, весело воркующих.', effect: { mood: 4 } }
            ]
        },
        'Бар "У бобра" (18+)': {
            tragic: [
                { message: 'Спрятался под столом, напуганный шумом.', effect: { mood: -5 } },
                { message: 'Скулил, когда кто-то наступил на хвост.', effect: { health: -5, mood: -5 } },
                { message: 'Нашёл крошку хлеба, но шум пугает.', effect: { satiety: 3, mood: 2, health: -2 } },
                { message: 'Скулил у стойки, но никто не заметил.', effect: { mood: 2 } },
                { message: 'Съел кусочек сыра, но всё тоскливо.', effect: { satiety: 4, mood: 2, health: -2 } },
                { message: 'Лежал у двери, вдыхая сигаретный дым.', effect: { health: -3, mood: 1 } },
                { message: 'Нашёл орешек, но шум раздражает.', effect: { satiety: 3, mood: 2 } },
                { message: 'Смотрел на людей, чувствуя одиночество.', effect: { mood: 2 } },
                { message: 'Вилял хвостом, но никто не погладил.', effect: { mood: 2 } },
                { message: 'Нашёл кусочек мяса, но дым мешает.', effect: { satiety: 4, health: -2, mood: 2 } },
                { message: 'Спрятался за ящиком, но всё равно страшно.', effect: { mood: 2 } },
                { message: 'Съел крошку пиццы, но радости мало.', effect: { satiety: 3, mood: 2, health: -2 } },
                { message: 'Слушал музыку, но шум пугает.', effect: { mood: 2 } },
                { message: 'Нашёл каплю соуса, чуть лучше.', effect: { satiety: 4, mood: 3 } },
                { message: 'Лежал у батареи, но дым в глазах.', effect: { health: -2, mood: 2 } },
                { message: 'Съел кусочек колбасы, но всё тоскливо.', effect: { satiety: 4, mood: 2, health: -2 } },
                { message: 'Скулил, но никто не обратил внимания.', effect: { mood: 2 } },
                { message: 'Нашёл оливку, но она невкусная.', effect: { satiety: 3, mood: 2 } },
                { message: 'Смотрел на огоньки, слегка отвлёкся.', effect: { mood: 3 } },
                { message: 'Вилял хвостом, но прогнали.', effect: { mood: 2 } },
                { message: 'Съел крошку хлеба, но дым мешает.', effect: { satiety: 3, health: -2, mood: 2 } },
                { message: 'Лежал в углу, мечтая о тишине.', effect: { mood: 2 } },
                { message: 'Нашёл кусочек мяса, но шум раздражает.', effect: { satiety: 4, mood: 2, health: -2 } },
                { message: 'Смотрел на танцующих, но не до веселья.', effect: { mood: 2 } },
                { message: 'Нашёл каплю соуса, слегка утешило.', effect: { satiety: 3, mood: 2 } },
                { message: 'Скулил у двери, но никто не помог.', effect: { mood: 2 } },
                { message: 'Съел кусочек сыра, но дым в горле.', effect: { satiety: 4, health: -2, mood: 2 } },
                { message: 'Лежал у стойки, но всё тоскливо.', effect: { mood: 2 } },
                { message: 'Нашёл крошку пиццы, но радости нет.', effect: { satiety: 3, mood: 2, health: -2 } },
                { message: 'Смотрел на бармена, мечтая о ласке.', effect: { mood: 2 } }
            ],
            sad: [
                { message: 'Попытался стащить еду, но получил шлепок.', effect: { mood: -5 } },
                { message: 'Лежал у входа, чувствуя себя ненужным.', effect: { mood: -3 } },
                { message: 'Нашёл кусочек хлеба, но настроение не лучше.', effect: { satiety: 4, mood: 2, health: -2 } },
                { message: 'Вилял хвостом, слегка погладили.', effect: { mood: 3 } },
                { message: 'Съел орешек, но дым раздражает.', effect: { satiety: 3, health: -2, mood: 2 } },
                { message: 'Смотрел на танцпол, но не до веселья.', effect: { mood: 2 } },
                { message: 'Нашёл крошку сыра, чуть повеселел.', effect: { satiety: 4, mood: 3, health: -2 } },
                { message: 'Лежал у батареи, но шум мешает.', effect: { mood: 3, health: -2 } },
                { message: 'Съел кусочек колбасы, но всё тоскливо.', effect: { satiety: 4, mood: 2, health: -2 } },
                { message: 'Смотрел на огоньки, немного отвлёкся.', effect: { mood: 3 } },
                { message: 'Нашёл каплю молока, слегка лучше.', effect: { satiety: 4, mood: 3 } },
                { message: 'Вилял хвостом, но никто не заметил.', effect: { mood: 2 } },
                { message: 'Съел крошку пиццы, но дым в глазах.', effect: { satiety: 3, health: -2, mood: 2 } },
                { message: 'Лежал у стойки, мечтая о тишине.', effect: { mood: 2 } },
                { message: 'Нашёл кусочек мяса, настроение чуть лучше.', effect: { satiety: 5, mood: 3, health: -2 } },
                { message: 'Скулил, но шум заглушает.', effect: { mood: 2 } },
                { message: 'Съел оливку, но не то.', effect: { satiety: 3, mood: 2 } },
                { message: 'Смотрел на бармена, надеясь на еду.', effect: { mood: 2 } },
                { message: 'Нашёл крошку хлеба, но радости мало.', effect: { satiety: 3, mood: 2, health: -2 } },
                { message: 'Вилял хвостом, получил лёгкую ласку.', effect: { mood: 3 } },
                { message: 'Съел кусочек мяса, но дым мешает.', effect: { satiety: 4, health: -2, mood: 2 } },
                { message: 'Лежал у батареи, слегка согрелся.', effect: { mood: 3, health: -2 } },
                { message: 'Нашёл каплю соуса, чуть повеселел.', effect: { satiety: 3, mood: 3 } },
                { message: 'Sмотрел на танцующих, но не до веселья.', effect: { mood: 2 } },
                { message: 'Съел крошку сыра, но шум раздражает.', effect: { satiety: 4, health: -2, mood: 2 } },
                { message: 'Скулил у двери, надеясь на ласку.', effect: { mood: 2 } },
                { message: 'Нашёл кусочек хлеба, но всё тоскливо.', effect: { satiety: 3, mood: 2 } },
                { message: 'Смотрел на огоньки, слегка успокоился.', effect: { mood: 3 } },
                { message: 'Съел орешек, но дым в горле.', effect: { satiety: 3, health: -2, mood: 2 } },
                { message: 'Вилял хвостом у стойки, мечтая о еде.', effect: { mood: 2 } }
            ],
            good: [
                { message: 'Нашёл кусок мяса под барной стойкой.', effect: { satiety: 5, mood: 5 } },
                { message: 'Тявкал от радости, когда погладили.', effect: { mood: 5 } },
                { message: 'Съел кусочек колбасы, объедение!', effect: { satiety: 6, mood: 5, health: -2 } },
                { message: 'Вилял хвостом, получил ласку.', effect: { mood: 6 } },
                { message: 'Нашёл крошку пиццы, вкуснятина.', effect: { satiety: 5, mood: 5, health: -2 } },
                { message: 'Играл с пробкой, весело.', effect: { mood: 5, energy: -3 } },
                { message: 'Съел орешек, хрустящее удовольствие.', effect: { satiety: 4, mood: 5 } },
                { message: 'Тявкал под музыку, весело.', effect: { mood: 5 } },
                { message: 'Нашёл каплю соуса, настроение лучше.', effect: { satiety: 5, mood: 5 } },
                { message: 'Смотрел на огоньки, завораживает.', effect: { mood: 5 } },
                { message: 'Съел кусочек сыра, просто класс.', effect: { satiety: 5, mood: 5, health: -2 } },
                { message: 'Вилял хвостом у бармена, получил ласку.', effect: { mood: 6 } },
                { message: 'Нашёл крошку хлеба, сытно.', effect: { satiety: 4, mood: 5 } },
                { message: 'Играл с бумажкой, весело.', effect: { mood: 5, energy: -3 } },
                { message: 'Съел кусочек мяса, вкуснятина.', effect: { satiety: 6, mood: 5, health: -2 } },
                { message: 'Тявкал у стойки, все умилялись.', effect: { mood: 6 } },
                { message: 'Нашёл оливку, забавно.', effect: { satiety: 4, mood: 5 } },
                { message: 'Смотрел на танцующих, настроение поднялось.', effect: { mood: 5 } },
                { message: 'Съел крошку пиццы, сытно.', effect: { satiety: 5, mood: 5, health: -2 } },
                { message: 'Вилял хвостом, получил вкусняшку.', effect: { satiety: 5, mood: 6 } },
                { message: 'Играл с ниткой, весело.', effect: { mood: 5, energy: -3 } },
                { message: 'Съел кусочек колбасы, объедение.', effect: { satiety: 6, mood: 5, health: -2 } },
                { message: 'Тявкал под джаз, расслабляет.', effect: { mood: 5 } },
                { message: 'Нашёл каплю соуса, вкусно.', effect: { satiety: 4, mood: 5 } },
                { message: 'Смотрел на барный декор, уютно.', effect: { mood: 5 } },
                { message: 'Съел орешек, хрустящее удовольствие.', effect: { satiety: 4, mood: 5 } },
                { message: 'Вилял хвостом у стойки, все улыбались.', effect: { mood: 6 } },
                { message: 'Нашёл кусочек сыра, настроение лучше.', effect: { satiety: 5, mood: 5, health: -2 } },
                { message: 'Играл с пробкой, весело.', effect: { mood: 5, energy: -3 } },
                { message: 'Съел крошку хлеба, сытно.', effect: { satiety: 4, mood: 5 } }
            ],
            happy: [
                { message: 'Играл с посетителями, виляя хвостом!', effect: { mood: 10, energy: -5 } },
                { message: 'Получил целую тарелку вкусностей!', effect: { satiety: 15, mood: 10 } },
                { message: 'Съел кусок мяса, виляю хвостом от счастья!', effect: { satiety: 10, mood: 8, health: -2 } },
                { message: 'Тявкал под живую музыку, кайф!', effect: { mood: 8 } },
                { message: 'Нашёл кость, райское наслаждение!', effect: { satiety: 10, mood: 8 } },
                { message: 'Играл с бумажкой, прыгая от радости.', effect: { mood: 8, energy: -3 } },
                { message: 'Съел кусок колбасы, объедение!', effect: { satiety: 8, mood: 8, health: -2 } },
                { message: 'Вилял хвостом у бармена, все умилялись.', effect: { mood: 10 } },
                { message: 'Нашёл кусок мяса, счастье полное.', effect: { satiety: 10, mood: 8, health: -2 } },
                { message: 'Тявкал у батареи, полный релакс.', effect: { mood: 8, energy: 3 } },
                { message: 'Съел сыр, вкуснятина!', effect: { satiety: 8, mood: 8, health: -2 } },
                { message: 'Играл с ниткой, весело!', effect: { mood: 8, energy: -3 } },
                { message: 'Нашёл крошку пиццы, объедение.', effect: { satiety: 8, mood: 8, health: -2 } },
                { message: 'Вилял хвостом, получил много ласки.', effect: { mood: 10 } },
                { message: 'Съел орешек, хрустящее счастье.', effect: { satiety: 6, mood: 8 } },
                { message: 'Тявкал под джаз, душа поёт.', effect: { mood: 8 } },
                { message: 'Нашёл каплю соуса, вкусно!', effect: { satiety: 6, mood: 8 } },
                { message: 'Играл с пробкой, полный восторг.', effect: { mood: 8, energy: -3 } },
                { message: 'Съел кусок хлеба, сытно и радостно.', effect: { satiety: 6, mood: 8, health: -2 } },
                { message: 'Вилял хвостом у стойки, все улыбались.', effect: { mood: 10 } },
                { message: 'Нашёл кусок сыра, тявкаю от радости!', effect: { satiety: 8, mood: 8, health: -2 } },
                { message: 'Играл с бумажкой, весело!', effect: { mood: 8, energy: -3 } },
                { message: 'Съел кусок мяса, счастье!', effect: { satiety: 8, mood: 8, health: -2 } },
                { message: 'Тявкал под музыку, кайфую.', effect: { mood: 8 } },
                { message: 'Нашёл оливку, забавно и вкусно.', effect: { satiety: 6, mood: 8 } },
                { message: 'Вилял хвостом, получил вкусняшку.', effect: { satiety: 8, mood: 10 } },
                { message: 'Съел крошку пиццы, объедение.', effect: { satiety: 6, mood: 8, health: -2 } },
                { message: 'Играл с ниткой, полный восторг.', effect: { mood: 8, energy: -3 } },
                { message: 'Съел кусок колбасы, тявкаю.', effect: { satiety: 8, mood: 8, health: -2 } },
                { message: 'Вилял хвостом у стойки, все в восторге.', effect: { mood: 10 } }
            ]
        },
        'Бизнес центр "Альбион"': {
            tragic: [
                { message: 'Скулил у входа, но никто не подошёл.', effect: { mood: -2 } },
                { message: 'Лежал на холодном асфальте, дрожа.', effect: { health: -1, mood: -2 } },
                { message: 'Пытался найти еду в мусорке, но ничего нет.', effect: { satiety: -3 } },
                { message: 'Сидел в тени, чувствуя одиночество.', effect: { mood: -2 } },
                { message: 'Промок под кондиционером, шерсть мокрая.', effect: { health: -1, mood: -2 } },
                { message: 'Пытался поймать голубя, но устал.', effect: { energy: -5, mood: -2 } },
                { message: 'Спрятался за урной, боясь шума.', effect: { mood: -2 } },
                { message: 'Лежал на парковке, без сил.', effect: { energy: -5 } },
                { message: 'Пытался пролезть в дверь, но её закрыли.', effect: { energy: -3, mood: -2 } },
                { message: 'Сидел в углу, слыша шум машин.', effect: { mood: -2 } },
                { message: 'Пытался найти тёплое место, но везде холодно.', effect: { energy: -3 } },
                { message: 'Скулил у входа, но никто не заметил.', effect: { mood: -2 } },
                { message: 'Пытался поймать листок, но он улетел.', effect: { energy: -3, mood: -2 } },
                { message: 'Лежал под скамейкой, дрожа от холода.', effect: { health: -1, mood: -2 } },
                { message: 'Пытался найти еду, но мусорка пуста.', effect: { satiety: -3 } },
                { message: 'Сидел в тени, наблюдая за людьми.', effect: { mood: -2 } },
                { message: 'Поскользнулся на мокром асфальте, лапы болят.', effect: { health: -1, energy: -3 } },
                { message: 'Пытался пролезть в кафе, но прогнали.', effect: { mood: -2 } },
                { message: 'Лежал у стены, чувствуя усталость.', effect: { energy: -5 } },
                { message: 'Пытался поймать муху, но она улетела.', effect: { energy: -3 } },
                { message: 'Сидел в углу парковки, чувствуя тоску.', effect: { mood: -2 } },
                { message: 'Пытался найти укрытие, но везде сквозняк.', effect: { energy: -3 } },
                { message: 'Скулил у двери, но её не открыли.', effect: { mood: -2 } },
                { message: 'Пытался поймать тень, но устал.', effect: { energy: -5 } },
                { message: 'Лежал на асфальте, чувствуя холод.', effect: { health: -1, mood: -2 } },
                { message: 'Пытался найти еду в урне, но ничего нет.', effect: { satiety: -3 } },
                { message: 'Сидел под машиной, боясь прохожих.', effect: { mood: -2 } },
                { message: 'Пытался пролезть в холл, но прогнали.', effect: { energy: -3 } },
                { message: 'Лежал в тени, слыша гул кондиционера.', effect: { energy: -3 } },
                { message: 'Пытался поймать голубя, но он улетел.', effect: { energy: -3, mood: -2 } }
            ],
            sad: [
                { message: 'Погнался за голубем, но он улетел.', effect: { energy: -3, mood: -1 } },
                { message: 'Лежал на тёплом асфальте, но радости нет.', effect: { energy: -2 } },
                { message: 'Нашёл старую кость, но она невкусная.', effect: { satiety: -2 } },
                { message: 'Сидел у входа, но никто не погладил.', effect: { mood: -2 } },
                { message: 'Пытался поймать тень, но быстро устал.', effect: { energy: -3 } },
                { message: 'Лежал в углу холла, слыша шум.', effect: { energy: -2 } },
                { message: 'Пытался пролезть в кафе, но дверь закрыта.', effect: { energy: -3 } },
                { message: 'Сидел под скамейкой, чувствуя одиночество.', effect: { mood: -2 } },
                { message: 'Пытался поймать листок, но ветер унёс.', effect: { energy: -3 } },
                { message: 'Лежал у стены, наблюдая за машинами.', effect: { energy: -2 } },
                { message: 'Пытался найти еду, но урна пуста.', effect: { satiety: -2 } },
                { message: 'Сидел в тени, но было неуютно.', effect: { mood: -1 } },
                { message: 'Пытался поймать муху, но она ускользнула.', effect: { energy: -3 } },
                { message: 'Лежал на парковке, чувствуя усталость.', effect: { energy: -3 } },
                { message: 'Пытался пролезть в холл, но прогнали.', effect: { mood: -2 } },
                { message: 'Сидел у входа, но люди проходили мимо.', effect: { mood: -2 } },
                { message: 'Пытался поймать голубя, но не успел.', effect: { energy: -3 } },
                { message: 'Лежал под машиной, слыша шум города.', effect: { energy: -2 } },
                { message: 'Пытался найти тёплое место, но везде сквозняк.', effect: { energy: -3 } },
                { message: 'Сидел в углу, наблюдая за прохожими.', effect: { mood: -1 } },
                { message: 'Пытался поймать тень, но она исчезла.', effect: { energy: -3 } },
                { message: 'Лежал на асфальте, чувствуя холод.', effect: { energy: -2 } },
                { message: 'Пытался найти еду в мусорке, но ничего нет.', effect: { satiety: -2 } },
                { message: 'Сидел под скамейкой, слыша гул машин.', effect: { mood: -2 } },
                { message: 'Пытался пролезть в дверь, но её закрыли.', effect: { energy: -3 } },
                { message: 'Лежал в тени, но было некомфортно.', effect: { energy: -2 } },
                { message: 'Пытался поймать голубя, но он улетел.', effect: { energy: -3 } },
                { message: 'Сидел у входа, но никто не заметил.', effect: { mood: -2 } },
                { message: 'Пытался поймать листок, но он улетел.', effect: { energy: -3 } },
                { message: 'Лежал в углу парковки, чувствуя тоску.', effect: { mood: -2 } }
            ],
            good: [
                { message: 'Нашёл кость у кафе, погрыз с удовольствием.', effect: { satiety: 3, energy: -2 } },
                { message: 'Вилял хвостом, встретив доброго человека.', effect: { mood: 2 } },
                { message: 'Побегал за голубем, было весело.', effect: { energy: -3, mood: 2 } },
                { message: 'Лежал в тени, наблюдая за людьми.', effect: { energy: -1 } },
                { message: 'Получил ласку от прохожего у входа.', effect: { mood: 2 } },
                { message: 'Понюхал кусты у парковки, интересно.', effect: { energy: -2, mood: 2 } },
                { message: 'Нашёл кусочек хлеба у урны.', effect: { satiety: 3, energy: -2 } },
                { message: 'Побегал за листочком, весело.', effect: { energy: -3, mood: 2 } },
                { message: 'Лежал на тёплом асфальте, наслаждаясь.', effect: { energy: -1, mood: 2 } },
                { message: 'Тявкнул на голубя, чувствуя себя активным.', effect: { energy: -2, mood: 2 } },
                { message: 'Нашёл крошку еды у кафе.', effect: { satiety: 3, energy: -2 } },
                { message: 'Побегал за тенью в холле.', effect: { energy: -3, mood: 2 } },
                { message: 'Лежал у входа, чувствуя тепло солнца.', effect: { energy: -1 } },
                { message: 'Получил ласку от охранника.', effect: { mood: 2 } },
                { message: 'Понюхал мусорку, нашёл что-то съедобное.', effect: { satiety: 3, energy: -2 } },
                { message: 'Побегал за мухой, было забавно.', effect: { energy: -3, mood: 2 } },
                { message: 'Лежал в тени, наблюдая за машинами.', effect: { energy: -1 } },
                { message: 'Тявкнул на прохожего, он улыбнулся.', effect: { mood: 2 } },
                { message: 'Побегал за листочком на парковке.', effect: { energy: -3, mood: 2 } },
                { message: 'Лежал у стены, наслаждаясь тишиной.', effect: { energy: -1 } },
                { message: 'Нашёл кусочек сыра у входа.', effect: { satiety: 3, energy: -2 } },
                { message: 'Побегал за тенью, виляя хвостом.', effect: { energy: -3, mood: 2 } },
                { message: 'Лежал на тёплом асфальте, чувствуя тепло.', effect: { energy: -1 } },
                { message: 'Получил ласку от посетителя.', effect: { mood: 2 } },
                { message: 'Понюхал кусты, нашёл интересный запах.', effect: { energy: -2, mood: 2 } },
                { message: 'Нашёл крошку хлеба у урны.', effect: { satiety: 3, energy: -2 } },
                { message: 'Побегал за голубем, весело.', effect: { energy: -3, mood: 2 } },
                { message: 'Лежал у входа, наблюдая за людьми.', effect: { energy: -1 } },
                { message: 'Тявкнул на муху, было забавно.', effect: { energy: -2, mood: 2 } },
                { message: 'Побегал за тенью у кафе.', effect: { energy: -3, mood: 2 } }
            ],
            happy: [
                { message: 'Носился за голубем, полный энергии!', effect: { energy: -3, mood: 5 } },
                { message: 'Нашёл вкусную кость у кафе!', effect: { satiety: 5, energy: -2 } },
                { message: 'Вилял хвостом, получив ласку от прохожего.', effect: { mood: 5 } },
                { message: 'Побегал за листочком, полный восторг!', effect: { energy: -3, mood: 5 } },
                { message: 'Понюхал цветы у входа, настроение взлетело.', effect: { mood: 5 } },
                { message: 'Нашёл кусочек мяса у урны.', effect: { satiety: 5, energy: -2 } },
                { message: 'Тявкал от радости, встретив человека.', effect: { mood: 5 } },
                { message: 'Побегал за тенью, виляя хвостом.', effect: { energy: -3, mood: 5 } },
                { message: 'Лежал на тёплом асфальте, наслаждаясь солнцем.', effect: { energy: -1, mood: 5 } },
                { message: 'Получил вкусняшку от охранника!', effect: { satiety: 5, mood: 5 } },
                { message: 'Носился за мухой, полный азарт!', effect: { energy: -3, mood: 5 } },
                { message: 'Нашёл крошку сыра у кафе.', effect: { satiety: 5, energy: -2 } },
                { message: 'Побегал за голубем, весело!', effect: { energy: -3, mood: 5 } },
                { message: 'Лежал у входа, виляя хвостом.', effect: { energy: -1, mood: 5 } },
                { message: 'Получил ласку от доброго человека.', effect: { mood: 5 } },
                { message: 'Понюхал кусты, нашёл интересный запах.', effect: { energy: -2, mood: 5 } },
                { message: 'Побегал за листочком на парковке.', effect: { energy: -3, mood: 5 } },
                { message: 'Нашёл кусочек хлеба у входа.', effect: { satiety: 5, energy: -2 } },
                { message: 'Тявкал на муху, чувствуя себя активным.', effect: { energy: -2, mood: 5 } },
                { message: 'Побегал за тенью в холле.', effect: { energy: -3, mood: 5 } },
                { message: 'Лежал в тени, наслаждаясь теплом.', effect: { energy: -1, mood: 5 } },
                { message: 'Получил вкусняшку от посетителя!', effect: { satiety: 5, mood: 5 } },
                { message: 'Носился за голубем, полный восторг!', effect: { energy: -3, mood: 5 } },
                { message: 'Нашёл кость у парковки, пир!', effect: { satiety: 5, energy: -2 } },
                { message: 'Вилял хвостом, встретив охранника.', effect: { mood: 5 } },
                { message: 'Побегал за мухой, весело.', effect: { energy: -3, mood: 5 } },
                { message: 'Лежал у кафе, наслаждаясь солнцем.', effect: { energy: -1, mood: 5 } },
                { message: 'Понюхал цветы, настроение улучшилось.', effect: { mood: 5 } },
                { message: 'Нашёл кусочек сыра у урны.', effect: { satiety: 5, energy: -2 } },
                { message: 'Тявкал от радости, побегав за тенью.', effect: { energy: -3, mood: 5 } }
            ]
        },
        'Вокзал': {
      tragic: [
        { message: 'Скулил на платформе, никто не подошёл.', effect: { mood: -2, energy: -5 } },
        { message: 'Лежал на холодном асфальте, дрожа.', effect: { energy: -5 } },
        { message: 'Пытался найти еду, но всё убирают.', effect: { satiety: -5 } },
        { message: 'Сидел в углу, напуганный шумом поездов.', effect: { mood: -2 } },
        { message: 'Промок под навесом, шерсть мокрая.', effect: { energy: -5 } },
        { message: 'Погнался за голубем, но он улетел.', effect: { energy: -5, mood: -2 } },
        { message: 'Свернулся клубком в холодном углу.', effect: { energy: -5 } },
        { message: 'Сидел под вагоном, чувствуя одиночество.', effect: { mood: -2 } },
        { message: 'Пытался стащить еду, но прогнали.', effect: { satiety: -3, mood: -2 } },
        { message: 'Лежал на асфальте, устав от беготни.', effect: { energy: -5 } },
        { message: 'Смотрел на толпу, чувствуя себя потерянным.', effect: { mood: -2 } },
        { message: 'Пытался найти тёплое место, но всё холодное.', effect: { energy: -5 } },
        { message: 'Скулил у кафе, но еды не дали.', effect: { satiety: -3 } },
        { message: 'Сидел под скамейкой, слушая шум поездов.', effect: { mood: -2 } },
        { message: 'Поскользнулся на мокром асфальте.', effect: { energy: -3 } },
        { message: 'Пытался вздремнуть, но шум мешает.', effect: { energy: -5 } },
        { message: 'Смотрел на уходящие поезда, чувствуя тоску.', effect: { mood: -2 } },
        { message: 'Пытался найти укрытие, но всё занято.', effect: { energy: -3 } },
        { message: 'Сидел в углу, напуганный толпой.', effect: { mood: -2 } },
        { message: 'Пытался поймать муху, но не вышло.', effect: { energy: -3 } },
        { message: 'Лежал на холодной платформе, дрожа.', effect: { energy: -5 } },
        { message: 'Смотрел на людей, но никто не обратил внимания.', effect: { mood: -2 } },
        { message: 'Пытался стащить кусочек еды, но не успел.', effect: { satiety: -3 } },
        { message: 'Сидел под навесом, чувствуя холод.', effect: { energy: -5 } },
        { message: 'Пытался найти укромное место, но ничего нет.', effect: { energy: -3 } },
        { message: 'Скулил у киоска, но еды не дали.', effect: { satiety: -3 } },
        { message: 'Сидел в тени, слушая громкие объявления.', effect: { mood: -2 } },
        { message: 'Пытался поймать листок, но его унесло.', effect: { energy: -3 } },
        { message: 'Свернулся у стены, чувствуя усталость.', effect: { energy: -5 } },
        { message: 'Смотрел на голубей, но они улетели.', effect: { mood: -2 } }
      ],
      sad: [
        { message: 'Погнался за листочком, но быстро устал.', effect: { energy: -3, mood: -1 } },
        { message: 'Лежал на платформе, но радости нет.', effect: { mood: -1 } },
        { message: 'Нашёл крошку хлеба, но она невкусная.', effect: { satiety: -3 } },
        { message: 'Сидел под скамейкой, слушая шум.', effect: { energy: -3 } },
        { message: 'Пытался поймать муху, но не вышло.', effect: { energy: -3 } },
        { message: 'Смотрел на поезда, но ничего интересного.', effect: { mood: -1 } },
        { message: 'Пытался вздремнуть, но шумно.', effect: { energy: -3 } },
        { message: 'Лизнул руку прохожего, но он ушёл.', effect: { mood: -1 } },
        { message: 'Сидел у кафе, но еды не дали.', effect: { satiety: -3 } },
        { message: 'Погнался за голубем, но он улетел.', effect: { energy: -3 } },
        { message: 'Лежал на асфальте, чувствуя холод.', effect: { energy: -3 } },
        { message: 'Смотрел на толпу, но никто не заметил.', effect: { mood: -1 } },
        { message: 'Пытался найти тёплое место, но всё занято.', effect: { energy: -3 } },
        { message: 'Сидел под вагоном, слушая шум.', effect: { mood: -1 } },
        { message: 'Пытался стащить еду, но прогнали.', effect: { satiety: -3 } },
        { message: 'Лежал в углу, чувствуя одиночество.', effect: { mood: -1 } },
        { message: 'Пытался поймать листок, но его унесло.', effect: { energy: -3 } },
        { message: 'Сидел на платформе, но всё серое.', effect: { mood: -1 } },
        { message: 'Пытался вздремнуть, но мешает толпа.', effect: { energy: -3 } },
        { message: 'Смотрел на голубей, но они улетели.', effect: { mood: -1 } },
        { message: 'Погнался за мухой, но не поймал.', effect: { energy: -3 } },
        { message: 'Сидел под навесом, но всё равно холодно.', effect: { energy: -3 } },
        { message: 'Лизнул сумку, но никто не заметил.', effect: { mood: -1 } },
        { message: 'Пытался найти еду, но всё убирают.', effect: { satiety: -3 } },
        { message: 'Лежал у стены, чувствуя усталость.', effect: { energy: -3 } },
        { message: 'Смотрел на поезда, но ничего не меняется.', effect: { mood: -1 } },
        { message: 'Пытался поймать тень, но не вышло.', effect: { energy: -3 } },
        { message: 'Сидел в тени, слушая шум вокзала.', effect: { mood: -1 } },
        { message: 'Пытался найти укромное место, но ничего нет.', effect: { energy: -3 } },
        { message: 'Скулил у киоска, но еды не дали.', effect: { satiety: -3 } }
      ],
      good: [
        { message: 'Нашёл кусочек хлеба у скамейки.', effect: { satiety: 3, mood: 2 } },
        { message: 'Грелся на тёплом асфальте вокзала.', effect: { energy: -2, mood: 2 } },
        { message: 'Погнался за листочком, было весело.', effect: { energy: -3, mood: 2 } },
        { message: 'Лизнул руку доброго человека.', effect: { mood: 2 } },
        { message: 'Сидел на платформе, наблюдая за поездами.', effect: { mood: 2 } },
        { message: 'Поймал муху, немного развлёкся.', effect: { energy: -3, mood: 2 } },
        { message: 'Нашёл тёплое место под навесом.', effect: { energy: -2, mood: 2 } },
        { message: 'Смотрел на голубей, интересно.', effect: { mood: 2 } },
        { message: 'Играл с обрывком бумаги на платформе.', effect: { energy: -3, mood: 2 } },
        { message: 'Получил ласку от прохожего.', effect: { mood: 2 } },
        { message: 'Нашёл крошку сыра у кафе.', effect: { satiety: 3, mood: 2 } },
        { message: 'Сидел на скамейке, греясь на солнце.', effect: { energy: -2, mood: 2 } },
        { message: 'Погнался за тенью, было забавно.', effect: { energy: -3, mood: 2 } },
        { message: 'Вилял хвостом, глядя на поезда.', effect: { mood: 2 } },
        { message: 'Нашёл укромное место под вагоном.', effect: { energy: -2, mood: 2 } },
        { message: 'Поймал листок, унесённый ветром.', effect: { energy: -3, mood: 2 } },
        { message: 'Сидел у кафе, нюхая вкусные запахи.', effect: { mood: 2 } },
        { message: 'Погнался за голубем, почти поймал.', effect: { energy: -3, mood: 2 } },
        { message: 'Лизнул руку прохожего, получил ласку.', effect: { mood: 2 } },
        { message: 'Нашёл кусочек еды у киоска.', effect: { satiety: 3, mood: 2 } },
        { message: 'Сидел на платформе, наблюдая за людьми.', effect: { mood: 2 } },
        { message: 'Играл с верёвкой, весело.', effect: { energy: -3, mood: 2 } },
        { message: 'Грелся на тёплой скамейке.', effect: { energy: -2, mood: 2 } },
        { message: 'Смотрел на поезда, интересно.', effect: { mood: 2 } },
        { message: 'Поймал тень на платформе.', effect: { energy: -3, mood: 2 } },
        { message: 'Нашёл укромный уголок для отдыха.', effect: { energy: -2, mood: 2 } },
        { message: 'Лизнул руку прохожего, получил внимание.', effect: { mood: 2 } },
        { message: 'Нашёл крошку хлеба у мусорки.', effect: { satiety: 3, mood: 2 } },
        { message: 'Сидел на платформе, виляя хвостом.', effect: { mood: 2 } },
        { message: 'Играл с листочком, весело.', effect: { energy: -3, mood: 2 } }
      ],
      happy: [
        { message: 'Носился за листочком, полный восторг!', effect: { energy: -3, mood: 3 } },
        { message: 'Получил вкусняшку от доброго человека!', effect: { satiety: 5, mood: 3 } },
        { message: 'Вилял хвостом, греясь на тёплой скамейке.', effect: { energy: -2, mood: 3 } },
        { message: 'Поймал муху, как настоящий охотник!', effect: { energy: -3, mood: 3 } },
        { message: 'Лизнул руку прохожего, получил ласку!', effect: { mood: 3 } },
        { message: 'Нашёл вкусный кусочек сыра у кафе.', effect: { satiety: 5, mood: 3 } },
        { message: 'Играл с обрывком бумаги, весело!', effect: { energy: -3, mood: 3 } },
        { message: 'Сидел на платформе, наслаждаясь солнцем.', effect: { mood: 3 } },
        { message: 'Погнался за голубем, полный азарта!', effect: { energy: -3, mood: 3 } },
        { message: 'Вилял хвостом, наблюдая за поездами.', effect: { mood: 3 } },
        { message: 'Нашёл тёплое место под навесом, уютно.', effect: { energy: -2, mood: 3 } },
        { message: 'Поймал листок, унесённый ветром.', effect: { energy: -3, mood: 3 } },
        { message: 'Лизнул руку прохожего, получил вкусняшку!', effect: { satiety: 5, mood: 3 } },
        { message: 'Сидел на платформе, тявкая от радости.', effect: { mood: 3 } },
        { message: 'Играл с тенью, полный энергии!', effect: { energy: -3, mood: 3 } },
        { message: 'Нашёл крошку хлеба, объелся!', effect: { satiety: 5, mood: 3 } },
        { message: 'Грелся на тёплом асфальте, виляя хвостом.', effect: { energy: -2, mood: 3 } },
        { message: 'Погнался за мухой, почти поймал!', effect: { energy: -3, mood: 3 } },
        { message: 'Сидел у кафе, нюхая вкусные запахи.', effect: { mood: 3 } },
        { message: 'Лизнул руку прохожего, получил ласку.', effect: { mood: 3 } },
        { message: 'Играл с верёвкой, весело!', effect: { energy: -3, mood: 3 } },
        { message: 'Нашёл укромное место, полный кайф!', effect: { energy: -2, mood: 3 } },
        { message: 'Поймал тень, как настоящий охотник!', effect: { energy: -3, mood: 3 } },
        { message: 'Сидел на скамейке, виляя хвостом от счастья.', effect: { mood: 3 } },
        { message: 'Нашёл кусочек еды у киоска.', effect: { satiety: 5, mood: 3 } },
        { message: 'Погнался за листочком, полный азарта!', effect: { energy: -3, mood: 3 } },
        { message: 'Вилял хвостом, глядя на поезда.', effect: { mood: 3 } },
        { message: 'Лизнул руку прохожего, получил внимание.', effect: { mood: 3 } },
        { message: 'Играл с обрывком бумаги, весело!', effect: { energy: -3, mood: 3 } },
        { message: 'Сидел на платформе, наслаждаясь моментом.', effect: { mood: 3 } }
      ]
    },
        'ЖК Сфера': {
            tragic: [
                { message: 'Скулил у подъезда, никто не заметил.', effect: { mood: -3, satiety: -3 } },
                { message: 'Лежал на холодном асфальте, дрожа.', effect: { health: -2, satiety: -3 } },
                { message: 'Пытался найти еду, но мусорка пуста.', effect: { satiety: -5 } },
                { message: 'Сидел под скамейкой, чувствуя тоску.', effect: { mood: -3, satiety: -3 } },
                { message: 'Слышал шум машин, спрятался.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался гнаться за голубем, но сил нет.', effect: { energy: -2, satiety: -3 } },
                { message: 'Лежал у двери, но еды нет.', effect: { satiety: -3 } },
                { message: 'Смотрел на прохожих, но никто не обратил внимания.', effect: { mood: -3, satiety: -3 } },
                { message: 'Поскользнулся на мокром асфальте.', effect: { health: -2, satiety: -3 } },
                { message: 'Скулил в углу двора, тоска.', effect: { mood: -3, satiety: -3 } },
                { message: 'Пытался найти кость, но ничего нет.', effect: { satiety: -5 } },
                { message: 'Сидел на парковке, но всё серое.', effect: { mood: -2, satiety: -3 } },
                { message: 'Слышал лай других собак, напугался.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался копать яму, но устал.', effect: { energy: -2, satiety: -3 } },
                { message: 'Лежал под машиной, желудок урчит.', effect: { satiety: -3 } },
                { message: 'Смотрел на голубей, но не догнать.', effect: { mood: -3, satiety: -3 } },
                { message: 'Пытался стащить еду, но прогнали.', effect: { satiety: -3 } },
                { message: 'Сидел у подъезда, но всё скучно.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался найти укрытие, но всё занято.', effect: { satiety: -3 } },
                { message: 'Лежал на холодной плитке, дрожа.', effect: { health: -2, satiety: -3 } },
                { message: 'Скулил у мусорки, но еды нет.', effect: { satiety: -5 } },
                { message: 'Сидел под деревом, чувствуя одиночество.', effect: { mood: -3, satiety: -3 } },
                { message: 'Пытался гнаться за мухой, но не вышло.', effect: { energy: -2, satiety: -3 } },
                { message: 'Смотрел на детей во дворе, но они шумные.', effect: { mood: -2, satiety: -3 } },
                { message: 'Лежал на асфальте, без сил.', effect: { mood: -3, satiety: -3 } },
                { message: 'Слышал шум лифта, насторожился.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался найти еду в мусорке, но пусто.', effect: { satiety: -5 } },
                { message: 'Сидел на парковке, тоска.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался копать яму, но ничего не нашёл.', effect: { energy: -2, satiety: -3 } },
                { message: 'Лежал у скамейки, чувствуя голод.', effect: { satiety: -3 } }
            ],
            sad: [
                { message: 'Погнался за голубем, но он улетел.', effect: { energy: -2, satiety: -3 } },
                { message: 'Понюхал мусорку, но ничего съедобного.', effect: { satiety: -3 } },
                { message: 'Лежал на тёплой плитке, но радости нет.', effect: { satiety: -3 } },
                { message: 'Смотрел на прохожих, но никто не погладил.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался найти кость, но всё пусто.', effect: { satiety: -5 } },
                { message: 'Сидел у подъезда, но всё серое.', effect: { mood: -2, satiety: -3 } },
                { message: 'Слышал шум машин, насторожился.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался копать яму, но устал.', effect: { energy: -2, satiety: -3 } },
                { message: 'Лежал на асфальте, но еды нет.', effect: { satiety: -3 } },
                { message: 'Смотрел на голубей, но они далеко.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался стащить еду, но не успел.', effect: { satiety: -3 } },
                { message: 'Сидел под деревом, но настроение упало.', effect: { mood: -2, satiety: -3 } },
                { message: 'Погнался за мухой, но она улетела.', effect: { energy: -2, satiety: -3 } },
                { message: 'Лежал на скамейке, но желудок урчит.', effect: { satiety: -3 } },
                { message: 'Смотрел на детей во дворе, но они шумные.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался найти еду, но всё закрыто.', effect: { satiety: -5 } },
                { message: 'Сидел у мусорки, но ничего интересного.', effect: { satiety: -3 } },
                { message: 'Слышал лай собак, насторожился.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался гнаться за бабочкой, но не вышло.', effect: { energy: -2, satiety: -3 } },
                { message: 'Лежал на парковке, но всё скучно.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался найти укрытие, но всё занято.', effect: { satiety: -3 } },
                { message: 'Сидел у подъезда, но никто не заметил.', effect: { mood: -2, satiety: -3 } },
                { message: 'Погнался за листочком, но он улетел.', effect: { energy: -2, satiety: -3 } },
                { message: 'Лежал на тёплой плитке, но еды нет.', effect: { satiety: -3 } },
                { message: 'Смотрел на птиц, но они высоко.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался копать яму, но ничего не нашёл.', effect: { energy: -2, satiety: -3 } },
                { message: 'Сидел под машиной, но радости нет.', effect: { satiety: -3 } },
                { message: 'Слышал шум лифта, напугался.', effect: { mood: -2, satiety: -3 } },
                { message: 'Пытался найти еду в мусорке, но пусто.', effect: { satiety: -5 } },
                { message: 'Лежал у скамейки, чувствуя тоску.', effect: { mood: -2, satiety: -3 } }
            ],
            good: [
                { message: 'Побегал по двору, весело.', effect: { mood: 2, satiety: -3 } },
                { message: 'Понюхал кусты, интересный запах.', effect: { mood: 2, satiety: -3 } },
                { message: 'Нашёл кусочек хлеба у подъезда.', effect: { satiety: 2, mood: 2 } },
                { message: 'Повалялся на тёплой плитке, уютно.', effect: { energy: 2, satiety: -3 } },
                { message: 'Вилял хвостом, встретив прохожего.', effect: { mood: 3, satiety: -3 } },
                { message: 'Погнался за голубем, забавно.', effect: { mood: 2, satiety: -3 } },
                { message: 'Лизнул руку доброго человека.', effect: { mood: 3, satiety: -3 } },
                { message: 'Повалялся на травке во дворе.', effect: { energy: 2, satiety: -3 } },
                { message: 'Нашёл старую кость у мусорки.', effect: { satiety: 2, mood: 2 } },
                { message: 'Тявкнул на птиц, весело.', effect: { mood: 2, satiety: -3 } },
                { message: 'Побегал по парковке, лапы в деле.', effect: { health: 2, satiety: -3 } },
                { message: 'Получил ласку от прохожего.', effect: { mood: 3, satiety: -3 } },
                { message: 'Понюхал цветы во дворе, приятно.', effect: { mood: 2, satiety: -3 } },
                { message: 'Нашёл крошки у скамейки.', effect: { satiety: 2, mood: 2 } },
                { message: 'Повалялся в тени, отдыхая.', effect: { energy: 2, satiety: -3 } },
                { message: 'Смотрел на голубей, интересно.', effect: { mood: 2, satiety: -3 } },
                { message: 'Погнался за листочком, весело.', effect: { mood: 2, satiety: -3 } },
                { message: 'Вилял хвостом, встретив ребёнка.', effect: { mood: 3, satiety: -3 } },
                { message: 'Побегал по двору, чувствуя себя активным.', effect: { health: 2, satiety: -3 } },
                { message: 'Нашёл кусочек еды у подъезда.', effect: { satiety: 2, mood: 2 } },
                { message: 'Лизнул руку прохожего, приятно.', effect: { mood: 3, satiety: -3 } },
                { message: 'Повалялся на тёплой плитке, уютно.', effect: { energy: 2, satiety: -3 } },
                { message: 'Смотрел на детей во дворе, забавно.', effect: { mood: 2, satiety: -3 } },
                { message: 'Погнался за мухой, весело.', effect: { mood: 2, satiety: -3 } },
                { message: 'Нашёл старую кость у скамейки.', effect: { satiety: 2, mood: 2 } },
                { message: 'Тявкнул на прохожего, он улыбнулся.', effect: { mood: 3, satiety: -3 } },
                { message: 'Побегал по траве, лапы в деле.', effect: { health: 2, satiety: -3 } },
                { message: 'Получил ласку от ребёнка.', effect: { mood: 3, satiety: -3 } },
                { message: 'Понюхал кусты, нашёл запах.', effect: { mood: 2, satiety: -3 } },
                { message: 'Повалялся на коврике, расслабился.', effect: { energy: 2, satiety: -3 } }
            ],
            happy: [
                { message: 'Носился по двору, полный энергии!', effect: { mood: 5, energy: -2, satiety: -3 } },
                { message: 'Нашёл вкусную кость у подъезда!', effect: { satiety: 5, mood: 5 } },
                { message: 'Вилял хвостом, встретив доброго человека!', effect: { mood: 5, satiety: -3 } },
                { message: 'Погнался за голубем, полный восторг!', effect: { mood: 5, satiety: -3 } },
                { message: 'Получил вкусняшку от прохожего!', effect: { satiety: 5, mood: 5 } },
                { message: 'Повалялся в траве, виляя хвостом!', effect: { mood: 5, satiety: -3 } },
                { message: 'Тявкал от радости, встретив друга!', effect: { mood: 5, satiety: -3 } },
                { message: 'Побегал по парковке, лапы в деле!', effect: { health: 2, satiety: -3 } },
                { message: 'Лизнул руку ребёнка, весело!', effect: { mood: 5, satiety: -3 } },
                { message: 'Нашёл кусок мяса у мусорки!', effect: { satiety: 5, mood: 5 } },
                { message: 'Носился за мячом во дворе, кайф!', effect: { mood: 5, energy: -2, satiety: -3 } },
                { message: 'Понюхал цветы, жизнь прекрасна!', effect: { mood: 5, satiety: -3 } },
                { message: 'Повалялся на тёплой плитке, счастье!', effect: { mood: 5, satiety: -3 } },
                { message: 'Погнался за бабочкой, полный восторг!', effect: { mood: 5, satiety: -3 } },
                { message: 'Получил ласку от прохожего, кайф!', effect: { mood: 5, satiety: -3 } },
                { message: 'Нашёл крошки у скамейки, вкусно!', effect: { satiety: 5, mood: 5 } },
                { message: 'Тявкал на птиц, весело!', effect: { mood: 5, satiety: -3 } },
                { message: 'Побегал по траве, чувствуя свободу!', effect: { health: 2, satiety: -3 } },
                { message: 'Лизнул руку доброго человека, счастье!', effect: { mood: 5, satiety: -3 } },
                { message: 'Нашёл кусочек хлеба у подъезда!', effect: { satiety: 5, mood: 5 } },
                { message: 'Носился по двору, полный кайф!', effect: { mood: 5, energy: -2, satiety: -3 } },
                { message: 'Вилял хвостом, встретив ребёнка!', effect: { mood: 5, satiety: -3 } },
                { message: 'Погнался за листочком, весело!', effect: { mood: 5, satiety: -3 } },
                { message: 'Повалялся в тени, полный релакс!', effect: { energy: 2, satiety: -3 } },
                { message: 'Нашёл старую кость у мусорки!', effect: { satiety: 5, mood: 5 } },
                { message: 'Тявкал от радости, встретив пса!', effect: { mood: 5, satiety: -3 } },
                { message: 'Побегал по парковке, лапы в деле!', effect: { health: 2, satiety: -3 } },
                { message: 'Получил вкусняшку от ребёнка!', effect: { satiety: 5, mood: 5 } },
                { message: 'Понюхал кусты, классный запах!', effect: { mood: 5, satiety: -3 } },
                { message: 'Повалялся на травке, счастье!', effect: { mood: 5, satiety: -3 } }
            ]
        },
        'Завод': {
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
        'Кофейня "Ляля-Фа"': {
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
        'Лес': {
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
        'Мастерская': {
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
        'Парк': {
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
        'Полигон утилизации': {
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
        'Приют для животных "Кошкин дом"': {
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
        'Район Дачный': {
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
        'Магазин "Всё на свете"': {
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
        'Под мостом': {
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
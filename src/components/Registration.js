// src/components/Registration.js
import React, { useState } from 'react';
import styled from 'styled-components';
import Professions from './Professions';
import Streets from './Streets';
import regpic from '../images/regpic.jpg'; // Импортируем изображение

const RegistrationContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  background: ${props => props.theme === 'dark' ? '#1A1A1A' : '#fff'};
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  position: relative;
  overflow: hidden;
  background-image: url(${regpic});
  background-size: cover;
  background-position: center;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
`;

const TextBox = styled.div`
  background: ${props => props.theme === 'dark' ? 'rgba(42, 42, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  max-width: 90%;
  margin: 0 auto;
  align-self: flex-start;
`;

const Text = styled.p`
  font-size: 16px;
  margin: 0;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px; /* Уменьшаем расстояние между блоками текста */
`;

const ButtonContainer = styled.div`
  position: sticky;
  bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
  z-index: 2;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  max-width: 200px;
  transition: background 0.2s;

  &:hover {
    background: #005BBB;
  }
`;

// Остальные стили остаются без изменений
const RadioContainer = styled.div`
  margin: 20px 0;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  margin: 10px 0;
  font-size: 16px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
`;

const RadioInput = styled.input.attrs({ type: 'radio' })`
  margin-right: 10px;
`;

const Registration = ({ user, theme, socket, onRegistrationComplete }) => {
  const [step, setStep] = useState(1);
  const [isHuman, setIsHuman] = useState(null);
  const [animalType, setAnimalType] = useState(null);

  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
  const firstName = telegramUser.first_name || user.firstName || 'User';
  const username = telegramUser.username || '';
  const lastName = telegramUser.last_name || '';

  const getRandomProfession = () => Professions[Math.floor(Math.random() * Professions.length)];
  const getRandomStreet = () => Streets[Math.floor(Math.random() * Streets.length)];
  const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const handleNext = () => {
    if (step === 3 && isHuman === null) return;
    if (step === 4 && isHuman === false && !animalType) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    const registrationData = isHuman
      ? {
          userId: user.userId,
          isHuman: true,
          formerProfession: getRandomProfession(),
          residence: `Город Туманный, ${getRandomStreet()}, дом ${getRandomNumber(1, 42)}, квартира ${getRandomNumber(1, 20)}`,
          isRegistered: true,
        }
      : {
          userId: user.userId,
          isHuman: false,
          animalType,
          name: animalType === 'Кошка' ? 'Бездомный кот' : 'Бездомная собака',
          residence: 'Неопределено',
          isRegistered: true,
        };

    socket.emit('completeRegistration', registrationData, (response) => {
      if (response.success) {
        onRegistrationComplete('Автобусная остановка');
      }
    });
  };

  return (
    <RegistrationContainer theme={theme}>
      <Overlay />
      <ContentWrapper>
        {step === 1 && (
          <>
            <TextBox theme={theme}>
              <Text>
                Город Туманный — удивительное место. Скрытый среди холмов и лесов лежит городок, больше похожий на деревню. Это место, где время замедляется, а воздух пропитан тайнами прошлого. Узкие улочки из старого камня вьются между домами с цветущими крышами, а звонкий ручей, пробегающий через центр, напевает мелодии, которые слышны только тем, кто умеет слушать.
              </Text>
            </TextBox>
            <ButtonContainer>
              <Button onClick={handleNext}>Дальше</Button>
            </ButtonContainer>
          </>
        )}
        {step === 2 && (
          <>
            <TextBox theme={theme}>
              <TextContainer>
                <Text>
                  Здесь собираются люди самых разных профессий: айтишники, променявшие мышку и клавиатуру на зубило и стаместку, менеджеры, сбежавшие от бесконечных дедлайнов и скрам-митингов, чтобы хоть раз в жизни не планировать хаос, а просто его пережить, продажники, спрятавшиеся здесь от бесконечных звонков и KPI, чтобы наконец-то подышать воздухом...
                </Text>
                <Text>
                  Животные здесь — не просто спутники, а полноправные жители: любопытные коты крадутся вдоль заборов и перепрыгивают с крыши на крышу, а бдительные собаки следят за ночными жителями, не позволяя нарушить покой спящих...
                </Text>
              </TextContainer>
            </TextBox>
            <ButtonContainer>
              <Button onClick={handleBack}>Назад</Button>
              <Button onClick={handleNext}>Далее</Button>
            </ButtonContainer>
          </>
        )}
        {step === 3 && (
          <>
            <RadioContainer>
              <RadioLabel theme={theme}>
                <RadioInput
                  checked={isHuman === true}
                  onChange={() => setIsHuman(true)}
                />
                Я человек
              </RadioLabel>
              <RadioLabel theme={theme}>
                <RadioInput
                  checked={isHuman === false}
                  onChange={() => setIsHuman(false)}
                />
                Я животное
              </RadioLabel>
            </RadioContainer>
            {isHuman === true && (
              <Text>
                Город Туманный - город для людей. Но здесь вы не увидите ни умных домов, ни беспилотных такси, ни роботов-доставщиков еды. Здесь даже мобильный телефон или ноутбук редкость. Этот город для выгоревших работяг, решивших уехать подальше от суеты и жить без технологий. Здесь ты просыпаешься не от звонка начальника, а от пения петуха. На завтра ты пьёшь не кофе с круассаном, а чай из трав, которые сам собрал. Вместо телефона - книга, вместо ноутбука - окно. Вместо ИКЕИ — мастерская, где ты сам соберёшь себе мебель, вместо доставки еды на дом — огород. Работаешь кем захочешь и когда захочешь. Можно ещё завести себе домашнего питомца, чтобы было не так скучно. Хотя, скучно здесь точно не будет...
              </Text>
            )}
            {isHuman === false && (
              <Text>
                Город Туманный — город для животных. Благоприятная среда, минимальное количество хищников, умеренное количество пищи. Кошки и собаки здесь живут бок о бок и не лезут на территорию соседа. Хочешь голубей лови, хочешь рыбу. На свалке так вообще кучу всего вкусного можно найти. А захочется приключений — вперёд в лес, там занятие на любого найдётся, от охоты и собирательства до подпольных сражений. Главный плюс — людей здесь немного. Хотя, в последнее время их стало всё больше появляться. Но и те какие-то неагрессивные совсем. Всё погладить да покормить пытаются...
              </Text>
            )}
            <ButtonContainer>
              <Button onClick={handleBack}>Назад</Button>
              <Button onClick={handleNext} disabled={isHuman === null}>Далее</Button>
            </ButtonContainer>
          </>
        )}
        {step === 4 && (
          <>
            {isHuman ? (
              <>
                <Text>Полное имя: {firstName} {lastName}</Text>
                <Text>Ник: @{username}</Text>
                <Text>ID: {user.userId}</Text>
                <Text>Бывшая профессия: {getRandomProfession()}</Text>
                <Text>Место жительства: Город Туманный, {getRandomStreet()}, дом {getRandomNumber(1, 42)}, квартира {getRandomNumber(1, 20)}</Text>
              </>
            ) : (
              <>
                <RadioContainer>
                  <RadioLabel theme={theme}>
                    <RadioInput
                      checked={animalType === 'Кошка'}
                      onChange={() => setAnimalType('Кошка')}
                    />
                    Кошка
                  </RadioLabel>
                  <RadioLabel theme={theme}>
                    <RadioInput
                      checked={animalType === 'Собака'}
                      onChange={() => setAnimalType('Собака')}
                    />
                    Собака
                  </RadioLabel>
                </RadioContainer>
                {animalType && (
                  <>
                    <Text>Животное: {animalType}</Text>
                    <Text>Имя: {animalType === 'Кошка' ? 'Бездомный кот' : 'Бездомная собака'}</Text>
                    <Text>Место жительства: Неопределённо</Text>
                  </>
                )}
              </>
            )}
            <ButtonContainer>
              <Button onClick={handleBack}>Назад</Button>
              <Button onClick={handleComplete} disabled={isHuman === false && !animalType}>
                Завершить регистрацию
              </Button>
            </ButtonContainer>
          </>
        )}
      </ContentWrapper>
    </RegistrationContainer>
  );
};

export default Registration;
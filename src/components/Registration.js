import React, { useState } from 'react';
import styled from 'styled-components';
import Professions from './Professions';
import Streets from './Streets';
import regpic from '../images/regpic.jpg';

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

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Text = styled.p`
  font-size: 16px;
  margin: 0;
`;

const BoldText = styled.span`
  font-weight: bold;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
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

const RadioContainer = styled.div`
  background: ${props => props.theme === 'dark' ? 'rgba(42, 42, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  max-width: 90%;
  margin: 0 auto;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
`;

const RadioInput = styled.input.attrs({ type: 'radio' })`
  margin-right: 10px;
  width: 20px;
  height: 20px;
`;

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin: 0 auto 15px;
  display: block;
  border: 2px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
`;

const Registration = ({ user, theme, socket, onRegistrationComplete }) => {
  const [step, setStep] = useState(1);
  const [isHuman, setIsHuman] = useState(null);
  const [animalType, setAnimalType] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
  const firstName = telegramUser.first_name || user.firstName || '';
  const username = telegramUser.username || '';
  const lastName = telegramUser.last_name || '';
  const avatarUrl = telegramUser.photo_url || '';

  const catAvatars = [
    'https://tuchki-zauchki.ru/images/telepets/avatars/cats/cat_1.jpg',
    'https://tuchki-zauchki.ru/images/telepets/avatars/cats/cat_2.jpg',
    'https://tuchki-zauchki.ru/images/telepets/avatars/cats/cat_3.jpg',
    'https://tuchki-zauchki.ru/images/telepets/avatars/cats/cat_4.jpg',
    'https://tuchki-zauchki.ru/images/telepets/avatars/cats/cat_5.jpg',
  ];

  const dogAvatars = [
    'https://tuchki-zauchki.ru/images/telepets/avatars/dogs/dog_1.jpg',
    'https://tuchki-zauchki.ru/images/telepets/avatars/dogs/dog_2.jpg',
    'https://tuchki-zauchki.ru/images/telepets/avatars/dogs/dog_3.jpg',
    'https://tuchki-zauchki.ru/images/telepets/avatars/dogs/dog_4.jpg',
    'https://tuchki-zauchki.ru/images/telepets/avatars/dogs/dog_5.jpg',
  ];

  const getRandomProfession = () => Professions[Math.floor(Math.random() * Professions.length)];
  const getRandomStreet = () => Streets[Math.floor(Math.random() * Streets.length)];
  const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const selectRandomAvatar = (type) => {
    const avatars = type === 'Кошка' ? catAvatars : dogAvatars;
    const randomIndex = Math.floor(Math.random() * avatars.length);
    return avatars[randomIndex];
  };

  const handleAnimalTypeChange = (type) => {
    setAnimalType(type);
    const avatar = selectRandomAvatar(type);
    setSelectedAvatar(avatar);
  };

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
          residence: 'Город Туманный',
          isRegistered: true,
          photoUrl: selectedAvatar, // Добавляем выбранную аватарку для животного
        };

    socket.emit('completeRegistration', registrationData, (response) => {
      if (response.success) {
        onRegistrationComplete('Автобусная остановка');
      }
    });
  };

  const fullNameParts = [];
  if (firstName) fullNameParts.push(firstName);
  if (username) fullNameParts.push(`@${username}`);
  if (lastName) fullNameParts.push(lastName);
  const fullName = fullNameParts.length > 0 ? fullNameParts.join(' ') : 'Безымянный';

  return (
    <RegistrationContainer theme={theme}>
      <Overlay />
      <ContentWrapper>
        {step === 1 && (
          <>
            <div>
              <TextBox theme={theme}>
                <Text>
                  Город Туманный — удивительное место. Скрытый среди холмов и лесов лежит городок, больше похожий на деревню. Это место, где время замедляется, а воздух пропитан тайнами прошлого. Узкие улочки из старого камня вьются между домами с цветущими крышами, а звонкий ручей, пробегающий через центр, напевает мелодии, которые слышны только тем, кто умеет слушать.
                </Text>
              </TextBox>
              <ButtonContainer>
                <Button onClick={handleNext}>Дальше</Button>
              </ButtonContainer>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div>
              <TextBox theme={theme}>
                <TextContainer MAGICK>
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
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div>
              <RadioContainer theme={theme}>
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
                <TextBox theme={theme}>
                  <Text>
                    Город Туманный - город для людей. Но здесь вы не увидите ни умных домов, ни беспилотных такси, ни роботов-доставщиков еды. Здесь даже мобильный телефон или ноутбук редкость. Этот город для выгоревших работяг, решивших уехать подальше от суеты и жить без технологий. Здесь ты просыпаешься не от звонка начальника, а от пения петуха. На завтра ты пьёшь не кофе с круассаном, а чай из трав, которые сам собрал. Вместо телефона - книга, вместо ноутбука - окно. Вместо ИКЕИ — мастерская, где ты сам соберёшь себе мебель, вместо доставки еды на дом — огород. Работаешь кем захочешь и когда захочешь. Можно ещё завести себе домашнего питомца, чтобы было не так скучно. Хотя, скучно здесь точно не будет...
                  </Text>
                </TextBox>
              )}
              {isHuman === false && (
                <TextBox theme={theme}>
                  <Text>
                    Город Туманный — город для животных. Благоприятная среда, минимальное количество хищников, умеренное количество пищи. Кошки и собаки здесь живут бок о бок и не лезут на территорию соседа. Хочешь голубей лови, хочешь рыбу. На свалке так вообще кучу всего вкусного можно найти. А захочется приключений — вперёд в лес, там занятие на любого найдётся, от охоты и собирательства до подпольных сражений. Главный плюс — людей здесь немного. Хотя, в последнее время их стало всё больше появляться. Но и те какие-то неагрессивные совсем. Всё погладить да покормить пытаются...
                  </Text>
                </TextBox>
              )}
              <ButtonContainer>
                <Button onClick={handleBack}>Назад</Button>
                <Button onClick={handleNext} disabled={isHuman === null}>Далее</Button>
              </ButtonContainer>
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <div>
              {isHuman ? (
                <TextBox theme={theme}>
                  {avatarUrl && <Avatar src={avatarUrl} alt="User Avatar" theme={theme} />}
                  <TextContainer>
                    <Text>
                      <BoldText>Полное имя:</BoldText> {fullName}
                    </Text>
                    <Text>
                      <BoldText>Бывшая профессия:</BoldText> {getRandomProfession()}
                    </Text>
                    <Text>
                      <BoldText>Место жительства:</BoldText> Город Туманный, {getRandomStreet()}, дом {getRandomNumber(1, 42)}, квартира {getRandomNumber(1, 20)}
                    </Text>
                  </TextContainer>
                </TextBox>
              ) : (
                <>
                  <RadioContainer theme={theme}>
                    <RadioLabel theme={theme}>
                      <RadioInput
                        checked={animalType === 'Кошка'}
                        onChange={() => handleAnimalTypeChange('Кошка')}
                      />
                      Кошка
                    </RadioLabel>
                    <RadioLabel theme={theme}>
                      <RadioInput
                        checked={animalType === 'Собака'}
                        onChange={() => handleAnimalTypeChange('Собака')}
                      />
                      Собака
                    </RadioLabel>
                  </RadioContainer>
                  {animalType && (
                    <TextBox theme={theme}>
                      {selectedAvatar && <Avatar src={selectedAvatar} alt={`${animalType} Avatar`} theme={theme} />}
                      <TextContainer>
                        <Text>
                          <BoldText>Животное:</BoldText> {animalType}
                        </Text>
                        <Text>
                          <BoldText>Имя:</BoldText> {animalType === 'Кошка' ? 'Бездомный кот' : 'Бездомная собака'}
                        </Text>
                        <Text>
                          <BoldText>Место жительства:</BoldText> Город Туманный
                        </Text>
                      </TextContainer>
                    </TextBox>
                  )}
                </>
              )}
              <ButtonContainer>
                <Button onClick={handleBack}>Назад</Button>
                <Button onClick={handleComplete} disabled={isHuman === false && !animalType}>
                  Завершить регистрацию
                </Button>
              </ButtonContainer>
            </div>
          </>
        )}
      </ContentWrapper>
    </RegistrationContainer>
  );
};

export default Registration;
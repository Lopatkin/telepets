import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import actionsConfig from './constants/actionsConfig';
import { rooms } from './constants/rooms';
import actionHandlers from './handlers/actionHandlers'; // Добавляем импорт actionHandlers

const ProfileContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: ${props => props.theme === 'dark' ? '#1A1A1A' : '#f5f5f5'};
  height: 100%;
  overflow-y: auto;
`;

const TabsContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 400px;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 10px;
  background: ${props => props.active ? '#007AFF' : props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  color: ${props => props.active ? 'white' : props.theme === 'dark' ? '#ccc' : '#333'};
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-bottom: ${props => props.active ? 'none' : '1px solid'};
  cursor: pointer;
  font-size: 16px;
  &:hover {
    background: ${props => props.theme === 'dark' ? '#333' : '#f0f0f0'};
  }
`;

const TabContent = styled.div`
  width: 100%;
  max-width: 400px;
`;

const ProgressWidget = styled.div`
  width: 100%;
  margin-top: 20px;
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ProgressBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 5px;
  border-radius: 4px;
`;

const ProgressLabel = styled.span`
  font-size: 16px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#666'};
  width: 80px;
  text-align: left;
`;

const ProgressValue = styled.span`
  font-size: 14px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  margin-left: 10px;
`;

const ProgressBar = styled.progress`
  width: 140px;
  height: 8px;
  border-radius: 4px;
  &::-webkit-progress-bar {
    background-color: #f0f0f0;
    border-radius: 4px;
  }
  &::-webkit-progress-value {
    ${props => props.type === 'energy' && `background-color: #FFA500;`}
    ${props => props.type === 'health' && `background-color: #FF0000;`}
    ${props => props.type === 'mood' && `background-color: #007AFF;`}
    ${props => props.type === 'fullness' && `background-color: #32CD32;`}
    border-radius: 4px;
  }
  &::-moz-progress-bar {
    ${props => props.type === 'energy' && `background-color: #FFA500;`}
    ${props => props.type === 'health' && `background-color: #FF0000;`}
    ${props => props.type === 'mood' && `background-color: #007AFF;`}
    ${props => props.type === 'fullness' && `background-color: #32CD32;`}
    border-radius: 4px;
  }
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
  border: 3px solid #007AFF;
`;

const DefaultAvatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #007AFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: white;
  margin-bottom: 20px;
  border: 3px solid #007AFF;
`;

const Name = styled.h2`
  font-size: 24px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  margin: 0 0 10px 0;
`;

const Username = styled.p`
  font-size: 18px;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
  margin: 0 0 10px 0;
`;

const Info = styled.p`
  font-size: 16px;
  color: ${props => props.theme === 'dark' ? '#999' : '#888'};
  margin: 0 0 20px 0;
`;

const ThemeOptions = styled.div`
  width: 100%;
  padding: 15px;
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
`;

const ThemeTitle = styled.h3`
  font-size: 18px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  margin: 0 0 10px 0;
`;

const ThemeOption = styled.label`
  display: flex;
  align-items: center;
  margin: 5px 0;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  cursor: pointer;
`;

const ThemeRadio = styled.input.attrs({ type: 'radio' })`
  margin-right: 10px;
`;

const ThemeLabel = styled.span`
  font-size: 16px;
`;

const SliderContainer = styled.div`
  width: 100%;
  margin: 20px 0;
`;

const SliderLabel = styled.label`
  display: block;
  font-size: 16px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  margin-bottom: 10px;
`;

const Slider = styled.input.attrs({ type: 'range', min: 0, max: 100 })`
  width: 100%;
  -webkit-appearance: none;
  height: 8px;
  border-radius: 4px;
  background: ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  outline: none;
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #007AFF;
    cursor: pointer;
  }
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #007AFF;
    cursor: pointer;
  }
`;

const DiaryLog = styled.div`
  width: 100%;
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
`;

const DiaryEntry = styled.p`
  font-size: 14px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  margin: 5px 0;
`;

function Profile({ user, theme, selectedTheme, telegramTheme, onThemeChange, progressValues, socket }) {
  const [activeTab, setActiveTab] = useState('interface');
  const [freeWill, setFreeWill] = useState(50);
  const [diaryEntries, setDiaryEntries] = useState([]);

  const photoUrl = user?.photoUrl || '';
  const displayName = !user.isHuman && user.name 
    ? user.name 
    : `${user?.firstName || 'User'} ${user?.lastName || ''}`.trim();
  const username = user?.username || '';
  const defaultAvatarLetter = (user?.firstName || user?.name || 'U').charAt(0).toUpperCase();

  // Вступительные фразы для выбора локации с мемоизацией
  const introPhrases = useMemo(() => [
    'Решил пойти в ',
    'Пошёл в ',
    'Сходил в ',
    'Подумал, не плохо было бы сходить в '
  ], []);

  // Реакции с мемоизацией
  const reactions = useMemo(() => [
    'Хорошо.',
    'Нравится.',
    'Ну и ладно.',
    'Пойдёт.'
  ], []);

  // Маппинг локаций для actionsConfig с мемоизацией
  const roomToConfigKey = useMemo(() => ({
    'Автобусная остановка': 'busStop',
    'Лес': 'forest',
    'Полигон утилизации': 'disposal',
    'Мастерская': 'workshop',
    'Приют для животных "Кошкин дом"': 'shelter'
  }), []); // Пустой массив зависимостей, так как объект статический

  // Получение доступных действий для локации с мемоизацией
  const getAvailableActions = useCallback((room) => {
    const configKey = roomToConfigKey[room] || 'home';
    const actions = actionsConfig[configKey]?.[user.isHuman ? 'humanActions' : 'animalActions'] || [];
    return actions.map(action => action.title);
  }, [user?.isHuman, roomToConfigKey]);

  // Обработчик изменения ползунка
  const handleFreeWillChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setFreeWill(newValue);
    if (socket) {
      socket.emit('updateFreeWill', { userId: user.userId, freeWill: newValue });
    }
  };

  // Генерация события с мемоизацией
  const generateEvent = useCallback(() => {
    const room = rooms[Math.floor(Math.random() * rooms.length)];
    const intro = introPhrases[Math.floor(Math.random() * introPhrases.length)];
    const availableActions = getAvailableActions(room);
    const action = availableActions.length > 0 
      ? availableActions[Math.floor(Math.random() * availableActions.length)]
      : 'Ничего не делал';
    const effect = actionHandlers[action]?.successMessage || 'Ничего особенного не произошло.';
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    
    // Добавление предмета, если действие связано с предметом
    if (actionHandlers[action]?.item && socket) {
      socket.emit('addItem', { owner: `user_${user.userId}`, item: actionHandlers[action].item });
    }

    return `${intro}${room}. ${action}. ${effect} ${reaction}`;
  }, [socket, user?.userId, getAvailableActions, introPhrases, reactions]);

  // Обработка оффлайн-событий
  useEffect(() => {
    if (socket && user?.lastActivity) {
      const lastActivity = new Date(user.lastActivity);
      const now = new Date();
      const hoursOffline = Math.floor((now - lastActivity) / (1000 * 60 * 60));
      
      const newEntries = [];
      for (let i = 0; i < hoursOffline; i++) {
        if (Math.random() * 100 < freeWill) {
          newEntries.push(generateEvent());
        }
      }
      
      if (newEntries.length > 0) {
        setDiaryEntries(prev => [...newEntries, ...prev]);
      }

      // Обновляем lastActivity
      socket.emit('updateLastActivity', { userId: user.userId });
    }
  }, [socket, user, freeWill, generateEvent]);

  // Загрузка сохраненного значения freeWill
  useEffect(() => {
    if (socket) {
      socket.emit('getFreeWill', { userId: user.userId });
      socket.on('freeWillUpdate', ({ freeWill }) => {
        setFreeWill(freeWill || 50);
      });
      return () => {
        socket.off('freeWillUpdate');
      };
    }
  }, [socket, user]);

  return (
    <ProfileContainer theme={theme}>
      <TabsContainer>
        <Tab theme={theme} active={activeTab === 'interface'} onClick={() => setActiveTab('interface')}>
          Интерфейс
        </Tab>
        <Tab theme={theme} active={activeTab === 'parameters'} onClick={() => setActiveTab('parameters')}>
          Параметры
        </Tab>
        <Tab theme={theme} active={activeTab === 'diary'} onClick={() => setActiveTab('diary')}>
          Дневник
        </Tab>
      </TabsContainer>
      <TabContent>
        {activeTab === 'interface' && (
          <ThemeOptions theme={theme}>
            <ThemeTitle theme={theme}>Тема оформления</ThemeTitle>
            <ThemeOption theme={theme}>
              <ThemeRadio
                checked={selectedTheme === 'telegram'}
                onChange={() => onThemeChange('telegram')}
              />
              <ThemeLabel>Тема как в Telegram ({telegramTheme === 'dark' ? 'тёмная' : 'светлая'})</ThemeLabel>
            </ThemeOption>
            <ThemeOption theme={theme}>
              <ThemeRadio
                checked={selectedTheme === (telegramTheme === 'dark' ? 'light' : 'dark')}
                onChange={() => onThemeChange(telegramTheme === 'dark' ? 'light' : 'dark')}
              />
              <ThemeLabel>{telegramTheme === 'dark' ? 'Светлая' : 'Тёмная'}</ThemeLabel>
            </ThemeOption>
          </ThemeOptions>
        )}
        {activeTab === 'parameters' && (
          <>
            {photoUrl ? (
              <Avatar src={photoUrl} alt={`${displayName}'s avatar`} />
            ) : (
              <DefaultAvatar>{defaultAvatarLetter}</DefaultAvatar>
            )}
            <Name theme={theme}>{displayName}</Name>
            {username && <Username theme={theme}>@{username}</Username>}
            <Info theme={theme}>ID: {user.userId}</Info>
            {progressValues && (
              <ProgressWidget theme={theme}>
                <ProgressBarContainer>
                  <ProgressLabel theme={theme}>Энергия</ProgressLabel>
                  <ProgressBar value={progressValues.energy || 0} max="100" type="energy" />
                  <ProgressValue theme={theme}>{progressValues.energy || 0}%</ProgressValue>
                </ProgressBarContainer>
                <ProgressBarContainer>
                  <ProgressLabel theme={theme}>Здоровье</ProgressLabel>
                  <ProgressBar value={progressValues.health || 0} max="100" type="health" />
                  <ProgressValue theme={theme}>{progressValues.health || 0}%</ProgressValue>
                </ProgressBarContainer>
                <ProgressBarContainer>
                  <ProgressLabel theme={theme}>Настроение</ProgressLabel>
                  <ProgressBar value={progressValues.mood || 0} max="100" type="mood" />
                  <ProgressValue theme={theme}>{progressValues.mood || 0}%</ProgressValue>
                </ProgressBarContainer>
                <ProgressBarContainer>
                  <ProgressLabel theme={theme}>Сытость</ProgressLabel>
                  <ProgressBar value={progressValues.fullness || 0} max="100" type="fullness" />
                  <ProgressValue theme={theme}>{progressValues.fullness || 0}%</ProgressValue>
                </ProgressBarContainer>
              </ProgressWidget>
            )}
          </>
        )}
        {activeTab === 'diary' && (
          <>
            <SliderContainer>
              <SliderLabel theme={theme}>Свобода воли: {freeWill}%</SliderLabel>
              <Slider
                value={freeWill}
                onChange={handleFreeWillChange}
                theme={theme}
              />
            </SliderContainer>
            <DiaryLog theme={theme}>
              {diaryEntries.length > 0 ? (
                diaryEntries.map((entry, index) => (
                  <DiaryEntry key={index} theme={theme}>{entry}</DiaryEntry>
                ))
              ) : (
                <DiaryEntry theme={theme}>Записи в дневнике отсутствуют.</DiaryEntry>
              )}
            </DiaryLog>
          </>
        )}
      </TabContent>
    </ProfileContainer>
  );
}

export default Profile;
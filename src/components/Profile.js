import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUser, FaBook, FaPalette, FaSave, FaStar } from 'react-icons/fa';

// Стили для вкладок
const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
`;

const ExpInfo = styled.p`
  font-size: 16px;
  color: ${props => props.theme === 'dark' ? '#999' : '#888'};
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LevelInfo = styled.p`
  font-size: 16px;
  color: ${props => props.theme === 'dark' ? '#999' : '#888'};
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TabButton = styled.button`
  background: ${props => props.active ? '#007AFF' : 'none'};
  color: ${props => props.active ? 'white' : (props.theme === 'dark' ? '#ccc' : '#666')};
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FreeWillContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FreeWillWrapper = styled.div`
    width: calc(100% - 40px);
    max-width: 800px;
    margin: 20px auto;
    padding: 15px;
    background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
    border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const LogWrapper = styled.div`
    width: calc(100% - 40px);
    max-width: 800px;
    margin: 20px auto;
    padding: 15px;
    background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
    border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
    max-height: 300px;
    overflow-y: auto;
`;

const LogEntry = styled.div`
    padding: 8px 2px; // Уменьшаем отступы: 6px сверху/снизу, 2px слева/справа
    text-align: left;
    border-bottom: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
    font-size: 14px;
    &:last-child {
        border-bottom: none;
    }
`;

const Timestamp = styled.span`
    font-weight: bold; // Выделяем дату и время жирным
`;

const SliderLabel = styled.label`
    font-size: 16px;
    color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
    width: 120px;
    white-space: nowrap;
    text-align: left;
`;

const Slider = styled.input.attrs({ type: 'range' })`
  flex: 1;
`;

const SaveIcon = styled(FaSave)`
  font-size: 20px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  background: ${props => props.success ? '#32CD32' : 'transparent'};
  transition: background 0.3s;
`;

const ProgressWidget = styled.div`
  width: 100%;
  max-width: 300px;
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
    ${props => props.type === 'exp' && `background-color: #FFD700;`} // Новый цвет для опыта
    border-radius: 4px;
  }
  &::-moz-progress-bar {
    ${props => props.type === 'energy' && `background-color: #FFA500;`}
    ${props => props.type === 'health' && `background-color: #FF0000;`}
    ${props => props.type === 'mood' && `background-color: #007AFF;`}
    ${props => props.type === 'fullness' && `background-color: #32CD32;`}
    ${props => props.type === 'exp' && `background-color: #FFD700;`} // Новый цвет для опыта
    border-radius: 4px;
  }
`;

const ProfileContainer = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: ${props => props.theme === 'dark' ? '#1A1A1A' : '#f5f5f5'};
  height: 100%;
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
  max-width: 300px;
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

const calculateLevel = (exp) => {
  // Таблица соответствия опыта и уровней
  const levelRanges = [
    { min: 0, max: 9, level: 1 },
    { min: 10, max: 29, level: 2 },
    { min: 30, max: 59, level: 3 },
    { min: 60, max: 99, level: 4 },
    { min: 100, max: 149, level: 5 },
    { min: 150, max: 209, level: 6 },
    { min: 210, max: 279, level: 7 },
    { min: 280, max: 359, level: 8 },
    { min: 360, max: 449, level: 9 },
    { min: 450, max: 549, level: 10 },
    { min: 550, max: 659, level: 11 },
    { min: 660, max: 779, level: 12 },
    { min: 780, max: 909, level: 13 },
    { min: 910, max: 1049, level: 14 },
    { min: 1050, max: 1199, level: 15 },
    { min: 1200, max: 1359, level: 16 },
    { min: 1360, max: 1529, level: 17 },
    { min: 1530, max: 1709, level: 18 },
    { min: 1710, max: 1899, level: 19 },
    { min: 1900, max: 2099, level: 20 },
    { min: 2100, max: 2309, level: 21 },
    { min: 2310, max: 2529, level: 22 },
    { min: 2530, max: 2759, level: 23 },
    { min: 2760, max: 2999, level: 24 },
    { min: 3000, max: 3249, level: 25 },
    { min: 3250, max: 3509, level: 26 },
    { min: 3510, max: 3779, level: 27 },
    { min: 3780, max: 4059, level: 28 },
    { min: 4060, max: 4349, level: 29 },
    { min: 4350, max: 4649, level: 30 },
    { min: 4650, max: 4959, level: 31 },
    { min: 4960, max: 5279, level: 32 },
    { min: 5280, max: 5609, level: 33 },
    { min: 5610, max: 5949, level: 34 },
    { min: 5950, max: 6299, level: 35 },
    { min: 6300, max: 6659, level: 36 },
    { min: 6660, max: 7029, level: 37 },
    { min: 7030, max: 7409, level: 38 },
    { min: 7410, max: 7799, level: 39 },
    { min: 7800, max: 8199, level: 40 },
    { min: 8200, max: 8609, level: 41 },
    { min: 8610, max: 9029, level: 42 },
    { min: 9030, max: 9459, level: 43 },
    { min: 9460, max: 9899, level: 44 },
    { min: 9900, max: 10349, level: 45 },
    { min: 10350, max: 10809, level: 46 },
    { min: 10810, max: 11279, level: 47 },
    { min: 11280, max: 11759, level: 48 },
    { min: 11760, max: 12249, level: 49 },
    { min: 12250, max: 12749, level: 50 },
    { min: 12750, max: Infinity, level: 50 } // Для exp >= 12750
  ];

  const range = levelRanges.find(range => exp >= range.min && exp <= range.max);
  return {
    level: range ? range.level : 1,
    min: range ? range.min : 0,
    max: range ? range.max : 9
  };
};

function Profile({ user, theme, selectedTheme, telegramTheme, onThemeChange, progressValues, socket }) {
  const [activeTab, setActiveTab] = useState('stats');
  const [freeWill, setFreeWill] = useState(user.stats.freeWill || 0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const photoUrl = user?.photoUrl || '';
  const displayName = !user.isHuman && user.name
    ? user.name
    : `${user?.firstName || 'User'} ${user?.lastName || ''}`.trim();
  const username = user?.username || '';
  const defaultAvatarLetter = (user?.firstName || user?.name || 'U').charAt(0).toUpperCase();

  const handleSaveFreeWill = () => {
    if (socket) {
      socket.emit('updateFreeWill', { userId: user.userId, freeWill }, (response) => {
        if (response.success) {
          console.log('FreeWill updated:', freeWill);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 1000);
        } else {
          console.error('Failed to update freeWill:', response.message);
        }
      });
    }
  };

  // Форматирование даты и времени для отображения
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}.${month} ${hours}:${minutes}`;
  };

  useEffect(() => {
    if (activeTab === 'diary') {
      const logWrapper = document.querySelector('#logWrapper');
      if (logWrapper) logWrapper.scrollTop = logWrapper.scrollHeight;
    }
  }, [activeTab, user.diary]);

  const { level, min, max } = calculateLevel(user.exp || 0);

  return (
    <ProfileContainer theme={theme}>
      <TabsContainer>
        <TabButton
          active={activeTab === 'stats'}
          onClick={() => setActiveTab('stats')}
          theme={theme}
        >
          <FaUser />
        </TabButton>
        <TabButton
          active={activeTab === 'diary'}
          onClick={() => setActiveTab('diary')}
          theme={theme}
        >
          <FaBook />
        </TabButton>
        <TabButton
          active={activeTab === 'interface'}
          onClick={() => setActiveTab('interface')}
          theme={theme}
        >
          <FaPalette />
        </TabButton>
      </TabsContainer>

      {activeTab === 'stats' && (
        <>
          {photoUrl ? (
            <Avatar src={photoUrl} alt={`${displayName}'s avatar`} />
          ) : (
            <DefaultAvatar>{defaultAvatarLetter}</DefaultAvatar>
          )}

          <Name theme={theme}>{displayName}</Name>
          {username && <Username theme={theme}>@{username}</Username>}
          <Info theme={theme}>ID: {user.userId}</Info>
          <LevelInfo theme={theme}><FaStar /> Уровень: {level}</LevelInfo>
          <ExpInfo theme={theme}><FaStar /> Опыт: {user.exp || 0}</ExpInfo>
          <ProgressWidget theme={theme}>
            <ProgressBarContainer>
              <ProgressLabel theme={theme}>Опыт</ProgressLabel>
              <ProgressBar
                value={max === Infinity ? 100 : (user.exp || 0) - min}
                max={max === Infinity ? 100 : max - min}
                type="exp"
              />
              <ProgressValue theme={theme}>
                {max === Infinity ? (user.exp || 0) : `${user.exp || 0}/${max}`}
              </ProgressValue>
            </ProgressBarContainer>
            <ProgressBarContainer>
              <ProgressLabel theme={theme}>Энергия</ProgressLabel>
              <ProgressBar value={user.stats.energy || 0} max={user.stats.maxEnergy || 100} type="energy" />
              <ProgressValue theme={theme}>{user.stats.energy || 0}%</ProgressValue>
            </ProgressBarContainer>
            <ProgressBarContainer>
              <ProgressLabel theme={theme}>Здоровье</ProgressLabel>
              <ProgressBar value={user.stats.health || 0} max={user.stats.maxHealth || 100} type="health" />
              <ProgressValue theme={theme}>{user.stats.health || 0}%</ProgressValue>
            </ProgressBarContainer>
            <ProgressBarContainer>
              <ProgressLabel theme={theme}>Настроение</ProgressLabel>
              <ProgressBar value={user.stats.mood || 0} max={user.stats.maxMood || 100} type="mood" />
              <ProgressValue theme={theme}>{user.stats.mood || 0}%</ProgressValue>
            </ProgressBarContainer>
            <ProgressBarContainer>
              <ProgressLabel theme={theme}>Сытость</ProgressLabel>
              <ProgressBar value={user.stats.satiety || 0} max={user.stats.maxSatiety || 100} type="fullness" />
              <ProgressValue theme={theme}>{user.stats.satiety || 0}%</ProgressValue>
            </ProgressBarContainer>
          </ProgressWidget>
        </>
      )}

      {activeTab === 'diary' && (
        <>
          <FreeWillWrapper theme={theme}>
            <FreeWillContainer>
              <SliderLabel theme={theme}>Свобода воли</SliderLabel>
              <Slider
                value={freeWill}
                onChange={(e) => setFreeWill(Number(e.target.value))}
                min={0}
                max={100}
              />
              <SaveIcon
                theme={theme}
                success={saveSuccess}
                onClick={handleSaveFreeWill}
              />
            </FreeWillContainer>
          </FreeWillWrapper>
          <LogWrapper id="logWrapper" theme={theme}>
            {user.diary && user.diary.length > 0 ? (
              user.diary
                .slice()
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .map((entry, index) => (
                  <LogEntry key={index} theme={theme}>
                    <Timestamp>{formatTimestamp(entry.timestamp)}</Timestamp>: {entry.message}
                  </LogEntry>
                ))
            ) : (
              <p>Логи пока отсутствуют</p>
            )}
          </LogWrapper>
        </>
      )}

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
    </ProfileContainer>
  );
}

export default Profile;
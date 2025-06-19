import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUser, FaBook, FaPalette, FaSave, FaStar } from 'react-icons/fa';

const LevelLabel = styled.span`
    font-size: 24px; /* Совпадает с размером Name */
    color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
    margin-right: 10px;
    display: flex;
    align-items: center;
`;

// Стили для вкладок
const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
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
  width: 160px;
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
      ${props => props.type === 'exp' && `background-color: #FFD700;`} /* Золотой цвет для опыта */
      border-radius: 4px;
    }
    &::-moz-progress-bar {
      ${props => props.type === 'energy' && `background-color: #FFA500;`}
      ${props => props.type === 'health' && `background-color: #FF0000;`}
      ${props => props.type === 'mood' && `background-color: #007AFF;`}
      ${props => props.type === 'fullness' && `background-color: #32CD32;`}
      ${props => props.type === 'exp' && `background-color: #FFD700;`} /* Золотой цвет для опыта */
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
  margin: 0 0 0 0;
`;

const Username = styled.p`
  font-size: 18px;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
  margin: 0 0 0 0;
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

// Функция для определения уровня и максимального опыта
const getLevelInfo = (exp) => {
  const levelTable = [
    { level: 1, minExp: 0, maxExp: 10 },
    { level: 2, minExp: 11, maxExp: 30 },
    { level: 3, minExp: 31, maxExp: 60 },
    { level: 4, minExp: 61, maxExp: 100 },
    { level: 5, minExp: 101, maxExp: 150 },
    { level: 6, minExp: 151, maxExp: 210 },
    { level: 7, minExp: 211, maxExp: 280 },
    { level: 8, minExp: 281, maxExp: 360 },
    { level: 9, minExp: 361, maxExp: 450 },
    { level: 10, minExp: 451, maxExp: 550 },
    { level: 11, minExp: 551, maxExp: 660 },
    { level: 12, minExp: 661, maxExp: 780 },
    { level: 13, minExp: 781, maxExp: 910 },
    { level: 14, minExp: 911, maxExp: 1050 },
    { level: 15, minExp: 1051, maxExp: 1200 },
    { level: 16, minExp: 1201, maxExp: 1360 },
    { level: 17, minExp: 1361, maxExp: 1530 },
    { level: 18, minExp: 1531, maxExp: 1710 },
    { level: 19, minExp: 1711, maxExp: 1900 },
    { level: 20, minExp: 1901, maxExp: 2100 },
    { level: 21, minExp: 2101, maxExp: 2310 },
    { level: 22, minExp: 2311, maxExp: 2530 },
    { level: 23, minExp: 2531, maxExp: 2760 },
    { level: 24, minExp: 2761, maxExp: 3000 },
    { level: 25, minExp: 3001, maxExp: 3250 },
    { level: 26, minExp: 3251, maxExp: 3510 },
    { level: 27, minExp: 3511, maxExp: 3780 },
    { level: 28, minExp: 3781, maxExp: 4060 },
    { level: 29, minExp: 4061, maxExp: 4350 },
    { level: 30, minExp: 4351, maxExp: 4650 },
    { level: 31, minExp: 4651, maxExp: 4960 },
    { level: 32, minExp: 4961, maxExp: 5280 },
    { level: 33, minExp: 5281, maxExp: 5610 },
    { level: 34, minExp: 5611, maxExp: 5950 },
    { level: 35, minExp: 5951, maxExp: 6300 },
    { level: 36, minExp: 6301, maxExp: 6660 },
    { level: 37, minExp: 6661, maxExp: 7030 },
    { level: 38, minExp: 7031, maxExp: 7410 },
    { level: 39, minExp: 7411, maxExp: 7800 },
    { level: 40, minExp: 7801, maxExp: 8200 },
    { level: 41, minExp: 8201, maxExp: 8610 },
    { level: 42, minExp: 8611, maxExp: 9030 },
    { level: 43, minExp: 9031, maxExp: 9460 },
    { level: 44, minExp: 9461, maxExp: 9900 },
    { level: 45, minExp: 9901, maxExp: 10350 },
    { level: 46, minExp: 10351, maxExp: 10810 },
    { level: 47, minExp: 10811, maxExp: 11280 },
    { level: 48, minExp: 11281, maxExp: 11760 },
    { level: 49, minExp: 11761, maxExp: 12250 },
    { level: 50, minExp: 12251, maxExp: 12750 }
  ];

  for (let i = levelTable.length - 1; i >= 0; i--) {
    if (exp >= levelTable[i].minExp) {
      return {
        level: levelTable[i].level,
        currentExp: exp,
        maxExp: levelTable[i].maxExp,
        totalMaxExp: levelTable[i].maxExp
      };
    }
  }
  return { level: 1, currentExp: exp, maxExp: 10, totalMaxExp: 10 };
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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <LevelLabel theme={theme}>
              <FaStar style={{ color: theme === 'dark' ? '#FFD700' : '#FFD700', marginRight: '5px', fontSize: '20px' }} />
              {getLevelInfo(user.exp || 0).level}
            </LevelLabel>
            <Name theme={theme}>{displayName}</Name>
          </div>
          {username && <Username theme={theme}>@{username}</Username>}
          <ProgressBarContainer>
            <ProgressLabel theme={theme}></ProgressLabel>
            <ProgressBar
              value={getLevelInfo(user.exp || 0).currentExp}
              max={getLevelInfo(user.exp || 0).maxExp}
              type="exp"
            />
            <ProgressValue theme={theme}>
              {getLevelInfo(user.exp || 0).currentExp}/{getLevelInfo(user.exp || 0).maxExp}
            </ProgressValue>
          </ProgressBarContainer>
          {photoUrl ? (
            <Avatar src={photoUrl} alt={`${displayName}'s avatar`} />
          ) : (
            <DefaultAvatar>{defaultAvatarLetter}</DefaultAvatar>
          )}
          <Info theme={theme}>ID: {user.userId}</Info>
          {progressValues && (
            <ProgressWidget theme={theme}>
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
          )}
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
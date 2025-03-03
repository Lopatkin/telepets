import React, { useState } from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  padding: 10px;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RoomTitle = styled.h3`
  font-size: 18px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%; /* Больше места, так как прогресс-бары убраны */
`;

const AvatarContainer = styled.div`
  position: relative;
  cursor: pointer;
`;

const Avatar = styled.img`
  width: 40px; /* Увеличен размер */
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #007AFF;
`;

const DefaultAvatar = styled.div`
  width: 40px; /* Увеличен размер */
  height: 40px;
  border-radius: 50%;
  background: #007AFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px; /* Увеличен шрифт */
  color: white;
  border: 2px solid #007AFF;
`;

const AverageValue = styled.span`
  position: absolute;
  bottom: -5px;
  right: -5px;
  background: #007AFF;
  color: white;
  font-size: 12px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProgressModal = styled.div`
  position: absolute;
  top: 50px;
  right: 10px;
  width: 200px;
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 101;
`;

const ProgressBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 5px 0;
`;

const ProgressLabel = styled.span`
  font-size: 12px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#666'};
  width: 60px;
`;

const ProgressBar = styled.div`
  width: 120px; /* Чуть шире для модального окна */
  height: 8px;
  background: ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  width: ${props => props.value}%;
  height: 100%;
  background: ${props => {
    switch (props.type) {
      case 'energy':
        return '#FFA500'; // Жёлто-оранжевый
      case 'health':
        return '#FF0000'; // Красный
      case 'mood':
        return '#007AFF'; // Синий
      case 'fullness':
        return '#32CD32'; // Зелёно-салатовый
      default:
        return '#007AFF';
    }
  }};
  transition: width 0.3s ease;
`;

function Header({ user, room, theme }) {
  const [showProgress, setShowProgress] = useState(false);

  const roomName = room 
    ? (room.startsWith('myhome_') ? 'Мой дом' : room) 
    : 'Выберите комнату';

  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
  const photoUrl = telegramUser.photo_url || '';
  const firstName = telegramUser.first_name || user.firstName || 'User';
  const defaultAvatarLetter = firstName.charAt(0).toUpperCase();

  // Заглушки для прогресс-баров
  const progressValues = {
    energy: 50,
    health: 50,
    mood: 50,
    fullness: 50
  };

  // Среднее значение всех прогресс-баров
  const averageValue = Math.round(
    (progressValues.energy + progressValues.health + progressValues.mood + progressValues.fullness) / 4
  );

  const toggleProgressModal = (e) => {
    e.stopPropagation();
    setShowProgress(prev => !prev);
  };

  // Закрытие модального окна при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.avatar-container')) {
        setShowProgress(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <HeaderContainer theme={theme}>
      <RoomTitle theme={theme}>{roomName}</RoomTitle>
      <AvatarContainer className="avatar-container" onClick={toggleProgressModal}>
        {photoUrl ? (
          <Avatar src={photoUrl} alt="User avatar" />
        ) : (
          <DefaultAvatar>{defaultAvatarLetter}</DefaultAvatar>
        )}
        <AverageValue>{averageValue}</AverageValue>
      </AvatarContainer>
      {showProgress && (
        <ProgressModal theme={theme}>
          <ProgressBarContainer>
            <ProgressLabel theme={theme}>Энергия</ProgressLabel>
            <ProgressBar>
              <ProgressFill type="energy" value={progressValues.energy} />
            </ProgressBar>
          </ProgressBarContainer>
          <ProgressBarContainer>
            <ProgressLabel theme={theme}>Здоровье</ProgressLabel>
            <ProgressBar>
              <ProgressFill type="health" value={progressValues.health} />
            </ProgressBar>
          </ProgressBarContainer>
          <ProgressBarContainer>
            <ProgressLabel theme={theme}>Настроение</ProgressLabel>
            <ProgressBar>
              <ProgressFill type="mood" value={progressValues.mood} />
            </ProgressBar>
          </ProgressBarContainer>
          <ProgressBarContainer>
            <ProgressLabel theme={theme}>Сытость</ProgressLabel>
            <ProgressBar>
              <ProgressFill type="fullness" value={progressValues.fullness} />
            </ProgressBar>
          </ProgressBarContainer>
        </ProgressModal>
      )}
    </HeaderContainer>
  );
}

export default Header;
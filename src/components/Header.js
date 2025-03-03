import React, { useState, useEffect } from 'react';
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
  max-width: 70%;
`;

const AvatarContainer = styled.div`
  position: relative;
  cursor: pointer;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #007AFF;
`;

const DefaultAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #007AFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
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
  width: 220px; /* Чуть шире для отступов */
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 8px;
  padding: 15px; /* Увеличены отступы */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); /* Усилена тень */
  z-index: 101;
`;

const ProgressBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px; /* Увеличен отступ между названием и полоской */
  margin: 8px 0; /* Увеличен вертикальный отступ */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Тень для каждого прогресс-бара */
  padding: 5px; /* Внутренний отступ для контейнера */
  border-radius: 4px;
`;

const ProgressLabel = styled.span`
  font-size: 12px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#666'};
  width: 60px;
`;

const ProgressBar = styled.div`
  width: 120px;
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
        return '#FFA500';
      case 'health':
        return '#FF0000';
      case 'mood':
        return '#007AFF';
      case 'fullness':
        return '#32CD32';
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

  const progressValues = {
    energy: 50,
    health: 50,
    mood: 50,
    fullness: 50
  };

  const averageValue = Math.round(
    (progressValues.energy + progressValues.health + progressValues.mood + progressValues.fullness) / 4
  );

  const toggleProgressModal = (e) => {
    e.stopPropagation();
    setShowProgress(prev => !prev);
  };

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
import React from 'react';
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
  max-width: 50%; /* Уменьшено для места под прогресс-бары */
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #007AFF;
`;

const DefaultAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #007AFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  border: 2px solid #007AFF;
`;

const ProgressBars = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ProgressBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ProgressLabel = styled.span`
  font-size: 12px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#666'};
  width: 60px;
`;

const ProgressBar = styled.div`
  width: 100px;
  height: 8px;
  background: ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  width: ${props => props.value}%;
  height: 100%;
  background: #007AFF;
  transition: width 0.3s ease;
`;

function Header({ user, room, theme }) {
  const roomName = room 
    ? (room.startsWith('myhome_') ? 'Мой дом' : room) 
    : 'Выберите комнату';

  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
  const photoUrl = telegramUser.photo_url || '';
  const firstName = telegramUser.first_name || user.firstName || 'User';
  const defaultAvatarLetter = firstName.charAt(0).toUpperCase();

  // Заглушки для прогресс-баров (пока 50% для всех)
  const progressValues = {
    energy: 50,
    health: 50,
    mood: 50,
    fullness: 50
  };

  return (
    <HeaderContainer theme={theme}>
      <RoomTitle theme={theme}>{roomName}</RoomTitle>
      <UserSection>
        {photoUrl ? (
          <Avatar src={photoUrl} alt="User avatar" />
        ) : (
          <DefaultAvatar>{defaultAvatarLetter}</DefaultAvatar>
        )}
        <ProgressBars>
          <ProgressBarContainer>
            <ProgressLabel theme={theme}>Энергия</ProgressLabel>
            <ProgressBar>
              <ProgressFill value={progressValues.energy} />
            </ProgressBar>
          </ProgressBarContainer>
          <ProgressBarContainer>
            <ProgressLabel theme={theme}>Здоровье</ProgressLabel>
            <ProgressBar>
              <ProgressFill value={progressValues.health} />
            </ProgressBar>
          </ProgressBarContainer>
          <ProgressBarContainer>
            <ProgressLabel theme={theme}>Настроение</ProgressLabel>
            <ProgressBar>
              <ProgressFill value={progressValues.mood} />
            </ProgressBar>
          </ProgressBarContainer>
          <ProgressBarContainer>
            <ProgressLabel theme={theme}>Сытость</ProgressLabel>
            <ProgressBar>
              <ProgressFill value={progressValues.fullness} />
            </ProgressBar>
          </ProgressBarContainer>
        </ProgressBars>
      </UserSection>
    </HeaderContainer>
  );
}

export default Header;
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCoins } from 'react-icons/fa';

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
  width: 220px;
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 101;
`;

const ProgressBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 4px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 5px;
  border-radius: 4px;
`;

const ProgressLabel = styled.span`
  font-size: 12px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#666'};
  width: 60px;
`;

const ProgressBar = styled.progress`
  width: 120px;
  height: 8px;
  border-radius: 4px;
  &::-webkit-progress-bar {
    background-color: #f0f0f0;
    border-radius: 4px;
  }
  &::-webkit-progress-value {
    ${props => props.type === 'health' && `background-color: #FF0000;`}
    ${props => props.type === 'mood' && `background-color: #007AFF;`}
    ${props => props.type === 'fullness' && `background-color: #32CD32;`}
    border-radius: 4px;
  }
  &::-moz-progress-bar {
    ${props => props.type === 'health' && `background-color: #FF0000;`}
    ${props => props.type === 'mood' && `background-color: #007AFF;`}
    ${props => props.type === 'fullness' && `background-color: #32CD32;`}
    border-radius: 4px;
  }
`;

const CreditsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-right: 10px;
`;

const CreditsText = styled.span`
  font-size: 14px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
`;

function Header({ user, room, theme, socket }) {
  const [showProgress, setShowProgress] = useState(false);
  const [credits, setCredits] = useState(0);

  const roomName = room
    ? (room.startsWith('myhome_') ? 'Мой дом' : room)
    : 'Выберите комнату';

  const photoUrl = user?.photoUrl || '';
  const firstName = user?.firstName || 'User';
  const defaultAvatarLetter = firstName.charAt(0).toUpperCase();

  const progressValues = {
    health: 50,
    mood: 50,
    fullness: 50
  };

  useEffect(() => {
    if (!socket || !user?.userId) return;

    const handleCreditsUpdate = (newCredits) => {
      console.log('Header.js: Credits updated via socket:', newCredits); // Логируем
      if (typeof newCredits === 'number') {
        setCredits(newCredits);
      } else {
        console.error('Header.js: Received invalid credits value:', newCredits);
      }
    };

    socket.on('creditsUpdate', handleCreditsUpdate);

    socket.emit('getCredits', ({ success, credits }) => {
      console.log('Header.js: Initial credits received:', credits);
      if (success && typeof credits === 'number') {
        setCredits(credits);
      } else {
        console.error('Header.js: Failed to fetch initial credits');
      }
    });

    return () => {
      socket.off('creditsUpdate', handleCreditsUpdate);
      console.log('Header.js: Unsubscribed from creditsUpdate');
    };
  }, [socket, user]);

  const averageValue = Math.round(
    (progressValues.health + progressValues.mood + progressValues.fullness) / 3
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
      <CreditsContainer>
        <FaCoins color="#FFD700" />
        <CreditsText theme={theme}>{credits}</CreditsText>
      </CreditsContainer>
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
            <ProgressLabel theme={theme}>Здоровье</ProgressLabel>
            <ProgressBar value={progressValues.health} max="100" type="health" />
          </ProgressBarContainer>
          <ProgressBarContainer>
            <ProgressLabel theme={theme}>Настроение</ProgressLabel>
            <ProgressBar value={progressValues.mood} max="100" type="mood" />
          </ProgressBarContainer>
          <ProgressBarContainer>
            <ProgressLabel theme={theme}>Сытость</ProgressLabel>
            <ProgressBar value={progressValues.fullness} max="100" type="fullness" />
          </ProgressBarContainer>
        </ProgressModal>
      )}
    </HeaderContainer>
  );
}

export default Header;
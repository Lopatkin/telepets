import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCoins, FaStar } from 'react-icons/fa'; // Добавляем FaStar
import { keyframes } from 'styled-components';
import { getLevelInfo } from '../utils/levels';


// Добавление анимаций мерцания для кредитов
const creditsFlickerGreen = keyframes`
  0%, 100% { color: ${props => props.theme === 'dark' ? '#ccc' : '#333'}; }
  50% { color: #32CD32; } // Зелёный цвет для увеличения
`;

const creditsFlickerRed = keyframes`
  0%, 100% { color: ${props => props.theme === 'dark' ? '#ccc' : '#333'}; }
  50% { color: #FF0000; } // Красный цвет для уменьшения
`;

// Определяем анимацию мерцания
const flickerAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

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
  max-width: 50%;
  word-wrap: break-word;
  line-height: 1.2;
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
    ${props => props.type === 'energy' && `background-color: #FFA500;`}
    border-radius: 4px;
  }
  &::-moz-progress-bar {
    ${props => props.type === 'health' && `background-color: #FF0000;`}
    ${props => props.type === 'mood' && `background-color: #007AFF;`}
    ${props => props.type === 'fullness' && `background-color: #32CD32;`}
    ${props => props.type === 'energy' && `background-color: #FFA500;`}
    border-radius: 4px;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  margin-left: auto;
  padding-right: 10px;
`;

const LevelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  animation: ${props => props.isFlickering ? flickerAnimation : 'none'} 0.5s ease-in-out 6; // Применяем анимацию
`;

const LevelText = styled.span`
  font-size: 14px;
  font-weight: bold; /* Делаем текст жирным */
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  animation: ${props => props.isFlickering ? flickerAnimation : 'none'} 0.5s ease-in-out 6;
`;

const CreditsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const CreditsText = styled.span`
  font-size: 14px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  animation: ${props => props.creditsFlicker === 'green' ? creditsFlickerGreen :
    props.creditsFlicker === 'red' ? creditsFlickerRed : 'none'} 0.5s ease-in-out 2; // 2 секунды (2 итерации по 0.5с)
`;

function Header({ user, room, theme, socket }) {
  const [showProgress, setShowProgress] = useState(false);
  const [credits, setCredits] = useState(user?.credits || 0);
  const [level, setLevel] = useState(getLevelInfo(user?.exp || 0).level);
  const [isFlickering, setIsFlickering] = useState(false);
  const [creditsFlicker, setCreditsFlicker] = useState(null); // Состояние для типа мерцания кредитов

  const roomName = room
    ? (room.startsWith('myhome_') ? 'Мой дом' : room)
    : 'Выберите комнату';

  const photoUrl = user?.photoUrl || '';
  const firstName = user?.firstName || 'User';
  const defaultAvatarLetter = firstName.charAt(0).toUpperCase();

  const progressValues = {
    health: user?.stats?.health || 0,
    mood: user?.stats?.mood || 0,
    fullness: user?.stats?.satiety || 0,
    energy: user?.stats?.energy || 0,
  };

  useEffect(() => {
    if (!socket || !user?.userId) return;

    const handleUserUpdate = (updatedUser) => {
      if (updatedUser.credits !== undefined) {
        console.log('Updating credits from userUpdate:', updatedUser.credits);
        // Определяем тип мерцания в зависимости от изменения кредитов
        if (updatedUser.credits > credits) {
          setCreditsFlicker('green');
        } else if (updatedUser.credits < credits) {
          setCreditsFlicker('red');
        }
        setCredits(updatedUser.credits);
        // Сбрасываем мерцание через 2 секунды
        setTimeout(() => setCreditsFlicker(null), 2000);
      }
      if (updatedUser.exp !== undefined) {
        const newLevel = getLevelInfo(updatedUser.exp).level;
        if (newLevel !== level) {
          console.log('Updating level from userUpdate:', newLevel);
          setLevel(newLevel);
          setIsFlickering(true);
          setTimeout(() => setIsFlickering(false), 3000);
        }
      }
    };

    const handleCreditsUpdate = (newCredits) => {
      console.log('Credits updated via creditsUpdate:', newCredits);
      // Определяем тип мерцания в зависимости от изменения кредитов
      if (newCredits > credits) {
        setCreditsFlicker('green');
      } else if (newCredits < credits) {
        setCreditsFlicker('red');
      }
      setCredits(newCredits);
      // Сбрасываем мерцание через 2 секунды
      setTimeout(() => setCreditsFlicker(null), 2000);
    };

    socket.on('userUpdate', handleUserUpdate);
    socket.on('creditsUpdate', handleCreditsUpdate);

    socket.emit('getCredits', {}, (response) => {
      if (response?.success) {
        console.log('Initial credits received:', response.credits);
        setCredits(response.credits);
      }
    });

    return () => {
      socket.off('userUpdate', handleUserUpdate);
      socket.off('creditsUpdate', handleCreditsUpdate);
    };
  }, [socket, user?.userId, level, credits]);

  const averageValue = Math.round(
    (progressValues.health + progressValues.mood + progressValues.fullness + progressValues.energy) / 4
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
      <StatsContainer>
        <LevelContainer isFlickering={isFlickering}>
          <FaStar color="#FFD700" />
          <LevelText theme={theme} isFlickering={isFlickering}>{level} ур.</LevelText>
        </LevelContainer>
        <CreditsContainer>
          <FaCoins color="#FFD700" />
          <CreditsText theme={theme} creditsFlicker={creditsFlicker}>{credits}</CreditsText>
        </CreditsContainer>
      </StatsContainer>
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
            <ProgressBar value={progressValues.energy} max={user?.stats?.maxEnergy || 100} type="energy" />
          </ProgressBarContainer>
          <ProgressBarContainer>
            <ProgressLabel theme={theme}>Здоровье</ProgressLabel>
            <ProgressBar value={progressValues.health} max={user?.stats?.maxHealth || 100} type="health" />
          </ProgressBarContainer>
          <ProgressBarContainer>
            <ProgressLabel theme={theme}>Настроение</ProgressLabel>
            <ProgressBar value={progressValues.mood} max={user?.stats?.maxMood || 100} type="mood" />
          </ProgressBarContainer>
          <ProgressBarContainer>
            <ProgressLabel theme={theme}>Сытость</ProgressLabel>
            <ProgressBar value={progressValues.fullness} max={user?.stats?.maxSatiety || 100} type="fullness" />
          </ProgressBarContainer>
        </ProgressModal>
      )}
    </HeaderContainer>
  );
}

export default Header;
import React from 'react';
import styled from 'styled-components';

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
  justify-content: space-between; /* Разделяем пространство между надписью и прогресс-баром */
  margin: 8px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 5px;
  border-radius: 4px;
`;

const ProgressLabel = styled.span`
  font-size: 16px; /* Увеличен размер текста надписей */
  color: ${props => props.theme === 'dark' ? '#ccc' : '#666'};
  width: 80px; /* Фиксированная ширина для прижатия к левому краю */
  text-align: left; /* Прижатие текста к левой стороне */
`;

const ProgressBar = styled.progress`
  width: 160px; /* Увеличена ширина прогресс-бара */
  height: 8px;
  border-radius: 4px;
  &::-webkit-progress-bar {
    background-color: #f0f0f0;
    border-radius: 4px;
  }
  &::-webkit-progress-value {
    ${props => props.type === 'energy' && `background-color: #FFA500;`} /* Жёлто-оранжевый */
    ${props => props.type === 'health' && `background-color: #FF0000;`} /* Красный */
    ${props => props.type === 'mood' && `background-color: #007AFF;`} /* Синий */
    ${props => props.type === 'fullness' && `background-color: #32CD32;`} /* Зелёно-салатовый */
    border-radius: 4px;
  }
  &::-moz-progress-bar {
    ${props => props.type === 'energy' && `background-color: #FFA500;`} /* Жёлто-оранжевый */
    ${props => props.type === 'health' && `background-color: #FF0000;`} /* Красный */
    ${props => props.type === 'mood' && `background-color: #007AFF;`} /* Синий */
    ${props => props.type === 'fullness' && `background-color: #32CD32;`} /* Зелёно-салатовый */
    border-radius: 4px;
  }
`;

const ProfileContainer = styled.div`
  padding: 20px;
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

function Profile({ user, theme, selectedTheme, telegramTheme, onThemeChange, progressValues }) {
  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user || {};

  const firstName = telegramUser.first_name || user.firstName || 'User';
  const username = telegramUser.username || '';
  const lastName = telegramUser.last_name || '';
  const photoUrl = telegramUser.photo_url || '';

  const defaultAvatarLetter = firstName.charAt(0).toUpperCase();

  return (
    <ProfileContainer theme={theme}>
      {photoUrl ? (
        <Avatar src={photoUrl} alt={`${firstName}'s avatar`} />
      ) : (
        <DefaultAvatar>{defaultAvatarLetter}</DefaultAvatar>
      )}
      <Name theme={theme}>{firstName} {lastName}</Name>
      {username && <Username theme={theme}>@{username}</Username>}
      <Info theme={theme}>ID: {user.id}</Info>
      {progressValues && (
        <ProgressWidget theme={theme}>
          <ProgressBarContainer>
            <ProgressLabel theme={theme}>Энергия</ProgressLabel>
            <ProgressBar value={progressValues.energy || 0} max="100" type="energy" />
          </ProgressBarContainer>
          <ProgressBarContainer>
            <ProgressLabel theme={theme}>Здоровье</ProgressLabel>
            <ProgressBar value={progressValues.health || 0} max="100" type="health" />
          </ProgressBarContainer>
          <ProgressBarContainer>
            <ProgressLabel theme={theme}>Настроение</ProgressLabel>
            <ProgressBar value={progressValues.mood || 0} max="100" type="mood" />
          </ProgressBarContainer>
          <ProgressBarContainer>
            <ProgressLabel theme={theme}>Сытость</ProgressLabel>
            <ProgressBar value={progressValues.fullness || 0} max="100" type="fullness" />
          </ProgressBarContainer>
        </ProgressWidget>
      )}
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
    </ProfileContainer>
  );
}

export default Profile;
import React from 'react';
import styled from 'styled-components';

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
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 300px;
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

function Profile({ user, theme, selectedTheme, telegramTheme, onThemeChange }) {
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
      <ThemeOptions>
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
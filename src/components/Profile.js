import React from 'react';
import styled from 'styled-components';

const ProfileContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #f5f5f5;
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
  color: #333;
  margin: 0 0 10px 0;
`;

const Username = styled.p`
  font-size: 18px;
  color: #666;
  margin: 0 0 10px 0;
`;

const Info = styled.p`
  font-size: 16px;
  color: #888;
  margin: 0;
`;

function Profile({ user }) {
  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user || {};

  // Данные пользователя из Telegram или переданные через пропс
  const firstName = telegramUser.first_name || user.firstName || 'User';
  const username = telegramUser.username || '';
  const lastName = telegramUser.last_name || '';
  const photoUrl = telegramUser.photo_url || ''; // URL аватара из Telegram

  // Первая буква имени для дефолтного аватара
  const defaultAvatarLetter = firstName.charAt(0).toUpperCase();

  return (
    <ProfileContainer>
      {photoUrl ? (
        <Avatar src={photoUrl} alt={`${firstName}'s avatar`} />
      ) : (
        <DefaultAvatar>{defaultAvatarLetter}</DefaultAvatar>
      )}
      <Name>{firstName} {lastName}</Name>
      {username && <Username>@{username}</Username>}
      <Info>ID: {user.id}</Info>
    </ProfileContainer>
  );
}

export default Profile;
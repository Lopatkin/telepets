import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  background: #2A2A2A; /* Такой же тёмный фон, как у Footer */
  padding: 10px;
  border-bottom: 1px solid #444; /* Тёмная граница для контраста */
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RoomTitle = styled.h3`
  font-size: 18px;
  color: #ccc; /* Светлый цвет для читаемости на тёмном фоне */
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
`;

const UserName = styled.p`
  font-size: 16px;
  color: #ccc; /* Светлый цвет для читаемости на тёмном фоне */
  margin: 0;
  text-align: right;
`;

function Header({ user, room }) {
  const roomName = room 
    ? (room.startsWith('myhome_') ? 'Мой дом' : room) 
    : 'Выберите комнату';

  return (
    <HeaderContainer>
      <RoomTitle>{roomName}</RoomTitle>
      <UserName>{user.firstName}</UserName>
    </HeaderContainer>
  );
}

export default Header;
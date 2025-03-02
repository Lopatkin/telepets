import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  background: #fff;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RoomTitle = styled.h3`
  font-size: 18px;
  color: #333;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%; /* Ограничиваем ширину, чтобы не перекрывать имя */
`;

const UserName = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
  text-align: right;
`;

function Header({ user, room }) {
  // Форматируем название комнаты
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
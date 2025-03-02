import React from 'react';
import styled from 'styled-components';

const MapContainer = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
  background: ${props => props.theme === 'dark' ? '#1A1A1A' : '#fff'}; /* Тёмный фон для тёмной темы */
`;

const RoomList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RoomItem = styled.li`
  padding: ${props => props.isHome ? '15px' : '10px'};
  margin: 5px 0;
  background: ${props => props.isHome ? '#007AFF' : (props.theme === 'dark' ? '#333' : '#f0f0f0')};
  color: ${props => props.isHome ? 'white' : (props.theme === 'dark' ? '#ccc' : '#333')};
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: ${props => props.isHome ? '0 2px 6px rgba(0, 0, 0, 0.2)' : 'none'};

  &:hover {
    background: ${props => props.isHome ? '#005BBB' : (props.theme === 'dark' ? '#444' : '#e0e0e0')};
  }
`;

const RoomName = styled.span`
  font-size: ${props => props.isHome ? '18px' : '16px'};
`;

function Map({ userId, onRoomSelect, theme }) {
  const rooms = [
    'Автобусная остановка',
    'Вокзал',
    'ЖК Сфера',
    'Завод',
    'Лес',
    'Парк',
    'Район Дачный'
  ].sort();

  const myHomeRoom = `myhome_${userId}`;

  return (
    <MapContainer theme={theme}>
      <RoomList>
        <RoomItem isHome onClick={() => onRoomSelect(myHomeRoom)} theme={theme}>
          <RoomName isHome>Мой дом</RoomName>
        </RoomItem>
        {rooms.map(room => (
          <RoomItem key={room} onClick={() => onRoomSelect(room)} theme={theme}>
            <RoomName>{room}</RoomName>
          </RoomItem>
        ))}
      </RoomList>
    </MapContainer>
  );
}

export default Map;
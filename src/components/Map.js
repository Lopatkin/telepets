import React from 'react';
import styled from 'styled-components';

const MapContainer = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
`;

const RoomList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RoomItem = styled.li`
  padding: 10px;
  margin: 5px 0;
  background: ${props => props.isHome ? '#007AFF' : '#f0f0f0'};
  color: ${props => props.isHome ? 'white' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.isHome ? '#005BBB' : '#e0e0e0'};
  }
`;

const RoomName = styled.span`
  font-size: 16px;
`;

function Map({ userId, onRoomSelect }) {
  const rooms = [
    'Автобусная остановка',
    'Вокзал',
    'ЖК Сфера',
    'Завод',
    'Лес',
    'Парк',
    'Район Дачный'
  ].sort();

  const myHomeRoom = `myhome_${userId}`; // Уникальная комната для каждого пользователя

  return (
    <MapContainer>
      <RoomList>
        <RoomItem isHome onClick={() => onRoomSelect(myHomeRoom)}>
          <RoomName>Мой дом</RoomName>
        </RoomItem>
        {rooms.map(room => (
          <RoomItem key={room} onClick={() => onRoomSelect(room)}>
            <RoomName>{room}</RoomName>
          </RoomItem>
        ))}
      </RoomList>
    </MapContainer>
  );
}

export default Map;
import React from 'react';
import styled from 'styled-components';

const MapContainer = styled.div`
  padding: 10px;
  height: 100%;
  background: ${props => props.theme === 'dark' ? '#1A1A1A' : '#fff'};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const RoomList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1; /* Список занимает доступное пространство */
`;

const RoomItem = styled.li`
  padding: 10px;
  margin: 5px 0;
  background: ${props => props.isCurrent 
    ? '#007AFF' 
    : (props.theme === 'dark' ? '#333' : '#f0f0f0')};
  color: ${props => props.isCurrent 
    ? 'white' 
    : (props.theme === 'dark' ? '#ccc' : '#333')};
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.isCurrent 
      ? '#005BBB' 
      : (props.theme === 'dark' ? '#444' : '#e0e0e0')};
  }
`;

const HomeButton = styled.button`
  padding: 15px;
  margin: 10px 0 0 0;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: background 0.2s;

  &:hover {
    background: #005BBB;
  }
`;

const RoomName = styled.span`
  font-size: 16px;
`;

function Map({ userId, onRoomSelect, theme, currentRoom }) {
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
        {rooms.map(room => (
          <RoomItem 
            key={room} 
            onClick={() => onRoomSelect(room)} 
            theme={theme} 
            isCurrent={room === currentRoom} // Проверка текущей комнаты
          >
            <RoomName>{room}</RoomName>
          </RoomItem>
        ))}
      </RoomList>
      <HomeButton 
        onClick={() => onRoomSelect(myHomeRoom)} 
        theme={theme}
      >
        Домой
      </HomeButton>
    </MapContainer>
  );
}

export default Map;
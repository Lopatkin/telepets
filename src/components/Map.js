import React from 'react';
import styled from 'styled-components';

const MapContainer = styled.div`
  height: 100%;
  background: ${props => props.theme === 'dark' ? '#1A1A1A' : '#fff'};
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
  position: relative;
`;

const RoomList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 10px 0;
  flex: 1;
  overflow-y: auto;
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
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: background 0.2s;
  width: 100%;
  position: sticky;
  bottom: 10px;
  margin-top: 10px;

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
    'Бар "У бобра" (18+)',
    'Бизнес центр "Альбион"',
    'Вокзал',
    'ЖК Сфера',
    'Завод',
    'Кофейня "Ляля-Фа"',
    'Лес',
    'Мастерская', // Добавляем "Мастерскую"
    'Парк',
    'Полигон утилизации', // Новая комната
    'Приют для животных "Кошкин дом"',
    'Район Дачный',
    'Торговый центр "Карнавал"',
  ].sort(); // Сортировка по алфавиту

  const myHomeRoom = `myhome_${userId}`;

  return (
    <MapContainer theme={theme}>
      <RoomList>
        {rooms.map(room => (
          <RoomItem 
            key={room} 
            onClick={() => onRoomSelect(room)} 
            theme={theme} 
            isCurrent={room === currentRoom}
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
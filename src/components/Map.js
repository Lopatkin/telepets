import React from 'react';
import styled from 'styled-components';
import foggyCityMap from '../images/foggy_city_map.jpg'; // Импортируем изображение

const MapContainer = styled.div`
  height: 100%;
  background: ${props => props.theme === 'dark' ? '#1A1A1A' : '#fff'};
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
  position: relative;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  margin-bottom: 10px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 10px;
  background: ${props => props.active ? '#007AFF' : 'transparent'};
  color: ${props => props.active ? 'white' : (props.theme === 'dark' ? '#ccc' : '#333')};
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.active ? '#005BBB' : (props.theme === 'dark' ? '#333' : '#f0f0f0')};
  }
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

const MapImageContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const MapImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover; /* Изображение заполняет контейнер, сохраняя пропорции */
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
  const [activeSubTab, setActiveSubTab] = useState('locations'); // Состояние для переключения подвкладок

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
      <Tabs>
        <Tab
          active={activeSubTab === 'locations'}
          onClick={() => setActiveSubTab('locations')}
          theme={theme}
        >
          Локации
        </Tab>
        <Tab
          active={activeSubTab === 'map'}
          onClick={() => setActiveSubTab('map')}
          theme={theme}
        >
          Карта
        </Tab>
      </Tabs>

      {activeSubTab === 'locations' && (
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
      )}

      {activeSubTab === 'map' && (
        <MapImageContainer>
          <MapImage src={foggyCityMap} alt="Foggy City Map" />
        </MapImageContainer>
      )}

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
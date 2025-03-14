import React, { useState, useRef } from 'react';
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
  overflow: hidden; /* Скрываем части изображения, выходящие за пределы контейнера */
  position: relative;
  cursor: grab; /* Курсор для указания возможности перетаскивания */
  user-select: none; /* Запрещаем выделение текста или изображения */
  -webkit-user-select: none; /* Для Safari */
  -ms-user-select: none; /* Для IE/Edge */
  touch-action: none; /* Отключаем стандартное поведение прокрутки на сенсорных устройствах */
`;

const MapImage = styled.img`
  position: absolute;
  top: ${props => props.top}px;
  left: ${props => props.left}px;
  width: auto; /* Оставляем исходную ширину изображения */
  height: auto; /* Оставляем исходную высоту изображения */
  object-fit: contain; /* Изображение сохраняет пропорции, но не растягивается */
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
  const [isDragging, setIsDragging] = useState(false); // Флаг перетаскивания
  const [position, setPosition] = useState({ top: 0, left: 0 }); // Позиция изображения
  const [startPos, setStartPos] = useState({ x: 0, y: 0 }); // Начальная позиция курсора
  const mapContainerRef = useRef(null); // Ссылка на контейнер карты

  const rooms = [
    'Автобусная остановка',
    'Бар "У бобра" (18+)',
    'Бизнес центр "Альбион"',
    'Вокзал',
    'ЖК Сфера',
    'Завод',
    'Кофейня "Ляля-Фа"',
    'Лес',
    'Мастерская',
    'Парк',
    'Полигон утилизации',
    'Приют для животных "Кошкин дом"',
    'Район Дачный',
    'Торговый центр "Карнавал"',
  ].sort(); // Сортировка по алфавиту

  const myHomeRoom = `myhome_${userId}`;

  // Начало перетаскивания (мышь)
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.left,
      y: e.clientY - position.top,
    });
  };

  // Начало перетаскивания (сенсорный экран)
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPos({
      x: touch.clientX - position.left,
      y: touch.clientY - position.top,
    });
  };

  // Перемещение изображения (мышь)
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newLeft = e.clientX - startPos.x;
    const newTop = e.clientY - startPos.y;

    restrictPosition(newLeft, newTop, e.target);
  };

  // Перемещение изображения (сенсорный экран)
  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const newLeft = touch.clientX - startPos.x;
    const newTop = touch.clientY - startPos.y;

    restrictPosition(newLeft, newTop, e.target);
  };

  // Ограничение перемещения
  const restrictPosition = (newLeft, newTop, img) => {
    const container = mapContainerRef.current;
    const maxLeft = 0; // Левая граница
    const maxTop = 0; // Верхняя граница
    const minLeft = container.offsetWidth - img.offsetWidth; // Правая граница
    const minTop = container.offsetHeight - img.offsetHeight; // Нижняя граница

    setPosition({
      left: Math.min(maxLeft, Math.max(minLeft, newLeft)),
      top: Math.min(maxTop, Math.max(minTop, newTop)),
    });
  };

  // Завершение перетаскивания (мышь)
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Завершение перетаскивания (сенсорный экран)
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

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
        <MapImageContainer
          ref={mapContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <MapImage
            src={foggyCityMap}
            alt="Foggy City Map"
            top={position.top}
            left={position.left}
            draggable={false} // Отключаем стандартное перетаскивание изображения
          />
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
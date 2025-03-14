import React, { useState, useRef, useEffect } from 'react';
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
  width: ${props => props.scale}%; /* Масштаб в процентах от исходного размера */
  height: auto; /* Сохраняем пропорции */
  transform-origin: top left; /* Точка масштабирования */
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
  const [scale, setScale] = useState(null); // Масштаб изначально null, чтобы не рендерить до загрузки
  const [initialDistance, setInitialDistance] = useState(null); // Начальное расстояние между пальцами
  const [isImageLoaded, setIsImageLoaded] = useState(false); // Флаг загрузки изображения
  const mapContainerRef = useRef(null); // Ссылка на контейнер карты
  const mapImageRef = useRef(null); // Ссылка на изображение

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

  // Устанавливаем начальный масштаб после загрузки изображения
  useEffect(() => {
    const container = mapContainerRef.current;
    const img = mapImageRef.current;

    if (container && img && activeSubTab === 'map' && isImageLoaded && scale === null) {
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      // Вычисляем масштаб так, чтобы изображение занимало 100% контейнера по ширине или высоте
      const scaleX = (containerWidth / imgWidth) * 100; // Процент от исходного размера
      const scaleY = (containerHeight / imgHeight) * 100; // Процент от исходного размера
      const initialScale = Math.min(scaleX, scaleY); // Берем меньший, чтобы уместилось полностью

      setScale(initialScale);
      setPosition({
        left: (containerWidth - (imgWidth * (initialScale / 100))) / 2,
        top: (containerHeight - (imgHeight * (initialScale / 100))) / 2,
      });
    }
  }, [activeSubTab, isImageLoaded, scale]);

  // Обработчик загрузки изображения
  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  // Вычисление расстояния между двумя точками касания
  const getDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Начало перетаскивания (мышь)
  const handleMouseDown = (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.left,
      y: e.clientY - position.top,
    });
  };

  // Начало перетаскивания или масштабирования (сенсорный экран)
  const handleTouchStart = (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setStartPos({
        x: touch.clientX - position.left,
        y: touch.clientY - position.top,
      });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialDistance(distance);
    }
  };

  // Перемещение изображения (мышь)
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newLeft = e.clientX - startPos.x;
    const newTop = e.clientY - startPos.y;

    restrictPosition(newLeft, newTop, mapImageRef.current);
  };

  // Перемещение или масштабирование (сенсорный экран)
  const handleTouchMove = (e) => {
    e.preventDefault(); // Предотвращаем прокрутку страницы
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      const newLeft = touch.clientX - startPos.x;
      const newTop = touch.clientY - startPos.y;

      restrictPosition(newLeft, newTop, mapImageRef.current);
    } else if (e.touches.length === 2 && initialDistance !== null) {
      const newDistance = getDistance(e.touches[0], e.touches[1]);
      const scaleFactor = newDistance / initialDistance;
      const newScale = Math.min(Math.max(scale * scaleFactor, 50), 500); // Ограничиваем масштаб от 50% до 500%

      const img = mapImageRef.current;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      const imgRect = img.getBoundingClientRect();
      const dx = centerX - (imgRect.left + imgRect.width / 2);
      const dy = centerY - (imgRect.top + imgRect.height / 2);

      const newLeft = position.left - (dx * (newScale / scale - 1));
      const newTop = position.top - (dy * (newScale / scale - 1));

      setScale(newScale);
      restrictPosition(newLeft, newTop, img);
      setInitialDistance(newDistance); // Обновляем начальное расстояние
    }
  };

  // Масштабирование колесом мыши
  const handleWheel = (e) => {
    e.preventDefault(); // Предотвращаем стандартную прокрутку страницы
    const img = mapImageRef.current;
    const container = mapContainerRef.current;

    const scaleFactor = e.deltaY < 0 ? 1.1 : 0.9; // Увеличиваем на 10% или уменьшаем на 10%
    const newScale = Math.min(Math.max(scale * scaleFactor, 50), 500); // Ограничиваем масштаб от 50% до 500%

    const imgRect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;

    const dx = mouseX - (position.left + (imgRect.width / 2) * (scale / 100));
    const dy = mouseY - (position.top + (imgRect.height / 2) * (scale / 100));

    const newLeft = position.left - (dx * (newScale / scale - 1));
    const newTop = position.top - (dy * (newScale / scale - 1));

    setScale(newScale);
    restrictPosition(newLeft, newTop, img);
  };

  // Ограничение перемещения
  const restrictPosition = (newLeft, newTop, img) => {
    const container = mapContainerRef.current;
    const maxLeft = 0; // Левая граница
    const maxTop = 0; // Верхняя граница
    const minLeft = container.offsetWidth - (img.offsetWidth * (scale / 100)); // Правая граница с учетом масштаба
    const minTop = container.offsetHeight - (img.offsetHeight * (scale / 100)); // Нижняя граница с учетом масштаба

    setPosition({
      left: Math.min(maxLeft, Math.max(minLeft, newLeft)),
      top: Math.min(maxTop, Math.max(minTop, newTop)),
    });
  };

  // Завершение перетаскивания (мышь)
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Завершение перетаскивания или масштабирования (сенсорный экран)
  const handleTouchEnd = () => {
    setIsDragging(false);
    setInitialDistance(null); // Сбрасываем расстояние для масштабирования
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
          onWheel={handleWheel}
        >
          {isImageLoaded && scale !== null && (
            <MapImage
              ref={mapImageRef}
              src={foggyCityMap}
              alt="Foggy City Map"
              top={position.top}
              left={position.left}
              scale={scale}
              draggable={false}
              onLoad={handleImageLoad} // Добавляем обработчик загрузки
            />
          )}
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
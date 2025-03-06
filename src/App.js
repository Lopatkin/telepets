import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import Chat from './components/Chat';
import Header from './components/Header';
import Footer from './components/Footer';
import Profile from './components/Profile';
import Map from './components/Map';

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
`;

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [theme, setTheme] = useState('telegram');
  const [telegramTheme, setTelegramTheme] = useState('light');
  const [energy, setEnergy] = useState(100); // Энергия пользователя
  const socketRef = useRef(null); // Сохраняем сокет в ref
  const prevRoomRef = useRef(null); // Отслеживание предыдущей комнаты
  const joinedRoomsRef = useRef(new Set()); // Отслеживание комнат, в которые уже входили
  const isJoiningRef = useRef(false); // Флаг, чтобы предотвратить дублирование joinRoom
  const isAuthenticatedRef = useRef(false); // Флаг для отслеживания аутентификации

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      const telegramData = window.Telegram.WebApp.initDataUnsafe;
      const savedTheme = localStorage.getItem('theme') || 'telegram';
      const userId = telegramData?.user?.id?.toString();
      let savedRoom = null;
  
      // Загружаем комнату из localStorage, специфичную для userId
      if (userId) {
        const storedRooms = JSON.parse(localStorage.getItem('userRooms') || '{}');
        savedRoom = storedRooms[userId] || null;
      }
  
      if (telegramData?.user?.id) {
        const userData = {
          userId: telegramData.user.id.toString(),
          firstName: telegramData.user.first_name || 'User',
          username: telegramData.user.username || '',
          lastName: telegramData.user.last_name || '',
          photoUrl: telegramData.user.photo_url || 'tu97jy'
        };
        setUser(userData);
        setTelegramTheme(window.Telegram.WebApp.colorScheme || 'light');
        setTheme(savedTheme);
        setCurrentRoom(savedRoom || `myhome_${userData.userId}`);
  
        // Инициализируем сокет один раз, если ещё не инициализирован
        if (!socketRef.current) {
          socketRef.current = io(process.env.REACT_APP_SERVER_URL || 'https://telepets.onrender.com');
          socketRef.current.on('connect', () => console.log('Socket connected:', socketRef.current.id));
          socketRef.current.on('disconnect', (reason) => console.log('Socket disconnected:', reason));
  
          // Аутентификация только один раз, если ещё не аутентифицированы
          if (!isAuthenticatedRef.current) {
            socketRef.current.emit('auth', userData);
            isAuthenticatedRef.current = true; // Устанавливаем флаг аутентификации
          }
  
          // Получение обновлений энергии
          socketRef.current.on('energyUpdate', (newEnergy) => {
            setEnergy(newEnergy);
          });
  
          // Запрос энергии при входе
          socketRef.current.emit('getEnergy');
  
          // Периодический запрос энергии каждые 10 минут
          const energyInterval = setInterval(() => {
            if (socketRef.current) {
              socketRef.current.emit('getEnergy');
            }
          }, 10 * 60 * 1000);
  
          return () => {
            if (socketRef.current) {
              socketRef.current.disconnect();
              console.log('Socket disconnected on unmount');
            }
            clearInterval(energyInterval);
          };
        }
      } else {
        console.warn('Telegram Web App data not available');
        const testUser = { userId: 'test123', firstName: 'Test User' };
        setUser(testUser);
        setTelegramTheme('light');
        setTheme(savedTheme);
  
        // Для тестового пользователя также используем userId
        const storedRooms = JSON.parse(localStorage.getItem('userRooms') || '{}');
        savedRoom = storedRooms[testUser.userId] || null;
        setCurrentRoom(savedRoom || 'myhome_test123');
  
        // Инициализация для тестового пользователя
        if (!socketRef.current) {
          socketRef.current = io(process.env.REACT_APP_SERVER_URL || 'https://telepets.onrender.com');
          socketRef.current.on('connect', () => console.log('Socket connected:', socketRef.current.id));
          socketRef.current.on('disconnect', (reason) => console.log('Socket disconnected:', reason));
  
          if (!isAuthenticatedRef.current) {
            socketRef.current.emit('auth', testUser);
            isAuthenticatedRef.current = true; // Устанавливаем флаг аутентификации
          }
  
          socketRef.current.on('energyUpdate', (newEnergy) => setEnergy(newEnergy));
          socketRef.current.emit('getEnergy');
  
          const energyInterval = setInterval(() => {
            if (socketRef.current) {
              socketRef.current.emit('getEnergy');
            }
          }, 10 * 60 * 1000);
  
          return () => {
            if (socketRef.current) {
              socketRef.current.disconnect();
            }
            clearInterval(energyInterval);
          };
        }
      }
    }
  }, []); // Пустой массив зависимостей — эффект выполняется один раз при монтировании

  const handleRoomSelect = (room) => {
    if (!room || !socketRef.current || room === currentRoom || isJoiningRef.current) return; // Избегаем дублирования
    isJoiningRef.current = true; // Устанавливаем флаг
  
    // Выходим из текущей комнаты перед входом в новую, только если текущая комната существует
    if (currentRoom && socketRef.current) {
      socketRef.current.emit('leaveRoom', currentRoom);
    }
  
    setCurrentRoom(room);
  
    // Сохраняем комнату для текущего userId
    if (user?.userId) {
      const storedRooms = JSON.parse(localStorage.getItem('userRooms') || '{}');
      storedRooms[user.userId] = room;
      localStorage.setItem('userRooms', JSON.stringify(storedRooms));
    }
  
    setActiveTab('chat');
  
    // Проверяем, не входили ли уже в эту комнату в этом сеансе
    if (!joinedRoomsRef.current.has(room)) {
      console.log(`Emitting joinRoom for new room: ${room}`);
      socketRef.current.emit('joinRoom', { room, lastTimestamp: null });
      joinedRoomsRef.current.add(room); // Отмечаем, что вошли в комнату
    } else {
      console.log(`Rejoining room: ${room} — using cached messages or fetching updates`);
      socketRef.current.emit('joinRoom', { room, lastTimestamp: null }); // Отправляем для обновления сообщений
    }
  
    // Сбрасываем флаг после отправки (с небольшой задержкой, чтобы избежать дублирования)
    setTimeout(() => {
      isJoiningRef.current = false;
    }, 1000); // Задержка 1 секунда, чтобы предотвратить повторные вызовы
  
    prevRoomRef.current = room; // Сохраняем текущую комнату
  };

  // Добавляем useEffect для отслеживания активной вкладки и предотвращения выхода из комнаты
  useEffect(() => {
    // Если пользователь переключается на вкладку, отличную от 'chat', не выходим из комнаты
    if (activeTab !== 'chat' && currentRoom && socketRef.current) {
      // Не отправляем leaveRoom, оставляем пользователя в комнате
      console.log(`User stayed in room ${currentRoom} while switching to ${activeTab} tab`);
    }
  }, [activeTab, currentRoom, socketRef]);


  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const appliedTheme = theme === 'telegram' ? telegramTheme : theme;

  // Фиктивные значения для прогресс-баров
  const progressValues = {
    energy,
    health: 50,
    mood: 50,
    fullness: 50
  };

  return (
    <AppContainer>
      <Header user={user} room={currentRoom} theme={appliedTheme} energy={energy} />
      <Content>
        {activeTab === 'chat' && <Chat userId={user.userId} room={currentRoom} theme={appliedTheme} socket={socketRef.current} joinedRoomsRef={joinedRoomsRef} />}
        {activeTab === 'actions' && <div>Действия</div>}
        {activeTab === 'housing' && <div>Жильё</div>}
        {activeTab === 'map' && <Map userId={user.userId} onRoomSelect={handleRoomSelect} theme={appliedTheme} currentRoom={currentRoom} />}
        {activeTab === 'profile' && (
          <Profile
            user={user}
            theme={appliedTheme}
            selectedTheme={theme}
            telegramTheme={telegramTheme}
            onThemeChange={handleThemeChange}
            progressValues={progressValues}
          />
        )}
      </Content>
      <Footer activeTab={activeTab} setActiveTab={setActiveTab} theme={appliedTheme} />
    </AppContainer>
  );
}

export default App;
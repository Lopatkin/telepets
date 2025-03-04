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

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      const telegramData = window.Telegram.WebApp.initDataUnsafe;
      const savedTheme = localStorage.getItem('theme') || 'telegram';
      const savedRoom = localStorage.getItem('currentRoom');
      if (telegramData?.user?.id) {
        const userData = {
          id: telegramData.user.id.toString(),
          firstName: telegramData.user.first_name || 'User',
          username: telegramData.user.username || '',
          lastName: telegramData.user.last_name || ''
        };
        setUser(userData);
        setTelegramTheme(window.Telegram.WebApp.colorScheme || 'light');
        setTheme(savedTheme);
        setCurrentRoom(savedRoom || `myhome_${userData.id}`);

        // Инициализируем сокет один раз
        socketRef.current = io(process.env.REACT_APP_SERVER_URL || 'https://telepets.onrender.com');
        
        socketRef.current.on('connect', () => console.log('Socket connected:', socketRef.current.id));
        socketRef.current.on('disconnect', (reason) => console.log('Socket disconnected:', reason));

        // Аутентификация
        socketRef.current.emit('auth', userData);

        // Получение обновлений энергии
        socketRef.current.on('energyUpdate', (newEnergy) => {
          setEnergy(newEnergy);
        });

        // Запрос энергии при входе
        socketRef.current.emit('getEnergy');

        // Периодический запрос энергии каждые 10 минут
        const energyInterval = setInterval(() => {
          socketRef.current.emit('getEnergy');
        }, 10 * 60 * 1000);

        return () => {
          if (socketRef.current) {
            socketRef.current.disconnect();
            console.log('Socket disconnected on unmount');
          }
          clearInterval(energyInterval);
        };
      } else {
        console.warn('Telegram Web App data not available');
        const testUser = { id: 'test123', firstName: 'Test User' };
        setUser(testUser);
        setTelegramTheme('light');
        setTheme(savedTheme);
        setCurrentRoom(savedRoom || 'myhome_test123');

        // Инициализация для тестового пользователя
        socketRef.current = io(process.env.REACT_APP_SERVER_URL || 'https://telepets.onrender.com');
        socketRef.current.emit('auth', testUser);
        socketRef.current.on('energyUpdate', (newEnergy) => setEnergy(newEnergy));
        socketRef.current.emit('getEnergy');

        const energyInterval = setInterval(() => {
          socketRef.current.emit('getEnergy');
        }, 10 * 60 * 1000);

        return () => {
          if (socketRef.current) {
            socketRef.current.disconnect();
          }
          clearInterval(energyInterval);
        };
      }
    }
  }, []); // Пустой массив зависимостей — эффект выполняется один раз при монтировании

  const handleRoomSelect = (room) => {
    if (!room || !socketRef.current || room === currentRoom) return; // Избегаем дублирования и отправки для той же комнаты
    setCurrentRoom(room);
    localStorage.setItem('currentRoom', room);
    setActiveTab('chat');
    socketRef.current.emit('joinRoom', { room, lastTimestamp: null }); // Отправляем только один раз
    prevRoomRef.current = room; // Сохраняем текущую комнату
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const appliedTheme = theme === 'telegram' ? telegramTheme : theme;

  return (
    <AppContainer>
      <Header user={user} room={currentRoom} theme={appliedTheme} energy={energy} />
      <Content>
        {activeTab === 'chat' && <Chat userId={user.id} room={currentRoom} theme={appliedTheme} socket={socketRef.current} />}
        {activeTab === 'actions' && <div>Действия</div>}
        {activeTab === 'housing' && <div>Жильё</div>}
        {activeTab === 'map' && <Map userId={user.id} onRoomSelect={handleRoomSelect} theme={appliedTheme} currentRoom={currentRoom} />}
        {activeTab === 'profile' && (
          <Profile 
            user={user} 
            theme={appliedTheme} 
            selectedTheme={theme} 
            telegramTheme={telegramTheme} 
            onThemeChange={handleThemeChange} 
          />
        )}
      </Content>
      <Footer activeTab={activeTab} setActiveTab={setActiveTab} theme={appliedTheme} />
    </AppContainer>
  );
}

export default App;
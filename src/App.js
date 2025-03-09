import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import Chat from './components/Chat';
import Header from './components/Header';
import Footer from './components/Footer';
import Profile from './components/Profile';
import Map from './components/Map';
import Actions from './components/Actions';
import Inventory from './components/Inventory';

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
  const socketRef = useRef(null);
  const prevRoomRef = useRef(null);
  const joinedRoomsRef = useRef(new Set());
  const isJoiningRef = useRef(false);
  const isAuthenticatedRef = useRef(false);
  const [socket, setSocket] = useState(null); // Состояние для сокета

  useEffect(() => {
    const initializeSocket = () => {
      if (socketRef.current) return; // Не переинициализируем, если уже есть соединение

      socketRef.current = io(process.env.REACT_APP_SERVER_URL || 'https://telepets.onrender.com', {
        cors: {
          origin: process.env.FRONTEND_URL || "https://telepets.netlify.app",
          methods: ["GET", "POST"]
        },
        reconnection: true, // Включаем автоматическое переподключение
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current.id);
        setSocket(socketRef.current); // Устанавливаем сокет в состояние
        if (!isAuthenticatedRef.current && user) {
          socketRef.current.emit('auth', user);
          isAuthenticatedRef.current = true;
        }
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setSocket(null); // Сбрасываем состояние при отключении
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
      });

      // Очистка при размонтировании
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          console.log('Socket disconnected on unmount');
        }
      };
    };

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      const telegramData = window.Telegram.WebApp.initDataUnsafe;
      const savedTheme = localStorage.getItem('theme') || 'telegram';
      const userId = telegramData?.user?.id?.toString();
      let savedRoom = null;

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
          photoUrl: telegramData.user.photo_url || ''
        };
        setUser(userData);
        setTelegramTheme(window.Telegram.WebApp.colorScheme || 'light');
        setTheme(savedTheme);
        setCurrentRoom(savedRoom || `myhome_${userData.userId}`);
        initializeSocket(); // Инициализируем сокет
      } else {
        console.warn('Telegram Web App data not available');
        const testUser = { userId: 'test123', firstName: 'Test User' };
        setUser(testUser);
        setTelegramTheme('light');
        setTheme(savedTheme);
        setCurrentRoom(savedRoom || 'myhome_test123');
        initializeSocket(); // Инициализируем сокет
      }
    } else {
      console.warn('Telegram Web App not detected, using test mode');
      const testUser = { userId: 'test123', firstName: 'Test User' };
      setUser(testUser);
      setTelegramTheme('light');
      setTheme('telegram');
      setCurrentRoom('myhome_test123');
      initializeSocket(); // Инициализируем сокет
    }
  }, []); // Пустой массив зависимостей, чтобы эффект срабатывал только при монтировании

  const handleRoomSelect = (room) => {
    if (!room || !socket || room === currentRoom || isJoiningRef.current) return;
    isJoiningRef.current = true;

    if (currentRoom && socket) {
      socket.emit('leaveRoom', currentRoom);
    }

    setCurrentRoom(room);

    if (user?.userId) {
      const storedRooms = JSON.parse(localStorage.getItem('userRooms') || '{}');
      storedRooms[user.userId] = room;
      localStorage.setItem('userRooms', JSON.stringify(storedRooms));
    }

    setActiveTab('chat');

    if (!joinedRoomsRef.current.has(room)) {
      console.log(`Emitting joinRoom for new room: ${room}`);
      socket.emit('joinRoom', { room, lastTimestamp: null });
      joinedRoomsRef.current.add(room);
    } else {
      console.log(`Rejoining room: ${room} — using cached messages or fetching updates`);
      socket.emit('joinRoom', { room, lastTimestamp: null });
    }

    setTimeout(() => {
      isJoiningRef.current = false;
    }, 1000);

    prevRoomRef.current = room;
  };

  useEffect(() => {
    if (activeTab !== 'chat' && currentRoom && socket) {
      console.log(`User stayed in room ${currentRoom} while switching to ${activeTab} tab`);
    }
  }, [activeTab, currentRoom, socket]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const appliedTheme = theme === 'telegram' ? telegramTheme : theme;

  const progressValues = {
    health: 50,
    mood: 50,
    fullness: 50
  };

  // Передаём socket только если он определён
  return (
    <AppContainer>
      <Header user={user} room={currentRoom} theme={appliedTheme} />
      <Content>
        {activeTab === 'chat' && <Chat userId={user.userId} room={currentRoom} theme={appliedTheme} socket={socket} joinedRoomsRef={joinedRoomsRef} />}
        {activeTab === 'actions' && socket && <Actions theme={appliedTheme} currentRoom={currentRoom} userId={user.userId} socket={socket} />}
        {activeTab === 'housing' && socket && <Inventory userId={user.userId} currentRoom={currentRoom} theme={appliedTheme} socket={socket} />}
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
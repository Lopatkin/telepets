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
  const [socket, setSocket] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Новое состояние

  // Инициализация сокета
  useEffect(() => {
    const initializeSocket = () => {
      if (socketRef.current) return;

      socketRef.current = io(process.env.REACT_APP_SERVER_URL || 'https://telepets.onrender.com', {
        cors: {
          origin: process.env.FRONTEND_URL || "https://telepets.netlify.app",
          methods: ["GET", "POST"]
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current.id);
        setSocket(socketRef.current);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setSocket(null);
        setIsAuthenticated(false); // Сбрасываем состояние аутентификации
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
      });

      // Подтверждение успешной аутентификации
      socketRef.current.on('authSuccess', () => {
        console.log('Authentication successful');
        setIsAuthenticated(true);
        isAuthenticatedRef.current = true;
      });

      socketRef.current.on('error', ({ message }) => {
        console.error('Server error:', message);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          console.log('Socket disconnected on unmount');
        }
      };
    };

    initializeSocket();
  }, []);

  // Аутентификация пользователя
  useEffect(() => {
    if (socket && user && !isAuthenticatedRef.current) {
      socket.emit('auth', user, () => {
        // Сервер должен отправить 'authSuccess' после успешной аутентификации
      });
    }
  }, [socket, user]);

  // Инициализация Telegram и установка начального состояния
  useEffect(() => {
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
      } else {
        console.warn('Telegram Web App data not available');
        const testUser = { userId: 'test123', firstName: 'Test User' };
        setUser(testUser);
        setTelegramTheme('light');
        setTheme(savedTheme);
        setCurrentRoom(savedRoom || 'myhome_test123');
      }
    } else {
      console.warn('Telegram Web App not detected, using test mode');
      const testUser = { userId: 'test123', firstName: 'Test User' };
      setUser(testUser);
      setTelegramTheme('light');
      setTheme('telegram');
      setCurrentRoom('myhome_test123');
    }
  }, []);

  const handleRoomSelect = (room) => {
    if (!room || !socket || room === currentRoom || isJoiningRef.current || !isAuthenticated) {
      console.log('Cannot join room: authentication not completed or other conditions not met');
      return;
    }
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
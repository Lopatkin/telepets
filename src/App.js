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
import { ClipLoader } from 'react-spinners';
import Registration from './components/Registration'; // Добавляем импорт

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const LoadingContainer = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${props => props.theme === 'dark' ? '#1A1A1A' : '#fff'};
`;

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [theme, setTheme] = useState('telegram');
  const [telegramTheme, setTelegramTheme] = useState('light');
  const socketRef = useRef(null);
  const joinedRoomsRef = useRef(new Set());
  const [socket, setSocket] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [personalItems, setPersonalItems] = useState([]); // Добавляем состояние для personalItems
  const [isRegistered, setIsRegistered] = useState(null); // null - ещё не проверено

  const handleItemsUpdate = (items) => {
    setPersonalItems(items.filter(item => item.owner === `user_${user.userId}`));
  };

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
        setIsAuthenticated(false);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
      });

      socketRef.current.on('authSuccess', ({ defaultRoom, isRegistered }) => { // Добавляем isRegistered
        console.log('Authentication successful, received defaultRoom:', defaultRoom, 'isRegistered:', isRegistered);
        setIsAuthenticated(true);
        setIsRegistered(isRegistered);
        if (isRegistered) {
          setCurrentRoom(defaultRoom);
          joinedRoomsRef.current.add(defaultRoom);
          socketRef.current.emit('joinRoom', { room: defaultRoom, lastTimestamp: null });
        }
      });

      socketRef.current.on('userUpdate', (updatedUser) => {
        console.log('Received userUpdate:', updatedUser);
        setUser(prevUser => ({ ...prevUser, ...updatedUser })); // Обновляем user с новыми данными
        setIsRegistered(updatedUser.isRegistered);
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

  useEffect(() => {
    if (socket && user && !isAuthenticated) {
      const storedRooms = JSON.parse(localStorage.getItem('userRooms') || '{}');
      const lastRoom = storedRooms[user.userId] || 'Полигон утилизации';
      console.log('Stored rooms in localStorage:', storedRooms);
      console.log('Last room for user', user.userId, ':', lastRoom);
      console.log('Sending auth with user data:', { ...user, lastRoom });
      socket.emit('auth', { ...user, lastRoom });
    }
  }, [socket, user, isAuthenticated]);

  // Добавляем обработчик завершения регистрации
  const handleRegistrationComplete = (defaultRoom) => {
    setIsRegistered(true);
    setCurrentRoom(defaultRoom);
    joinedRoomsRef.current.add(defaultRoom);
    socket.emit('joinRoom', { room: defaultRoom, lastTimestamp: null });
  };

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      const telegramData = window.Telegram.WebApp.initDataUnsafe;
      const savedTheme = localStorage.getItem('theme') || 'telegram';

      if (telegramData?.user?.id) {
        const userData = {
          userId: telegramData.user.id.toString(),
          firstName: telegramData.user.first_name || 'User',
          username: telegramData.user.username || '',
          lastName: telegramData.user.last_name || '',
          photoUrl: telegramData.user.photo_url || ''
        };
        console.log('Telegram user data:', userData);
        setUser(userData);
        setTelegramTheme(window.Telegram.WebApp.colorScheme || 'light');
        setTheme(savedTheme);
      } else {
        console.warn('Telegram Web App data not available');
        const testUser = { userId: 'test123', firstName: 'Test User' };
        setUser(testUser);
        setTelegramTheme('light');
        setTheme(savedTheme);
      }
    } else {
      console.warn('Telegram Web App not detected, using test mode');
      const testUser = { userId: 'test123', firstName: 'Test User' };
      setUser(testUser);
      setTelegramTheme('light');
      setTheme('telegram');
    }
  }, []);

  const handleRoomSelect = (room) => {
    if (!room || !socket || room === currentRoom || !isAuthenticated) {
      console.log('Cannot join room: conditions not met');
      return;
    }

    if (currentRoom && socket) {
      socket.emit('leaveRoom', currentRoom);
    }

    setCurrentRoom(room);

    if (user?.userId) {
      const storedRooms = JSON.parse(localStorage.getItem('userRooms') || '{}');
      storedRooms[user.userId] = room;
      localStorage.setItem('userRooms', JSON.stringify(storedRooms));
      console.log('Saved room to localStorage:', storedRooms);
    }

    setActiveTab('chat');

    if (!joinedRoomsRef.current.has(room)) {
      console.log(`Emitting joinRoom for new room: ${room}`);
      socket.emit('joinRoom', { room, lastTimestamp: null });
      joinedRoomsRef.current.add(room);
    } else {
      console.log(`Rejoining room: ${room}`);
      socket.emit('joinRoom', { room, lastTimestamp: null });
    }
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

  if (!user || !isAuthenticated || isRegistered === null) {
    return (
      <LoadingContainer theme={theme === 'telegram' ? telegramTheme : theme}>
        <ClipLoader color="#007AFF" size={40} />
      </LoadingContainer>
    );
  }

  if (!isRegistered) {
    return (
      <Registration
        user={user}
        theme={theme === 'telegram' ? telegramTheme : theme}
        socket={socket}
        onRegistrationComplete={handleRegistrationComplete}
      />
    );
  }

  const appliedTheme = theme === 'telegram' ? telegramTheme : theme;

  return (
    <AppContainer>
      <Header user={user} room={currentRoom} theme={appliedTheme} socket={socket} />
      <Content>
        {activeTab === 'chat' && <Chat userId={user.userId} room={currentRoom} theme={appliedTheme} socket={socket} joinedRoomsRef={joinedRoomsRef} />}
        {activeTab === 'actions' && socket && <Actions theme={appliedTheme} currentRoom={currentRoom} userId={user.userId} socket={socket} personalItems={personalItems} />}
        {activeTab === 'housing' && socket && <Inventory userId={user.userId} currentRoom={currentRoom} theme={appliedTheme} socket={socket} onItemsUpdate={handleItemsUpdate} />}
        {activeTab === 'map' && <Map userId={user.userId} onRoomSelect={handleRoomSelect} theme={appliedTheme} currentRoom={currentRoom} />}
        {activeTab === 'profile' && (
          <Profile
            user={user}
            theme={appliedTheme}
            selectedTheme={theme}
            telegramTheme={telegramTheme}
            onThemeChange={handleThemeChange}
            progressValues={{ health: 50, mood: 50, fullness: 50 }}
          />
        )}
      </Content>
      <Footer activeTab={activeTab} setActiveTab={setActiveTab} theme={appliedTheme} />
    </AppContainer>
  );
}

export default App;
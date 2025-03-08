import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import Chat from './components/Chat';
import Header from './components/Header';
import Footer from './components/Footer';
import Profile from './components/Profile';
import Map from './components/Map';
import Actions from './components/Actions';
import Inventory from './components/Inventory'; // Импорт нового компонента

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

        if (!socketRef.current) {
          socketRef.current = io(process.env.REACT_APP_SERVER_URL || 'https://telepets.onrender.com');
          socketRef.current.on('connect', () => console.log('Socket connected:', socketRef.current.id));
          socketRef.current.on('disconnect', (reason) => console.log('Socket disconnected:', reason));

          if (!isAuthenticatedRef.current) {
            socketRef.current.emit('auth', userData);
            isAuthenticatedRef.current = true;
          }

          return () => {
            if (socketRef.current) {
              socketRef.current.disconnect();
              console.log('Socket disconnected on unmount');
            }
          };
        }
      } else {
        console.warn('Telegram Web App data not available');
        const testUser = { userId: 'test123', firstName: 'Test User' };
        setUser(testUser);
        setTelegramTheme('light');
        setTheme(savedTheme);

        const storedRooms = JSON.parse(localStorage.getItem('userRooms') || '{}');
        savedRoom = storedRooms[testUser.userId] || null;
        setCurrentRoom(savedRoom || 'myhome_test123');

        if (!socketRef.current) {
          socketRef.current = io(process.env.REACT_APP_SERVER_URL || 'https://telepets.onrender.com');
          socketRef.current.on('connect', () => console.log('Socket connected:', socketRef.current.id));
          socketRef.current.on('disconnect', (reason) => console.log('Socket disconnected:', reason));

          if (!isAuthenticatedRef.current) {
            socketRef.current.emit('auth', testUser);
            isAuthenticatedRef.current = true;
          }

          return () => {
            if (socketRef.current) {
              socketRef.current.disconnect();
            }
          };
        }
      }
    }
  }, []);

  const handleRoomSelect = (room) => {
    if (!room || !socketRef.current || room === currentRoom || isJoiningRef.current) return;
    isJoiningRef.current = true;

    if (currentRoom && socketRef.current) {
      socketRef.current.emit('leaveRoom', currentRoom);
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
      socketRef.current.emit('joinRoom', { room, lastTimestamp: null });
      joinedRoomsRef.current.add(room);
    } else {
      console.log(`Rejoining room: ${room} — using cached messages or fetching updates`);
      socketRef.current.emit('joinRoom', { room, lastTimestamp: null });
    }

    setTimeout(() => {
      isJoiningRef.current = false;
    }, 1000);

    prevRoomRef.current = room;
  };

  useEffect(() => {
    if (activeTab !== 'chat' && currentRoom && socketRef.current) {
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

  const progressValues = {
    health: 50,
    mood: 50,
    fullness: 50
  };

  return (
    <AppContainer>
      <Header user={user} room={currentRoom} theme={appliedTheme} />
      <Content>
        {activeTab === 'chat' && <Chat userId={user.userId} room={currentRoom} theme={appliedTheme} socket={socketRef.current} joinedRoomsRef={joinedRoomsRef} />}
        {activeTab === 'actions' && <Actions theme={appliedTheme} currentRoom={currentRoom} userId={user.userId} />}
        {activeTab === 'housing' && <Inventory userId={user.userId} currentRoom={currentRoom} theme={appliedTheme} socket={socketRef.current} />}
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
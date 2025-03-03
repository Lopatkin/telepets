import React, { useState, useEffect } from 'react';
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
  const [energy, setEnergy] = useState(100);

  const socket = io('https://telepets.onrender.com');

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

        socket.emit('auth', userData);
      } else {
        console.warn('Telegram Web App data not available');
        setUser({ id: 'test123', firstName: 'Test User' });
        setTelegramTheme('light');
        setTheme(savedTheme);
        setCurrentRoom(savedRoom || 'myhome_test123');
        socket.emit('auth', { userId: 'test123', firstName: 'Test User' });
      }

      socket.on('energyUpdate', (newEnergy) => {
        console.log('Received energyUpdate:', newEnergy); // Для отладки
        setEnergy(newEnergy);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [socket]);

  const handleRoomSelect = (room) => {
    setCurrentRoom(room);
    localStorage.setItem('currentRoom', room);
    setActiveTab('chat');
    socket.emit('joinRoom', room);
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
      <Header user={user} room={currentRoom} theme={appliedTheme} energy={energy} socket={socket} />
      <Content>
        {activeTab === 'chat' && <Chat userId={user.id} room={currentRoom} theme={appliedTheme} />}
        {activeTab === 'actions' && <div>Действия</div>}
        {activeTab === 'housing' && <div>Жильё</div>}
        {activeTab === 'map' && <Map userId={user.id} onRoomSelect={handleRoomSelect} theme={appliedTheme} />}
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
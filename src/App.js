import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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
  const [theme, setTheme] = useState('light'); // По умолчанию светлая тема

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      const telegramData = window.Telegram.WebApp.initDataUnsafe;
      if (telegramData?.user?.id) {
        const userData = {
          id: telegramData.user.id.toString(),
          firstName: telegramData.user.first_name || 'User',
          username: telegramData.user.username || '',
          lastName: telegramData.user.last_name || ''
        };
        setUser(userData);
        setCurrentRoom(`myhome_${userData.id}`);
        // Устанавливаем тему из Telegram
        setTheme(window.Telegram.WebApp.colorScheme || 'light');
      } else {
        console.warn('Telegram Web App data not available');
        setUser({ id: 'test123', firstName: 'Test User' });
        setCurrentRoom('myhome_test123');
        setTheme('light');
      }
    } else {
      console.warn('Telegram Web App not loaded');
      setUser({ id: 'test123', firstName: 'Test User' });
      setCurrentRoom('myhome_test123');
      setTheme('light');
    }
  }, []);

  const handleRoomSelect = (room) => {
    setCurrentRoom(room);
    setActiveTab('chat');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <AppContainer>
      <Header user={user} room={currentRoom} theme={theme} />
      <Content>
        {activeTab === 'chat' && <Chat userId={user.id} room={currentRoom} theme={theme} />}
        {activeTab === 'actions' && <div>Действия</div>}
        {activeTab === 'housing' && <div>Жильё</div>}
        {activeTab === 'map' && <Map userId={user.id} onRoomSelect={handleRoomSelect} theme={theme} />}
        {activeTab === 'profile' && <Profile user={user} theme={theme} />}
      </Content>
      <Footer activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
    </AppContainer>
  );
}

export default App;
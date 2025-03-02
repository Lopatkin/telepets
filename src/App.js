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
  const [theme, setTheme] = useState('telegram'); // По умолчанию "Как в Telegram"
  const [telegramTheme, setTelegramTheme] = useState('light'); // Тема Telegram

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      const telegramData = window.Telegram.WebApp.initDataUnsafe;
      const savedTheme = localStorage.getItem('theme') || 'telegram'; // Загружаем сохранённую тему
      if (telegramData?.user?.id) {
        const userData = {
          id: telegramData.user.id.toString(),
          firstName: telegramData.user.first_name || 'User',
          username: telegramData.user.username || '',
          lastName: telegramData.user.last_name || ''
        };
        setUser(userData);
        setCurrentRoom(`myhome_${userData.id}`);
        setTelegramTheme(window.Telegram.WebApp.colorScheme || 'light');
        setTheme(savedTheme);
      } else {
        console.warn('Telegram Web App data not available');
        setUser({ id: 'test123', firstName: 'Test User' });
        setCurrentRoom('myhome_test123');
        setTelegramTheme('light');
        setTheme(savedTheme);
      }
    } else {
      console.warn('Telegram Web App not loaded');
      setUser({ id: 'test123', firstName: 'Test User' });
      setCurrentRoom('myhome_test123');
      setTelegramTheme('light');
      setTheme('light'); // Для локального теста
    }
  }, []);

  const handleRoomSelect = (room) => {
    setCurrentRoom(room);
    setActiveTab('chat');
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme); // Сохраняем выбор в localStorage
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  // Определяем текущую тему для компонентов
  const appliedTheme = theme === 'telegram' ? telegramTheme : theme;

  return (
    <AppContainer>
      <Header user={user} room={currentRoom} theme={appliedTheme} />
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
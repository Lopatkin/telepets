import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Chat from './components/Chat';
import Header from './components/Header';
import Footer from './components/Footer';

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

  useEffect(() => {
    // Инициализация Telegram Web App
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      const telegramData = window.Telegram.WebApp.initDataUnsafe;

      
      if (telegramData?.user?.id) {
        setUser({
          id: telegramData.user.id.toString(), // Telegram ID как строка
          firstName: telegramData.user.first_name || 'User'
        });
      } else {
        // Fallback для случаев, когда Telegram данные недоступны
        console.warn('Telegram Web App data not available');
        setUser({ id: 'test123', firstName: 'Test User' });
      }
    } else {
      // Для локального тестирования без Telegram
      console.warn('Telegram Web App not loaded');
      setUser({ id: 'test123', firstName: 'Test User' });
    }
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <AppContainer>
      <Header user={user} />
      <Content>
        {activeTab === 'chat' && <Chat userId={user.id} />}
        {activeTab === 'actions' && <div>Действия</div>}
        {activeTab === 'housing' && <div>Жильё</div>}
        {activeTab === 'map' && <div>Карта</div>}
        {activeTab === 'profile' && <div>Профиль</div>}
      </Content>
      <Footer activeTab={activeTab} setActiveTab={setActiveTab} />
    </AppContainer>
  );
}

export default App;
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

  // Мок авторизации для тестирования без Telegram
  useEffect(() => {
    if (!window.Telegram?.WebApp?.initData) {
      setUser({ id: 'test123', firstName: 'Test User' });
    } else {
      const telegramData = window.Telegram.WebApp.initDataUnsafe;
      setUser({
        id: telegramData.user.id,
        firstName: telegramData.user.first_name
      });
    }
  }, []);

  if (!user) return <div>Loading...</div>;

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
import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.div`
  position: sticky;
  bottom: 0;
  background: #fff;
  padding: 10px;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: space-around;
`;

const TabButton = styled.button`
  background: ${props => props.active ? '#007AFF' : 'none'};
  color: ${props => props.active ? 'white' : 'black'};
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
`;

function Footer({ activeTab, setActiveTab }) {
  const tabs = ['chat', 'actions', 'housing', 'map', 'profile'];

  return (
    <FooterContainer>
      {tabs.map(tab => (
        <TabButton
          key={tab}
          active={activeTab === tab}
          onClick={() => setActiveTab(tab)}
        >
          {tab === 'chat' ? 'Чат' :
           tab === 'actions' ? 'Действия' :
           tab === 'housing' ? 'Жильё' :
           tab === 'map' ? 'Карта' : 'Профиль'}
        </TabButton>
      ))}
    </FooterContainer>
  );
}

export default Footer;
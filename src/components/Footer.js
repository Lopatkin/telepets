import React from 'react';
import styled from 'styled-components';
import { FaComments, FaTasks, FaHome, FaMap, FaUser } from 'react-icons/fa';

const FooterContainer = styled.div`
  position: sticky;
  bottom: 0;
  background: #2A2A2A; /* Более тёмный фон */
  border-top: 1px solid #444; /* Тёмная граница для контраста */
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 5px 0;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
`;

const TabButton = styled.button`
  background: ${props => props.active ? '#007AFF' : 'none'};
  box-shadow: ${props => props.active ? '0 2px 4px rgba(0, 0, 0, 0.2)' : 'none'};
  color: ${props => props.active ? 'white' : '#ccc'}; /* Светлый цвет иконок для тёмного фона */
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 32px;
  flex: 1;
  margin: 0 4px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 20%;

  @media (max-width: 400px) {
    font-size: 24px;
    padding: 6px 10px;
  }
`;

function Footer({ activeTab, setActiveTab }) {
  const tabs = [
    { key: 'chat', icon: <FaComments /> },
    { key: 'actions', icon: <FaTasks /> },
    { key: 'housing', icon: <FaHome /> },
    { key: 'map', icon: <FaMap /> },
    { key: 'profile', icon: <FaUser /> }
  ];

  return (
    <FooterContainer>
      {tabs.map(tab => (
        <TabButton
          key={tab.key}
          active={activeTab === tab.key}
          onClick={() => setActiveTab(tab.key)}
        >
          {tab.icon}
        </TabButton>
      ))}
    </FooterContainer>
  );
}

export default Footer;
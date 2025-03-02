import React from 'react';
import styled from 'styled-components';
import { FaComments, FaTasks, FaHome, FaMap, FaUser } from 'react-icons/fa';

const FooterContainer = styled.div`
  position: sticky;
  bottom: 0;
  background: #fff;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 5px 0;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
`;

const TabButton = styled.button`
  background: ${props => props.active ? '#007AFF' : 'none'};
  color: ${props => props.active ? 'white' : 'black'};
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px; /* Размер иконок */
  flex: 1;
  margin: 0 2px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 20%;

  @media (max-width: 400px) {
    padding: 4px 6px;
    font-size: 14px;
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
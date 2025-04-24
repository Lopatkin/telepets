import React from 'react';
import styled from 'styled-components';
import { FaComments, FaTasks, FaBox, FaMap, FaUser } from 'react-icons/fa';

const FooterContainer = styled.div`
  position: sticky;
  bottom: 0;
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  border-top: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
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
  color: ${props => props.active ? 'white' : (props.theme === 'dark' ? '#ccc' : 'black')};
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 32px;
  flex: 1;
  margin: 0 4px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 20%;
  opacity: ${props => props.disabled ? 0.5 : 1};

  @media (max-width: 400px) {
    font-size: 24px;
    padding: 6px 10px;
  }
`;

function Footer({ activeTab, setActiveTab, theme, user, currentRoom, isAnimalAtHome, isAnimalInPocketWithOwnerOnline }) {
  const isAnimalInShelter = !user?.isHuman && currentRoom === 'Приют для животных "Кошкин дом"';
  const isMapDisabled = isAnimalInShelter || (isAnimalAtHome && !user?.freeRoam) || isAnimalOnLeashWithOwnerOnline;
  console.log('isMapDisabled:', isMapDisabled, 'freeRoam:', user?.freeRoam, 'isAnimalAtHome:', isAnimalAtHome, 'isAnimalInShelter:', isAnimalInShelter, 'isAnimalOnLeashWithOwnerOnline:', isAnimalOnLeashWithOwnerOnline); // Отладка

  const handleTabClick = (tab) => {
    if (tab === 'map') {
      if (isAnimalInShelter) {
        alert('Извините, но из приюта бездомному животному без хозяина просто так не сбежать.');
        return;
      }
      if (isAnimalAtHome && !user?.freeRoam) {
        alert('Вы находитесь дома у хозяина и не можете самостоятельно перемещаться.');
        return;
      }
      if (isAnimalInPocketWithOwnerOnline) {
        alert('Вы привязаны к хозяину и не можете перемещаться, пока он онлайн.');
        return;
      }
    }
    setActiveTab(tab);
  };

  const tabs = [
    { key: 'chat', icon: <FaComments /> },
    { key: 'actions', icon: <FaTasks /> },
    { key: 'housing', icon: <FaBox /> },
    { key: 'map', icon: <FaMap />, disabled: isMapDisabled },
    { key: 'profile', icon: <FaUser /> },
  ];

  return (
    <FooterContainer theme={theme}>
      {tabs.map(tab => (
        <TabButton
          key={tab.key}
          active={activeTab === tab.key}
          onClick={() => handleTabClick(tab.key)}
          theme={theme}
          disabled={tab.disabled}
        >
          {tab.icon}
        </TabButton>
      ))}
    </FooterContainer>
  );
}

export default Footer;
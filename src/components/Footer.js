import React from 'react';
import styled from 'styled-components';
import { FaComments, FaTasks, FaHome, FaMap, FaUser } from 'react-icons/fa';
const tabs = [
  { key: 'chat', icon: <FaComments /> },
  { key: 'actions', icon: <FaTasks /> },
  { key: 'housing', icon: <FaHome /> },
  { key: 'map', icon: <FaMap /> },
  { key: 'profile', icon: <FaUser /> }
];

const FooterContainer = styled.div`
  position: sticky;
  bottom: 0;
  background: #fff;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 5px 0; /* Уменьшили padding сверху и снизу */
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden; /* Предотвращаем горизонтальный скролл */
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
`;

const TabButton = styled.button`
  background: ${props => props.active ? '#007AFF' : 'none'};
  color: ${props => props.active ? 'white' : 'black'};
  border: none;
  padding: 6px 10px; /* Уменьшили padding для компактности */
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px; /* Уменьшили шрифт для мобильных */
  flex: 1; /* Кнопки равномерно распределяют ширину */
  margin: 0 2px; /* Минимальные отступы между кнопками */
  text-align: center;
  white-space: nowrap; /* Предотвращаем перенос текста */
  overflow: hidden;
  text-overflow: ellipsis; /* Обрезаем длинный текст с многоточием */
  max-width: 20%; /* Ограничиваем ширину каждой кнопки */
  
  /* Адаптивность для маленьких экранов */
  @media (max-width: 400px) {
    font-size: 12px;
    padding: 4px 6px;
  }
`;

function Footer({ activeTab, setActiveTab }) {
  const tabs = [
    { key: 'chat', label: 'Чат' },
    { key: 'actions', label: 'Действия' },
    { key: 'housing', label: 'Жильё' },
    { key: 'map', label: 'Карта' },
    { key: 'profile', label: 'Профиль' }
  ];

  return (
    <FooterContainer>
      {tabs.map(tab => (
        <TabButton active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)}>
          {tab.icon}
        </TabButton>
      ))}
    </FooterContainer>
  );
}

export default Footer;
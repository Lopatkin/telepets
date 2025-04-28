import styled from 'styled-components';
import { FaUsers, FaPaperPlane } from 'react-icons/fa';
import busStationImage from '../images/bus_station.jpg';
import myRoomImage from '../images/my_room.jpg';
import trainStationImage from '../images/train_station.jpg';
import zhkSferaImage from '../images/zhk_sfera.jpg';
import factoryImage from '../images/factory.jpg';
import forestImage from '../images/forest.jpg';
import parkImage from '../images/park.jpg';
import villageImage from '../images/village.jpg';
import barImage from '../images/bar.jpg';
import cafeImage from '../images/cafe.jpg';
import priyutImage from '../images/priyut.jpg';
import albionImage from '../images/albion.jpg';
import karnavalImage from '../images/univermag.jpg';
import poligonImage from '../images/poligon.jpg';
import workshopImage from '../images/workshop.jpg';
import podmostImage from '../images/podmost.jpg';

export const ChatContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Гарантирует, что контейнер не выходит за пределы родителя */
  height: 100%; /* Устанавливаем явную высоту для корректной прокрутки */
  z-index: 1; /* Устанавливаем низкий z-index, чтобы не перекрывать мяч */

  
  background: ${props => {
    if (props.room === 'Автобусная остановка') {
      return `url(${busStationImage}) no-repeat center center fixed`;
    } else if (props.room && props.room.startsWith('myhome_')) {
      return `url(${myRoomImage}) no-repeat center center fixed`;
    } else if (props.room === 'Вокзал') {
      return `url(${trainStationImage}) no-repeat center center fixed`;
    } else if (props.room === 'ЖК Сфера') {
      return `url(${zhkSferaImage}) no-repeat center center fixed`;
    } else if (props.room === 'Завод') {
      return `url(${factoryImage}) no-repeat center center fixed`;
    } else if (props.room === 'Лес') {
      return `url(${forestImage}) no-repeat center center fixed`;
    } else if (props.room === 'Парк') {
      return `url(${parkImage}) no-repeat center center fixed`;
    } else if (props.room === 'Район Дачный') {
      return `url(${villageImage}) no-repeat center center fixed`;
    } else if (props.room === 'Бар "У бобра" (18+)') {
      return `url(${barImage}) no-repeat center center fixed`;
    } else if (props.room === 'Кофейня "Ляля-Фа"') {
      return `url(${cafeImage}) no-repeat center center fixed`;
    } else if (props.room === 'Приют для животных "Кошкин дом"') {
      return `url(${priyutImage}) no-repeat center center fixed`;
    } else if (props.room === 'Бизнес центр "Альбион"') {
      return `url(${albionImage}) no-repeat center center fixed`;
    } else if (props.room === 'Магазин "Всё на свете"') {
      return `url(${karnavalImage}) no-repeat center center fixed`;
    } else if (props.room === 'Полигон утилизации') {
      return `url(${poligonImage}) no-repeat center center fixed`;
    } else if (props.room === 'Мастерская') {
      return `url(${workshopImage}) no-repeat center center fixed`;
    } else if (props.room === 'Под мостом') {
      return `url(${podmostImage}) no-repeat center center fixed`;
    } else {
      return props.theme === 'dark' ? '#1A1A1A' : '#fff';
    }
  }};
  
  background-size: cover;
`;

export const Message = styled.div`
    margin: 5px 0;
    padding: 8px;
    border-radius: ${props => props.isSystem ? '12px' : '4px'}; // Закруглённые углы для системных сообщений
    background: ${props => props.isSystem
    ? (props.theme === 'dark' ? '#4a4a4a' : '#e0e0e0')
    : (props.theme === 'dark' ? '#444' : (props.isOwn ? '#DCF8C6' : '#ECECEC'))
  };
    align-self: ${props => props.isSystem ? 'center' : (props.isOwn ? 'flex-end' : 'flex-start')}; // Центрирование системных сообщений
    max-width: 70%;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 2;
    font-style: ${props => props.isSystem ? 'italic' : 'normal'};
  `;

export const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
`;

export const Avatar = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 8px;
  object-fit: cover;
`;

export const DefaultAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #007AFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  margin-right: 8px;
`;

export const MessageName = styled.div`
  font-size: 12px;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
`;

export const MessageContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;
// Обновляем стиль MessageText для системных сообщений
export const MessageText = styled.span`
font-size: 14px;
word-break: break-word;
color: ${props => props.isSystem
    ? (props.theme === 'dark' ? '#cccccc' : '#666666')
    : (props.theme === 'dark' ? '#fff' : '#000')
  };
padding: ${props => props.isSystem ? '0' : '0'};
`;

export const Timestamp = styled.span`
  font-size: 10px;
  color: ${props => props.theme === 'dark' ? '#999' : '#999'};
  margin-left: 8px;
  white-space: nowrap;
`;

export const InputContainer = styled.div`
  position: sticky;
  bottom: 0;
  background: ${props => props.theme === 'dark' ? '#333' : '#fff'};
  padding: 10px;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#555' : '#ddd'};
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10;
`;

export const UsersButton = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export const UsersIcon = styled(FaUsers)`
  font-size: 24px;
  color: #007AFF;
`;

export const UserCount = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #007AFF;
  color: white;
  font-size: 12px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Input = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid ${props => props.theme === 'dark' ? '#555' : '#ddd'};
  border-radius: 4px;
  background: ${props => props.theme === 'dark' ? '#444' : '#fff'};
  color: ${props => props.theme === 'dark' ? '#fff' : '#000'};
`;

export const SendIcon = styled(FaPaperPlane)`
  font-size: 24px;
  color: #007AFF;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  padding: 8px;
`;

export const UserListModal = styled.div`
  position: absolute;
  bottom: 60px;
  left: 10px;
  width: 200px;
  background: ${props => props.theme === 'dark' ? '#333' : '#fff'};
  border: 1px solid ${props => props.theme === 'dark' ? '#555' : '#ddd'};
  border-radius: 4px;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 20;
`;

export const ModalTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  margin-bottom: 8px;
`;

export const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 0;
`;

export const UserName = styled.span`
  font-size: 14px;
  color: ${props => props.theme === 'dark' ? '#fff' : '#333'};
  margin-left: 5px;
`;

// export const PovodokIcon = styled.img`
//   width: 16px;
//   height: 16px;
// `;

export const LeashIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-left: 5px;
  vertical-align: middle;
`;
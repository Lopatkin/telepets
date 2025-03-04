import React, { useState, useEffect, useRef } from 'react';
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

const ChatContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
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
    } else {
      return props.theme === 'dark' ? '#1A1A1A' : '#fff';
    }
  }};
  background-size: cover;
`;

const Message = styled.div`
  margin: 5px 0;
  padding: 8px;
  border-radius: 4px;
  background: ${props => props.theme === 'dark'
    ? '#444'
    : (props.isOwn ? '#DCF8C6' : '#ECECEC')};
  align-self: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
  max-width: 70%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
`;

const Avatar = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 8px;
  object-fit: cover;
`;

const DefaultAvatar = styled.div`
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

const MessageName = styled.div`
  font-size: 12px;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
`;

const MessageContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const MessageText = styled.span`
  font-size: 14px;
  word-break: break-word;
  color: ${props => props.theme === 'dark' ? '#fff' : '#000'};
`;

const Timestamp = styled.span`
  font-size: 10px;
  color: ${props => props.theme === 'dark' ? '#999' : '#999'};
  margin-left: 8px;
  white-space: nowrap;
`;

const InputContainer = styled.div`
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

const UsersButton = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const UsersIcon = styled(FaUsers)`
  font-size: 24px;
  color: #007AFF;
`;

const UserCount = styled.span`
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

const Input = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid ${props => props.theme === 'dark' ? '#555' : '#ddd'};
  border-radius: 4px;
  background: ${props => props.theme === 'dark' ? '#444' : '#fff'};
  color: ${props => props.theme === 'dark' ? '#fff' : '#000'};
`;

const SendIcon = styled(FaPaperPlane)`
  font-size: 24px;
  color: #007AFF;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  padding: 8px;
`;

const UserListModal = styled.div`
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

const ModalTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  margin-bottom: 8px;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 0;
`;

const UserName = styled.span`
  font-size: 14px;
  color: ${props => props.theme === 'dark' ? '#fff' : '#333'};
`;

function Chat({ userId, room, theme, socket, joinedRoomsRef }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);

  // Кэш сообщений для каждой комнаты
  const [messageCache, setMessageCache] = useState({});

  useEffect(() => {
    if (!socket || !room) return;

    console.log('Setting up socket listeners for room:', room);

    window.Telegram.WebApp.ready();

    socket.on('messageHistory', (history) => {
      setMessages(prev => {
        const cached = messageCache[room] || [];
        const newMessages = [...cached, ...history].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        setMessageCache(prevCache => ({
          ...prevCache,
          [room]: newMessages
        }));
        return newMessages;
      });
    });

    socket.on('message', (msg) => {
      setMessages(prev => {
        const updated = [...prev, msg];
        setMessageCache(prevCache => ({
          ...prevCache,
          [room]: updated
        }));
        return updated;
      });
    });

    socket.on('roomUsers', (roomUsers) => {
      setUsers(roomUsers);
    });

    // Проверяем, не отправляли ли мы уже joinRoom для этой комнаты в этом сеансе
    const cachedMessages = messageCache[room] || [];
    if (!joinedRoomsRef.current.has(room) || cachedMessages.length === 0) {
      console.log('Emitting joinRoom for new room:', room);
      socket.emit('joinRoom', { room });
      joinedRoomsRef.current.add(room); // Отмечаем, что вошли в комнату
    } else {
      console.log('Rejoining room:', room, '— fetching updates');
      const lastTimestamp = cachedMessages[cachedMessages.length - 1]?.timestamp;
      socket.emit('joinRoom', { room, lastTimestamp });
    }

    return () => {
      console.log('Cleaning up socket listeners for room:', room);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, userId, room, joinedRoomsRef]); // Добавили joinedRoomsRef в зависимости

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowUserList(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() && room && socket) {
      const newMessage = {
        text: message,
        room,
        timestamp: new Date().toISOString()
      };
      socket.emit('sendMessage', newMessage);
      setMessage('');
    }
  };

  const getAuthorName = (msg) => {
    if (msg.userId === userId) return '';
    const parts = [];
    if (msg.firstName) parts.push(msg.firstName);
    if (msg.username) parts.push(`@${msg.username}`);
    if (msg.lastName) parts.push(msg.lastName);
    return parts.length > 0 ? parts.join(' ') : `User ${msg.userId}`;
  };

  const getAvatar = (msg) => {
    const initial = (msg.firstName || msg.userId || 'U').charAt(0).toUpperCase();
    return msg.photoUrl ? (
      <Avatar src={msg.photoUrl} alt="Avatar" />
    ) : (
      <DefaultAvatar>{initial}</DefaultAvatar>
    );
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return `${date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const toggleUserList = (e) => {
    e.stopPropagation();
    setShowUserList(prev => !prev);
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
    setShowUserList(false);
  };

  return (
    <ChatContainer>
      <MessagesContainer room={room} theme={theme}>
        {messages.map((msg, index) => (
          <Message key={index} isOwn={msg.userId === userId} theme={theme}>
            {msg.userId !== userId && (
              <MessageHeader>
                {getAvatar(msg)}
                <MessageName theme={theme}>{getAuthorName(msg)}</MessageName>
              </MessageHeader>
            )}
            <MessageContent>
              <MessageText theme={theme} isOwn={msg.userId === userId}>{msg.text}</MessageText>
              <Timestamp theme={theme}>{formatTimestamp(msg.timestamp)}</Timestamp>
            </MessageContent>
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <InputContainer theme={theme}>
        <UsersButton onClick={toggleUserList}>
          <UsersIcon />
          <UserCount>{users.length}</UserCount>
        </UsersButton>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={room ? "Напишите сообщение..." : "Выберите комнату на вкладке Карта"}
          disabled={!room}
          theme={theme}
        />
        <SendIcon onClick={sendMessage} disabled={!room} />
      </InputContainer>
      {showUserList && room && (
        <UserListModal ref={modalRef} onClick={handleModalClick} theme={theme}>
          <ModalTitle theme={theme}>Онлайн</ModalTitle>
          {users.map((user, index) => (
            <UserItem key={index}>
              {user.photoUrl ? (
                <Avatar src={user.photoUrl} alt="Avatar" />
              ) : (
                <DefaultAvatar>{(user.firstName || user.userId || 'U').charAt(0).toUpperCase()}</DefaultAvatar>
              )}
              <UserName theme={theme}>{user.firstName || `User ${user.userId}`}</UserName>
            </UserItem>
          ))}
        </UserListModal>
      )}
    </ChatContainer>
  );
}

export default Chat;
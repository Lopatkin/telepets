import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import { FaUsers } from 'react-icons/fa';

const ChatContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative; /* Для позиционирования модального окна */
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
`;

const Message = styled.div`
  margin: 5px 0;
  padding: 8px;
  border-radius: 4px;
  background: ${props => props.isOwn ? '#DCF8C6' : '#ECECEC'};
  align-self: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
  max-width: 70%;
  display: flex;
  flex-direction: column;
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
  color: #666;
`;

const MessageContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const MessageText = styled.span`
  font-size: 14px;
  word-break: break-word;
`;

const Timestamp = styled.span`
  font-size: 10px;
  color: #999;
  margin-left: 8px;
  white-space: nowrap;
`;

const InputContainer = styled.div`
  position: sticky;
  bottom: 0;
  background: #fff;
  padding: 10px;
  border-top: 1px solid #ddd;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10;
`;

const UsersIcon = styled(FaUsers)`
  font-size: 24px;
  color: #007AFF;
  cursor: pointer;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const UserListModal = styled.div`
  position: absolute;
  bottom: 60px;
  left: 10px;
  width: 200px; /* Фиксированная ширина вместо полной */
  background: #fff;
  border: 1px solid #ddd;
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
  color: #333;
  margin-bottom: 8px;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 0;
`;

const UserName = styled.span`
  font-size: 14px;
  color: #333;
`;

function Chat({ userId, room }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    window.Telegram.WebApp.ready();
    const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user || {};

    const userData = {
      userId: telegramUser.id?.toString() || userId,
      firstName: telegramUser.first_name || '',
      username: telegramUser.username || '',
      lastName: telegramUser.last_name || '',
      photoUrl: telegramUser.photo_url || ''
    };

    socketRef.current = io('https://telepets.onrender.com');
    socketRef.current.on('messageHistory', (history) => {
      setMessages(history);
    });

    socketRef.current.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socketRef.current.on('roomUsers', (roomUsers) => {
      setUsers(roomUsers);
    });

    socketRef.current.emit('auth', userData);

    if (room) {
      socketRef.current.emit('joinRoom', room);
    }

    return () => {
      socketRef.current.disconnect();
    };
  }, [userId, room]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
        setShowUserList(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() && room) {
      const newMessage = {
        text: message,
        room,
        timestamp: new Date().toISOString()
      };
      socketRef.current.emit('sendMessage', newMessage);
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
    e.stopPropagation(); // Предотвращаем закрытие при клике на иконку
    setShowUserList(prev => !prev);
  };

  const handleModalClick = (e) => {
    e.stopPropagation(); // Предотвращаем всплытие события
    setShowUserList(false); // Закрываем при клике на модальное окно
  };

  return (
    <ChatContainer ref={chatContainerRef}>
      <MessagesContainer>
        {messages.map((msg, index) => (
          <Message key={index} isOwn={msg.userId === userId}>
            {msg.userId !== userId && (
              <MessageHeader>
                {getAvatar(msg)}
                <MessageName>{getAuthorName(msg)}</MessageName>
              </MessageHeader>
            )}
            <MessageContent>
              <MessageText>{msg.text}</MessageText>
              <Timestamp>{formatTimestamp(msg.timestamp)}</Timestamp>
            </MessageContent>
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <InputContainer>
        <UsersIcon onClick={toggleUserList} />
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={room ? "Напишите сообщение..." : "Выберите комнату на вкладке Карта"}
          disabled={!room}
        />
        <Button onClick={sendMessage} disabled={!room}>Отправить</Button>
      </InputContainer>
      {showUserList && room && (
        <UserListModal onClick={handleModalClick}>
          <ModalTitle>На локации...</ModalTitle>
          {users.map((user, index) => (
            <UserItem key={index}>
              {user.photoUrl ? (
                <Avatar src={user.photoUrl} alt="Avatar" />
              ) : (
                <DefaultAvatar>{(user.firstName || user.userId || 'U').charAt(0).toUpperCase()}</DefaultAvatar>
              )}
              <UserName>{user.firstName || `User ${user.userId}`}</UserName>
            </UserItem>
          ))}
        </UserListModal>
      )}
    </ChatContainer>
  
  );
}

export default Chat;
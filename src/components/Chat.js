import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';

const ChatContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
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

const InputContainer = styled.div`
  position: sticky;
  bottom: 0;
  background: #fff;
  padding: 10px;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 10px;
  z-index: 10;
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

function Chat({ userId }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    window.Telegram.WebApp.ready();
    const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user || {};

    const userData = {
      userId: telegramUser.id?.toString() || userId,
      firstName: telegramUser.first_name || '',
      username: telegramUser.username || '',
      lastName: telegramUser.last_name || '',
      photoUrl: telegramUser.photo_url || '' // Добавляем photoUrl
    };

    socketRef.current = io('https://telepets.onrender.com');
    
    socketRef.current.on('messageHistory', (history) => {
      setMessages(history);
    });

    socketRef.current.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socketRef.current.emit('auth', userData);

    return () => {
      socketRef.current.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        text: message,
        timestamp: new Date().toISOString()
      };
      socketRef.current.emit('sendMessage', newMessage);
      setMessage('');
    }
  };

  const getAuthorName = (msg) => {
    if (msg.userId === userId) return ''; // Свои сообщения не подписываем
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

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.map((msg, index) => (
          <Message key={index} isOwn={msg.userId === userId}>
            {msg.userId !== userId && (
              <MessageHeader>
                {getAvatar(msg)}
                <MessageName>{getAuthorName(msg)}</MessageName>
              </MessageHeader>
            )}
            {msg.text}
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <InputContainer>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Напишите сообщение..."
        />
        <Button onClick={sendMessage}>Отправить</Button>
      </InputContainer>
    </ChatContainer>
  );
}

export default Chat;
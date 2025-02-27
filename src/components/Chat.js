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

const MessageName = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
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
    socketRef.current = io('https://telepets.onrender.com');
    
    socketRef.current.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        userId,
        text: message,
        timestamp: new Date().toISOString()
      };
      socketRef.current.emit('sendMessage', newMessage);
      setMessage('');
    }
  };

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.map((msg, index) => (
          <Message key={index} isOwn={msg.userId === userId}>
            {msg.userId !== userId && (
              <MessageName>User {msg.userId}</MessageName>
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
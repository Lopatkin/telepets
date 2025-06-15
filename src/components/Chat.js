import React, { useState, useEffect, useRef } from 'react';
import { catSounds, dogSounds } from './constants/animalSounds';
import PovodokIcon from '../images/povodok.png'; // Импорт иконки
import { getActiveNPCs } from '../utils/npcData'; // Обновляем импорт
import { MdVisibility } from 'react-icons/md'; // Добавляем импорт иконки глаза из react-icons

// import BouncingBall from './BouncingBall';

import {
  ChatContainer,
  MessagesContainer,
  Message,
  MessageHeader,
  Avatar,
  DefaultAvatar,
  MessageName,
  MessageContent,
  MessageText,
  Timestamp,
  InputContainer,
  UsersButton,
  UsersIcon,
  UserCount,
  Input,
  SendIcon,
  UserListModal,
  ModalTitle,
  UserItem,
  UserName,
  LeashIcon,
  ShelterIcon // Новый стиль для кнопки
} from '../styles/ChatStyles';

function Chat({ userId, room, theme, socket, joinedRoomsRef, user, setShowMyShelter }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);
  const messageCacheRef = useRef({});
  const messagesContainerRef = useRef(null);
  const avatarCacheRef = useRef(new Map()); // Новый кэш для аватарок
  const currentUserPhotoUrl = user?.photoUrl || '';

  const toggleShelter = () => {
    setShowMyShelter(true);
  };

  useEffect(() => {
    if (!socket || !room) return;

    // Очищаем кэш при смене комнаты
    messageCacheRef.current = { [room]: [] };

    // Запрашиваем историю для новой комнаты
    socket.emit('joinRoom', { room, lastTimestamp: null });

    const cachedMessages = messageCacheRef.current[room] || [];
    if (cachedMessages.length > 0 && messages.length === 0) {
      setMessages(cachedMessages);
    }

    socket.on('messageHistory', (history) => {
      setMessages(prev => {
        const cached = messageCacheRef.current[room] || [];
        const newMessages = [...cached, ...history].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        messageCacheRef.current[room] = newMessages;
        return newMessages;
      });
    });

    socket.on('message', (msg) => {
      if (msg.room === room) { // Фильтруем только сообщения для текущей комнаты
        setMessages(prev => {
          const updated = [...prev, msg];
          messageCacheRef.current[room] = updated;
          return updated;
        });
      }
    });

    // Добавляем обработчик системных сообщений
    socket.on('systemMessage', (msg) => {
      if (msg.room === room) {
        setMessages(prev => {
          const updated = [...prev, msg];
          messageCacheRef.current[room] = updated;
          return updated;
        });
      }
    });

    socket.on('roomUsers', (roomUsers) => {
      // Получаем активных NPC для текущей комнаты
      const activeNPCs = getActiveNPCs(room);
      const activeNPCIds = activeNPCs.map(npc => npc.userId);

      // Фильтруем пользователей, удаляя старых NPC, которые не активны
      const filteredUsers = roomUsers.filter(user =>
        !user.userId.startsWith('npc_') || activeNPCIds.includes(user.userId)
      );

      // Обновляем пользователей, добавляя активных NPC и текущего пользователя с актуальной photoUrl
      const updatedUsers = filteredUsers.map(roomUser => {
        if (roomUser.userId === userId) {
          return { ...roomUser, photoUrl: currentUserPhotoUrl };
        }
        return roomUser;
      });

      // Добавляем активных NPC в начало списка
      setUsers([...activeNPCs, ...updatedUsers.filter(user => !activeNPCIds.includes(user.userId))]);

      // console.log('Updated users in room:', [...activeNPCs, ...updatedUsers]);
    });

    if (!messageCacheRef.current[room]?.length) {
      socket.emit('joinRoom', { room, lastTimestamp: null });
    }

    return () => {
      socket.off('messageHistory');
      socket.off('message');
      socket.off('systemMessage');
      socket.off('roomUsers');
    };
  }, [socket, userId, room, messages, currentUserPhotoUrl]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() && room && socket) {
      let animalText = '';
      if (!user.isHuman) {
        const sounds = user.animalType === 'Кошка' ? catSounds : dogSounds;
        const parts = message.match(/[^\s,.!?;:]+[,.!?;:]*/g) || message.split(/\s+/);
        animalText = parts
          .map((part, index) => {
            const wordMatch = part.match(/^([^\s,.!?;:]+)([,.!?;:]*)$/);
            if (wordMatch) {
              const [, word, punctuation] = wordMatch;
              const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
              const isUpperCase = word.charAt(0) === word.charAt(0).toUpperCase();
              const transformedSound = isUpperCase ? randomSound.charAt(0).toUpperCase() + randomSound.slice(1) : randomSound;
              return transformedSound + punctuation;
            }
            return part;
          })
          .join(' ');
      }

      const newMessage = {
        text: message,
        room,
        timestamp: new Date().toISOString(),
        photoUrl: currentUserPhotoUrl || '',
        animalText: animalText || undefined
      };
      console.log('Sending message:', newMessage);
      socket.emit('sendMessage', newMessage);
      setMessage('');
    }
  };

  const getAuthorName = (msg) => {
    if (msg.userId === userId) return '';

    if (msg.isHuman === false && msg.name) {
      return msg.name;
    }

    const parts = [];
    if (msg.firstName) parts.push(msg.firstName);
    if (msg.username) parts.push(`@${msg.username}`);
    if (msg.lastName) parts.push(msg.lastName);
    return parts.length > 0 ? parts.join(' ') : `User ${msg.userId}`;
  };

  const getAvatar = (msg) => {
    // console.log('Getting avatar for:', { userId: msg.userId, photoUrl: msg.photoUrl, currentUserPhotoUrl });
    const initial = (msg.firstName || msg.userId || 'U').charAt(0).toUpperCase();

    // Проверяем кэш для NPC и системных сообщений
    if (msg.isSystem) {
      // Для системных сообщений используем дефолтный аватар или пустой
      return <DefaultAvatar>{initial || 'С'}</DefaultAvatar>;
    }

    // Проверяем кэш для NPC
    if (msg.userId && msg.userId.startsWith('npc_')) {
      const cachedPhotoUrl = avatarCacheRef.current.get(msg.userId);
      if (cachedPhotoUrl) {
        console.log(`Using cached avatar for ${msg.userId}: ${cachedPhotoUrl}`);
        return cachedPhotoUrl.trim() ? (
          <Avatar src={cachedPhotoUrl} alt="Avatar" />
        ) : (
          <DefaultAvatar>{initial}</DefaultAvatar>
        );
      }
      // Сохраняем в кэш, если не найдено
      if (msg.photoUrl) {
        avatarCacheRef.current.set(msg.userId, msg.photoUrl);
        console.log(`Caching avatar for ${msg.userId}: ${msg.photoUrl}`);
      }
    }

    if (msg.userId === userId) {
      return currentUserPhotoUrl && currentUserPhotoUrl.trim() ? (
        <Avatar src={currentUserPhotoUrl} alt="Avatar" />
      ) : (
        <DefaultAvatar>{initial}</DefaultAvatar>
      );
    }

    return msg.photoUrl && msg.photoUrl.trim() ? (
      <Avatar src={msg.photoUrl} alt="Avatar" />
    ) : (
      <DefaultAvatar>{initial}</DefaultAvatar>
    );
  };

  const getUserDisplayName = (user) => {
    if (user.isHuman === false && user.name) {
      return user.name;
    }
    return user.firstName || `User ${user.userId}`;
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

  const getDisplayText = (msg) => {
    if (!msg.isHuman && user.isHuman) {
      return msg.animalText || msg.text;
    }
    return msg.text;
  };

  return (
    <ChatContainer>
      <MessagesContainer ref={messagesContainerRef} room={room} theme={theme}>
        {messages.map((msg, index) => (
          <Message
            key={index}
            isOwn={msg.userId === userId}
            theme={theme}
            isSystem={msg.isSystem}
          >
            {msg.isSystem ? (
              <MessageContent>
                <MessageText theme={theme} isSystem={true}>{msg.text}</MessageText>
                <Timestamp theme={theme}>{formatTimestamp(msg.timestamp)}</Timestamp>
              </MessageContent>
            ) : (
              <>
                {msg.userId !== userId && (
                  <MessageHeader>
                    {getAvatar(msg)}
                    <MessageName theme={theme}>{getAuthorName(msg)}</MessageName>
                  </MessageHeader>
                )}
                <MessageContent>
                  <MessageText theme={theme} isOwn={msg.userId === userId}>{getDisplayText(msg)}</MessageText>
                  <Timestamp theme={theme}>{formatTimestamp(msg.timestamp)}</Timestamp>
                </MessageContent>
              </>
            )}
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <InputContainer theme={theme}>
        <UsersButton onClick={toggleUserList}>
          <UsersIcon />
          <UserCount>{users.length}</UserCount>
        </UsersButton>
        {room && room.startsWith('myhome_') && !user.homeless && (
          <ShelterIcon onClick={toggleShelter} theme={theme}>
            <MdVisibility />
          </ShelterIcon>
        )}
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
              {getAvatar(user)}
              {user.onLeash && !user.isHuman && <LeashIcon src={PovodokIcon} alt="Поводок" />}
              <UserName theme={theme}>{getUserDisplayName(user)}</UserName>
            </UserItem>
          ))}
        </UserListModal>
      )}
    </ChatContainer>
  );
}

export default Chat;
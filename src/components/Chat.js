import React, { useState, useEffect, useRef } from 'react';

import BouncingBall from './BouncingBall';

import { catSounds, dogSounds } from './constants/animalSounds';
import npcBelochkaImage from '../images/npc_belochka.jpg';
import npcFoxImage from '../images/npc_fox.jpg';
import npcEzhikImage from '../images/npc_ezhik.jpg';
import npcSecurityImage from '../images/npc_security.jpg';
import npcGuardImage from '../images/npc_guard.jpg';
import babushka1Image from '../images/babushka_1.jpg';
import babushka2Image from '../images/babushka_2.jpg';
import babushka3Image from '../images/babushka_3.jpg';
import volonterIraImage from '../images/volonter_Ira.jpg';
import volonterKatyaImage from '../images/volonter_Katya.jpg';
import volonterZhannaImage from '../images/volonter_Zhanna.jpg';
import lovec1Image from '../images/lovec_1.jpg';
import lovec2Image from '../images/lovec_2.jpg';
import prodavecSvetaImage from '../images/prodavec_Sveta.jpg';
import PovodokIcon from '../images/povodok.png'; // Импорт иконки

import lostDogImage from '../images/lost_dog_1.jpg';
import smallDogImage from '../images/small_dog_1.jpg';
import illDogImage from '../images/ill_dog_1.jpg';
import limpDogImage from '../images/limp_dog_1.jpg';
import sadDogImage from '../images/sad_dog_1.jpg';
import madDog1Image from '../images/mad_dog_1.jpg';
import madDog2Image from '../images/mad_dog_2.jpg';

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
  LeashIcon
} from '../styles/ChatStyles';

function Chat({ userId, room, theme, socket, joinedRoomsRef, user }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);
  const messageCacheRef = useRef({});

  const messagesContainerRef = useRef(null);

  const currentUserPhotoUrl = user?.photoUrl || '';

  // Проверка времени для появления бабушек (6:00–7:00)
  const isBabushkaTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return hours === 6 && minutes >= 0 && minutes <= 59;
  };

  // Проверка времени для волонтёров Иры и Кати (8:03–20:05)
  const isIraKatyaTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 8 * 60 + 3; // 8:03
    const endMinutes = 20 * 60 + 5;  // 20:05
    return totalMinutes >= startMinutes && totalMinutes <= endMinutes;
  };

  // Проверка времени для волонтёра Жанны (19:53–8:12 следующего дня)
  const isZhannaTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 19 * 60 + 53; // 19:53
    const endMinutes = 8 * 60 + 12;    // 8:12
    return totalMinutes >= startMinutes || totalMinutes <= endMinutes;
  };

  // Проверка времени для Ловца животных в Парке (8:00–23:00, чётные часы)
  const isLovecParkTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 8 * 60;   // 8:00
    const endMinutes = 23 * 60;    // 23:00
    return totalMinutes >= startMinutes && totalMinutes <= endMinutes && hours % 2 === 0;
  };

  // Проверка времени для Ловца животных в Районе Дачном (7:00–22:00, нечётные часы)
  const isLovecDachnyTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 7 * 60;   // 7:00
    const endMinutes = 22 * 60;    // 22:00
    return totalMinutes >= startMinutes && totalMinutes <= endMinutes && hours % 2 !== 0;
  };

  useEffect(() => {
    if (room === 'Парк') {
      const belochka = { userId: 'npc_belochka', firstName: 'Белочка', photoUrl: npcBelochkaImage, isHuman: false };
      const lovecPark = { userId: 'npc_lovec_park', firstName: 'Ловец животных', photoUrl: lovec1Image, isHuman: true };
      setUsers(prevUsers => {
        const updatedUsers = [...prevUsers];
        if (!prevUsers.some(user => user.userId === 'npc_belochka')) updatedUsers.unshift(belochka);
        if (isLovecParkTime() && !prevUsers.some(user => user.userId === 'npc_lovec_park')) updatedUsers.unshift(lovecPark);
        return updatedUsers;
      });
    } else if (room === 'Лес') {
      const fox = { userId: 'npc_fox', firstName: 'Лисичка', photoUrl: npcFoxImage, isHuman: false };
      const ezhik = { userId: 'npc_ezhik', firstName: 'Ёжик', photoUrl: npcEzhikImage, isHuman: false };
      setUsers(prevUsers => {
        const updatedUsers = [...prevUsers];
        if (!prevUsers.some(user => user.userId === 'npc_fox')) updatedUsers.unshift(fox);
        if (!prevUsers.some(user => user.userId === 'npc_ezhik')) updatedUsers.unshift(ezhik);
        return updatedUsers;
      });
    } else if (room === 'Район Дачный') {
      const security = { userId: 'npc_security', firstName: 'Охранник', photoUrl: npcSecurityImage, isHuman: true };
      const lovecDachny = { userId: 'npc_lovec_dachny', firstName: 'Ловец животных', photoUrl: lovec2Image, isHuman: true };
      setUsers(prevUsers => {
        const updatedUsers = [...prevUsers];
        if (!prevUsers.some(user => user.userId === 'npc_security')) updatedUsers.unshift(security);
        if (isLovecDachnyTime() && !prevUsers.some(user => user.userId === 'npc_lovec_dachny')) updatedUsers.unshift(lovecDachny);
        return updatedUsers;
      });
    } else if (room === 'Завод') {
      const guard = { userId: 'npc_guard', firstName: 'Сторож', photoUrl: npcGuardImage, isHuman: true };
      setUsers(prevUsers => !prevUsers.some(user => user.userId === 'npc_guard') ? [guard, ...prevUsers] : prevUsers);
    } else if (room === 'Автобусная остановка' && isBabushkaTime()) {
      const babushkaGalya = { userId: 'npc_babushka_galya', firstName: 'Бабушка Галя', photoUrl: babushka1Image, isHuman: true };
      const babushkaVera = { userId: 'npc_babushka_vera', firstName: 'Бабушка Вера', photoUrl: babushka2Image, isHuman: true };
      const babushkaZina = { userId: 'npc_babushka_zina', firstName: 'Бабушка Зина', photoUrl: babushka3Image, isHuman: true };
      setUsers(prevUsers => {
        const updatedUsers = [...prevUsers];
        if (!prevUsers.some(user => user.userId === 'npc_babushka_galya')) updatedUsers.unshift(babushkaGalya);
        if (!prevUsers.some(user => user.userId === 'npc_babushka_vera')) updatedUsers.unshift(babushkaVera);
        if (!prevUsers.some(user => user.userId === 'npc_babushka_zina')) updatedUsers.unshift(babushkaZina);
        return updatedUsers;
      });
    } else if (room === 'Приют для животных "Кошкин дом"') {
      const volonterIra = { userId: 'npc_volonter_ira', firstName: 'Волонтёр Ира', photoUrl: volonterIraImage, isHuman: true };
      const volonterKatya = { userId: 'npc_volonter_katya', firstName: 'Волонтёр Катя', photoUrl: volonterKatyaImage, isHuman: true };
      const volonterZhanna = { userId: 'npc_volonter_zhanna', firstName: 'Волонтёр Жанна', photoUrl: volonterZhannaImage, isHuman: true };
      setUsers(prevUsers => {
        const updatedUsers = [...prevUsers];
        if (isIraKatyaTime()) {
          if (!prevUsers.some(user => user.userId === 'npc_volonter_ira')) updatedUsers.unshift(volonterIra);
          if (!prevUsers.some(user => user.userId === 'npc_volonter_katya')) updatedUsers.unshift(volonterKatya);
        }
        if (isZhannaTime()) {
          if (!prevUsers.some(user => user.userId === 'npc_volonter_zhanna')) updatedUsers.unshift(volonterZhanna);
        }
        return updatedUsers;
      });
    } else if (room === 'Магазин "Всё на свете"') {
      const prodavecSveta = { userId: 'npc_prodavec_sveta', firstName: 'Продавщица Света', photoUrl: prodavecSvetaImage, isHuman: true };
      setUsers(prevUsers => {
        const updatedUsers = [...prevUsers];
        if (!prevUsers.some(user => user.userId === 'npc_prodavec_sveta')) updatedUsers.unshift(prodavecSveta);
        return updatedUsers;
      });
    } else if (room === 'Под мостом') {
      // Добавляем новых NPC для локации "Под мостом"
      const lostDog = { userId: 'npc_lost_dog', firstName: 'Потерявшийся пёс', photoUrl: lostDogImage, isHuman: false };
      const smallDog = { userId: 'npc_small_dog', firstName: 'Маленький бездомный пёсик', photoUrl: smallDogImage, isHuman: false };
      const illDog = { userId: 'npc_ill_dog', firstName: 'Больная бездомная собака', photoUrl: illDogImage, isHuman: false };
      const limpDog = { userId: 'npc_limp_dog', firstName: 'Хромая бездомная собака', photoUrl: limpDogImage, isHuman: false };
      const sadDog = { userId: 'npc_sad_dog', firstName: 'Грустная бездомная собака', photoUrl: sadDogImage, isHuman: false };
      const madDog1 = { userId: 'npc_mad_dog_1', firstName: 'Злая бездомная собака', photoUrl: madDog1Image, isHuman: false };
      const madDog2 = { userId: 'npc_mad_dog_2', firstName: 'Злой бездомный пёс', photoUrl: madDog2Image, isHuman: false };
      setUsers(prevUsers => {
        const updatedUsers = [...prevUsers];
        if (!prevUsers.some(user => user.userId === 'npc_lost_dog')) updatedUsers.unshift(lostDog);
        if (!prevUsers.some(user => user.userId === 'npc_small_dog')) updatedUsers.unshift(smallDog);
        if (!prevUsers.some(user => user.userId === 'npc_ill_dog')) updatedUsers.unshift(illDog);
        if (!prevUsers.some(user => user.userId === 'npc_limp_dog')) updatedUsers.unshift(limpDog);
        if (!prevUsers.some(user => user.userId === 'npc_sad_dog')) updatedUsers.unshift(sadDog);
        if (!prevUsers.some(user => user.userId === 'npc_mad_dog_1')) updatedUsers.unshift(madDog1);
        if (!prevUsers.some(user => user.userId === 'npc_mad_dog_2')) updatedUsers.unshift(madDog2);
        return updatedUsers;
      });
    } else {
      setUsers(prevUsers => prevUsers.filter(user => ![
        'npc_belochka', 'npc_fox', 'npc_ezhik', 'npc_security', 'npc_guard',
        'npc_babushka_galya', 'npc_babushka_vera', 'npc_babushka_zina',
        'npc_volonter_ira', 'npc_volonter_katya', 'npc_volonter_zhanna',
        'npc_lovec_park', 'npc_lovec_dachny', 'npc_prodavec_sveta',
        'npc_lost_dog', 'npc_small_dog', 'npc_ill_dog', 'npc_limp_dog',
        'npc_sad_dog', 'npc_mad_dog_1', 'npc_mad_dog_2' // Добавляем новые NPC в фильтр
      ].includes(user.userId)));
    }
  }, [room]);

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
      let updatedUsers = roomUsers.map(roomUser => {
        if (roomUser.userId === userId) {
          return { ...roomUser, photoUrl: currentUserPhotoUrl };
        }
        return roomUser;
      });
      // Логика добавления NPC остаётся прежней
      if (room === 'Парк') {
        updatedUsers = [{ userId: 'npc_belochka', firstName: 'Белочка', photoUrl: npcBelochkaImage, isHuman: false }, ...updatedUsers];
        if (isLovecParkTime()) {
          updatedUsers = [{ userId: 'npc_lovec_park', firstName: 'Ловец животных', photoUrl: lovec1Image, isHuman: true }, ...updatedUsers];
        }
      } else if (room === 'Лес') {
        updatedUsers = [
          { userId: 'npc_fox', firstName: 'Лисичка', photoUrl: npcFoxImage, isHuman: false },
          { userId: 'npc_ezhik', firstName: 'Ёжик', photoUrl: npcEzhikImage, isHuman: false },
          ...updatedUsers
        ];
      } else if (room === 'Район Дачный') {
        updatedUsers = [{ userId: 'npc_security', firstName: 'Охранник', photoUrl: npcSecurityImage, isHuman: true }, ...updatedUsers];
        if (isLovecDachnyTime()) {
          updatedUsers = [{ userId: 'npc_lovec_dachny', firstName: 'Ловец животных', photoUrl: lovec2Image, isHuman: true }, ...updatedUsers];
        }
      } else if (room === 'Завод') {
        updatedUsers = [{ userId: 'npc_guard', firstName: 'Сторож', photoUrl: npcGuardImage, isHuman: true }, ...updatedUsers];
      } else if (room === 'Автобусная остановка' && isBabushkaTime()) {
        updatedUsers = [
          { userId: 'npc_babushka_galya', firstName: 'Бабушка Галя', photoUrl: babushka1Image, isHuman: true },
          { userId: 'npc_babushka_vera', firstName: 'Бабушка Вера', photoUrl: babushka2Image, isHuman: true },
          { userId: 'npc_babushka_zina', firstName: 'Бабушка Зина', photoUrl: babushka3Image, isHuman: true },
          ...updatedUsers
        ];
      } else if (room === 'Магазин "Всё на свете"') {
        updatedUsers = [{ userId: 'npc_prodavec_sveta', firstName: 'Продавщица Света', photoUrl: prodavecSvetaImage, isHuman: true }, ...updatedUsers];
      } else if (room === 'Приют для животных "Кошкин дом"') {
        if (isIraKatyaTime()) {
          updatedUsers = [
            { userId: 'npc_volonter_ira', firstName: 'Волонтёр Ира', photoUrl: volonterIraImage, isHuman: true },
            { userId: 'npc_volonter_katya', firstName: 'Волонтёр Катя', photoUrl: volonterKatyaImage, isHuman: true },
            ...updatedUsers
          ];
        }
        if (isZhannaTime()) {
          updatedUsers = [
            { userId: 'npc_volonter_zhanna', firstName: 'Волонтёр Жанна', photoUrl: volonterZhannaImage, isHuman: true },
            ...updatedUsers
          ];
        }
      } else if (room === 'Под мостом') {
        // Добавляем новых NPC для локации "Под мостом" в обработчике roomUsers
        updatedUsers = [
          { userId: 'npc_lost_dog', firstName: 'Потерявшийся пёс', photoUrl: lostDogImage, isHuman: false },
          { userId: 'npc_small_dog', firstName: 'Маленький бездомный пёсик', photoUrl: smallDogImage, isHuman: false },
          { userId: 'npc_ill_dog', firstName: 'Больная бездомная собака', photoUrl: illDogImage, isHuman: false },
          { userId: 'npc_limp_dog', firstName: 'Хромая бездомная собака', photoUrl: limpDogImage, isHuman: false },
          { userId: 'npc_sad_dog', firstName: 'Грустная бездомная собака', photoUrl: sadDogImage, isHuman: false },
          { userId: 'npc_mad_dog_1', firstName: 'Злая бездомная собака', photoUrl: madDog1Image, isHuman: false },
          { userId: 'npc_mad_dog_2', firstName: 'Злой бездомный пёс', photoUrl: madDog2Image, isHuman: false },
          ...updatedUsers
        ];
      }
      console.log('Updated users in room:', updatedUsers);
      setUsers(updatedUsers);
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
    console.log('Getting avatar for:', { userId: msg.userId, photoUrl: msg.photoUrl, currentUserPhotoUrl });
    const initial = (msg.firstName || msg.userId || 'U').charAt(0).toUpperCase();

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
            isSystem={msg.isSystem} // Добавляем проп для системных сообщений
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
        <BouncingBall room={room} containerRef={messagesContainerRef} />
      </MessagesContainer>
      {/* <BouncingBall room={room} /> */}
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
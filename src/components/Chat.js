import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaUsers, FaPaperPlane } from 'react-icons/fa';
import { catSounds, dogSounds } from './animalSounds';
import busStationImage from '../images/bus_station.jpg';
import myRoomImage from '../images/my_room.jpg';
import trainStationImage from '../images/train_station.jpg';
import zhkSferaImage from '../images/zhk_sfera.jpg';
import factoryImage from '../images/factory.jpg';
import forestImage from '../images/forest.jpg';
import parkImage from '../images/park.jpg';
import villageImage from '../images/village.jpg';
import npcBelochkaImage from '../images/npc_belochka.jpg';
import npcFoxImage from '../images/npc_fox.jpg';
import npcEzhikImage from '../images/npc_ezhik.jpg';
import npcSecurityImage from '../images/npc_security.jpg';
import npcGuardImage from '../images/npc_guard.jpg';
import barImage from '../images/bar.jpg';
import cafeImage from '../images/cafe.jpg';
import priyutImage from '../images/priyut.jpg';
import albionImage from '../images/albion.jpg';
import karnavalImage from '../images/univermag.jpg';
import poligonImage from '../images/poligon.jpg';
import workshopImage from '../images/workshop.jpg';
import babushka1Image from '../images/babushka_1.jpg';
import babushka2Image from '../images/babushka_2.jpg';
import babushka3Image from '../images/babushka_3.jpg';
import volonterIraImage from '../images/volonter_Ira.jpg';
import volonterKatyaImage from '../images/volonter_Katya.jpg';
import volonterZhannaImage from '../images/volonter_Zhanna.jpg';
import lovec1Image from '../images/lovec_1.jpg';
import lovec2Image from '../images/lovec_2.jpg';
import povodokIcon from '../images/povodok.png';
import prodavecSvetaImage from '../images/prodavec_Sveta.jpg';

// Анимация затемнения
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

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
  margin-left: 5px;
`;

const PovodokIcon = styled.img`
  width: 16px;
  height: 16px;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
  z-index: 100;
  pointer-events: none;
  opacity: ${props => props.opacity};
  animation: ${props => props.transition === 'fadeOut' ? fadeOut : fadeIn} 3s ease-in-out forwards;
`;

function Chat({ userId, room, theme, socket, joinedRoomsRef, user }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [transitionState, setTransitionState] = useState(null); // 'fadeOut', 'fadeIn', null
  const [pendingRoom, setPendingRoom] = useState(null); // Комната, в которую переходим
  const [currentRoom, setCurrentRoom] = useState(room); // Текущая комната для рендера
  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);
  const messageCacheRef = useRef({});

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
    const startMinutes = 8 * 60 + 3;
    const endMinutes = 20 * 60 + 5;
    return totalMinutes >= startMinutes && totalMinutes <= endMinutes;
  };

  // Проверка времени для волонтёра Жанны (19:53–8:12 следующего дня)
  const isZhannaTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 19 * 60 + 53;
    const endMinutes = 8 * 60 + 12;
    return totalMinutes >= startMinutes || totalMinutes <= endMinutes;
  };

  // Проверка времени для Ловца животных в Парке (8:00–23:00, чётные часы)
  const isLovecParkTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 8 * 60;
    const endMinutes = 23 * 60;
    return totalMinutes >= startMinutes && totalMinutes <= endMinutes && hours % 2 === 0;
  };

  // Проверка времени для Ловца животных в Районе Дачном (7:00–22:00, нечётные часы)
  const isLovecDachnyTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 7 * 60;
    const endMinutes = 22 * 60;
    return totalMinutes >= startMinutes && totalMinutes <= endMinutes && hours % 2 !== 0;
  };

  // Обновление списка пользователей при смене комнаты
  useEffect(() => {
    if (currentRoom === 'Парк') {
      const belochka = { userId: 'npc_belochka', firstName: 'Белочка', photoUrl: npcBelochkaImage, isHuman: false };
      const lovecPark = { userId: 'npc_lovec_park', firstName: 'Ловец животных', photoUrl: lovec1Image, isHuman: true };
      setUsers(prevUsers => {
        const updatedUsers = [...prevUsers];
        if (!prevUsers.some(user => user.userId === 'npc_belochka')) updatedUsers.unshift(belochka);
        if (isLovecParkTime() && !prevUsers.some(user => user.userId === 'npc_lovec_park')) updatedUsers.unshift(lovecPark);
        return updatedUsers;
      });
    } else if (currentRoom === 'Лес') {
      const fox = { userId: 'npc_fox', firstName: 'Лисичка', photoUrl: npcFoxImage, isHuman: false };
      const ezhik = { userId: 'npc_ezhik', firstName: 'Ёжик', photoUrl: npcEzhikImage, isHuman: false };
      setUsers(prevUsers => {
        const updatedUsers = [...prevUsers];
        if (!prevUsers.some(user => user.userId === 'npc_fox')) updatedUsers.unshift(fox);
        if (!prevUsers.some(user => user.userId === 'npc_ezhik')) updatedUsers.unshift(ezhik);
        return updatedUsers;
      });
    } else if (currentRoom === 'Район Дачный') {
      const security = { userId: 'npc_security', firstName: 'Охранник', photoUrl: npcSecurityImage, isHuman: true };
      const lovecDachny = { userId: 'npc_lovec_dachny', firstName: 'Ловец животных', photoUrl: lovec2Image, isHuman: true };
      setUsers(prevUsers => {
        const updatedUsers = [...prevUsers];
        if (!prevUsers.some(user => user.userId === 'npc_security')) updatedUsers.unshift(security);
        if (isLovecDachnyTime() && !prevUsers.some(user => user.userId === 'npc_lovec_dachny')) updatedUsers.unshift(lovecDachny);
        return updatedUsers;
      });
    } else if (currentRoom === 'Завод') {
      const guard = { userId: 'npc_guard', firstName: 'Сторож', photoUrl: npcGuardImage, isHuman: true };
      setUsers(prevUsers => !prevUsers.some(user => user.userId === 'npc_guard') ? [guard, ...prevUsers] : prevUsers);
    } else if (currentRoom === 'Автобусная остановка' && isBabushkaTime()) {
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
    } else if (currentRoom === 'Приют для животных "Кошкин дом"') {
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
    } else if (currentRoom === 'Магазин "Всё на свете"') {
      const prodavecSveta = { userId: 'npc_prodavec_sveta', firstName: 'Продавщица Света', photoUrl: prodavecSvetaImage, isHuman: true };
      setUsers(prevUsers => {
        const updatedUsers = [...prevUsers];
        if (!prevUsers.some(user => user.userId === 'npc_prodavec_sveta')) updatedUsers.unshift(prodavecSveta);
        return updatedUsers;
      });
    } else {
      setUsers(prevUsers => prevUsers.filter(user => ![
        'npc_belochka', 'npc_fox', 'npc_ezhik', 'npc_security', 'npc_guard',
        'npc_babushka_galya', 'npc_babushka_vera', 'npc_babushka_zina',
        'npc_volonter_ira', 'npc_volonter_katya', 'npc_volonter_zhanna',
        'npc_lovec_park', 'npc_lovec_dachny'
      ].includes(user.userId)));
    }
  }, [currentRoom]);

  // Обработка смены комнаты
  useEffect(() => {
    if (room !== currentRoom && !transitionState) {
      // Начинаем переход: затемнение
      setPendingRoom(room);
      setTransitionState('fadeOut');
    }
  }, [room, currentRoom, transitionState]);

  // Обработка завершения анимации затемнения
  const handleFadeOutEnd = () => {
    if (transitionState === 'fadeOut' && pendingRoom) {
      // Завершено затемнение, меняем комнату
      setCurrentRoom(pendingRoom);
      setMessages([]); // Очищаем сообщения
      messageCacheRef.current[pendingRoom] = []; // Очищаем кэш для новой комнаты
      setTransitionState('fadeIn'); // Начинаем проявление
      // Запрашиваем данные для новой комнаты
      if (socket && pendingRoom) {
        socket.emit('joinRoom', { room: pendingRoom, lastTimestamp: null });
      }
    }
  };

  // Обработка завершения анимации проявления
  const handleFadeInEnd = () => {
    setTransitionState(null); // Завершаем переход
    setPendingRoom(null);
  };

  // Основная логика сокетов
  useEffect(() => {
    if (!socket || !currentRoom) return;

    // Очищаем кэш при смене комнаты
    if (!messageCacheRef.current[currentRoom]) {
      messageCacheRef.current[currentRoom] = [];
    }

    const cachedMessages = messageCacheRef.current[currentRoom] || [];
    if (cachedMessages.length > 0 && messages.length === 0) {
      setMessages(cachedMessages);
    }

    socket.on('messageHistory', (history) => {
      setMessages(prev => {
        const cached = messageCacheRef.current[currentRoom] || [];
        const newMessages = [...cached, ...history].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        messageCacheRef.current[currentRoom] = newMessages;
        return newMessages;
      });
    });

    socket.on('message', (msg) => {
      if (msg.room === currentRoom) {
        setMessages(prev => {
          const updated = [...prev, msg];
          messageCacheRef.current[currentRoom] = updated;
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
      if (currentRoom === 'Парк') {
        updatedUsers = [{ userId: 'npc_belochka', firstName: 'Белочка', photoUrl: npcBelochkaImage, isHuman: false }, ...updatedUsers];
        if (isLovecParkTime()) {
          updatedUsers = [{ userId: 'npc_lovec_park', firstName: 'Ловец животных', photoUrl: lovec1Image, isHuman: true }, ...updatedUsers];
        }
      } else if (currentRoom === 'Лес') {
        updatedUsers = [
          { userId: 'npc_fox', firstName: 'Лисичка', photoUrl: npcFoxImage, isHuman: false },
          { userId: 'npc_ezhik', firstName: 'Ёжик', photoUrl: npcEzhikImage, isHuman: false },
          ...updatedUsers
        ];
      } else if (currentRoom === 'Район Дачный') {
        updatedUsers = [{ userId: 'npc_security', firstName: 'Охранник', photoUrl: npcSecurityImage, isHuman: true }, ...updatedUsers];
        if (isLovecDachnyTime()) {
          updatedUsers = [{ userId: 'npc_lovec_dachny', firstName: 'Ловец животных', photoUrl: lovec2Image, isHuman: true }, ...updatedUsers];
        }
      } else if (currentRoom === 'Завод') {
        updatedUsers = [{ userId: 'npc_guard', firstName: 'Сторож', photoUrl: npcGuardImage, isHuman: true }, ...updatedUsers];
      } else if (currentRoom === 'Автобусная остановка' && isBabushkaTime()) {
        updatedUsers = [
          { userId: 'npc_babushka_galya', firstName: 'Бабушка Галя', photoUrl: babushka1Image, isHuman: true },
          { userId: 'npc_babushka_vera', firstName: 'Бабушка Вера', photoUrl: babushka2Image, isHuman: true },
          { userId: 'npc_babushka_zina', firstName: 'Бабушка Зина', photoUrl: babushka3Image, isHuman: true },
          ...updatedUsers
        ];
      } else if (currentRoom === 'Магазин "Всё на свете"') {
        updatedUsers = [{ userId: 'npc_prodavec_sveta', firstName: 'Продавщица Света', photoUrl: prodavecSvetaImage, isHuman: true }, ...updatedUsers];
      } else if (currentRoom === 'Приют для животных "Кошкин дом"') {
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
      }
      console.log('Updated users in room:', updatedUsers);
      setUsers(updatedUsers);
    });

    if (!messageCacheRef.current[currentRoom]?.length) {
      socket.emit('joinRoom', { room: currentRoom, lastTimestamp: null });
    }

    return () => {
      socket.off('messageHistory');
      socket.off('message');
      socket.off('roomUsers');
    };
  }, [socket, userId, currentRoom, messages, currentUserPhotoUrl]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() && currentRoom && socket) {
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
        room: currentRoom,
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
      <MessagesContainer room={currentRoom} theme={theme}>
        {messages.map((msg, index) => (
          <Message key={index} isOwn={msg.userId === userId} theme={theme}>
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
          placeholder={currentRoom ? "Напишите сообщение..." : "Выберите комнату на вкладке Карта"}
          disabled={!currentRoom}
          theme={theme}
        />
        <SendIcon onClick={sendMessage} disabled={!currentRoom} />
      </InputContainer>
      {showUserList && currentRoom && (
        <UserListModal ref={modalRef} onClick={handleModalClick} theme={theme}>
          <ModalTitle theme={theme}>Онлайн</ModalTitle>
          {users.map((user, index) => (
            <UserItem key={index}>
              {getAvatar(user)}
              {user.onLeash && !user.isHuman && <PovodokIcon src={povodokIcon} alt="Поводок" />}
              <UserName theme={theme}>{getUserDisplayName(user)}</UserName>
            </UserItem>
          ))}
        </UserListModal>
      )}
      {transitionState && (
        <Overlay
          transition={transitionState}
          opacity={transitionState === 'fadeOut' ? 0 : 1}
          onAnimationEnd={transitionState === 'fadeOut' ? handleFadeOutEnd : handleFadeInEnd}
        />
      )}
    </ChatContainer>
  );
}

export default Chat;
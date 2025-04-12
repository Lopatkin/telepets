import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import Chat from './components/Chat';
import Header from './components/Header';
import Footer from './components/Footer';
import Profile from './components/Profile';
import Map from './components/Map';
import Actions from './components/Actions';
import Inventory from './components/Inventory';
import { ClipLoader } from 'react-spinners';
import Registration from './components/Registration';

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const LoadingContainer = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${props => props.theme === 'dark' ? '#1A1A1A' : '#fff'};
`;

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [theme, setTheme] = useState('telegram');
  const [telegramTheme, setTelegramTheme] = useState('light');
  const socketRef = useRef(null);
  const joinedRoomsRef = useRef(new Set());
  const [socket, setSocket] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [personalItems, setPersonalItems] = useState([]);
  const [pets, setPets] = useState([]); // Новое состояние для питомцев
  const [isRegistered, setIsRegistered] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const closeActionModal = () => {
    console.log('Closing action modal'); // Отладка
    setIsActionModalOpen(false);
  };

  const handleItemsUpdate = (items) => {
    setPersonalItems(items.filter(item => item.owner === `user_${user?.userId}`));
  };

  useEffect(() => {
    const initializeSocket = () => {
      if (socketRef.current) return;

      socketRef.current = io(process.env.REACT_APP_SERVER_URL || 'https://telepets.onrender.com', {
        cors: {
          origin: process.env.FRONTEND_URL || "https://telepets.netlify.app",
          methods: ["GET", "POST"]
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current.id);
        setSocket(socketRef.current);

        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.ready();
          const telegramData = window.Telegram.WebApp.initDataUnsafe;
          if (telegramData?.user?.id) {
            const initialUserData = {
              userId: telegramData.user.id.toString(),
              firstName: telegramData.user.first_name || 'User',
              username: telegramData.user.username || '',
              lastName: telegramData.user.last_name || '',
              photoUrl: telegramData.user.photo_url || '',
              owner: telegramData.isHuman === false ? null : undefined // Добавляем owner для животных
            };
            // Загружаем последнюю комнату из localStorage, по умолчанию "Полигон утилизации"
            const lastRoom = JSON.parse(localStorage.getItem('userRooms') || '{}')[telegramData.user.id] || 'Полигон утилизации';
            console.log('Загружена последняя комната из localStorage:', lastRoom); // Для отладки
            socketRef.current.emit('auth', { ...initialUserData });
            setTelegramTheme(window.Telegram.WebApp.colorScheme || 'light');
          } else {
            const testUser = {
              userId: 'test123',
              firstName: 'Test User',
              isHuman: false // Предполагаем, что тестовый пользователь — человек
            };
            const lastRoom = 'Полигон утилизации';
            console.log('Используется дефолтная комната для тестового пользователя:', lastRoom); // Для отладки
            socketRef.current.emit('auth', { ...testUser });
            setTelegramTheme('light');
          }
        } else {
          const testUser = {
            userId: 'test123',
            firstName: 'Test User',
            isHuman: false // Предполагаем, что тестовый пользователь — человек
          };
          const lastRoom = 'Полигон утилизации';
          console.log('Используется дефолтная комната для тестового пользователя:', lastRoom); // Для отладки
          socketRef.current.emit('auth', { ...testUser });
          setTelegramTheme('light');
        }

        socketRef.current.on('userUpdate', (updatedUser) => {
          console.log('Received userUpdate from server:', updatedUser);
          setUser(prevUser => {
            const newUser = {
              ...prevUser,
              ...updatedUser,
              credits: updatedUser.credits !== undefined ? updatedUser.credits : (prevUser?.credits || 0),
              homeless: updatedUser.homeless ?? (updatedUser.isHuman ? false : true) // Значение по умолчанию
            };
            console.log('Updated user state after userUpdate:', newUser);
            return newUser;
          });
          if (updatedUser.isRegistered !== undefined) {
            setIsRegistered(updatedUser.isRegistered);
          }
          // Запрашиваем питомцев для человека
          if (updatedUser.isHuman) {
            socketRef.current.emit('getPets', { userId: updatedUser.userId });
          }
        });

        // Обработка добавления нового питомца
        socketRef.current.on('takeAnimalHomeSuccess', ({ animalId, owner, animal }) => {
          if (owner === user?.userId) {
            setPets(prevPets => [...prevPets, animal]);
          }
        });

        // Новый обработчик для получения списка питомцев
        socketRef.current.on('petsList', (petsData) => {
          setPets(petsData.map(pet => ({
            userId: pet.userId,
            name: pet.name,
            animalType: pet.animalType,
            photoUrl: pet.photoUrl,
            onLeash: pet.onLeash,
            owner: pet.owner
          })));
        });
      });

      socketRef.current.on('leashStatus', ({ onLeash }) => {
        setUser((prev) => ({ ...prev, onLeash }));
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setSocket(null);
        setIsAuthenticated(false);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
      });

      socketRef.current.on('authSuccess', ({ defaultRoom, isRegistered }) => {
        console.log('Authentication successful, received defaultRoom:', defaultRoom, 'isRegistered:', isRegistered);
        setIsAuthenticated(true);
        setIsRegistered(isRegistered);
        if (isRegistered) {
          setCurrentRoom(defaultRoom);
          joinedRoomsRef.current.add(defaultRoom);
          socketRef.current.emit('joinRoom', { room: defaultRoom, lastTimestamp: null });
        }
      });

      socketRef.current.on('userUpdate', (updatedUser) => {
        console.log('Received userUpdate from server:', updatedUser);
        setUser(prevUser => {
          if (!prevUser) {
            // Если user ещё не инициализирован, используем полный объект
            return updatedUser;
          }
          // Обновляем только те поля, которые пришли в updatedUser
          const newUser = { ...prevUser, ...updatedUser };
          console.log('Updated user state after userUpdate:', newUser);
          return newUser;
        });
        if (updatedUser.isRegistered !== undefined) {
          setIsRegistered(updatedUser.isRegistered);
        }
      });

      socketRef.current.on('forceRoomChange', ({ newRoom }) => {
        console.log('Перемещение в новую комнату:', newRoom);
        setCurrentRoom(newRoom);
        joinedRoomsRef.current.add(newRoom);
        socketRef.current.emit('joinRoom', { room: newRoom, lastTimestamp: null });
      });

      socketRef.current.on('error', ({ message }) => {
        console.error('Server error:', message);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.off('leashStatus');
          socketRef.current.disconnect();
          console.log('Socket disconnected on unmount');
        }
      };
    };

    initializeSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRegistrationComplete = (defaultRoom) => {
    setIsRegistered(true);
    setCurrentRoom(defaultRoom);
    joinedRoomsRef.current.add(defaultRoom);
    socket.emit('joinRoom', { room: defaultRoom, lastTimestamp: null });
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'telegram';
    setTheme(savedTheme);
  }, []);

  const handleRoomSelect = (room) => {
    if (!room || !socket || room === currentRoom || !isAuthenticated) {
      console.log('Cannot join room: conditions not met');
      return;
    }

    if (currentRoom && socket) {
      socket.emit('leaveRoom', currentRoom);
    }

    setCurrentRoom(room);

    if (user?.userId) {
      const storedRooms = JSON.parse(localStorage.getItem('userRooms') || '{}');
      storedRooms[user.userId] = room;
      localStorage.setItem('userRooms', JSON.stringify(storedRooms));
      console.log('Saved room to localStorage:', storedRooms);
    }

    setActiveTab('chat');

    if (!joinedRoomsRef.current.has(room)) {
      console.log(`Emitting joinRoom for new room: ${room}`);
      socket.emit('joinRoom', { room, lastTimestamp: null });
      joinedRoomsRef.current.add(room);
    } else {
      console.log(`Rejoining room: ${room}`);
      socket.emit('joinRoom', { room, lastTimestamp: null });
    }
  };

  useEffect(() => {
    if (activeTab !== 'chat' && currentRoom && socket) {
      console.log(`User stayed in room ${currentRoom} while switching to ${activeTab} tab`);
    }
  }, [activeTab, currentRoom, socket]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (!user || !isAuthenticated || isRegistered === null) {
    return (
      <LoadingContainer theme={theme === 'telegram' ? telegramTheme : theme}>
        <ClipLoader color="#007AFF" size={40} />
      </LoadingContainer>
    );
  }

  if (!isRegistered) {
    return (
      <Registration
        user={user}
        theme={theme === 'telegram' ? telegramTheme : theme}
        socket={socket}
        onRegistrationComplete={handleRegistrationComplete}
      />
    );
  }

  const appliedTheme = theme === 'telegram' ? telegramTheme : theme;
  const isAnimalAtHome = user && !user.isHuman && currentRoom && currentRoom.startsWith('myhome_');
  const isAnimalOnLeashWithOwnerOnline = user && !user.isHuman && user.onLeash && user.ownerOnline;

  return (
    <AppContainer>
      <Header user={user} room={currentRoom} theme={appliedTheme} socket={socket} />
      <Content>
        {activeTab === 'chat' && (
          <Chat
            userId={user?.userId}
            room={currentRoom}
            theme={appliedTheme}
            socket={socket}
            joinedRoomsRef={joinedRoomsRef}
            user={user}
          />
        )}
        {activeTab === 'actions' && socket && (
          <Actions
            theme={appliedTheme}
            currentRoom={currentRoom}
            userId={user?.userId}
            socket={socket}
            personalItems={personalItems}
            pets={pets} // Передаём питомцев
            isModalOpen={isActionModalOpen}
            setIsModalOpen={setIsActionModalOpen}
            user={user} // Добавляем пропс user
          />
        )}
        {activeTab === 'housing' && socket && (
          <Inventory
            userId={user?.userId}
            currentRoom={currentRoom}
            theme={appliedTheme}
            socket={socket}
            onItemsUpdate={handleItemsUpdate}
            closeActionModal={closeActionModal}
            setIsModalOpen={setIsActionModalOpen}
            user={user} // Добавляем user
          />
        )}
        {activeTab === 'map' && !isAnimalAtHome && !isAnimalOnLeashWithOwnerOnline && (
          <Map
            userId={user?.userId}
            onRoomSelect={handleRoomSelect}
            theme={appliedTheme}
            currentRoom={currentRoom}
            user={user} // Уже передаётся
          />
        )}
        {activeTab === 'profile' && (
          <Profile
            user={user}
            theme={appliedTheme}
            selectedTheme={theme}
            telegramTheme={telegramTheme}
            onThemeChange={handleThemeChange}
            progressValues={{ health: 50, mood: 50, fullness: 50 }}
          />
        )}
      </Content>
      <Footer
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={appliedTheme}
        user={user}
        currentRoom={currentRoom}
        isAnimalAtHome={isAnimalAtHome}
        isAnimalOnLeashWithOwnerOnline={isAnimalOnLeashWithOwnerOnline}
      />
    </AppContainer>
  );
}

export default App;
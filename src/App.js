import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import BouncingBall from './components/BouncingBall';
import MyShelter from './components/MyShelter'; // Новый импорт
import startLoadingImage from './images/start_loading.jpg';

import { NotificationProvider } from './utils/NotificationContext';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Новый импорт

const BouncingBallOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
  overflow: hidden;
`;

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
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
  background-image: url(${startLoadingImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
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
  const [pets, setPets] = useState([]);
  const [isRegistered, setIsRegistered] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [showMyShelter, setShowMyShelter] = useState(false); // Новое состояние

  const bouncingBallContainerRef = useRef(null);

  // Callback для обновления состояния user из дочерних компонентов
  const updateUser = useCallback((updatedUser) => {
    console.log('Updating user state from child component:', updatedUser);
    setUser(prevUser => {
      const newUser = {
        ...prevUser,
        ...updatedUser,
        stats: { ...prevUser?.stats, ...updatedUser.stats }
      };
      console.log('Updated user state:', newUser);
      return newUser;
    });
  }, []);

  const closeActionModal = () => {
    console.log('Closing action modal');
    setIsActionModalOpen(false);
  };

  const handleItemsUpdate = useCallback((data) => {
    const { owner, items } = data;
    // console.log('handleItemsUpdate:', { owner, items });
    if (owner === `user_${user?.userId}`) {
      const updatedItems = items.map(item => ({
        ...item,
        _id: item._id.toString(),
      }));
      // console.log('Updating personalItems:', updatedItems);
      setPersonalItems(updatedItems);
      // console.log('personalItems state after setPersonalItems:', updatedItems);
    }
  }, [user?.userId]);

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
        // console.log('Socket connected:', socketRef.current.id);
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
              owner: telegramData.isHuman === false ? null : undefined
            };
            const lastRoom = JSON.parse(localStorage.getItem('userRooms') || '{}')[telegramData.user.id] || 'Полигон утилизации';
            console.log('Загружена последняя комната из localStorage:', lastRoom);
            socketRef.current.emit('auth', { ...initialUserData });
            setTelegramTheme(window.Telegram.WebApp.colorScheme || 'light');
          } else {
            const testUser = {
              userId: 'test123',
              firstName: 'Test User',
              isHuman: false
            };
            // const lastRoom = 'Полигон утилизации';
            // console.log('Используется дефолтная комната для тестового пользователя:', lastRoom);
            socketRef.current.emit('auth', { ...testUser });
            setTelegramTheme('light');
          }
        } else {
          const testUser = {
            userId: 'test123',
            firstName: 'Test User',
            isHuman: false
          };
          // const lastRoom = 'Полигон утилизации';
          // console.log('Используется дефолтная комната для тестового пользователя:', lastRoom);
          socketRef.current.emit('auth', { ...testUser });
          setTelegramTheme('light');
        }

        // Добавляем обработчик для всех ответов getUser
        socketRef.current.on('getUser', (response) => {
          if (response.success && response.user) {
            // console.log('Received getUser response:', response.user);
            updateUser(response.user);
          }
        });

        // Улучшение обработки userUpdate для надежного обновления stats
        // В useEffect для инициализации сокета обновляем обработчик userUpdate
        socketRef.current.on('userUpdate', (updatedUser) => {
          console.log('Received userUpdate from server:', updatedUser);
          setUser(prevUser => {
            const newUser = {
              ...prevUser,
              ...updatedUser,
              credits: updatedUser.credits !== undefined ? updatedUser.credits : (prevUser?.credits || 0),
              exp: updatedUser.exp !== undefined ? updatedUser.exp : (prevUser?.exp || 0),
              homeless: updatedUser.homeless ?? (updatedUser.isHuman ? false : true),
              freeRoam: updatedUser.freeRoam ?? false,
              stats: { ...prevUser?.stats, ...updatedUser.stats },
              diary: updatedUser.diary || prevUser?.diary || []
            };
            console.log('Updated user state after userUpdate:', newUser);
            return newUser;
          });
          if (updatedUser.isRegistered !== undefined) {
            setIsRegistered(updatedUser.isRegistered);
          }
          if (updatedUser.isHuman) {
            socketRef.current.emit('getPets', { userId: updatedUser.userId });
          }
        });

        socketRef.current.on('takeAnimalHomeSuccess', ({ animalId, owner, animal }) => {
          if (owner === user?.userId) {
            setPets(prevPets => [...prevPets, animal]);
          }
        });

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

        socketRef.current.on('items', handleItemsUpdate);
        socketRef.current.on('itemAction', (data) => {
          const { action, owner, item, itemId, itemIds } = data;
          // console.log('Received itemAction:', data);
          if (owner === `user_${user?.userId}`) {
            if (action === 'add') {
              setPersonalItems(prev => [...prev, { ...item, _id: item._id.toString() }]);
            } else if (action === 'remove') {
              const idsToRemove = Array.isArray(itemIds) ? itemIds : [itemId];
              setPersonalItems(prev => prev.filter(i => !idsToRemove.includes(i._id.toString())));
            }
          }
        });
      });

      // Новый обработчик для обновления позиций предметов
      socketRef.current.on('itemPositionsUpdate', (data) => {
        const { owner, items } = data;
        if (owner === `user_${user?.userId}` || owner === currentRoom) {
          const updatedItems = items.map(item => ({
            ...item,
            _id: item._id.toString(),
          }));
          setPersonalItems(prev => {
            const mergedItems = prev.map(p => {
              const updatedItem = updatedItems.find(u => u._id === p._id);
              return updatedItem || p;
            }).filter(p => !updatedItems.some(u => u._id === p._id) || updatedItems.includes(p));
            return [...mergedItems, ...updatedItems.filter(u => !prev.some(p => p._id === u._id))];
          });
        }
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
        // console.log('Authentication successful, received defaultRoom:', defaultRoom, 'isRegistered:', isRegistered);
        setIsAuthenticated(true);
        setIsRegistered(isRegistered);
        if (isRegistered) {
          setCurrentRoom(defaultRoom);
          joinedRoomsRef.current.add(defaultRoom);
          socketRef.current.emit('joinRoom', { room: defaultRoom, lastTimestamp: null });
          if (user?.userId) {
            // console.log('Emitting getItems for user:', `user_${user.userId}`);
            socketRef.current.emit('getItems', { owner: `user_${user.userId}` });
          } else {
            console.warn('user.userId is undefined during authSuccess');
          }
        }
      });

      socketRef.current.on('forceRoomChange', ({ newRoom }) => {
        // console.log('Перемещение в новую комнату:', newRoom);
        setCurrentRoom(newRoom);
        joinedRoomsRef.current.add(newRoom);
        socketRef.current.emit('joinRoom', { room: newRoom, lastTimestamp: null });
      });

      socketRef.current.on('error', ({ message }) => {
        console.error('Server error:', message);
      });

      // Добавляем запрос getUser при подключении
      socketRef.current.on('connect', () => {
        // console.log('Socket connected, requesting user data');
        if (user?.userId) {
          socketRef.current.emit('getUser', { userId: user.userId }, (response) => {
            if (response.success && response.user) {
              // console.log('Received user data on connect:', response.user);
              updateUser(response.user);
              setIsRegistered(response.user.isRegistered);
            }
          });
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.off('connect');
          socketRef.current.off('getUser');
          socketRef.current.off('userUpdate');
          socketRef.current.off('leashStatus');
          socketRef.current.off('items');
          socketRef.current.off('itemAction');
          socketRef.current.off('disconnect');
          socketRef.current.off('connect_error');
          socketRef.current.off('authSuccess');
          socketRef.current.off('forceRoomChange');
          socketRef.current.off('error');
          socketRef.current.disconnect();
          console.log('Socket disconnected on unmount');
        }
      };
    };

    initializeSocket();
  }, [handleItemsUpdate, updateUser, user?.userId, currentRoom]); // Добавляем зависимости

  // Добавляем эффект для повторного запроса getItems после обновления user
  // useEffect(() => {
  //   if (socket && user?.userId && isAuthenticated && isRegistered && personalItems.length === 0) {
  //     console.log('Re-emitting getItems for user:', `user_${user.userId}`);
  //     socket.emit('getItems', { owner: `user_${user.userId}` });
  //   }
  // }, [socket, user, isAuthenticated, isRegistered, personalItems.length]);

  // useEffect(() => {
  //   if (socket && user?.userId && isAuthenticated && isRegistered && activeTab === 'actions') {
  //     console.log('Emitting getItems for user on actions tab:', `user_${user.userId}`);
  //     socket.emit('getItems', { owner: `user_${user.userId}` });
  //   }
  // }, [socket, user, isAuthenticated, isRegistered, activeTab]);

  useEffect(() => {
    if (socket && user?.userId && isAuthenticated && isRegistered && personalItems.length === 0) {
      // console.log('Emitting getItems for user:', `user_${user.userId}`);
      socket.emit('getItems', { owner: `user_${user.userId}` });
    }
  }, [socket, user, isAuthenticated, isRegistered, personalItems.length]);

  const handleRegistrationComplete = (defaultRoom) => {
    setIsRegistered(true);
    setCurrentRoom(defaultRoom);
    joinedRoomsRef.current.add(defaultRoom);
    socket.emit('joinRoom', { room: defaultRoom, lastTimestamp: null });
    if (user?.userId) {
      console.log('Emitting getItems after registration:', `user_${user.userId}`);
      socket.emit('getItems', { owner: `user_${user.userId}` });
    } else {
      console.warn('user.userId is undefined during handleRegistrationComplete');
    }
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
      // console.log(`User stayed in room ${currentRoom} while switching to ${activeTab} tab`);
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
  const canAccessMap = user && (
    user.isHuman ||
    user.freeRoam ||
    (!isAnimalAtHome && !isAnimalOnLeashWithOwnerOnline)
  );
  // console.log('canAccessMap:', canAccessMap, 'freeRoam:', user?.freeRoam, 'isAnimalAtHome:', isAnimalAtHome, 'isAnimalOnLeashWithOwnerOnline:', isAnimalOnLeashWithOwnerOnline);

  return (
    <NotificationProvider>
      <AppContainer>
        <Header user={user} room={currentRoom} theme={appliedTheme} socket={socket} />
        <Content>
          {showMyShelter ? (
            <MyShelter
              theme={appliedTheme}
              setShowMyShelter={setShowMyShelter}
              userId={user?.userId}
              socket={socket}
              currentRoom={currentRoom}
            />
          ) : (
            <>
              {activeTab === 'chat' && (
                <Chat
                  userId={user?.userId}
                  room={currentRoom}
                  theme={appliedTheme}
                  socket={socket}
                  joinedRoomsRef={joinedRoomsRef}
                  user={user}
                  setShowMyShelter={setShowMyShelter}
                />
              )}
              {activeTab === 'actions' && socket && (
                <Actions
                  userId={user?.userId}
                  currentRoom={currentRoom}
                  theme={appliedTheme}
                  socket={socket}
                  personalItems={personalItems}
                  onItemsUpdate={handleItemsUpdate}
                  pets={pets}
                  isModalOpen={isActionModalOpen}
                  setIsModalOpen={setIsActionModalOpen}
                  user={user}
                  updateUser={updateUser}
                />
              )}
              {activeTab === 'housing' && socket && (
                <Inventory
                  userId={user?.userId}
                  currentRoom={currentRoom}
                  theme={appliedTheme}
                  socket={socket}
                  personalItems={personalItems}
                  onItemsUpdate={handleItemsUpdate}
                  closeActionModal={closeActionModal}
                  setIsModalOpen={setIsActionModalOpen}
                  user={user}
                  updateUser={updateUser}
                />
              )}
              {activeTab === 'map' && canAccessMap && (
                <Map
                  userId={user?.userId}
                  onRoomSelect={handleRoomSelect}
                  theme={appliedTheme}
                  currentRoom={currentRoom}
                  user={user}
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
                  socket={socket}
                />
              )}
            </>
          )}
        </Content>
        <BouncingBallOverlay ref={bouncingBallContainerRef}>
          {activeTab === 'chat' && currentRoom && !showMyShelter && (
            <BouncingBall room={currentRoom} containerRef={bouncingBallContainerRef} />
          )}
        </BouncingBallOverlay>
        <Footer
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={appliedTheme}
          user={user}
          currentRoom={currentRoom}
          isAnimalAtHome={isAnimalAtHome}
          isAnimalOnLeashWithOwnerOnline={isAnimalOnLeashWithOwnerOnline}
        />
        <ToastContainer />
      </AppContainer>
    </NotificationProvider>
  );
}

export default App;
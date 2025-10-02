import { useEffect, useRef, useCallback, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = (serverUrl, options = {}) => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = options.maxReconnectAttempts || 5;
    const reconnectDelay = options.reconnectDelay || 1000;

    const connect = useCallback(() => {
        if (socketRef.current?.connected) return;

        try {
            socketRef.current = io(serverUrl, {
                cors: {
                    origin: process.env.FRONTEND_URL || "https://telepets.netlify.app",
                    methods: ["GET", "POST"]
                },
                reconnection: true,
                reconnectionAttempts: maxReconnectAttempts,
                reconnectionDelay: reconnectDelay,
                timeout: 20000,
                ...options
            });

            socketRef.current.on('connect', () => {
                setIsConnected(true);
                setConnectionError(null);
                reconnectAttempts.current = 0;
                console.log('Socket connected:', socketRef.current.id);
            });

            socketRef.current.on('disconnect', (reason) => {
                setIsConnected(false);
                if (reason === 'io server disconnect') {
                    // Сервер отключил соединение
                    socketRef.current.connect();
                }
                console.log('Socket disconnected:', reason);
            });

            socketRef.current.on('connect_error', (error) => {
                setConnectionError(error.message);
                console.error('Socket connection error:', error);
            });

            socketRef.current.on('reconnect', (attemptNumber) => {
                setIsConnected(true);
                setConnectionError(null);
                console.log('Socket reconnected after', attemptNumber, 'attempts');
            });

            socketRef.current.on('reconnect_failed', () => {
                setConnectionError('Failed to reconnect after maximum attempts');
                console.error('Socket reconnection failed');
            });

        } catch (error) {
            setConnectionError(error.message);
            console.error('Error creating socket connection:', error);
        }
    }, [serverUrl, maxReconnectAttempts, reconnectDelay, options]);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        }
    }, []);

    const emit = useCallback((event, data, callback) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(event, data, callback);
        } else {
            console.warn('Socket not connected, cannot emit event:', event);
            if (callback) callback({ success: false, error: 'Socket not connected' });
        }
    }, []);

    const on = useCallback((event, callback) => {
        if (socketRef.current) {
            socketRef.current.on(event, callback);
        }
    }, []);

    const off = useCallback((event, callback) => {
        if (socketRef.current) {
            socketRef.current.off(event, callback);
        }
    }, []);

    // Автоматическое подключение при монтировании
    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        socket: socketRef.current,
        isConnected,
        connectionError,
        connect,
        disconnect,
        emit,
        on,
        off
    };
};

// Хук для аутентификации через сокет
export const useSocketAuth = (socket, userData) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authError, setAuthError] = useState(null);

    const authenticate = useCallback((data) => {
        if (!socket) {
            setAuthError('Socket not available');
            return;
        }

        socket.emit('auth', data, (response) => {
            if (response?.success) {
                setIsAuthenticated(true);
                setAuthError(null);
            } else {
                setIsAuthenticated(false);
                setAuthError(response?.message || 'Authentication failed');
            }
        });
    }, [socket]);

    useEffect(() => {
        if (socket && userData) {
            authenticate(userData);
        }
    }, [socket, userData, authenticate]);

    return {
        isAuthenticated,
        authError,
        authenticate
    };
};

// Хук для управления комнатами
export const useSocketRooms = (socket) => {
    const [joinedRooms, setJoinedRooms] = useState(new Set());
    const [currentRoom, setCurrentRoom] = useState(null);

    const joinRoom = useCallback((roomName) => {
        if (!socket) return;

        socket.emit('joinRoom', { room: roomName }, (response) => {
            if (response?.success) {
                setJoinedRooms(prev => new Set([...prev, roomName]));
                setCurrentRoom(roomName);
            }
        });
    }, [socket]);

    const leaveRoom = useCallback((roomName) => {
        if (!socket) return;

        socket.emit('leaveRoom', { room: roomName }, (response) => {
            if (response?.success) {
                setJoinedRooms(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(roomName);
                    return newSet;
                });
                if (currentRoom === roomName) {
                    setCurrentRoom(null);
                }
            }
        });
    }, [socket, currentRoom]);

    return {
        joinedRooms,
        currentRoom,
        joinRoom,
        leaveRoom,
        setCurrentRoom
    };
};

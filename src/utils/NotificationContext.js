// Создание контекста для уведомлений
import { createContext, useContext } from 'react';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const showNotification = (message, type = 'info') => {
        const isDark = type === 'error';

        toast[type](
            <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
            }}>
                {message}
            </div>,
            {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: isDark ? 'dark' : 'light',
                style: {
                    background: isDark ? '#2c2c2c' : '#f8f9fa',
                    color: isDark ? '#fff' : '#212529',
                    textAlign: 'center',
                    ...options.style // Добавляем кастомные стили
                },
                ...options // Передаем остальные опции
            }
        );
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
// Создание контекста для уведомлений
import { createContext, useContext } from 'react';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const showNotification = (message, type = 'info') => {
        toast[type](message, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'colored',
            style: {
                textAlign: 'center' // Добавляем стиль для центрирования текста
            }
        });
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
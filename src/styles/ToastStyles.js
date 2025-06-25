// Обновление файла стилей для тостов с анимацией появления и исчезновения
import { createGlobalStyle } from 'styled-components';

// Глобальные стили для тостов
export const ToastGlobalStyles = createGlobalStyle`
  .Toastify__toast {
    text-align: center; /* Центрирование текста */
    font-size: 16px;
    padding: 16px;
    border-radius: 8px;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.5s ease-in-out, fadeOut 0.5s ease-in-out 1s forwards; /* Анимация появления и исчезновения */
  }

  .Toastify__toast--success {
    background: ${props => props.theme === 'dark' ? '#4CAF50' : '#E8F5E9'};
    color: ${props => props.theme === 'dark' ? '#fff' : '#2E7D32'};
  }

  .Toastify__toast--error {
    background: ${props => props.theme === 'dark' ? '#F44336' : '#FFEBEE'};
    color: ${props => props.theme === 'dark' ? '#fff' : '#B71C1C'};
  }

  .Toastify__toast-body {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  /* Скрытие крестика закрытия */
  .Toastify__close-button {
    display: none; /* Убираем крестик */
  }

  /* Определение анимации появления */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px); /* Небольшое смещение вверх для эффекта */
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Определение анимации исчезновения */
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }
`;

// Объект стилей для прямого использования в toastConfig
export const toastStyles = {
  textAlign: 'center',
  fontSize: '16px',
  padding: '16px',
  borderRadius: '8px',
  minHeight: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};
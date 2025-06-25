// Обновление стилей для полного удаления тостов из DOM
import { createGlobalStyle } from 'styled-components';

// Глобальные стили для тостов
export const ToastGlobalStyles = createGlobalStyle`
  .Toastify__toast-container {
    pointer-events: none; /* Отключаем взаимодействие с контейнером */
    padding: 0; /* Убираем отступы */
    margin: 0; /* Убираем внешние отступы */
    width: auto; /* Адаптивная ширина */
    z-index: 9999; /* Высокий z-index для видимости */
  }

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
    pointer-events: auto; /* Включаем взаимодействие во время отображения */
    overflow: hidden; /* Предотвращаем выход содержимого */
    margin: 0; /* Убираем все отступы */
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
    margin: 0; /* Убираем отступы */
  }

  /* Скрытие крестика закрытия */
  .Toastify__close-button {
    display: none; /* Убираем крестик */
  }

  /* Полное сворачивание тоста после анимации */
  .Toastify__toast--closing {
    pointer-events: none !important; /* Отключаем клики */
    height: 0 !important; /* Сворачиваем высоту */
    min-height: 0 !important; /* Убираем минимальную высоту */
    margin: 0 !important; /* Убираем все отступы */
    padding: 0 !important; /* Убираем внутренние отступы */
    overflow: hidden !important; /* Скрываем содержимое */
    opacity: 0 !important; /* Гарантируем прозрачность */
    visibility: hidden !important; /* Полностью скрываем элемент */
    transform: translateY(-10px) !important; /* Синхронизируем с анимацией */
  }

  /* Определение анимации появления */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
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
      height: 0;
      min-height: 0;
      margin: 0;
      padding: 0;
      visibility: hidden;
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
  justifyContent: 'center',
  overflow: 'hidden',
  margin: '0'
};
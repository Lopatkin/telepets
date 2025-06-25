// Обновление конфигурации тостов для отображения новых тостов сверху
import { toastStyles } from '../styles/ToastStyles';

const NOTIFICATION_DURATION_CONST = 1500; // 1.5 секунды (1с задержка + 0.5с анимация исчезновения)

export const toastConfig = {
  position: "top-center",
  autoClose: NOTIFICATION_DURATION_CONST, // Устанавливаем общее время отображения
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  newestOnTop: true, // Новые тосты отображаются сверху
  rtl: false,
  pauseOnFocusLoss: true,
  closeButton: false, // Отключаем кнопку закрытия
  style: toastStyles, // Используем объект стилей
};
// Обновление конфигурации тостов для синхронизации с анимацией
import { toastStyles } from '../styles/ToastStyles';

const NOTIFICATION_DURATION_CONST = 1500; // 1.5 секунды (1с задержка + 0.5с анимация исчезновения)

export const toastConfig = {
  position: "top-center",
  autoClose: NOTIFICATION_DURATION_CONST, // Устанавливаем общее время отображения
  hideProgressBar: true,
  closeOnClick: false, // Отключаем закрытие по клику, чтобы избежать артефактов
  pauseOnHover: false, // Отключаем паузу при наведении для предсказуемого исчезновения
  draggable: false, // Отключаем перетаскивание для упрощения поведения
  newestOnTop: true, // Новые тосты отображаются сверху
  rtl: false,
  pauseOnFocusLoss: false, // Отключаем паузу при потере фокуса
  closeButton: false, // Отключаем кнопку закрытия
  style: toastStyles, // Используем объект стилей
  transition: null // Отключаем встроенные переходы react-toastify
};
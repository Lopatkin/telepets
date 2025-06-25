// Обновление конфигурации тостов для точной синхронизации
import { toastStyles } from '../styles/ToastStyles';

const NOTIFICATION_DURATION_CONST = 1500; // 1.5 секунды (1с отображение + 0.5с анимация исчезновения)

export const toastConfig = {
  position: "top-center",
  autoClose: NOTIFICATION_DURATION_CONST, // Синхронизировано с анимацией
  hideProgressBar: true,
  closeOnClick: false, // Отключаем закрытие по клику
  pauseOnHover: false, // Отключаем паузу при наведении
  draggable: false, // Отключаем перетаскивание
  newestOnTop: true, // Новые тосты сверху
  rtl: false,
  pauseOnFocusLoss: false, // Отключаем паузу при потере фокуса
  closeButton: false, // Отключаем кнопку закрытия
  style: toastStyles, // Используем объект стилей
  transition: null, // Отключаем встроенные переходы
  limit: 1 // Только один тост одновременно
};
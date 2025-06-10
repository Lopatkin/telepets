// export const COOLDOWN_DURATION_CONST = 10 * 100;
// export const NOTIFICATION_DURATION_CONST = 2000;

// // Лимиты веса инвентаря
// export const INVENTORY_LIMITS = {
//     HUMAN: 40, // Лимит веса для человека (кг)
//     ANIMAL: 10, // Лимит веса для животных (кошка или собака, кг)
//     LOCATION: 10000 // Лимит веса для любой локации (кг)
//   };

// Определяем константы
const COOLDOWN_DURATION_CONST = 10 * 100;
const NOTIFICATION_DURATION_CONST = 2000;

// Лимиты веса инвентаря
const INVENTORY_LIMITS = {
  HUMAN: 40, // Лимит веса для человека (кг)
  ANIMAL: 10, // Лимит веса для животных (кошка или собака, кг)
  LOCATION: 10000 // Лимит веса для любой локации (кг)
};

// Экспортируем константы через CommonJS
module.exports = {
  COOLDOWN_DURATION_CONST,
  NOTIFICATION_DURATION_CONST,
  INVENTORY_LIMITS
};
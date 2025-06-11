const COOLDOWN_DURATION_CONST = 10 * 100;
const NOTIFICATION_DURATION_CONST = 2000;

// Добавляем лимиты веса
const WEIGHT_LIMITS = {
  HUMAN: 40, // Лимит веса для игрока-человека (кг)
  ANIMAL: 10, // Лимит веса для игрока-животного (кошка или собака) (кг)
  LOCATION: 10000 // Лимит веса для любой локации (кг)
};

// Экспортируем через CommonJS
module.exports = {
  COOLDOWN_DURATION_CONST,
  NOTIFICATION_DURATION_CONST,
  WEIGHT_LIMITS
};
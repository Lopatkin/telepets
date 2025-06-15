export const COOLDOWN_DURATION_CONST = 10 * 100;
export const NOTIFICATION_DURATION_CONST = 2000;

// Добавлены константы ограничения веса для инвентарей
export const INVENTORY_WEIGHT_LIMIT = {
    human: 40, // Лимит веса личного инвентаря игрока-человека в кг
    animal: 10, // Лимит веса личного инвентаря игрока-животного (кошка или собака) в кг
    location: 10000 // Лимит веса инвентаря любой локации в кг
};
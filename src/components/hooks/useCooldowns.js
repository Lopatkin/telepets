import { useState, useEffect } from 'react';

// Кастомный хук для управления кулдаунами
const useCooldowns = (userId, COOLDOWN_DURATION = 10 * 1000) => {
  const [cooldowns, setCooldowns] = useState({
    findStick: { active: false, timeLeft: 0, progress: 100 },
    findBerries: { active: false, timeLeft: 0, progress: 100 },
    findMushrooms: { active: false, timeLeft: 0, progress: 100 },
  });

  const COOLDOWN_KEYS = {
    findStick: `findStickCooldown_${userId}`,
    findBerries: `findBerriesCooldown_${userId}`,
    findMushrooms: `findMushroomsCooldown_${userId}`,
  };

  // Восстановление состояния кулдаунов
  useEffect(() => {
    Object.entries(COOLDOWN_KEYS).forEach(([key, storageKey]) => {
      const savedCooldown = localStorage.getItem(storageKey);
      if (savedCooldown) {
        const { startTime } = JSON.parse(savedCooldown);
        const elapsed = Date.now() - startTime;
        const remaining = COOLDOWN_DURATION - elapsed;

        if (remaining > 0) {
          setCooldowns(prev => ({
            ...prev,
            [key]: { active: true, timeLeft: Math.ceil(remaining / 1000), progress: (remaining / COOLDOWN_DURATION) * 100 },
          }));
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    });
  }, [COOLDOWN_KEYS, COOLDOWN_DURATION]);

  // Единый таймер для кулдаунов
  useEffect(() => {
    const timer = setInterval(() => {
      setCooldowns(prev => {
        const updated = { ...prev };
        Object.entries(COOLDOWN_KEYS).forEach(([key, storageKey]) => {
          if (updated[key].active && updated[key].timeLeft > 0) {
            const savedCooldown = localStorage.getItem(storageKey);
            if (!savedCooldown) return;

            const { startTime } = JSON.parse(savedCooldown);
            const elapsed = Date.now() - startTime;
            const remaining = COOLDOWN_DURATION - elapsed;

            if (remaining <= 0) {
              updated[key] = { active: false, timeLeft: 0, progress: 100 };
              localStorage.removeItem(storageKey);
            } else {
              updated[key] = {
                active: true,
                timeLeft: Math.ceil(remaining / 1000),
                progress: (remaining / COOLDOWN_DURATION) * 100,
              };
            }
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [COOLDOWN_KEYS, COOLDOWN_DURATION]);

  // Новая функция для активации кулдауна
  const startCooldown = (cooldownKey) => {
    if (COOLDOWN_KEYS[cooldownKey]) {
      setCooldowns(prev => ({
        ...prev,
        [cooldownKey]: { active: true, timeLeft: Math.floor(COOLDOWN_DURATION / 1000), progress: 100 },
      }));
      localStorage.setItem(COOLDOWN_KEYS[cooldownKey], JSON.stringify({ startTime: Date.now() }));
    }
  };

  return [cooldowns, setCooldowns, startCooldown];
};

export default useCooldowns;
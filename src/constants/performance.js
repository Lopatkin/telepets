// Константы для оптимизации производительности

// Настройки для Matter.js
export const MATTER_JS_CONFIG = {
    // Гравитация
    GRAVITY: { x: 0, y: 0 },
    
    // Настройки физики
    PHYSICS: {
        RESTITUTION: 0,
        FRICTION: 0,
        FRICTION_AIR: 0,
        DENSITY: 0.001
    },
    
    // Настройки рендеринга
    RENDER: {
        WIREFRAMES: false,
        SHOW_DEBUG: false,
        SHOW_AXES: false,
        SHOW_POSITIONS: false,
        SHOW_VELOCITY: false,
        SHOW_ANGLES: false
    },
    
    // Настройки коллизий
    COLLISION: {
        STATIC_FILTER: { category: 0x0002, mask: 0 },
        DYNAMIC_FILTER: { category: 0x0001, mask: 0x0002 },
        BOUNDARY_FILTER: { category: 0x0003, mask: 0x0001 }
    }
};

// Настройки для Canvas
export const CANVAS_CONFIG = {
    // Качество рендеринга
    QUALITY: {
        HIGH: { antialias: true, alpha: true },
        MEDIUM: { antialias: false, alpha: true },
        LOW: { antialias: false, alpha: false }
    },
    
    // Настройки тени
    SHADOW: {
        ENABLED: true,
        COLOR: 'rgba(0, 0, 0, 0.3)',
        BLUR: 5,
        OFFSET_X: 3,
        OFFSET_Y: 3
    },
    
    // Настройки прозрачности
    OPACITY: {
        DEFAULT: 1,
        DRAGGING: 0.8,
        HOVER: 0.9
    }
};

// Настройки для изображений
export const IMAGE_CONFIG = {
    // Форматы изображений
    FORMATS: {
        SUPPORTED: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        PREFERRED: 'webp',
        FALLBACK: 'png'
    },
    
    // Размеры изображений
    SIZES: {
        THUMBNAIL: 50,
        SMALL: 100,
        MEDIUM: 200,
        LARGE: 400,
        MAX: 800
    },
    
    // Качество сжатия
    QUALITY: {
        HIGH: 0.9,
        MEDIUM: 0.7,
        LOW: 0.5
    },
    
    // Настройки кэширования
    CACHE: {
        MAX_SIZE: 100, // максимальное количество изображений в кэше
        TTL: 5 * 60 * 1000 // время жизни кэша в миллисекундах (5 минут)
    }
};

// Настройки для анимации
export const ANIMATION_CONFIG = {
    // FPS
    FPS: {
        TARGET: 60,
        MIN: 30,
        MAX: 120
    },
    
    // Интервалы обновления
    INTERVALS: {
        FAST: 16, // 60 FPS
        NORMAL: 33, // 30 FPS
        SLOW: 66 // 15 FPS
    },
    
    // Настройки плавности
    SMOOTHING: {
        ENABLED: true,
        FACTOR: 0.1,
        THRESHOLD: 0.01
    }
};

// Настройки для WebSocket
export const SOCKET_CONFIG = {
    // Подключение
    CONNECTION: {
        TIMEOUT: 20000,
        RECONNECT_ATTEMPTS: 5,
        RECONNECT_DELAY: 1000,
        MAX_RECONNECT_DELAY: 5000
    },
    
    // События
    EVENTS: {
        HEARTBEAT_INTERVAL: 30000,
        PING_TIMEOUT: 5000,
        PONG_TIMEOUT: 10000
    },
    
    // Буферизация
    BUFFER: {
        MAX_SIZE: 1000,
        FLUSH_INTERVAL: 100
    }
};

// Настройки для мемоизации
export const MEMOIZATION_CONFIG = {
    // Размер кэша для useMemo
    MEMO_CACHE_SIZE: 100,
    
    // Время жизни кэша
    MEMO_TTL: 5 * 60 * 1000, // 5 минут
    
    // Настройки для useCallback
    CALLBACK_DEPS: {
        SHALLOW_COMPARE: true,
        DEEP_COMPARE: false,
        CUSTOM_COMPARE: false
    }
};

// Настройки для lazy loading
export const LAZY_LOADING_CONFIG = {
    // Предзагрузка
    PRELOAD: {
        ENABLED: true,
        THRESHOLD: 0.1, // предзагружать когда компонент на 10% видим
        DELAY: 100 // задержка перед предзагрузкой
    },
    
    // Кэширование
    CACHE: {
        ENABLED: true,
        MAX_SIZE: 50,
        TTL: 10 * 60 * 1000 // 10 минут
    }
};

// Настройки для производительности
export const PERFORMANCE_CONFIG = {
    // Мониторинг
    MONITORING: {
        ENABLED: process.env.NODE_ENV === 'development',
        METRICS: ['fps', 'memory', 'render-time'],
        LOG_INTERVAL: 1000
    },
    
    // Оптимизация
    OPTIMIZATION: {
        DEBOUNCE_DELAY: 150,
        THROTTLE_DELAY: 100,
        BATCH_UPDATES: true,
        VIRTUAL_SCROLLING: false
    },
    
    // Отладка
    DEBUG: {
        SHOW_PERFORMANCE: process.env.NODE_ENV === 'development',
        SHOW_WARNINGS: true,
        SHOW_ERRORS: true
    }
};

// Утилиты для оптимизации
export const PERFORMANCE_UTILS = {
    // Дебаунс функция
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Троттл функция
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Проверка видимости элемента
    isElementVisible: (element) => {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    // Измерение производительности
    measurePerformance: (name, fn) => {
        if (process.env.NODE_ENV === 'development') {
            const start = performance.now();
            const result = fn();
            const end = performance.now();
            console.log(`${name} took ${end - start} milliseconds`);
            return result;
        }
        return fn();
    }
};

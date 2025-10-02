import { useState, useEffect, useRef, useCallback } from 'react';

// Кэш для загруженных изображений
const imageCache = new Map();

export const useImageLoader = (imageSources, options = {}) => {
    const {
        preload = true,
        retryAttempts = 3,
        retryDelay = 1000,
        onProgress,
        onComplete,
        onError
    } = options;

    const [imagesLoaded, setImagesLoaded] = useState({});
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    const imageRefs = useRef({});
    const loadingPromises = useRef({});
    const retryCounts = useRef({});

    const loadImage = useCallback((key, src, retryCount = 0) => {
        // Проверяем кэш
        if (imageCache.has(src)) {
            const cachedImage = imageCache.get(src);
            imageRefs.current[key] = cachedImage;
            setImagesLoaded(prev => ({ ...prev, [key]: true }));
            return Promise.resolve(cachedImage);
        }

        // Проверяем, не загружается ли уже
        if (loadingPromises.current[key]) {
            return loadingPromises.current[key];
        }

        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            
            // Настройка crossOrigin для CORS
            if (options.crossOrigin) {
                img.crossOrigin = options.crossOrigin;
            }

            img.onload = () => {
                // Кэшируем изображение
                imageCache.set(src, img);
                imageRefs.current[key] = img;
                setImagesLoaded(prev => ({ ...prev, [key]: true }));
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[key];
                    return newErrors;
                });
                resolve(img);
            };

            img.onerror = (error) => {
                console.error(`Failed to load image ${key}:`, src, error);
                
                // Попытка повтора
                if (retryCount < retryAttempts) {
                    retryCounts.current[key] = (retryCounts.current[key] || 0) + 1;
                    setTimeout(() => {
                        loadImage(key, src, retryCount + 1);
                    }, retryDelay * (retryCount + 1));
                } else {
                    setErrors(prev => ({ ...prev, [key]: `Failed to load after ${retryAttempts} attempts` }));
                    reject(new Error(`Failed to load ${key} image after ${retryAttempts} attempts`));
                }
            };

            // Начинаем загрузку
            img.src = src;
        });

        loadingPromises.current[key] = promise;
        return promise;
    }, [retryAttempts, retryDelay, options.crossOrigin]);

    const loadAllImages = useCallback(async () => {
        if (!imageSources || Object.keys(imageSources).length === 0) return;

        setIsLoading(true);
        setLoadingProgress(0);
        setErrors({});

        const imageEntries = Object.entries(imageSources);
        const totalImages = imageEntries.length;
        let loadedCount = 0;

        try {
            const results = await Promise.allSettled(
                imageEntries.map(async ([key, src]) => {
                    try {
                        await loadImage(key, src);
                        loadedCount++;
                        const progress = (loadedCount / totalImages) * 100;
                        setLoadingProgress(progress);
                        
                        if (onProgress) {
                            onProgress(progress, key, loadedCount, totalImages);
                        }
                        
                        return { key, success: true };
                    } catch (error) {
                        return { key, success: false, error: error.message };
                    }
                })
            );

            const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
            const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));

            if (onComplete) {
                onComplete({
                    total: totalImages,
                    successful: successful.length,
                    failed: failed.length,
                    results
                });
            }

        } catch (error) {
            console.error('Error loading images:', error);
            if (onError) {
                onError(error);
            }
        } finally {
            setIsLoading(false);
        }
    }, [imageSources, loadImage, onProgress, onComplete, onError]);

    const preloadImage = useCallback((key, src) => {
        return loadImage(key, src);
    }, [loadImage]);

    const getImage = useCallback((key) => {
        return imageRefs.current[key] || null;
    }, []);

    const isImageLoaded = useCallback((key) => {
        return imagesLoaded[key] || false;
    }, [imagesLoaded]);

    const clearCache = useCallback(() => {
        imageCache.clear();
        imageRefs.current = {};
        setImagesLoaded({});
        setErrors({});
        setLoadingProgress(0);
    }, []);

    const removeImage = useCallback((key) => {
        if (imageRefs.current[key]) {
            delete imageRefs.current[key];
            setImagesLoaded(prev => {
                const newState = { ...prev };
                delete newState[key];
                return newState;
            });
        }
    }, []);

    // Автоматическая загрузка при изменении источников
    useEffect(() => {
        if (preload && imageSources) {
            loadAllImages();
        }

        return () => {
            // Очищаем промисы при размонтировании
            loadingPromises.current = {};
        };
    }, [preload, imageSources, loadAllImages]);

    return {
        imagesLoaded,
        imageRefs: imageRefs.current,
        loadingProgress,
        isLoading,
        errors,
        loadImage: preloadImage,
        loadAllImages,
        getImage,
        isImageLoaded,
        clearCache,
        removeImage
    };
};

// Хук для загрузки одного изображения
export const useSingleImage = (src, options = {}) => {
    const imageSources = src ? { image: src } : {};
    const imageLoader = useImageLoader(imageSources, options);
    
    return {
        ...imageLoader,
        image: imageLoader.getImage('image'),
        isLoaded: imageLoader.isImageLoaded('image'),
        error: imageLoader.errors.image
    };
};

// Хук для предзагрузки изображений
export const useImagePreloader = (imageSources, options = {}) => {
    const [preloadedImages, setPreloadedImages] = useState(new Set());
    
    const imageLoader = useImageLoader(imageSources, {
        ...options,
        onComplete: (result) => {
            if (result.successful > 0) {
                setPreloadedImages(new Set(Object.keys(imageSources)));
            }
            if (options.onComplete) {
                options.onComplete(result);
            }
        }
    });

    const isAllPreloaded = preloadedImages.size === Object.keys(imageSources).length;

    return {
        ...imageLoader,
        preloadedImages,
        isAllPreloaded
    };
};

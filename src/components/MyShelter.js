import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Matter from 'matter-js';
import wallpaperImage from '../images/dwelling/wallpaper.jpg';
import floorImage from '../images/dwelling/floor.jpg';
import stickImage from '../images/dwelling/furniture/stick.png';
import garbageImage from '../images/dwelling/furniture/garbage.png';
import berryImage from '../images/dwelling/furniture/berry.png';
import mushroomsImage from '../images/dwelling/furniture/mushrooms.png';
import boardImage from '../images/dwelling/furniture/board.png';
import chairImage from '../images/dwelling/furniture/chair.png';
import tableImage from '../images/dwelling/furniture/table.png';
import wardrobeImage from '../images/dwelling/furniture/wardrobe.png';
import sofaImage from '../images/dwelling/furniture/sofa.png';
import chestImage from '../images/dwelling/furniture/chest.png';
import firstAidKitImage from '../images/dwelling/furniture/first-aid-kit.png';
import bandageImage from '../images/dwelling/furniture/bandage.png';
import chocolateImage from '../images/dwelling/furniture/chocolate.png';
import cannedFoodImage from '../images/dwelling/furniture/canned-food.png';

// Определение конфигурации текстур
const textureConfig = {
    wallpaper: { image: wallpaperImage, ref: useRef(new Image()), key: 'wallpaper' },
    floor: { image: floorImage, ref: useRef(new Image()), key: 'floor' },
    stick: { image: stickImage, ref: useRef(new Image()), key: 'stick', name: 'Палка', size: 67 },
    garbage: { image: garbageImage, ref: useRef(new Image()), key: 'garbage', name: 'Мусор', size: 67 },
    berry: { image: berryImage, ref: useRef(new Image()), key: 'berry', name: 'Лесные ягоды', size: 50 },
    mushrooms: { image: mushroomsImage, ref: useRef(new Image()), key: 'mushrooms', name: 'Лесные грибы', size: 50 },
    board: { image: boardImage, ref: useRef(new Image()), key: 'board', name: 'Доска', size: 100 },
    chair: { image: chairImage, ref: useRef(new Image()), key: 'chair', name: 'Стул', size: 100 },
    table: { image: tableImage, ref: useRef(new Image()), key: 'table', name: 'Стол', size: 200 },
    wardrobe: { image: wardrobeImage, ref: useRef(new Image()), key: 'wardrobe', name: 'Шкаф', size: 200 },
    sofa: { image: sofaImage, ref: useRef(new Image()), key: 'sofa', name: 'Кровать', size: 200 },
    chest: { image: chestImage, ref: useRef(new Image()), key: 'chest', name: 'Тумба', size: 100 },
    firstAidKit: { image: firstAidKitImage, ref: useRef(new Image()), key: 'firstAidKit', name: 'Аптечка', size: 50 },
    bandage: { image: bandageImage, ref: useRef(new Image()), key: 'bandage', name: 'Бинт', size: 50 },
    chocolate: { image: chocolateImage, ref: useRef(new Image()), key: 'chocolate', name: 'Шоколадка', size: 50 },
    cannedFood: { image: cannedFoodImage, ref: useRef(new Image()), key: 'cannedFood', name: 'Консервы', size: 50 },
};


const SaveButton = styled.button`
      position: absolute;
      top: 10px;
      right: 60px;
      background: ${({ theme, isSaved }) =>
        isSaved ? '#4CAF50' : (theme === 'dark' ? '#4A4A4A' : '#D3D3D3')};
      color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#000')};
      border: none;
      border-radius: 5px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 16px;
      z-index: 2000;
      transition: background 0.3s ease;
      animation: ${({ isSaved }) => isSaved ? 'blink 0.666s ease 3' : 'none'}; // 3 мигания за 2 секунды (2 / 3 = 0.666s на цикл)

      @keyframes blink {
          0%, 100% { background: #4CAF50; } // Зелёный
          50% { background: ${({ theme }) => (theme === 'dark' ? '#4A4A4A' : '#D3D3D3')}; } // Исходный цвет
      }

      &:hover {
          background: ${({ theme, isSaved }) =>
        isSaved ? '#45a049' : (theme === 'dark' ? '#5A5A5A' : '#B0B0B0')};
      }
  `;

const CloseIcon = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: ${({ theme }) => (theme === 'dark' ? '#4A4A4A' : '#D3D3D3')};
  color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#000')};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 24px;
  z-index: 2000;

  &:hover {
    background: ${({ theme }) => (theme === 'dark' ? '#5A5A5A' : '#B0B0B0')};
  }
`;

const ShelterContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: ${({ theme }) => (theme === 'dark' ? '#2A2A2A' : '#fff')};
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;



function MyShelter({ theme, setShowMyShelter, userId, socket, currentRoom }) {
    const [isSaved, setIsSaved] = useState(false);
    const canvasRef = useRef(null);
    const engineRef = useRef(Matter.Engine.create());
    const runnerRef = useRef(null);
    const imagesLoadedRef = useRef({
        // Инициализация флагов загрузки на основе textureConfig
        ...Object.keys(textureConfig).reduce((acc, key) => ({
            ...acc,
            [key]: false
        }), {})
    });
    const [locationItems, setLocationItems] = useState([]);
    const wallRef = useRef(null);
    const floorRef = useRef(null);
    const itemDataRef = useRef([]);
    const draggedItemRef = useRef(null);
    const initialDimensionsRef = useRef({ width: 0, height: 0, wallHeight: 0, floorHeight: 0 });

    // Загрузка изображений
    useEffect(() => {
        // Упрощенная загрузка изображений с использованием textureConfig
        Object.values(textureConfig).forEach(({ image, ref, key }) => {
            ref.current.src = image;
            ref.current.onload = () => {
                imagesLoadedRef.current[key] = true;
            };
            ref.current.onerror = () => {
                console.error(`Failed to load ${key} image`);
                imagesLoadedRef.current[key] = true;
            };
        });
    }, []);

    // Создание стены и пола
    useEffect(() => {
        const engine = engineRef.current;
        const canvas = canvasRef.current;
        const parent = canvas.parentElement;
        const width = parent.getBoundingClientRect().width;
        const height = parent.getBoundingClientRect().height;

        const wallHeight = height * 0.4;
        const floorHeight = height * 0.6;
        const staticCollisionFilter = { category: 0x0002, mask: 0 };

        // Сохраняем начальные размеры
        initialDimensionsRef.current = { width, height, wallHeight, floorHeight };

        const wall = Matter.Bodies.rectangle(width / 2, wallHeight / 2, width, wallHeight, {
            isStatic: true,
            restitution: 0,
            friction: 0,
            frictionAir: 0,
            render: {
                zIndex: -100
            },
            collisionFilter: staticCollisionFilter
        });

        const floor = Matter.Bodies.rectangle(width / 2, height - floorHeight / 2, width, floorHeight, {
            isStatic: true,
            restitution: 0,
            friction: 0,
            frictionAir: 0,
            render: {
                zIndex: -100
            },
            collisionFilter: staticCollisionFilter
        });

        wallRef.current = wall;
        floorRef.current = floor;
        Matter.World.add(engine.world, [wall, floor]);

        // Отладочный лог для проверки размеров при создании
        console.log('Создание стены и пола:', { width, height, wallHeight, floorHeight, floorY: height - floorHeight / 2 });

        return () => {
            Matter.World.remove(engine.world, [wall, floor]);
        };
    }, []); // Пустой массив зависимостей

    // Получение предметов текущей локации
    useEffect(() => {
        if (!socket || !currentRoom) return;

        const owner = currentRoom;
        socket.emit('getItems', { owner });

        socket.on('items', (data) => {
            if (data.owner === owner) {
                setLocationItems(data.items.map(item => ({
                    ...item,
                    _id: item._id.toString(),
                })));
            }
        });

        // Обработчик обновления позиций предметов от сервера
        socket.on('itemPositionsUpdate', (data) => {
            if (data.owner === currentRoom) {
                setLocationItems(data.items.map(item => ({
                    ...item,
                    _id: item._id.toString(),
                })));
            }
        });

        return () => {
            socket.off('items');
            socket.off('itemPositionsUpdate');
        };
    }, [socket, currentRoom]);

    // Сохранение позиций предметов на сервере
    const handleSave = () => {
        const canvas = canvasRef.current;
        const width = canvas.width;
        const height = canvas.height;

        console.log('Сохранение, текущие размеры:', {
            width,
            height,
            wallHeight: initialDimensionsRef.current.wallHeight,
            floorHeight: initialDimensionsRef.current.floorHeight,
            floorY: height - initialDimensionsRef.current.floorHeight / 2
        });

        const positions = {
            ...locationItems.reduce((acc, item) => ({
                ...acc,
                [`item_${item._id}`]: {
                    x: (itemDataRef.current.find(i => i.id === item._id)?.x || (width * 0.2)) / width,
                    y: (itemDataRef.current.find(i => i.id === item._id)?.y || (height * 0.4)) / height,
                    scaleFactor: itemDataRef.current.find(i => i.id === item._id)?.scaleFactor || 1,
                    zIndex: itemDataRef.current.find(i => i.id === item._id)?.zIndex || 0
                }
            }), {})
        };

        socket.emit('updateItemPositions', { owner: currentRoom, positions }, (response) => {
            if (response.success) {
                console.log('Позиции предметов успешно сохранены на сервере');
                setIsSaved(true);
                setTimeout(() => {
                    setIsSaved(false); // Отключаем анимацию через 2 секунды
                }, 2000);
            } else {
                console.error('Ошибка сохранения позиций:', response.message);
            }
        });
    };

    const handleClose = () => {
        setShowMyShelter(false); // Закрываем без сохранения
    };

    // Основной эффект для рендеринга
    useEffect(() => {
        const canvas = canvasRef.current;
        const parent = canvas.parentElement;
        const width = parent.getBoundingClientRect().width;
        const height = parent.getBoundingClientRect().height;
        canvas.width = width;
        canvas.height = height;

        const engine = engineRef.current;
        engine.gravity.y = 0;

        const boundaryOptions = {
            isStatic: true,
            restitution: 0,
            friction: 1,
            render: { visible: false },
            collisionFilter: { category: 0x0003, mask: 0x0001 }
        };
        const boundaries = [
            Matter.Bodies.rectangle(width / 2, -25, width, 50, boundaryOptions),
            Matter.Bodies.rectangle(width / 2, height + 25, width, 50, boundaryOptions),
            Matter.Bodies.rectangle(-25, height / 2, 50, height, boundaryOptions),
            Matter.Bodies.rectangle(width + 25, height / 2, 50, height, boundaryOptions),
        ];
        Matter.World.add(engine.world, boundaries);

        // Формируем данные для предметов на основе данных из базы
        itemDataRef.current = locationItems.map((item, index) => {
            // Поиск конфигурации текстуры по имени предмета
            const config = Object.values(textureConfig).find(conf => conf.name === item.name) || {};
            return {
                id: item._id,
                x: item.x * width,
                y: item.y * height,
                scaleFactor: item.scaleFactor,
                zIndex: item.zIndex,
                width: config.size || 200,
                height: config.size || 200,
                texture: config.image || undefined,
                opacity: 1
            };
        });

        const restrictPosition = (item) => {
            const margin = 5 / width;
            const halfWidth = (item.width * item.scaleFactor) / (2 * width);
            const halfHeight = (item.height * item.scaleFactor) / (2 * height);

            item.x = Math.max(margin + halfWidth, Math.min(item.x / width, 1 - margin - halfWidth)) * width;
            item.y = Math.max(margin + halfHeight, Math.min(item.y / height, 1 - margin - halfHeight)) * height;
        };

        const bringToFront = (item) => {
            const maxZIndex = Math.max(...itemDataRef.current.map(i => i.zIndex || 0));
            item.zIndex = maxZIndex + 1;
            item.opacity = 0.8;
        };

        // Общая функция для обработки событий мыши и касания
        const handleInteraction = (event, isTouch = false) => {
            event.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const mouseX = isTouch ? event.touches[0].clientX - rect.left : event.clientX - rect.left;
            const mouseY = isTouch ? event.touches[0].clientY - rect.top : event.clientY - rect.top;

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

            const itemsUnderCursor = itemDataRef.current
                .map(item => {
                    const halfWidth = (item.width * item.scaleFactor) / 2;
                    const halfHeight = (item.height * item.scaleFactor) / 2;

                    if (
                        mouseX >= item.x - halfWidth &&
                        mouseX <= item.x + halfWidth &&
                        mouseY >= item.y - halfHeight &&
                        mouseY <= item.y + halfHeight
                    ) {
                        const config = Object.values(textureConfig).find(conf => conf.image === item.texture);
                        if (config && config.ref.current.width && config.ref.current.height && imagesLoadedRef.current[config.key]) {
                            const aspectRatio = config.ref.current.width / config.ref.current.height;
                            const textureHeight = item.height * item.scaleFactor;
                            const textureWidth = textureHeight * aspectRatio;

                            tempCanvas.width = config.ref.current.width;
                            tempCanvas.height = config.ref.current.height;
                            tempCtx.drawImage(config.ref.current, 0, 0, config.ref.current.width, config.ref.current.height);

                            const localX = (mouseX - (item.x - halfWidth)) / (textureWidth / config.ref.current.width);
                            const localY = (mouseY - (item.y - halfHeight)) / (textureHeight / config.ref.current.height);

                            if (localX >= 0 && localX < config.ref.current.width && localY >= 0 && localY < config.ref.current.height) {
                                try {
                                    const pixelData = tempCtx.getImageData(Math.floor(localX), Math.floor(localY), 1, 1).data;
                                    const isNotTransparent = pixelData[3] > 0;
                                    return { item, isNotTransparent };
                                } catch (error) {
                                    console.error('Error reading pixel data for item:', item.id, error);
                                    return null;
                                }
                            }
                        }
                        return null;
                    }
                    return null;
                })
                .filter(item => item && item.isNotTransparent)
                .sort((a, b) => (b.item.zIndex || 0) - (a.item.zIndex || 0));

            const selectedItem = itemsUnderCursor.length > 0 ? itemsUnderCursor[0].item : null;

            if (selectedItem) {
                bringToFront(selectedItem);
                draggedItemRef.current = selectedItem;
            }
        };

        const handleMouseMove = (event) => {
            if (draggedItemRef.current) {
                const rect = canvas.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;
                draggedItemRef.current.x = mouseX;
                draggedItemRef.current.y = mouseY;
                restrictPosition(draggedItemRef.current);
            }
        };

        const handleMouseUp = () => {
            if (draggedItemRef.current) {
                draggedItemRef.current.opacity = 1;
                draggedItemRef.current = null;
            }
        };

        const handleTouchMove = (event) => {
            event.preventDefault();
            if (draggedItemRef.current) {
                const touch = event.touches[0];
                const rect = canvas.getBoundingClientRect();
                const mouseX = touch.clientX - rect.left;
                const mouseY = touch.clientY - rect.top;
                draggedItemRef.current.x = mouseX;
                draggedItemRef.current.y = mouseY;
                restrictPosition(draggedItemRef.current);
            }
        };

        const handleTouchEnd = (event) => {
            event.preventDefault();
            if (draggedItemRef.current) {
                draggedItemRef.current.opacity = 1;
                draggedItemRef.current = null;
            }
        };

        canvas.addEventListener('mousedown', handleInteraction);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('touchstart', (e) => handleInteraction(e, true), { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

        const context = canvas.getContext('2d');
        let animationFrameId;

        const renderLoop = () => {
            context.fillStyle = theme === 'dark' ? '#2A2A2A' : '#fff';
            context.fillRect(0, 0, canvas.width, canvas.height);

            [wallRef.current, floorRef.current].forEach(body => {
                const vertices = body.vertices;
                const minX = Math.min(...vertices.map(v => v.x));
                const maxX = Math.max(...vertices.map(v => v.x));
                const minY = Math.min(...vertices.map(v => v.y));
                const maxY = Math.max(...vertices.map(v => v.y));
                const objWidth = maxX - minX;
                const objHeight = maxY - minY;

                context.save();
                context.beginPath();
                context.moveTo(vertices[0].x, vertices[0].y);
                for (let j = 1; j < vertices.length; j++) {
                    context.lineTo(vertices[j].x, vertices[j].y);
                }
                context.closePath();
                context.clip();

                const isWall = body === wallRef.current;
                const config = isWall ? textureConfig.wallpaper : textureConfig.floor;
                const image = config.ref.current;
                const isImageLoaded = imagesLoadedRef.current[config.key];

                if (isImageLoaded && image.width && image.height) {
                    const aspectRatio = image.width / image.height;
                    const textureHeight = objHeight;
                    const textureWidth = textureHeight * aspectRatio;

                    if (textureWidth < objWidth) {
                        const pattern = context.createPattern(image, 'repeat-x');
                        context.fillStyle = pattern;
                        context.translate(minX, minY);
                        context.scale(textureWidth / image.width, textureHeight / image.height);
                        context.fill();
                    } else {
                        context.drawImage(image, minX, minY, textureWidth, textureHeight);
                    }
                } else {
                    context.fillStyle = isWall ? (theme === 'dark' ? '#4A4A4A' : '#D3D3D3') : (theme === 'dark' ? '#3A3A3A' : '#A9A9A9');
                    context.fill();
                }
                context.restore();
            });

            itemDataRef.current.forEach(item => {
                const margin = 5;
                const halfWidth = (item.width * item.scaleFactor) / 2;
                const halfHeight = (item.height * item.scaleFactor) / 2;
                item.x = Math.max(margin + halfWidth, Math.min(item.x, canvas.width - margin - halfWidth));
                item.y = Math.max(margin + halfHeight, Math.min(item.y, canvas.height - margin - halfHeight));

                const y = item.y;
                const minY = height * 0.4;
                const maxY = height;
                let targetScale = 1;
                if (y >= minY && y <= maxY) {
                    targetScale = 1 + (y - minY) / (maxY - minY);
                } else if (y > maxY) {
                    targetScale = 2;
                }
                item.scaleFactor = targetScale;
            });

            const items = itemDataRef.current.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
            items.forEach(item => {
                context.globalAlpha = item.opacity;
                if (item.texture) {
                    const config = Object.values(textureConfig).find(conf => conf.image === item.texture);
                    if (config && imagesLoadedRef.current[config.key]) {
                        const image = config.ref.current;

                        if (image.width && image.height) {
                            const aspectRatio = image.width / image.height;
                            const textureHeight = item.height * item.scaleFactor;
                            const textureWidth = textureHeight * aspectRatio;
                            context.save();
                            context.shadowColor = 'rgba(0, 0, 0, 0.3)';
                            context.shadowBlur = 5;
                            context.shadowOffsetX = 3;
                            context.shadowOffsetY = 3;
                            context.drawImage(image, item.x - textureWidth / 2, item.y - textureHeight / 2, textureWidth, textureHeight);
                            context.shadowColor = 'rgba(0, 0, 0, 0)';
                            context.shadowBlur = 0;
                            context.shadowOffsetX = 0;
                            context.shadowOffsetY = 0;
                            context.restore();
                        }
                    }
                    context.globalAlpha = 1;
                });

            animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop();

        runnerRef.current = Matter.Runner.create();
        Matter.Runner.run(runnerRef.current, engine);

        // В основном useEffect, обновляем handleResize
        const handleResize = () => {
            const canvas = canvasRef.current;
            const newWidth = canvas.parentElement.getBoundingClientRect().width;
            const newHeight = canvas.parentElement.getBoundingClientRect().height;
            canvas.width = newWidth;
            canvas.height = newHeight;

            // Используем пропорции из начальных размеров
            const wallHeight = newHeight * 0.4;
            const floorHeight = newHeight * 0.6;

            // Обновляем позиции и размеры стены и пола
            Matter.Body.setPosition(wallRef.current, { x: newWidth / 2, y: wallHeight / 2 });
            Matter.Body.setPosition(floorRef.current, { x: newWidth / 2, y: newHeight - floorHeight / 2 });
            Matter.Body.setVertices(wallRef.current, Matter.Bodies.rectangle(newWidth / 2, wallHeight / 2, newWidth, wallHeight).vertices);
            Matter.Body.setVertices(floorRef.current, Matter.Bodies.rectangle(newWidth / 2, newHeight - floorHeight / 2, newWidth, floorHeight).vertices);

            // Обновляем позиции предметов пропорционально новому размеру
            itemDataRef.current.forEach(item => {
                item.x = (item.x / initialDimensionsRef.current.width) * newWidth;
                item.y = (item.y / initialDimensionsRef.current.height) * newHeight;
                const margin = 5;
                const halfWidth = (item.width * item.scaleFactor) / 2;
                const halfHeight = (item.height * item.scaleFactor) / 2;
                item.x = Math.max(margin + halfWidth, Math.min(item.x, newWidth - margin - halfWidth));
                item.y = Math.max(margin + halfHeight, Math.min(item.y, newHeight - margin - halfHeight));
            });

            // Добавляем отладочный лог для проверки размеров при ресайзе
            console.log('Ресайз:', { newWidth, newHeight, wallHeight, floorHeight, floorY: newHeight - floorHeight / 2 });

            // Сохраняем новые размеры как начальные
            initialDimensionsRef.current = { width: newWidth, height: newHeight, wallHeight, floorHeight };
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener('mousedown', handleInteraction);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('touchstart', (e) => handleInteraction(e, true));
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('resize', handleResize);
            Matter.Runner.stop(runnerRef.current);
            Matter.World.clear(engine.world);
            Matter.Engine.clear(engine);
        };
    }, [theme, userId, socket, currentRoom, locationItems]);

    return (
        <ShelterContainer theme={theme}>
            <CloseIcon theme={theme} onClick={handleClose}>×</CloseIcon>
            <SaveButton theme={theme} isSaved={isSaved} onClick={handleSave}>Сохранить</SaveButton>
            <CanvasContainer>
                <canvas ref={canvasRef} />
            </CanvasContainer>
        </ShelterContainer>
    );
}

export default MyShelter;
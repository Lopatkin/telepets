import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Matter from 'matter-js';
import wallpaperImage from '../images/dwelling/wallpaper.jpg';
import floorImage from '../images/dwelling/floor.jpg';
import stickImage from '../images/dwelling/furniture/stick.png'; // Добавляем импорт текстуры для палки
import garbageImage from '../images/dwelling/furniture/garbage.png'; // Добавляем импорт текстуры для мусора
import berryImage from '../images/dwelling/furniture/berry.png'; // Добавляем импорт текстуры для ягод
import mushroomsImage from '../images/dwelling/furniture/mushrooms.png'; // Добавляем импорт текстуры для грибов

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0);
  z-index: 1500;
  pointer-events: auto;
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

const ToggleContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 100px;
  display: flex;
  align-items: center;
  z-index: 2000;
`;

const ToggleLabel = styled.label`
  color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#000')};
  margin-left: 8px;
  font-size: 16px;
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
`;

function MyShelter({ theme, setShowMyShelter, userId, socket, currentRoom }) {
    const canvasRef = useRef(null);
    const engineRef = useRef(Matter.Engine.create());
    const runnerRef = useRef(null);
    const bodiesRef = useRef([]);
    const mouseConstraintRef = useRef(null);
    const originalSizesRef = useRef({});
    const [isFixed, setIsFixed] = useState(false);
    const circleRef = useRef(null);
    const squareRef = useRef(null);
    const triangleRef = useRef(null);
    const wallpaperImgRef = useRef(new Image());
    const floorImgRef = useRef(new Image());
    const stickImgRef = useRef(new Image());
    const garbageImgRef = useRef(new Image());
    const berryImgRef = useRef(new Image()); // Создаем реф для текстуры ягод
    const mushroomsImgRef = useRef(new Image()); // Создаем реф для текстуры грибов
    const imagesLoadedRef = useRef({
        wallpaper: false,
        floor: false,
        stick: false,
        garbage: false,
        berry: false, // Добавляем флаг для ягод
        mushrooms: false // Добавляем флаг для грибов
    });
    const [locationItems, setLocationItems] = useState([]);

    // Загрузка изображений
    useEffect(() => {
        wallpaperImgRef.current.src = wallpaperImage;
        floorImgRef.current.src = floorImage;
        stickImgRef.current.src = stickImage;
        garbageImgRef.current.src = garbageImage;
        berryImgRef.current.src = berryImage; // Устанавливаем источник для текстуры ягод
        mushroomsImgRef.current.src = mushroomsImage; // Устанавливаем источник для текстуры грибов

        wallpaperImgRef.current.onload = () => {
            imagesLoadedRef.current.wallpaper = true;
        };
        floorImgRef.current.onload = () => {
            imagesLoadedRef.current.floor = true;
        };
        stickImgRef.current.onload = () => {
            imagesLoadedRef.current.stick = true;
        };
        garbageImgRef.current.onload = () => {
            imagesLoadedRef.current.garbage = true;
        };
        berryImgRef.current.onload = () => {
            imagesLoadedRef.current.berry = true; // Устанавливаем флаг загрузки для ягод
        };
        mushroomsImgRef.current.onload = () => {
            imagesLoadedRef.current.mushrooms = true; // Устанавливаем флаг загрузки для грибов
        };

        wallpaperImgRef.current.onerror = () => {
            console.error('Failed to load wallpaper image');
            imagesLoadedRef.current.wallpaper = true;
        };
        floorImgRef.current.onerror = () => {
            console.error('Failed to load floor image');
            imagesLoadedRef.current.floor = true;
        };
        stickImgRef.current.onerror = () => {
            console.error('Failed to load stick image');
            imagesLoadedRef.current.stick = true;
        };
        garbageImgRef.current.onerror = () => {
            console.error('Failed to load garbage image');
            imagesLoadedRef.current.garbage = true;
        };
        berryImgRef.current.onerror = () => {
            console.error('Failed to load berry image');
            imagesLoadedRef.current.berry = true; // Обработка ошибки загрузки ягод
        };
        mushroomsImgRef.current.onerror = () => {
            console.error('Failed to load mushrooms image');
            imagesLoadedRef.current.mushrooms = true; // Обработка ошибки загрузки грибов
        };
    }, []);

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

        return () => {
            socket.off('items');
        };
    }, [socket, currentRoom]);

    const handleClose = () => {
        // Сохранение позиций и масштабов всех объектов
        const positions = {
            circle: { x: circleRef.current.position.x, y: circleRef.current.position.y, scaleFactor: circleRef.current.scaleFactor },
            square: { x: squareRef.current.position.x, y: squareRef.current.position.y, scaleFactor: squareRef.current.scaleFactor },
            triangle: { x: triangleRef.current.position.x, y: triangleRef.current.position.y, scaleFactor: triangleRef.current.scaleFactor },
            ...locationItems.reduce((acc, item, index) => ({
                ...acc,
                [`item_${item._id}`]: {
                    x: bodiesRef.current.find(b => b.itemId === item._id)?.position.x || (canvasRef.current?.width * (0.2 + (index % 5) * 0.15)),
                    y: bodiesRef.current.find(b => b.itemId === item._id)?.position.y || (canvasRef.current?.height * 0.4),
                    scaleFactor: bodiesRef.current.find(b => b.itemId === item._id)?.scaleFactor || 1
                }
            }), {})
        };
        localStorage.setItem(`shelterObjectPositions_${userId}`, JSON.stringify(positions));
        setShowMyShelter(false);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const parent = canvas.parentElement;
        const width = parent.getBoundingClientRect().width;
        const height = parent.getBoundingClientRect().height;
        canvas.width = width;
        canvas.height = height;

        const engine = engineRef.current;
        engine.gravity.y = 0;

        // Создаем границы
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

        // Создаем стену и пол
        const wallHeight = height * 0.4;
        const floorHeight = height * 0.6;
        const staticCollisionFilter = { category: 0x0002, mask: 0 };
        const wall = Matter.Bodies.rectangle(width / 2, wallHeight / 2, width, wallHeight, {
            isStatic: true,
            restitution: 0,
            friction: 0,
            frictionAir: 0,
            render: {
                fillStyle: theme === 'dark' ? '#4A4A4A' : '#D3D3D3',
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
                fillStyle: theme === 'dark' ? '#3A3A3A' : '#A9A9A9',
                zIndex: -100
            },
            collisionFilter: staticCollisionFilter
        });

        // Загружаем сохраненные позиции и масштабы
        const savedPositions = JSON.parse(localStorage.getItem(`shelterObjectPositions_${userId}`)) || {};
        const floorTopY = height * 0.4;

        // Создаем статичные объекты (круг, квадрат, треугольник)
        const circle = Matter.Bodies.circle(
            savedPositions.circle?.x || width * 0.25,
            savedPositions.circle?.y || floorTopY,
            30,
            {
                isStatic: false,
                restitution: 0,
                friction: 1,
                frictionAir: 0.1,
                render: {
                    fillStyle: 'red',
                    zIndex: 0
                },
                collisionFilter: { group: -1, category: 0x0001, mask: 0x0003 }
            }
        );
        const circleScale = savedPositions.circle?.scaleFactor || 1;
        circle.scaleFactor = circleScale;
        Matter.Body.scale(circle, circleScale, circleScale);
        originalSizesRef.current.circle = { radius: 30 };
        circleRef.current = circle;

        const square = Matter.Bodies.rectangle(
            savedPositions.square?.x || width * 0.5,
            savedPositions.square?.y || floorTopY,
            60,
            60,
            {
                isStatic: false,
                restitution: 0,
                friction: 1,
                frictionAir: 0.1,
                render: {
                    fillStyle: 'blue',
                    zIndex: 0
                },
                collisionFilter: { group: -1, category: 0x0001, mask: 0x0003 }
            }
        );
        const squareScale = savedPositions.square?.scaleFactor || 1;
        square.scaleFactor = squareScale;
        Matter.Body.scale(square, squareScale, squareScale);
        originalSizesRef.current.square = { width: 60, height: 60 };
        squareRef.current = square;

        const triangle = Matter.Bodies.polygon(
            savedPositions.triangle?.x || width * 0.75,
            savedPositions.triangle?.y || floorTopY,
            3,
            40,
            {
                isStatic: false,
                restitution: 0,
                friction: 1,
                frictionAir: 0.1,
                render: {
                    fillStyle: 'yellow',
                    zIndex: 0
                },
                collisionFilter: { group: -1, category: 0x0001, mask: 0x0003 }
            }
        );
        const triangleScale = savedPositions.triangle?.scaleFactor || 1;
        triangle.scaleFactor = triangleScale;
        Matter.Body.scale(triangle, triangleScale, triangleScale);
        originalSizesRef.current.triangle = { radius: 40 };
        triangleRef.current = triangle;

        // Создаем серые квадраты для каждого предмета в инвентаре локации
        const itemBodies = locationItems.map((item, index) => {
            const itemKey = `item_${item._id}`;
            const savedItem = savedPositions[itemKey] || {
                x: width * (0.2 + (index % 5) * 0.15),
                y: floorTopY,
                scaleFactor: 1
            };

            const isStick = item.name === 'Палка';
            const isGarbage = item.name === 'Мусор';
            const isBerry = item.name === 'Лесные ягоды'; // Проверяем, является ли предмет "Ягоды"
            const isMushrooms = item.name === 'Лесные грибы'; // Проверяем, является ли предмет "Грибы"
            const itemSquare = Matter.Bodies.rectangle(
                savedItem.x,
                savedItem.y,
                50,
                50,
                {
                    isStatic: false,
                    restitution: 0,
                    friction: 1,
                    frictionAir: 0.1,
                    render: {
                        fillStyle: isStick || isGarbage || isBerry || isMushrooms ? 'transparent' : 'grey', // Прозрачный фон для текстурированных предметов
                        sprite: isStick ? { texture: stickImage } :
                            isGarbage ? { texture: garbageImage } :
                                isBerry ? { texture: berryImage } :
                                    isMushrooms ? { texture: mushroomsImage } : undefined, // Текстура для соответствующих предметов
                        zIndex: 0
                    },
                    collisionFilter: { group: -1, category: 0x0001, mask: 0x0003 },
                    itemId: item._id
                }
            );
            const itemScale = savedItem.scaleFactor || 1;
            itemSquare.scaleFactor = itemScale;
            Matter.Body.scale(itemSquare, itemScale, itemScale);
            originalSizesRef.current[itemKey] = { width: 50, height: 50 };
            return itemSquare;
        });

        // Объединяем все объекты
        bodiesRef.current = [circle, square, triangle, ...itemBodies];
        Matter.World.add(engine.world, [...boundaries, wall, floor, circle, square, triangle, ...itemBodies]);

        // Настройка мыши
        const mouse = Matter.Mouse.create(canvas);

        const bringToFront = (body) => {
            const maxZIndex = Math.max(...bodiesRef.current.map(b => b.render.zIndex || 0));
            body.render.zIndex = maxZIndex + 1;
        };

        const handleMouseDown = (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            const mouse = Matter.Vector.create(mouseX, mouseY);
            const clickedBody = bodiesRef.current.find(body => Matter.Bounds.contains(body.bounds, mouse));
            if (clickedBody) {
                bringToFront(clickedBody);
            }
        };

        const handleTouchStart = (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            const rect = canvas.getBoundingClientRect();
            const mouseX = touch.clientX - rect.left;
            const mouseY = touch.clientY - rect.top;
            mouse.position.x = mouseX;
            mouse.position.y = mouseY;
            mouse.mousedown = true;

            const touchPoint = Matter.Vector.create(mouseX, mouseY);
            const touchedBody = bodiesRef.current.find(body => Matter.Bounds.contains(body.bounds, touchPoint));
            if (touchedBody) {
                bringToFront(touchedBody);
            }
        };

        const handleTouchMove = (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            const rect = canvas.getBoundingClientRect();
            const mouseX = touch.clientX - rect.left;
            const mouseY = touch.clientY - rect.top;
            mouse.position.x = mouseX;
            mouse.position.y = mouseY;
        };

        const handleTouchEnd = (event) => {
            event.preventDefault();
            mouse.mousedown = false;
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false },
            },
        });
        mouseConstraintRef.current = mouseConstraint;
        Matter.World.add(engine.world, mouseConstraint);

        Matter.Events.on(mouseConstraint, 'enddrag', (event) => {
            const draggedBody = event.body;
            Matter.Body.setVelocity(draggedBody, { x: 0, y: 0 });
        });

        Matter.Events.on(mouseConstraint, 'startdrag', (event) => {
            const draggedBody = event.body;
            bringToFront(draggedBody);
        });

        // Пользовательский цикл рендеринга
        const context = canvas.getContext('2d');
        let animationFrameId;

        const renderLoop = () => {
            context.fillStyle = theme === 'dark' ? '#2A2A2A' : '#fff';
            context.fillRect(0, 0, canvas.width, canvas.height);

            // Рендерим статичные объекты (стена и пол) с текстурами
            [wall, floor].forEach(body => {
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

                const isWall = body === wall;
                const image = isWall ? wallpaperImgRef.current : floorImgRef.current;
                const isImageLoaded = isWall ? imagesLoadedRef.current.wallpaper : imagesLoadedRef.current.floor;

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
                    context.fillStyle = body.render.fillStyle;
                    context.fill();
                }
                context.restore();
            });

            // Проверяем позиции и масштабируем интерактивные объекты
            bodiesRef.current.forEach(body => {
                const bounds = body.bounds;
                const margin = 5;
                if (bounds.min.x < margin) {
                    Matter.Body.setPosition(body, { x: margin + (bounds.max.x - bounds.min.x) / 2, y: body.position.y });
                }
                if (bounds.max.x > canvas.width - margin) {
                    Matter.Body.setPosition(body, { x: canvas.width - margin - (bounds.max.x - bounds.min.x) / 2, y: body.position.y });
                }
                if (bounds.min.y < margin) {
                    Matter.Body.setPosition(body, { x: body.position.x, y: margin + (bounds.max.y - bounds.min.y) / 2 });
                }
                if (bounds.max.y > canvas.height - margin) {
                    Matter.Body.setPosition(body, { x: body.position.x, y: canvas.height - margin - (bounds.max.y - bounds.min.y) / 2 });
                }

                // Масштабирование на основе y-позиции
                const y = body.position.y;
                const minY = height * 0.4;
                const maxY = height;
                let targetScale = 1;
                if (y >= minY && y <= maxY) {
                    targetScale = 1 + (y - minY) / (maxY - minY);
                } else if (y > maxY) {
                    targetScale = 2;
                }

                if (Math.abs(body.scaleFactor - targetScale) > 0.001) {
                    const scaleFactor = targetScale / body.scaleFactor;
                    Matter.Body.scale(body, scaleFactor, scaleFactor);
                    body.scaleFactor = targetScale;
                }
            });

            // Рендерим интерактивные объекты
            const bodies = bodiesRef.current.sort((a, b) => (a.render.zIndex || 0) - (b.render.zIndex || 0));
            bodies.forEach(body => {
                context.beginPath();
                if (body.circleRadius) {
                    context.arc(body.position.x, body.position.y, body.circleRadius, 0, 2 * Math.PI);
                } else {
                    const vertices = body.vertices;
                    context.moveTo(vertices[0].x, vertices[0].y);
                    for (let j = 1; j < vertices.length; j++) {
                        context.lineTo(vertices[j].x, vertices[j].y);
                    }
                    context.closePath();
                }
        
                // Проверяем, есть ли у объекта текстура (для палки, мусора, ягод или грибов)
                if (body.render.sprite && 
                    [stickImage, garbageImage, berryImage, mushroomsImage].includes(body.render.sprite.texture) && 
                    imagesLoadedRef.current[body.render.sprite.texture === stickImage ? 'stick' : 
                                           body.render.sprite.texture === garbageImage ? 'garbage' : 
                                           body.render.sprite.texture === berryImage ? 'berry' : 'mushrooms']) {
                    const vertices = body.vertices;
                    const minX = Math.min(...vertices.map(v => v.x));
                    // const maxX = Math.max(...vertices.map(v => v.x));
                    const minY = Math.min(...vertices.map(v => v.y));
                    const maxY = Math.max(...vertices.map(v => v.y));
                    const objHeight = maxY - minY;
        
                    context.save();
                    context.beginPath();
                    context.moveTo(vertices[0].x, vertices[0].y);
                    for (let j = 1; j < vertices.length; j++) {
                        context.lineTo(vertices[j].x, vertices[j].y);
                    }
                    context.closePath();
                    context.clip();
        
                    // Добавляем тень для текстурированных предметов
                    context.shadowColor = 'rgba(0, 0, 0, 0.3)'; // Полупрозрачная черная тень
                    context.shadowBlur = 5; // Размытие тени
                    context.shadowOffsetX = 3; // Смещение тени по X
                    context.shadowOffsetY = 3; // Смещение тени по Y
        
                    const image = body.render.sprite.texture === stickImage ? stickImgRef.current : 
                                 body.render.sprite.texture === garbageImage ? garbageImgRef.current : 
                                 body.render.sprite.texture === berryImage ? berryImgRef.current : 
                                 mushroomsImgRef.current;
                    if (image.width && image.height) {
                        const aspectRatio = image.width / image.height;
                        const textureHeight = objHeight;
                        const textureWidth = textureHeight * aspectRatio;
        
                        context.drawImage(image, minX, minY, textureWidth, textureHeight);
                    }
        
                    // Сбрасываем настройки тени после рендеринга
                    context.shadowColor = 'rgba(0, 0, 0, 0)';
                    context.shadowBlur = 0;
                    context.shadowOffsetX = 0;
                    context.shadowOffsetY = 0;
        
                    context.restore();
                } else {
                    context.fillStyle = body.render.fillStyle;
                    context.fill();
                }
            });

            animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop();

        // Запускаем физический движок
        runnerRef.current = Matter.Runner.create();
        Matter.Runner.run(runnerRef.current, engine);

        // Адаптация при изменении размера окна
        const handleResize = () => {
            const newWidth = canvas.parentElement.getBoundingClientRect().width;
            const newHeight = canvas.parentElement.getBoundingClientRect().height;
            canvas.width = newWidth;
            canvas.height = newHeight;

            Matter.Body.setPosition(boundaries[0], { x: newWidth / 2, y: -25 });
            Matter.Body.setPosition(boundaries[1], { x: newWidth / 2, y: newHeight + 25 });
            Matter.Body.setPosition(boundaries[2], { x: -25, y: newHeight / 2 });
            Matter.Body.setPosition(boundaries[3], { x: newWidth + 25, y: newHeight / 2 });

            Matter.Body.setPosition(wall, { x: newWidth / 2, y: (newHeight * 0.4) / 2 });
            Matter.Body.setPosition(floor, { x: newWidth / 2, y: newHeight - (newHeight * 0.6) / 2 });
            const scaleX = newWidth / width;
            const scaleY = newHeight / height;
            Matter.Body.scale(wall, scaleX, scaleY);
            Matter.Body.scale(floor, scaleX, scaleY);

            const margin = 5;
            bodiesRef.current.forEach(body => {
                const bounds = body.bounds;
                if (bounds.min.x < margin || bounds.max.x > newWidth - margin || bounds.min.y < margin || bounds.max.y > newHeight - margin) {
                    const newX = Math.max(margin + (bounds.max.x - bounds.min.x) / 2, Math.min(body.position.x, newWidth - margin - (bounds.max.x - bounds.min.x) / 2));
                    const newY = Math.max(margin + (bounds.max.y - bounds.min.y) / 2, Math.min(body.position.y, newHeight - margin - (bounds.max.y - bounds.min.y) / 2));
                    Matter.Body.setPosition(body, { x: newX, y: newY });
                }
            });
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('touchstart', handleTouchStart);
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
            <ToggleContainer>
                <input
                    type="checkbox"
                    checked={isFixed}
                    onChange={() => setIsFixed(!isFixed)}
                    id="fixToggle"
                />
                <ToggleLabel theme={theme} htmlFor="fixToggle">
                    Зафиксировать
                </ToggleLabel>
            </ToggleContainer>
            {isFixed && <Overlay />}
            <CanvasContainer>
                <canvas ref={canvasRef} />
            </CanvasContainer>
        </ShelterContainer>
    );
}

export default MyShelter;
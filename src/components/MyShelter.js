import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Matter from 'matter-js';
import wallpaperImage from '../images/dwelling/wallpaper.jpg';
import floorImage from '../images/dwelling/floor.jpg';
import chairImage from '../images/dwelling/furniture/chair.png';
import sofaImage from '../images/dwelling/furniture/sofa.png';
import tableImage from '../images/dwelling/furniture/table.png';
import wardrobeImage from '../images/dwelling/furniture/wardrobe.png';
import stickImage from '../images/dwelling/furniture/stick.jpg';

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

function MyShelter({ theme, setShowMyShelter, userId, socket }) {
    const canvasRef = useRef(null);
    const engineRef = useRef(Matter.Engine.create());
    const runnerRef = useRef(null);
    const bodiesRef = useRef([]);
    const mouseConstraintRef = useRef(null);
    const originalSizesRef = useRef({});
    const [isFixed, setIsFixed] = useState(false);
    const itemRefs = useRef({});
    const wallpaperImgRef = useRef(new Image());
    const floorImgRef = useRef(new Image());
    const imagesLoadedRef = useRef({ wallpaper: false, floor: false });
    const itemImagesRef = useRef({
        Стул: new Image(),
        Диван: new Image(),
        Стол: new Image(),
        Шкаф: new Image(),
        Палка: new Image(),
    });
    const itemImagesLoadedRef = useRef({
        Стул: false,
        Диван: false,
        Стол: false,
        Шкаф: false,
        Палка: false,
    });
    const [items, setItems] = useState([]);

    // Размеры предметов
    const itemSizes = {
        Стул: { width: 60, height: 60 },
        Диван: { width: 100, height: 60 },
        Стол: { width: 80, height: 60 },
        Шкаф: { width: 80, height: 100 },
        Палка: { width: 40, height: 20 },
    };

    // Загрузка изображений
    useEffect(() => {
        wallpaperImgRef.current.src = wallpaperImage;
        floorImgRef.current.src = floorImage;
        itemImagesRef.current.Стул.src = chairImage;
        itemImagesRef.current.Диван.src = sofaImage;
        itemImagesRef.current.Стол.src = tableImage;
        itemImagesRef.current.Шкаф.src = wardrobeImage;
        itemImagesRef.current.Палка.src = stickImage;

        wallpaperImgRef.current.onload = () => {
            imagesLoadedRef.current.wallpaper = true;
        };
        floorImgRef.current.onload = () => {
            imagesLoadedRef.current.floor = true;
        };
        Object.keys(itemImagesRef.current).forEach((key) => {
            itemImagesRef.current[key].onload = () => {
                itemImagesLoadedRef.current[key] = true;
            };
            itemImagesRef.current[key].onerror = () => {
                console.error(`Failed to load image for ${key}`);
                itemImagesLoadedRef.current[key] = true;
            };
        });
    }, []);

    // Запрос предметов из инвентаря комнаты
    useEffect(() => {
        if (!socket || !userId) return;

        const owner = `myhome_${userId}`;
        socket.emit('getItems', { owner });

        const handleItems = (data) => {
            if (data.owner === owner) {
                const validItems = data.items.filter((item) =>
                    ['Стул', 'Диван', 'Стол', 'Шкаф', 'Палка'].includes(item.name)
                );
                setItems(validItems);
            }
        };

        socket.on('items', handleItems);

        return () => {
            socket.off('items', handleItems);
        };
    }, [socket, userId]);

    const handleClose = () => {
        const positions = {};
        Object.keys(itemRefs.current).forEach((itemId) => {
            const body = itemRefs.current[itemId];
            positions[itemId] = {
                x: body.position.x,
                y: body.position.y,
                scaleFactor: body.scaleFactor,
            };
        });
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
            collisionFilter: { category: 0x0003, mask: 0x0001 },
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
                zIndex: -100,
            },
            collisionFilter: staticCollisionFilter,
        });

        const floor = Matter.Bodies.rectangle(width / 2, height - floorHeight / 2, width, floorHeight, {
            isStatic: true,
            restitution: 0,
            friction: 0,
            frictionAir: 0,
            render: {
                fillStyle: theme === 'dark' ? '#3A3A3A' : '#A9A9A9',
                zIndex: -100,
            },
            collisionFilter: staticCollisionFilter,
        });

        // Загружаем сохраненные позиции
        const savedPositions = JSON.parse(localStorage.getItem(`shelterObjectPositions_${userId}`)) || {};
        const floorTopY = height * 0.4;

        // Создаем объекты для каждого предмета
        const bodies = items.map((item, index) => {
            const { width: baseWidth, height: baseHeight } = itemSizes[item.name] || { width: 60, height: 60 };
            const itemId = item._id.toString();
            const saved = savedPositions[itemId] || {};
            const body = Matter.Bodies.rectangle(
                saved.x || width * (0.2 + (index % 5) * 0.15),
                saved.y || floorTopY,
                baseWidth,
                baseHeight,
                {
                    isStatic: false,
                    restitution: 0,
                    friction: 1,
                    frictionAir: 0.1,
                    render: {
                        fillStyle: 'transparent',
                        zIndex: 0,
                    },
                    collisionFilter: { group: -1, category: 0x0001, mask: 0x0003 },
                }
            );
            const scaleFactor = saved.scaleFactor || 1;
            body.scaleFactor = scaleFactor;
            body.itemId = itemId;
            body.itemName = item.name;
            Matter.Body.scale(body, scaleFactor, scaleFactor);
            originalSizesRef.current[itemId] = { width: baseWidth, height: baseHeight };
            itemRefs.current[itemId] = body;
            return body;
        });

        bodiesRef.current = bodies;
        Matter.World.add(engine.world, [...boundaries, wall, floor, ...bodies]);

        // Настройка мыши
        const mouse = Matter.Mouse.create(canvas);

        const bringToFront = (body) => {
            const maxZIndex = Math.max(...bodiesRef.current.map((b) => b.render.zIndex || 0));
            body.render.zIndex = maxZIndex + 1;
        };

        const handleMouseDown = (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            const mouse = Matter.Vector.create(mouseX, mouseY);
            const clickedBody = bodiesRef.current.find((body) => Matter.Bounds.contains(body.bounds, mouse));
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
            const touchedBody = bodiesRef.current.find((body) => Matter.Bounds.contains(body.bounds, touchPoint));
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

            // Рендерим статичные объекты (стена и пол)
            [wall, floor].forEach((body) => {
                const vertices = body.vertices;
                const minX = Math.min(...vertices.map((v) => v.x));
                const maxX = Math.max(...vertices.map((v) => v.x));
                const minY = Math.min(...vertices.map((v) => v.y));
                const maxY = Math.max(...vertices.map((v) => v.y));
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
            bodiesRef.current.forEach((body) => {
                const bounds = body.bounds;
                const margin = 5;
                if (bounds.min.x < margin) {
                    Matter.Body.setPosition(body, {
                        x: margin + (bounds.max.x - bounds.min.x) / 2,
                        y: body.position.y,
                    });
                }
                if (bounds.max.x > canvas.width - margin) {
                    Matter.Body.setPosition(body, {
                        x: canvas.width - margin - (bounds.max.x - bounds.min.x) / 2,
                        y: body.position.y,
                    });
                }
                if (bounds.min.y < margin) {
                    Matter.Body.setPosition(body, {
                        x: body.position.x,
                        y: margin + (bounds.max.y - bounds.min.y) / 2,
                    });
                }
                if (bounds.max.y > canvas.height - margin) {
                    Matter.Body.setPosition(body, {
                        x: body.position.x,
                        y: canvas.height - margin - (bounds.max.y - bounds.min.y) / 2,
                    });
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
            bodies.forEach((body) => {
                const vertices = body.vertices;
                const minX = Math.min(...vertices.map((v) => v.x));
                const maxX = Math.max(...vertices.map((v) => v.x));
                const minY = Math.min(...vertices.map((v) => v.y));
                const maxY = Math.max(...vertices.map((v) => v.y));
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

                const image = itemImagesRef.current[body.itemName];
                const isImageLoaded = itemImagesLoadedRef.current[body.itemName];

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
                    context.fillStyle = 'gray';
                    context.fill();
                }
                context.restore();
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

            // Обновляем позиции и размеры границы
            Matter.Body.setPosition(boundaries[0], { x: newWidth / 2, y: -25 });
            Matter.Body.setPosition(boundaries[1], { x: newWidth / 2, y: newHeight + 25 });
            Matter.Body.setPosition(boundaries[2], { x: -25, y: newHeight / 2 });
            Matter.Body.setPosition(boundaries[3], { x: newWidth + 25, y: newHeight / 2 });

            // Обновляем позиции и размеры стены и пола
            Matter.Body.setPosition(wall, { x: newWidth / 2, y: (newHeight * 0.4) / 2 });
            Matter.Body.setPosition(floor, { x: newWidth / 2, y: newHeight - (newHeight * 0.6) / 2 });
            const scaleX = newWidth / width;
            const scaleY = newHeight / height;
            Matter.Body.scale(wall, scaleX, scaleY);
            Matter.Body.scale(floor, scaleX, scaleY);

            // Проверяем, что интерактивные объекты остаются в видимой области
            const margin = 5;
            bodiesRef.current.forEach((body) => {
                const bounds = body.bounds;
                if (
                    bounds.min.x < margin ||
                    bounds.max.x > newWidth - margin ||
                    bounds.min.y < margin ||
                    bounds.max.y > newHeight - margin
                ) {
                    const newX = Math.max(
                        margin + (bounds.max.x - bounds.min.x) / 2,
                        Math.min(body.position.x, newWidth - margin - (bounds.max.x - bounds.min.x) / 2)
                    );
                    const newY = Math.max(
                        margin + (bounds.max.y - bounds.min.y) / 2,
                        Math.min(body.position.y, newHeight - margin - (bounds.max.y - bounds.min.y) / 2)
                    );
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
    }, [theme, userId, socket, items, itemSizes]); // Добавлен itemSizes`

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
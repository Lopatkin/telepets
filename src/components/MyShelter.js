import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import Matter from 'matter-js';

// Новый стиль для кнопки "Сохранить"
const SaveButton = styled.button`
  position: absolute;
  top: 10px;
  right: 90px; // Сдвигаем, чтобы не перекрывать кнопку "Закрыть"
  background: #28A745;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 16px;
  z-index: 1001;

  &:hover {
    background: #218838;
  }
`;

// Определяем styled-компоненты
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

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 16px;
  z-index: 1001;

  &:hover {
    background: #005BB5;
  }
`;

function MyShelter({ theme, setShowMyShelter, user, socket }) { // Добавляем user и socket в пропсы
    const canvasRef = useRef(null);
    const engineRef = useRef(Matter.Engine.create());
    const runnerRef = useRef(null);
    const bodiesRef = useRef([]);
    const mouseConstraintRef = useRef(null);
    const originalSizesRef = useRef({});

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

        // Загружаем координаты предметов из user.dwelling или используем значения по умолчанию
        const dwelling = user?.dwelling || [];
        const defaultPositions = {
            circle: { x: width * 0.25, y: height * 0.4, scaleFactor: 1 },
            square: { x: width * 0.5, y: height * 0.4, scaleFactor: 1 },
            triangle: { x: width * 0.75, y: height * 0.4, scaleFactor: 1 }
        };

        const circleData = dwelling.find(item => item.id === 'circle') || defaultPositions.circle;
        const circle = Matter.Bodies.circle(circleData.x, circleData.y, 30, {
            isStatic: false,
            restitution: 0,
            friction: 1,
            frictionAir: 0.1,
            render: {
                fillStyle: 'red',
                zIndex: 0
            },
            collisionFilter: { group: -1, category: 0x0001, mask: 0x0003 }
        });
        circle.scaleFactor = circleData.scaleFactor;
        circle.id = 'circle'; // Добавляем id для идентификации
        originalSizesRef.current.circle = { radius: 30 };

        const squareData = dwelling.find(item => item.id === 'square') || defaultPositions.square;
        const square = Matter.Bodies.rectangle(squareData.x, squareData.y, 60, 60, {
            isStatic: false,
            restitution: 0,
            friction: 1,
            frictionAir: 0.1,
            render: {
                fillStyle: 'blue',
                zIndex: 0
            },
            collisionFilter: { group: -1, category: 0x0001, mask: 0x0003 }
        });
        square.scaleFactor = squareData.scaleFactor;
        square.id = 'square'; // Добавляем id для идентификации
        originalSizesRef.current.square = { width: 60, height: 60 };

        const triangleData = dwelling.find(item => item.id === 'triangle') || defaultPositions.triangle;
        const triangle = Matter.Bodies.polygon(squareData.x, squareData.y, 3, 40, {
            isStatic: false,
            restitution: 0,
            friction: 1,
            frictionAir: 0.1,
            render: {
                fillStyle: 'yellow',
                zIndex: 0
            },
            collisionFilter: { group: -1, category: 0x0001, mask: 0x0003 }
        });
        triangle.scaleFactor = triangleData.scaleFactor;
        triangle.id = 'triangle'; // Добавляем id для идентификации
        originalSizesRef.current.triangle = { radius: 40 };

        bodiesRef.current = [circle, square, triangle];
        Matter.World.add(engine.world, [...boundaries, wall, floor, circle, square, triangle]);

        // Функция для сохранения координат предметов
        const saveDwelling = () => {
            const dwellingData = bodiesRef.current.map(body => ({
                id: body.id,
                x: body.position.x,
                y: body.position.y,
                scaleFactor: body.scaleFactor
            }));

            socket.emit('saveDwelling', {
                userId: user.userId,
                dwelling: dwellingData
            }, (response) => {
                if (!response.success) {
                    console.error('Ошибка при сохранении dwelling:', response.message);
                }
            });
        };

        // Остальной код без изменений (обработчики мыши, рендеринг, ресайз и т.д.)
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

        const mouse = Matter.Mouse.create(canvas);
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

        const context = canvas.getContext('2d');
        let animationFrameId;

        const renderLoop = () => {
            context.fillStyle = theme === 'dark' ? '#2A2A2A' : '#fff';
            context.fillRect(0, 0, canvas.width, canvas.height);

            [wall, floor].forEach(body => {
                context.beginPath();
                const vertices = body.vertices;
                context.moveTo(vertices[0].x, vertices[0].y);
                for (let j = 1; j < vertices.length; j++) {
                    context.lineTo(vertices[j].x, vertices[j].y);
                }
                context.closePath();
                context.fillStyle = body.render.fillStyle;
                context.fill();
            });

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
                context.fillStyle = body.render.fillStyle;
                context.fill();
            });

            animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop();

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
    }, [theme, user, socket]); // Добавляем user и socket в зависимости

    return (
        <ShelterContainer theme={theme}>
            <CloseButton onClick={() => setShowMyShelter(false)}>Закрыть</CloseButton>
            <SaveButton onClick={() => {
                const dwellingData = bodiesRef.current.map(body => ({
                    id: body.id,
                    x: body.position.x,
                    y: body.position.y,
                    scaleFactor: body.scaleFactor
                }));
                socket.emit('saveDwelling', {
                    userId: user.userId,
                    dwelling: dwellingData
                }, (response) => {
                    if (!response.success) {
                        console.error('Ошибка при сохранении dwelling:', response.message);
                    }
                });
            }}>Сохранить</SaveButton>
            <CanvasContainer>
                <canvas ref={canvasRef} />
            </CanvasContainer>
        </ShelterContainer>
    );
}

export default MyShelter;
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import Matter from 'matter-js';

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

function MyShelter({ theme, setShowMyShelter }) {
    const canvasRef = useRef(null);
    const engineRef = useRef(Matter.Engine.create());
    const runnerRef = useRef(null);
    const bodiesRef = useRef([]);
    const mouseConstraintRef = useRef(null);

    useEffect(() => {
        const engine = engineRef.current;
        engine.gravity.y = 0;

        const canvas = canvasRef.current;
        const { width, height } = canvas.getBoundingClientRect();

        // Создаем границы
        const boundaryOptions = {
            isStatic: true,
            restitution: 0, // Убираем отскок
            friction: 1, // Увеличиваем трение для остановки объектов
            render: { visible: false },
            collisionFilter: { category: 0x0003, mask: 0x0001 } // Границы взаимодействуют только с интерактивными объектами
        };
        const boundaries = [
            Matter.Bodies.rectangle(width / 2, -25, width, 50, boundaryOptions), // Верхняя граница
            Matter.Bodies.rectangle(width / 2, height + 25, width, 50, boundaryOptions), // Нижняя граница
            Matter.Bodies.rectangle(-25, height / 2, 50, height, boundaryOptions), // Левая граница
            Matter.Bodies.rectangle(width + 25, height / 2, 50, height, boundaryOptions), // Правая граница
        ];

        // Создаем стену и пол
        const wallHeight = height * 0.4; // Стена занимает 40% высоты
        const floorHeight = height * 0.6; // Пол занимает 60% высоты
        const staticCollisionFilter = { category: 0x0002, mask: 0 }; // Уникальная категория, не взаимодействует с другими
        const wall = Matter.Bodies.rectangle(width / 2, wallHeight / 2, width, wallHeight, {
            isStatic: true,
            restitution: 0,
            friction: 0,
            frictionAir: 0,
            render: {
                fillStyle: theme === 'dark' ? '#4A4A4A' : '#D3D3D3', // Цвет для стены
                zIndex: -100 // Самый дальний план
            },
            collisionFilter: staticCollisionFilter // Не взаимодействует с другими объектами
        });

        const floor = Matter.Bodies.rectangle(width / 2, height - floorHeight / 2, width, floorHeight, {
            isStatic: true,
            restitution: 0,
            friction: 0,
            frictionAir: 0,
            render: {
                fillStyle: theme === 'dark' ? '#3A3A3A' : '#A9A9A9', // Цвет для пола
                zIndex: -100 // Самый дальний план
            },
            collisionFilter: staticCollisionFilter // Не взаимодействует с другими объектами
        });

        // Создаем объекты с начальным zIndex
        // const interactiveCollisionFilter = { category: 0x0001, mask: 0x0001 | 0x0003 }; // Взаимодействуют с другими объектами и границами
        const circle = Matter.Bodies.circle(Math.min(width / 4, width - 30), Math.min(height / 4, height - 30), 30, {
            isStatic: false,
            restitution: 0,
            friction: 1,
            frictionAir: 0,
            inertia: Infinity,
            render: {
                fillStyle: 'red',
                zIndex: 0
            },
            collisionFilter: { group: -1, category: 0x0001, mask: 0x0003 } // Отрицательная группа, взаимодействует только с границами
        });

        const square = Matter.Bodies.rectangle(Math.min(width / 2, width - 60), Math.min(height / 2, height - 60), 60, 60, {
            isStatic: false,
            restitution: 0,
            friction: 1,
            frictionAir: 0,
            inertia: Infinity,
            render: {
                fillStyle: 'blue',
                zIndex: 0
            },
            collisionFilter: { group: -1, category: 0x0001, mask: 0x0003 } // Отрицательная группа, взаимодействует только с границами
        });

        const triangle = Matter.Bodies.polygon(Math.min(width * 3 / 4, width - 40), Math.min(height * 3 / 4, height - 40), 3, 40, {
            isStatic: false,
            restitution: 0,
            friction: 1,
            frictionAir: 0,
            inertia: Infinity,
            render: {
                fillStyle: 'yellow',
                zIndex: 0
            },
            collisionFilter: { group: -1, category: 0x0001, mask: 0x0003 } // Отрицательная группа, взаимодействует только с границами
        });

        bodiesRef.current = [circle, square, triangle];
        Matter.World.add(engine.world, [...boundaries, wall, floor, circle, square, triangle]);

        // Настройка мыши для перетаскивания
        const mouse = Matter.Mouse.create(canvas);

        // Функция для поднятия объекта на передний слой
        const bringToFront = (body) => {
            const maxZIndex = Math.max(...bodiesRef.current.map(b => b.render.zIndex || 0));
            body.render.zIndex = maxZIndex + 1;
        };

        // Обработка кликов
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

        // Обработка сенсорных событий
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

        // Поднимаем объект на передний слой при начале перетаскивания
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

            // Рендерим статичные объекты (стена и пол) первыми
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

            // Проверяем и корректируем позиции интерактивных объектов
            bodiesRef.current.forEach(body => {
                const bounds = body.bounds;
                const margin = 5; // Небольшой отступ от границ
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
            });

            // Рендерим интерактивные объекты после, с сортировкой по zIndex
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
            Matter.Body.set(boundaries[0], 'bounds', Matter.Bounds.create([
                { x: 0, y: -50 },
                { x: newWidth, y: 0 },
            ]));
            Matter.Body.set(boundaries[1], 'bounds', Matter.Bounds.create([
                { x: 0, y: newHeight },
                { x: newWidth, y: newHeight + 50 },
            ]));
            Matter.Body.set(boundaries[2], 'bounds', Matter.Bounds.create([
                { x: -50, y: 0 },
                { x: 0, y: newHeight },
            ]));
            Matter.Body.set(boundaries[3], 'bounds', Matter.Bounds.create([
                { x: newWidth, y: 0 },
                { x: newWidth + 50, y: newHeight },
            ]));

            // Обновляем позиции и размеры стены и пола
            Matter.Body.setPosition(wall, { x: newWidth / 2, y: (newHeight * 0.4) / 2 });
            Matter.Body.setPosition(floor, { x: newWidth / 2, y: newHeight - (newHeight * 0.6) / 2 });
            Matter.Body.scale(wall, newWidth / width, (newHeight * 0.4) / wallHeight);
            Matter.Body.scale(floor, newWidth / width, (newHeight * 0.6) / floorHeight);

            // Проверяем, что интерактивные объекты остаются в видимой области
            const margin = 5; // Небольшой отступ от границ
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
    }, [theme]);

    return (
        <ShelterContainer theme={theme}>
            <CloseButton onClick={() => setShowMyShelter(false)}>Закрыть</CloseButton>
            <CanvasContainer>
                <canvas ref={canvasRef} />
            </CanvasContainer>
        </ShelterContainer>
    );
}

export default MyShelter;
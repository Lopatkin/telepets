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
    const renderRef = useRef(null);
    const bodiesRef = useRef([]);
    const mouseConstraintRef = useRef(null);

    useEffect(() => {
        const engine = engineRef.current;
        engine.gravity.y = 0;

        const canvas = canvasRef.current;
        const { width, height } = canvas.getBoundingClientRect();

        // Создаем рендер
        const render = Matter.Render.create({
            canvas: canvas,
            engine: engine,
            options: {
                width,
                height,
                wireframes: false,
                background: theme === 'dark' ? '#2A2A2A' : '#fff',
            },
        });
        renderRef.current = render;

        // Создаем границы
        const boundaryOptions = {
            isStatic: true,
            render: { visible: false },
        };
        const boundaries = [
            Matter.Bodies.rectangle(width / 2, -25, width, 50, boundaryOptions),
            Matter.Bodies.rectangle(width / 2, height + 25, width, 50, boundaryOptions),
            Matter.Bodies.rectangle(-25, height / 2, 50, height, boundaryOptions),
            Matter.Bodies.rectangle(width + 25, height / 2, 50, height, boundaryOptions),
        ];

        // Создаем объекты с начальными z-index
        const circle = Matter.Bodies.circle(Math.min(width / 4, width - 30), Math.min(height / 4, height - 30), 30, {
            isStatic: false,
            restitution: 0,
            friction: 0,
            frictionAir: 0,
            inertia: Infinity,
            render: {
                fillStyle: 'red',
                zIndex: 1
            },
            collisionFilter: { group: -1 },
        });

        const square = Matter.Bodies.rectangle(Math.min(width / 2, width - 60), Math.min(height / 2, height - 60), 60, 60, {
            isStatic: false,
            restitution: 0,
            friction: 0,
            frictionAir: 0,
            inertia: Infinity,
            render: {
                fillStyle: 'blue',
                zIndex: 2
            },
            collisionFilter: { group: -1 },
        });

        const triangle = Matter.Bodies.polygon(Math.min(width * 3 / 4, width - 40), Math.min(height * 3 / 4, height - 40), 3, 40, {
            isStatic: false,
            restitution: 0,
            friction: 0,
            frictionAir: 0,
            inertia: Infinity,
            render: {
                fillStyle: 'yellow',
                zIndex: 3
            },
            collisionFilter: { group: -1 },
        });

        bodiesRef.current = [circle, square, triangle];
        Matter.World.add(engine.world, [...boundaries, circle, square, triangle]);

        // Настройка мыши для перетаскивания
        const mouse = Matter.Mouse.create(canvas);

        // Функция для поднятия объекта на передний слой
        const bringToFront = (body) => {
            // Увеличиваем z-index для всех тел, кроме выбранного
            bodiesRef.current.forEach(b => {
                if (b !== body && b.render.zIndex >= body.render.zIndex) {
                    b.render.zIndex -= 1;
                }
            });

            // Устанавливаем максимальный z-index для выбранного тела
            body.render.zIndex = bodiesRef.current.length;

            // Принудительно обновляем рендер
            Matter.Render.setPixelRatio(render, window.devicePixelRatio);
        };

        // Обработка кликов и сенсорных событий
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
            mouse.mousedown = true; // Имитируем нажатие мыши

            // Проверяем, попал ли клик по объекту
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
            mouse.mousedown = false; // Имитируем отпускание мыши
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

        // Запускаем рендеринг
        runnerRef.current = Matter.Runner.create();
        Matter.Runner.run(runnerRef.current, engine);
        Matter.Render.run(render);

        // Адаптация при изменении размера окна
        const handleResize = () => {
            const newWidth = canvas.parentElement.getBoundingClientRect().width;
            const newHeight = canvas.parentElement.getBoundingClientRect().height;
            canvas.width = newWidth;
            canvas.height = newHeight;
            render.options.width = newWidth;
            render.options.height = newHeight;

            // Обновляем позиции границ
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

            // Проверяем, что объекты остаются в видимой области
            bodiesRef.current.forEach(body => {
                const bounds = body.bounds;
                if (bounds.min.x < 0 || bounds.max.x > newWidth || bounds.min.y < 0 || bounds.max.y > newHeight) {
                    const newX = Math.max(50, Math.min(body.position.x, newWidth - 50));
                    const newY = Math.max(50, Math.min(body.position.y, newHeight - 50));
                    Matter.Body.setPosition(body, { x: newX, y: newY });
                }
            });
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Вызываем сразу для корректной инициализации

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('resize', handleResize);
            Matter.Render.stop(render);
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
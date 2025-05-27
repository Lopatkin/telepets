import React, { useEffect, useRef, useState } from 'react';
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

const ToggleContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  z-index: 1001;
`;

const ToggleLabel = styled.label`
  color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#000')};
  font-size: 16px;
  margin-right: 8px;
`;

const ToggleSwitch = styled.input`
  width: 40px;
  height: 20px;
  appearance: none;
  background: ${({ theme }) => (theme === 'dark' ? '#555' : '#ccc')};
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  outline: none;

  &:checked {
    background: #007AFF;
  }

  &:before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    background: white;
    transition: transform 0.2s;
  }

  &:checked:before {
    transform: translateX(20px);
  }
`;

function MyShelter({ theme, setShowMyShelter }) {
    const canvasRef = useRef(null);
    const engineRef = useRef(Matter.Engine.create());
    const runnerRef = useRef(null);
    const bodiesRef = useRef([]);
    const mouseConstraintRef = useRef(null);
    const originalSizesRef = useRef({});
    const [isFixed, setIsFixed] = useState(false); // Состояние переключателя

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

        // Размещаем объекты у верхней границы пола
        const floorTopY = height * 0.4;
        const circle = Matter.Bodies.circle(width * 0.25, floorTopY, 30, {
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
        circle.scaleFactor = 1;
        originalSizesRef.current.circle = { radius: 30 };

        const square = Matter.Bodies.rectangle(width * 0.5, floorTopY, 60, 60, {
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
        square.scaleFactor = 1;
        originalSizesRef.current.square = { width: 60, height: 60 };

        const triangle = Matter.Bodies.polygon(width * 0.75, floorTopY, 3, 40, {
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
        triangle.scaleFactor = 1;
        originalSizesRef.current.triangle = { radius: 40 };

        bodiesRef.current = [circle, square, triangle];
        Matter.World.add(engine.world, [...boundaries, wall, floor, circle, square, triangle]);

        // Настройка мыши
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

        const bringToFront = (body) => {
            if (!isFixed) { // Приводить к переднему плану только если не зафиксировано
                const maxZIndex = Math.max(...bodiesRef.current.map(b => b.render.zIndex || 0));
                body.render.zIndex = maxZIndex + 1;
            }
        };

        const handleMouseDown = (event) => {
            if (isFixed) return; // Игнорируем клики, если объекты зафиксированы
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
            if (isFixed) return; // Игнорируем касания, если объекты зафиксированы
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
            if (isFixed) return; // Игнорируем движение, если объекты зафиксированы
            event.preventDefault();
            const touch = event.touches[0];
            const rect = canvas.getBoundingClientRect();
            const mouseX = touch.clientX - rect.left;
            const mouseY = touch.clientY - rect.top;
            mouse.position.x = mouseX;
            mouse.position.y = mouseY;
        };

        const handleTouchEnd = (event) => {
            if (isFixed) return; // Игнорируем окончание касания, если объекты зафиксированы
            event.preventDefault();
            mouse.mousedown = false;
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

        Matter.Events.on(mouseConstraint, 'enddrag', (event) => {
            if (isFixed) return; // Игнорируем событие, если объекты зафиксированы
            const draggedBody = event.body;
            Matter.Body.setVelocity(draggedBody, { x: 0, y: 0 });
        });

        Matter.Events.on(mouseConstraint, 'startdrag', (event) => {
            if (isFixed) return; // Игнорируем событие, если объекты зафиксированы
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

            if (!isFixed) {
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
            }

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

            // Обновляем позиции и размеры стены и пола
            Matter.Body.setPosition(wall, { x: newWidth / 2, y: (newHeight * 0.4) / 2 });
            Matter.Body.setPosition(floor, { x: newWidth / 2, y: newHeight - (newHeight * 0.6) / 2 });
            const scaleX = newWidth / width;
            const scaleY = newHeight / height;
            Matter.Body.scale(wall, scaleX, scaleY);
            Matter.Body.scale(floor, scaleX, scaleY);

            if (!isFixed) {
                // Проверяем, что интерактивные объекты остаются в видимой области
                const margin = 5;
                bodiesRef.current.forEach(body => {
                    const bounds = body.bounds;
                    if (bounds.min.x < margin || bounds.max.x > newWidth - margin || bounds.min.y < margin || bounds.max.y > newHeight - margin) {
                        const newX = Math.max(margin + (bounds.max.x - bounds.min.x) / 2, Math.min(body.position.x, newWidth - margin - (bounds.max.x - bounds.min.x) / 2));
                        const newY = Math.max(margin + (bounds.max.y - bounds.min.y) / 2, Math.min(body.position.y, newHeight - margin - (bounds.max.y - bounds.min.y) / 2));
                        Matter.Body.setPosition(body, { x: newX, y: newY });
                    }
                });
            }
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
    }, [theme, isFixed]);

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        if (bodiesRef.current.length > 0) {
            bodiesRef.current.forEach(body => {
                Matter.Body.setStatic(body, isFixed);
                if (isFixed) {
                    // Сбрасываем скорость и ускорение, чтобы предотвратить смещение
                    Matter.Body.setVelocity(body, { x: 0, y: 0 });
                    Matter.Body.setAngularVelocity(body, 0);
                }
            });
            if (isFixed) {
                if (mouseConstraintRef.current) {
                    Matter.World.remove(engineRef.current.world, mouseConstraintRef.current);
                }
            } else {
                if (mouseConstraintRef.current && !engineRef.current.world.constraints.includes(mouseConstraintRef.current)) {
                    Matter.World.add(engineRef.current.world, mouseConstraintRef.current);
                }
            }
        }
    }, [isFixed]);
    /* eslint-enable react-hooks/exhaustive-deps */

    return (
        <ShelterContainer theme={theme}>
            <ToggleContainer>
                <ToggleLabel theme={theme}>Зафиксировать</ToggleLabel>
                <ToggleSwitch
                    type="checkbox"
                    theme={theme}
                    checked={isFixed}
                    onChange={() => setIsFixed(!isFixed)}
                />
            </ToggleContainer>
            <CloseButton onClick={() => setShowMyShelter(false)}>Закрыть</CloseButton>
            <CanvasContainer>
                <canvas ref={canvasRef} />
            </CanvasContainer>
        </ShelterContainer>
    );
}

export default MyShelter;
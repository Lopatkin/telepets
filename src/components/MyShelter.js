import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import styled from 'styled-components';
import tableImage from '../images/furniture/table.png';
import chairImage from '../images/furniture/chair.png';
import sofaImage from '../images/furniture/sofa.png';
import wardrobeImage from '../images/furniture/wardrobe.png';
import vaseImage from '../images/furniture/vase.png';
import backgroundImage from '../images/furniture/background_pic.jpg';

const ShelterContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  z-index: 1000;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4444;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 5px;
  cursor: pointer;
`;

const MyShelter = ({ theme, socket, userId, onClose }) => {
    const canvasRef = useRef(null);
    const engineRef = useRef(Matter.Engine.create());

    useEffect(() => {
        const engine = engineRef.current;
        const world = engine.world;

        // Отключаем глобальную гравитацию
        world.gravity.y = 0;

        // Определяем категории столкновений
        const defaultCategory = 0x0001; // Категория для пола, стен и вазы
        const noCollideCategory = 0x0002; // Категория для объектов без столкновений

        // Создаём стены и пол
        const leftWall = Matter.Bodies.rectangle(
            0,
            window.innerHeight / 2,
            50,
            window.innerHeight,
            {
                isStatic: true,
                render: { fillStyle: 'transparent' },
                collisionFilter: { category: defaultCategory, mask: defaultCategory },
                zOrder: 0 // Статические тела всегда на заднем плане
            }
        );
        const rightWall = Matter.Bodies.rectangle(
            window.innerWidth,
            window.innerHeight / 2,
            50,
            window.innerHeight,
            {
                isStatic: true,
                render: { fillStyle: 'transparent' },
                collisionFilter: { category: defaultCategory, mask: defaultCategory },
                zOrder: 0
            }
        );
        const floor = Matter.Bodies.rectangle(
            window.innerWidth / 2,
            window.innerHeight * 0.7,
            window.innerWidth,
            100,
            {
                isStatic: true,
                render: { fillStyle: 'transparent' },
                collisionFilter: { category: defaultCategory, mask: defaultCategory },
                zOrder: 0
            }
        );
        // Добавляем стены и пол в начало мира
        Matter.World.add(world, [leftWall, rightWall, floor]);

        // Создаём рендер с фоновым изображением
        const render = Matter.Render.create({
            canvas: canvasRef.current,
            engine: engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: true,
                background: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                sort: (a, b) => { // Кастомная сортировка для рендеринга
                    return (a.zOrder || 0) - (b.zOrder || 0);
                }
            }
        });

        // Определяем базовый масштаб относительно ширины экрана
        const scaleFactor = window.innerWidth / 1920; // Базовое разрешение 1920px (Full HD)

        // Определяем объекты с пропорциональными размерами (удвоенные)
        const furniture = [
            { name: 'table', image: tableImage, width: 200 * scaleFactor * 2, height: 100 * scaleFactor * 2, weight: 20 },
            { name: 'chair', image: chairImage, width: 80 * scaleFactor * 2, height: 80 * scaleFactor * 2, weight: 5 },
            { name: 'sofa', image: sofaImage, width: 250 * scaleFactor * 2, height: 100 * scaleFactor * 2, weight: 30 },
            { name: 'wardrobe', image: wardrobeImage, width: 150 * scaleFactor * 2, height: 200 * scaleFactor * 2, weight: 40 },
            { name: 'vase', image: vaseImage, width: 50 * scaleFactor * 2, height: 50 * scaleFactor * 2, weight: 2 }
        ];

        // Создаём маппинг для связи тела с именем furniture
        const bodyToFurnitureMap = new Map();
        // Счётчик для zOrder
        let currentZOrder = 100; // Начальное значение для динамических объектов

        // Добавляем объекты в мир
        const bodies = furniture.map(item => {
            const isNonRotatable = ['table', 'chair', 'sofa', 'wardrobe'].includes(item.name);
            const body = Matter.Bodies.rectangle(
                Math.random() * (window.innerWidth - item.width),
                Math.random() * (window.innerHeight * 0.7 - item.height),
                item.width,
                item.height,
                {
                    render: {
                        sprite: {
                            texture: item.image,
                            xScale: scaleFactor * 2,
                            yScale: scaleFactor * 2
                        },
                        opacity: 1
                    },
                    mass: item.weight,
                    friction: 0.1,
                    frictionAir: 0.01,
                    restitution: 0.5,
                    inertia: isNonRotatable ? Infinity : undefined,
                    collisionFilter: {
                        category: item.name === 'vase' ? defaultCategory : noCollideCategory,
                        mask: item.name === 'vase' ? defaultCategory : defaultCategory
                    },
                    zOrder: currentZOrder++ // Присваиваем уникальный zOrder
                }
            );
            // Сохраняем связь между телом и именем furniture
            bodyToFurnitureMap.set(body.id, item.name);
            Matter.World.add(world, body);
            return body;
        });

        // Явно добавляем статические тела в маппинг
        world.bodies.forEach(body => {
            if (body.isStatic && !bodyToFurnitureMap.has(body.id)) {
                bodyToFurnitureMap.set(body.id, 'static');
            }
        });

        // Находим тело вазы
        const vaseBody = bodies.find(body => bodyToFurnitureMap.get(body.id) === 'vase');

        // Загружаем начальные позиции мебели с сервера
        socket.emit('getFurniturePositions', { userId }, (response) => {
            if (response.success) {
                response.positions.forEach(({ furnitureId, position }) => {
                    const body = bodies.find(b => b.id === furnitureId);
                    if (body) {
                        Matter.Body.setPosition(body, position);
                        if (bodyToFurnitureMap.get(body.id) !== 'vase') {
                            Matter.Body.setVelocity(body, { x: 0, y: 0 });
                            Matter.Body.setAngularVelocity(body, 0);
                        }
                    }
                });
            }
        });

        // Применяем гравитацию только к вазе
        Matter.Events.on(engine, 'beforeUpdate', () => {
            if (vaseBody) {
                Matter.Body.applyForce(
                    vaseBody,
                    vaseBody.position,
                    { x: 0, y: 0.0005 * vaseBody.mass }
                );
            }
        });

        // Настройка перетаскивания и кликов
        const mouse = Matter.Mouse.create(render.canvas);
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
        });
        Matter.World.add(world, mouseConstraint);

        // При нажатии на объект увеличиваем его zOrder и добавляем подсветку
        Matter.Events.on(mouseConstraint, 'mousedown', (event) => {
            const body = mouseConstraint.body;
            if (body && !body.isStatic) { // Игнорируем статические тела
                const furnitureName = bodyToFurnitureMap.get(body.id) || 'unknown';
                console.log('Clicked body:', furnitureName, 'ID:', body.id);

                // Увеличиваем zOrder для выбранного тела
                currentZOrder++;
                body.zOrder = currentZOrder;
                console.log('New zOrder for', furnitureName, ':', body.zOrder);
                console.log('Bodies zOrder:', world.bodies.map(b => ({
                    name: bodyToFurnitureMap.get(b.id) || 'unknown',
                    zOrder: b.zOrder || 0
                })));

                // Добавляем визуальную подсветку
                body.render.opacity = 0.8;
                body.render.strokeStyle = '#007AFF';
                body.render.lineWidth = 2;
                setTimeout(() => {
                    body.render.opacity = 1;
                    body.render.strokeStyle = null;
                    body.render.lineWidth = 0;
                }, 500); // Уменьшено время подсветки для быстрого отклика

                // Принудительно обновляем рендер
                Matter.Render.lookAt(render, {
                    min: { x: 0, y: 0 },
                    max: { x: window.innerWidth, y: window.innerHeight }
                });
            } else {
                console.log('No valid body clicked');
            }
        });

        // Запуск рендера и физики
        Matter.Engine.run(engine);
        Matter.Render.run(render);

        // Сохранение позиций при отпускании
        Matter.Events.on(mouseConstraint, 'enddrag', (event) => {
            const body = event.body;
            if (body) {
                socket.emit('updateFurniturePosition', {
                    userId,
                    furnitureId: body.id,
                    position: { x: body.position.x, y: body.position.y }
                });
                if (bodyToFurnitureMap.get(body.id) !== 'vase') {
                    Matter.Body.setVelocity(body, { x: 0, y: 0 });
                    Matter.Body.setAngularVelocity(body, 0);
                }
            }
        });

        return () => {
            Matter.Render.stop(render);
            Matter.Engine.clear(engine);
            Matter.World.clear(world);
            Matter.Events.off(engine, 'beforeUpdate');
            Matter.Events.off(mouseConstraint, 'mousedown');
            Matter.Events.off(mouseConstraint, 'enddrag');
        };
    }, [socket, userId, engineRef]);

    return (
        <ShelterContainer theme={theme}>
            <CloseButton onClick={onClose}>Закрыть</CloseButton>
            <canvas ref={canvasRef} />
        </ShelterContainer>
    );
};

export default MyShelter;
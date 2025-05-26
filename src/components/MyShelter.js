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
        const defaultCategory = 0x0001;
        const noCollideCategory = 0x0002;

        // Создаём стены и пол
        const leftWall = Matter.Bodies.rectangle(
            0,
            window.innerHeight / 2,
            50,
            window.innerHeight,
            {
                isStatic: true,
                render: { fillStyle: 'transparent' },
                collisionFilter: { category: defaultCategory, mask: defaultCategory }
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
                collisionFilter: { category: defaultCategory, mask: defaultCategory }
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
                collisionFilter: { category: defaultCategory, mask: defaultCategory }
            }
        );
        Matter.World.add(world, [leftWall, rightWall, floor]);

        // Создаём рендер с фоновым изображением
        const render = Matter.Render.create({
            canvas: canvasRef.current,
            engine: engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: false,
                background: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }
        });

        const scaleFactor = window.innerWidth / 1920;

        // Определяем объекты с пропорциональными размерами
        const furniture = [
            { name: 'table', image: tableImage, width: 200 * scaleFactor * 2, height: 100 * scaleFactor * 2, weight: 20 },
            { name: 'chair', image: chairImage, width: 80 * scaleFactor * 2, height: 80 * scaleFactor * 2, weight: 5 },
            { name: 'sofa', image: sofaImage, width: 250 * scaleFactor * 2, height: 100 * scaleFactor * 2, weight: 30 },
            { name: 'wardrobe', image: wardrobeImage, width: 150 * scaleFactor * 2, height: 200 * scaleFactor * 2, weight: 40 },
            { name: 'vase', image: vaseImage, width: 50 * scaleFactor * 2, height: 50 * scaleFactor * 2, weight: 2 }
        ];

        // Создаём маппинг для связи тела с именем furniture
        // Создаём маппинг для связи тела с именем furniture
        const bodyToFurnitureMap = new Map();

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
                    }
                }
            );
            // Сохраняем связь между телом и именем furniture
            bodyToFurnitureMap.set(body.id, item.name);
            Matter.World.add(world, body);
            return body;
        });

        // Явно исключаем статические тела (стены, пол) из маппинга
        world.bodies.forEach(body => {
            if (body.isStatic && !bodyToFurnitureMap.has(body.id)) {
                bodyToFurnitureMap.set(body.id, 'static');
            }
        });

        // ... (код до обработки событий без изменений)

        // Кастомная сортировка тел для рендеринга
        Matter.Events.on(render, 'beforeRender', () => {
            // Сортируем тела по их позиции в world.bodies
            render.options.sort = (a, b) => {
                const indexA = world.bodies.indexOf(a);
                const indexB = world.bodies.indexOf(b);
                return indexA - indexB;
            };
        });

        // При нажатии на объект перемещаем его на передний план и добавляем подсветку
        Matter.Events.on(mouseConstraint, 'mousedown', (event) => {
            const body = mouseConstraint.body;
            if (body && !body.isStatic) { // Игнорируем статические тела
                const furnitureName = bodyToFurnitureMap.get(body.id) || 'unknown';
                console.log('Clicked body:', furnitureName, 'ID:', body.id);

                // Перемещаем объект в конец массива world.bodies
                const index = world.bodies.indexOf(body);
                if (index > -1) {
                    world.bodies.splice(index, 1);
                    world.bodies.push(body);
                    console.log('New bodies order:', world.bodies.map(b => bodyToFurnitureMap.get(b.id) || 'unknown'));
                }

                // Добавляем визуальную подсветку
                body.render.opacity = 0.8;
                body.render.strokeStyle = '#007AFF';
                body.render.lineWidth = 2;
                setTimeout(() => {
                    body.render.opacity = 1;
                    body.render.strokeStyle = null;
                    body.render.lineWidth = 0;
                }, 500); // Уменьшаем время подсветки для более быстрого отклика

                // Принудительно обновление рендера
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
            socket.emit('updateFurniturePosition', {
                userId,
                furnitureId: body.id,
                position: { x: body.position.x, y: body.position.y }
            });
            if (bodyToFurnitureMap.get(body.id) !== 'vase') {
                Matter.Body.setVelocity(body, { x: 0, y: 0 });
                Matter.Body.setAngularVelocity(body, 0);
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
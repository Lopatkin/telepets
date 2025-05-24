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

        const leftWall = Matter.Bodies.rectangle(
            0,
            window.innerHeight / 2,
            50,
            window.innerHeight,
            { isStatic: true, render: { fillStyle: 'transparent' } }
        );
        const rightWall = Matter.Bodies.rectangle(
            window.innerWidth,
            window.innerHeight / 2,
            50,
            window.innerHeight,
            { isStatic: true, render: { fillStyle: 'transparent' } }
        );
        Matter.World.add(world, [leftWall, rightWall]);

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

        // Определяем базовый масштаб относительно ширины экрана
        const scaleFactor = window.innerWidth / 1920; // Базовое разрешение 1920px (Full HD)

        // Определяем объекты с пропорциональными размерами
        const furniture = [
            { name: 'table', image: tableImage, width: 200 * scaleFactor, height: 100 * scaleFactor, weight: 20 },
            { name: 'chair', image: chairImage, width: 80 * scaleFactor, height: 80 * scaleFactor, weight: 5 },
            { name: 'sofa', image: sofaImage, width: 250 * scaleFactor, height: 100 * scaleFactor, weight: 30 },
            { name: 'wardrobe', image: wardrobeImage, width: 150 * scaleFactor, height: 200 * scaleFactor, weight: 40 },
            { name: 'vase', image: vaseImage, width: 50 * scaleFactor, height: 50 * scaleFactor, weight: 2 }
        ];

        // Добавляем объекты в мир
        const bodies = furniture.map(item => {
            const body = Matter.Bodies.rectangle(
                Math.random() * (window.innerWidth - item.width),
                Math.random() * (window.innerHeight * 0.7 - item.height),
                item.width,
                item.height,
                {
                    render: {
                        sprite: {
                            texture: item.image,
                            xScale: scaleFactor,
                            yScale: scaleFactor
                        }
                    },
                    mass: item.weight,
                    friction: 0.1,
                    frictionAir: 0.01,
                    restitution: 0.5
                }
            );
            Matter.World.add(world, body);
            return body;
        });

        // Находим тело вазы
        const vaseBody = bodies.find(body => furniture[bodies.indexOf(body)].name === 'vase');

        // Добавляем новый статический пол на 30% от нижней границы
        const floor = Matter.Bodies.rectangle(
            window.innerWidth / 2,
            window.innerHeight * 0.7,
            window.innerWidth,
            50,
            {
                isStatic: true,
                render: {
                    fillStyle: 'transparent'
                }
            }
        );
        Matter.World.add(world, floor);

        // Загружаем начальные позиции мебели с сервера
        socket.emit('getFurniturePositions', { userId }, (response) => {
            if (response.success) {
                response.positions.forEach(({ furnitureId, position }) => {
                    const body = bodies.find(b => b.id === furnitureId);
                    if (body) {
                        Matter.Body.setPosition(body, position);
                        // Устанавливаем нулевую скорость для всех объектов, кроме вазы
                        if (furniture[bodies.indexOf(body)].name !== 'vase') {
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
                    { x: 0, y: 0.001 * vaseBody.mass }
                );
            }
        });

        // Настройка перетаскивания
        const mouse = Matter.Mouse.create(render.canvas);
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
        });
        Matter.World.add(world, mouseConstraint);

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
            // Сбрасываем скорость для всех объектов, кроме вазы, после перетаскивания
            if (furniture[bodies.indexOf(body)].name !== 'vase') {
                Matter.Body.setVelocity(body, { x: 0, y: 0 });
                Matter.Body.setAngularVelocity(body, 0);
            }
        });

        return () => {
            Matter.Render.stop(render);
            Matter.Engine.clear(engine);
            Matter.World.clear(world);
            Matter.Events.off(engine, 'beforeUpdate');
        };
    }, [socket, userId]);

    return (
        <ShelterContainer theme={theme}>
            <CloseButton onClick={onClose}>Закрыть</CloseButton>
            <canvas ref={canvasRef} />
        </ShelterContainer>
    );
};

export default MyShelter;
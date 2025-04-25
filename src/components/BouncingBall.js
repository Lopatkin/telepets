import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import styled from 'styled-components';

const BallContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
  overflow: hidden; /* Предотвращаем влияние на прокрутку */
  contain: strict; /* Ограничиваем влияние на родительский контейнер */
`;

const Ball = styled.div`
  position: absolute;
  width: 30px;
  height: 30px;
  background: radial-gradient(circle at 30% 30%, #ff6666, #cc0000);
  border-radius: 50%;
  pointer-events: auto;
  cursor: pointer;
`;

function BouncingBall({ room, containerRef }) {
  const ballRef = useRef(null);
  const engineRef = useRef(null);
  const runnerRef = useRef(null);

  useEffect(() => {
    // Проверяем, что это домашняя локация
    if (!room || !room.startsWith('myhome_') || !containerRef.current) return;

    // Инициализация Matter.js
    const Engine = Matter.Engine;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Mouse = Matter.Mouse;
    const MouseConstraint = Matter.MouseConstraint;

    // Создаем физический движок
    const engine = Engine.create();
    engineRef.current = engine;

    // Получаем размеры контейнера сообщений
    const container = containerRef.current;
    let { width, height } = container.getBoundingClientRect();

    // Создаем мяч
    const ball = Bodies.circle(width / 2, 50, 15, {
      restitution: 0.8, // Упругость (отскок)
      friction: 0.1, // Трение
      density: 0.01, // Плотность
    });

    // Создаем стены и пол
    const ground = Bodies.rectangle(width / 2, height, width, 20, {
      isStatic: true,
    });
    const leftWall = Bodies.rectangle(0, height / 2, 20, height, {
      isStatic: true,
    });
    const rightWall = Bodies.rectangle(width, height / 2, 20, height, {
      isStatic: true,
    });
    const ceiling = Bodies.rectangle(width / 2, 0, width, 20, {
      isStatic: true,
    });

    // Добавляем объекты в мир
    World.add(engine.world, [ball, ground, leftWall, rightWall, ceiling]);

    // Создаем мышь и ограничение для взаимодействия
    const mouse = Mouse.create(container);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
      },
    });
    World.add(engine.world, mouseConstraint);

    // Запускаем движок
    const runner = Engine.run(engine);
    runnerRef.current = runner;

    // Синхронизация положения DOM-элемента мяча с физическим телом
    const ballElement = ballRef.current;
    Matter.Events.on(engine, 'afterUpdate', () => {
      if (ballElement) {
        ballElement.style.left = `${ball.position.x - 15}px`; // 15 - половина ширины мяча
        ballElement.style.top = `${ball.position.y - 15}px`;
      }
    });

    // Обработка клика по мячу
    const handleBallClick = () => {
      const forceMagnitude = 0.02;
      const angle = Math.random() * 2 * Math.PI;
      Matter.Body.applyForce(ball, ball.position, {
        x: forceMagnitude * Math.cos(angle),
        y: forceMagnitude * Math.sin(angle),
      });
    };

    if (ballElement) {
      ballElement.addEventListener('click', handleBallClick);
    }

    // Обработка изменения размеров контейнера
    const resizeObserver = new ResizeObserver(() => {
      const newSize = container.getBoundingClientRect();
      width = newSize.width;
      height = newSize.height;

      // Обновляем позиции стен
      Matter.Body.setPosition(ground, { x: width / 2, y: height });
      Matter.Body.setPosition(leftWall, { x: 0, y: height / 2 });
      Matter.Body.setPosition(rightWall, { x: width, y: height / 2 });
      Matter.Body.setPosition(ceiling, { x: width / 2, y: 0 });
      Matter.Body.setVertices(ground, Matter.Bodies.rectangle(width / 2, height, width, 20).vertices);
      Matter.Body.setVertices(leftWall, Matter.Bodies.rectangle(0, height / 2, 20, height).vertices);
      Matter.Body.setVertices(rightWall, Matter.Bodies.rectangle(width, height / 2, 20, height).vertices);
      Matter.Body.setVertices(ceiling, Matter.Bodies.rectangle(width / 2, 0, width, 20).vertices);
    });
    resizeObserver.observe(container);

    // Очистка при размонтировании
    return () => {
      if (ballElement) {
        ballElement.removeEventListener('click', handleBallClick);
      }
      World.clear(engine.world);
      Engine.clear(engine);
      runner.enabled = false;
      resizeObserver.disconnect();
    };
  }, [room, containerRef]);

  // Рендерим только в домашней локации
  if (!room || !room.startsWith('myhome_')) return null;

  return (
    <BallContainer>
      <Ball ref={ballRef} />
    </BallContainer>
  );
}

export default BouncingBall;
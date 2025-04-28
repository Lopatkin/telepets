import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import styled from 'styled-components';

const BallContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Контейнер не блокирует события */
  z-index: 10; /* Увеличиваем z-index для видимости */
`;

const Ball = styled.div`
  position: absolute;
  width: 30px;
  height: 30px;
  background: radial-gradient(circle at 30% 30%, #ff6666, #cc0000);
  border-radius: 50%;
  pointer-events: auto; /* Мяч принимает события */
  cursor: pointer;
`;

function BouncingBall({ room, containerRef }) {
  const ballRef = useRef(null);
  const engineRef = useRef(null);
  const runnerRef = useRef(null);
  const ballBodyRef = useRef(null); // Для хранения физического тела мяча

  // Основной эффект для инициализации Matter.js
  useEffect(() => {
    console.log('BouncingBall: Mounting component'); // Отладка
    // Проверяем, что это домашняя локация и контейнер доступен
    if (!room || !room.startsWith('myhome_') || !containerRef.current) {
      console.log('BouncingBall: Invalid room or container', { room, containerRef: !!containerRef.current });
      return;
    }

    console.log('BouncingBall: Initializing Matter.js');

    // Инициализация Matter.js
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Mouse = Matter.Mouse;
    const MouseConstraint = Matter.MouseConstraint;

    // Создаем физический движок
    const engine = Engine.create();
    engineRef.current = engine;

    // Получаем размеры контейнера сообщений
    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();

    // Создаем рендер
    const render = Render.create({
      element: container,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: 'transparent',
      },
    });

    // Создаем мяч
    const ball = Bodies.circle(width / 2, 50, 15, {
      restitution: 0.8, // Упругость (отскок)
      friction: 0.1, // Трение
      density: 0.01, // Плотность
      render: {
        visible: false, // Скрываем встроенный рендер, используем DOM
      },
    });
    ballBodyRef.current = ball; // Сохраняем тело мяча

    // Создаем стены и пол
    const ground = Bodies.rectangle(width / 2, height - 100, width, 20, {
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
        render: {
          visible: false,
        },
      },
    });
    World.add(engine.world, mouseConstraint);

    // Запускаем движок
    const runner = Engine.run(engine);
    runnerRef.current = runner;

    // Синхронизация положения DOM-элемента мяча с физическим телом
    Matter.Events.on(engine, 'afterUpdate', () => {
      if (ballRef.current && ballBodyRef.current) {
        ballRef.current.style.left = `${ballBodyRef.current.position.x - 15}px`; // 15 - половина ширины мяча
        ballRef.current.style.top = `${ballBodyRef.current.position.y - 15}px`;
      }
    });

    // Очистка при размонтировании
    return () => {
      console.log('BouncingBall: Cleaning up Matter.js');
      Render.stop(render);
      World.clear(engine.world);
      Engine.clear(engine);
      runner.enabled = false;
      render.canvas.remove();
    };
  }, [room, containerRef]);

  // Отдельный эффект для добавления слушателя клика
  useEffect(() => {
    const ballElement = ballRef.current;
    console.log('BouncingBall: Checking ball element for click listener', { ballElement: !!ballElement }); // Отладка
    if (!ballElement) {
      console.warn('BouncingBall: Ball element not found');
      return;
    }

    console.log('BouncingBall: Adding click listener to ball');

    const handleBallClick = () => {
      console.log('BouncingBall: Ball clicked!'); // Отладка: проверяем срабатывание клика
      if (ballBodyRef.current) {
        // Применяем силу в случайном направлении вверх (углы от 90 до 270 градусов)
        const forceMagnitude = 0.02; // Небольшая сила для умеренной скорости
        const angle = Math.PI / 2 + Math.random() * Math.PI; // От π/2 до 3π/2
        Matter.Body.applyForce(ballBodyRef.current, ballBodyRef.current.position, {
          x: forceMagnitude * Math.cos(angle),
          y: forceMagnitude * Math.sin(angle),
        });
      } else {
        console.warn('BouncingBall: Ball body not found');
      }
    };

    ballElement.addEventListener('click', handleBallClick);

    return () => {
      console.log('BouncingBall: Removing click listener from ball');
      ballElement.removeEventListener('click', handleBallClick);
    };
  }, [ballRef.current]); // Зависимость от ballRef.current

  // Рендерим только в домашней локации
  if (!room || !room.startsWith('myhome_')) {
    console.log('BouncingBall: Not rendering (not myhome_)');
    return null;
  }

  console.log('BouncingBall: Rendering component'); // Отладка
  return (
    <BallContainer>
      <Ball ref={ballRef} />
    </BallContainer>
  );
}

export default BouncingBall;
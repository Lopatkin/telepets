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
`;

const Ball = styled.div`
  position: absolute;
  width: 30px;
  height: 30px;
  background: radial-gradient(circle at 30% 30%, #ff6666, #cc0000);
  border-radius: 50%;
  pointer-events: auto;
  cursor: pointer;
  opacity: ${props => (props.isTransparent ? 0.5 : 1)}; // Условная прозрачность
  transition: opacity 0.2s ease; // Плавный переход для прозрачности
`;

function BouncingBall({ room, containerRef }) {
  const ballRef = useRef(null);
  const engineRef = useRef(null);
  const runnerRef = useRef(null);
  const [isTransparent, setIsTransparent] = React.useState(false); // Состояние для прозрачности

  useEffect(() => {
    // Проверяем, что это домашняя локация
    if (!room || !room.startsWith('myhome_') || !containerRef.current) return;

    // Инициализация Matter.js
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;

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
    const handleBallClick = (event) => {
      event.stopPropagation(); // Предотвращаем всплытие события
      setIsTransparent(prev => !prev); // Переключаем прозрачность
      console.log('Ball clicked, isTransparent:', !isTransparent); // Логирование для отладки
    };

    if (ballElement) {
      ballElement.addEventListener('mousedown', handleBallClick);
    }

    // Очистка при размонтировании
    return () => {
      if (ballElement) {
        ballElement.removeEventListener('mousedown', handleBallClick);
      }
      Render.stop(render);
      World.clear(engine.world);
      Engine.clear(engine);
      runner.enabled = false;
      render.canvas.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, containerRef]);

  // Рендерим только в домашней локации
  if (!room || !room.startsWith('myhome_')) return null;

  return (
    <BallContainer>
      <Ball ref={ballRef} isTransparent={isTransparent} />
    </BallContainer>
  );
}

export default BouncingBall;
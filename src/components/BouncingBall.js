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
  const isDragging = useRef(false); // Флаг для отслеживания перетаскивания
  const startPos = useRef(null); // Начальная позиция мыши

  useEffect(() => {
    // Проверяем, что это домашняя локация
    if (!room || !room.startsWith('myhome_') || !containerRef.current) return;

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
    const ballElement = ballRef.current;
    Matter.Events.on(engine, 'afterUpdate', () => {
      if (ballElement) {
        ballElement.style.left = `${ball.position.x - 15}px`; // 15 - половина ширины мяча
        ballElement.style.top = `${ball.position.y - 15}px`;
      }
    });

    // Обработка начала нажатия
    const handleMouseDown = (event) => {
      event.stopPropagation();
      isDragging.current = false;
      startPos.current = { x: event.clientX, y: event.clientY };
      console.log('Mouse down, startPos:', startPos.current); // Логирование для отладки
    };

    // Обработка движения мыши
    const handleMouseMove = (event) => {
      if (startPos.current) {
        const dx = event.clientX - startPos.current.x;
        const dy = event.clientY - startPos.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Считаем перетаскиванием, если мышь переместилась более чем на 5 пикселей
        if (distance > 5) {
          isDragging.current = true;
          console.log('Dragging detected, distance:', distance); // Логирование для отладки
        }
      }
    };

    // Обработка отпускания мыши
    const handleMouseUp = (event) => {
      event.stopPropagation();
      if (!isDragging.current) {
        setIsTransparent(prev => !prev); // Переключаем прозрачность только если не было перетаскивания
        console.log('Mouse up, isTransparent:', !isTransparent); // Логирование для отладки
      }
      isDragging.current = false;
      startPos.current = null;
    };

    if (ballElement) {
      ballElement.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    // Очистка при размонтировании
    return () => {
      if (ballElement) {
        ballElement.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
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
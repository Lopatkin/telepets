import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import styled from 'styled-components';

// Стили для контейнера мячика
const BallContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; // Позволяет кликам на мячике не блокировать другие элементы
  z-index: 5; // Помещаем мячик над сообщениями
`;

// Компонент мячика
const BouncingBall = ({ room, containerRef }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const ballRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Показываем мячик только в домашней локации
  const isHomeRoom = room && room.startsWith('myhome_');

  // Обновляем размеры контейнера
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const { width, height } = containerRef.current.getBoundingClientRect();
      console.log('Container dimensions:', { width, height }); // Дебаг размеров
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, [containerRef]);

  useEffect(() => {
    if (!isHomeRoom || !canvasRef.current || !containerRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    // Инициализация физического движка
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Mouse = Matter.Mouse;
    const MouseConstraint = Matter.MouseConstraint;

    // Создаем движок
    const engine = Engine.create();
    engineRef.current = engine;

    // Настраиваем гравитацию
    engine.world.gravity.y = 1; // Стандартная гравитация вниз

    // Создаем рендер
    const render = Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: dimensions.width,
        height: dimensions.height,
        wireframes: false,
        background: 'transparent',
      },
    });

    // Создаем пол (невидимый, только для физики)
    const floor = Bodies.rectangle(
      dimensions.width / 2,
      dimensions.height - 10, // Пол чуть выше нижней границы
      dimensions.width,
      20,
      { isStatic: true }
    );

    // Создаем стены
    const leftWall = Bodies.rectangle(
      -50,
      dimensions.height / 2,
      100,
      dimensions.height,
      { isStatic: true }
    );
    const rightWall = Bodies.rectangle(
      dimensions.width + 50,
      dimensions.height / 2,
      100,
      dimensions.height,
      { isStatic: true }
    );

    // Создаем мячик
    const ball = Bodies.circle(
      dimensions.width / 2, // Начальная позиция по центру
      -50, // Начинаем выше экрана
      20, // Радиус мячика
      {
        restitution: 0.8, // Упругость (0.8 для реалистичного отскока)
        friction: 0.1, // Трение
        density: 0.01, // Плотность
        render: {
          fillStyle: '#ff4444', // Красный цвет мячика
        },
      }
    );
    ballRef.current = ball;

    // Добавляем объекты в мир
    World.add(engine.world, [floor, leftWall, rightWall, ball]);

    // Настраиваем мышь для взаимодействия
    const mouse = Mouse.create(canvasRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    World.add(engine.world, mouseConstraint);

    // Обработчик клика по мячику
    Matter.Events.on(mouseConstraint, 'mousedown', (event) => {
      const mousePosition = event.mouse.position;
      const ballPosition = ball.position;

      // Проверяем, попал ли клик по мячику
      const distance = Math.sqrt(
        Math.pow(mousePosition.x - ballPosition.x, 2) +
        Math.pow(mousePosition.y - ballPosition.y, 2)
      );

      if (distance < ball.radius) {
        // Применяем случайный импульс для отскока
        const forceMagnitude = 0.02;
        const randomAngle = Math.random() * 2 * Math.PI;
        Matter.Body.applyForce(ball, ball.position, {
          x: forceMagnitude * Math.cos(randomAngle),
          y: forceMagnitude * Math.sin(randomAngle),
        });
      }
    });

    // Запускаем рендеринг
    Render.run(render);
    const runner = Engine.run(engine);

    // Обработка изменения размеров окна
    const handleResize = () => {
      const { width: newWidth, height: newHeight } = containerRef.current.getBoundingClientRect();
      console.log('Resize dimensions:', { newWidth, newHeight }); // Дебаг при ресайзе
      setDimensions({ width: newWidth, height: newHeight });
      render.canvas.width = newWidth;
      render.canvas.height = newHeight;
      render.options.width = newWidth;
      render.options.height = newHeight;
      Matter.Body.setPosition(floor, {
        x: newWidth / 2,
        y: newHeight - 10,
      });
      Matter.Body.setPosition(leftWall, {
        x: -50,
        y: newHeight / 2,
      });
      Matter.Body.setPosition(rightWall, {
        x: newWidth + 50,
        y: newHeight / 2,
      });
    };
    window.addEventListener('resize', handleResize);

    // Очистка при размонтировании
    return () => {
      Render.stop(render);
      Engine.clear(engine);
      runner.enabled = false;
      World.clear(engine.world, false);
      window.removeEventListener('resize', handleResize);
    };
  }, [isHomeRoom, room, containerRef, dimensions]);

  if (!isHomeRoom) return null;

  return (
    <BallContainer>
      <canvas ref={canvasRef} style={{ pointerEvents: 'auto' }} />
    </BallContainer>
  );
};

export default BouncingBall;
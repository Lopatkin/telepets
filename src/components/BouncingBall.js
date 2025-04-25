import React, { useEffect, useRef } from 'react';
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
  z-index: 5; // Помещаем мячик над сообщениями, но ниже модальных окон
`;

// Компонент мячика
const BouncingBall = ({ room }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const ballRef = useRef(null);

  // Показываем мячик только в домашней локации
  const isHomeRoom = room && room.startsWith('myhome_');

  useEffect(() => {
    if (!isHomeRoom || !canvasRef.current) return;

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
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent',
      },
    });

    // Создаем пол (невидимый, только для физики)
    const floor = Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight,
      window.innerWidth,
      100,
      { isStatic: true }
    );

    // Создаем стены
    const leftWall = Bodies.rectangle(
      -50,
      window.innerHeight / 2,
      100,
      window.innerHeight,
      { isStatic: true }
    );
    const rightWall = Bodies.rectangle(
      window.innerWidth + 50,
      window.innerHeight / 2,
      100,
      window.innerHeight,
      { isStatic: true }
    );

    // Создаем мячик
    const ball = Bodies.circle(
      window.innerWidth / 2, // Начальная позиция по центру
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
      render.canvas.width = window.innerWidth;
      render.canvas.height = window.innerHeight;
      Matter.Body.setPosition(floor, {
        x: window.innerWidth / 2,
        y: window.innerHeight + 50,
      });
      Matter.Body.setPosition(leftWall, {
        x: -50,
        y: window.innerHeight / 2,
      });
      Matter.Body.setPosition(rightWall, {
        x: window.innerWidth + 50,
        y: window.innerHeight / 2,
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
  }, [isHomeRoom, room]);

  if (!isHomeRoom) return null;

  return (
    <BallContainer>
      <canvas ref={canvasRef} style={{ pointerEvents: 'auto' }} />
    </BallContainer>
  );
};

export default BouncingBall;
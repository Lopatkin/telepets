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
  z-index: 30; /* Увеличиваем z-index выше UserListModal */
  background: rgba(0, 255, 0, 0.1); /* Временный фон для отладки */
`;

const Ball = styled.div`
  position: absolute;
  width: 30px;
  height: 30px;
  background: radial-gradient(circle at 30% 30%, #ff6666, #cc0000);
  border-radius: 50%;
  pointer-events: auto; /* Мяч принимает события */
  cursor: pointer;
  border: 2px solid blue; /* Временный бордер для отладки */
`;

function BouncingBall({ room, containerRef }) {
  const ballRef = useRef(null);
  const engineRef = useRef(null);
  const runnerRef = useRef(null);
  const ballBodyRef = useRef(null); // Для хранения физического тела мяча

  // Обработчик клика по мячу
  const handleBallClick = (event) => {
    console.log('BouncingBall: Ball clicked!', { eventType: event.type, target: event.target.className }); // Улучшенная отладка
    if (ballBodyRef.current) {
      const forceMagnitude = 0.02;
      const angle = Math.PI / 2 + Math.random() * Math.PI;
      Matter.Body.applyForce(ballBodyRef.current, ballBodyRef.current.position, {
        x: forceMagnitude * Math.cos(angle),
        y: forceMagnitude * Math.sin(angle),
      });
      console.log('BouncingBall: Force applied', { angle, x: forceMagnitude * Math.cos(angle), y: forceMagnitude * Math.sin(angle) });
    } else {
      console.warn('BouncingBall: Ball body not found');
    }
  };

  // Отладка событий мыши
  const handleMouseDown = (event) => {
    console.log('BouncingBall: Mouse down', { eventType: event.type, target: event.target.className });
  };

  const handleMouseUp = (event) => {
    console.log('BouncingBall: Mouse up', { eventType: event.type, target: event.target.className });
  };

  useEffect(() => {
    console.log('BouncingBall: Mounting component');
    if (!room || !room.startsWith('myhome_') || !containerRef.current) {
      console.log('BouncingBall: Invalid room or container', { room, containerRef: !!containerRef.current });
      return;
    }

    console.log('BouncingBall: Initializing Matter.js');

    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Mouse = Matter.Mouse;
    const MouseConstraint = Matter.MouseConstraint;
    const Runner = Matter.Runner;

    const engine = Engine.create();
    engineRef.current = engine;

    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();

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

    const ball = Bodies.circle(width / 2, 50, 15, {
      restitution: 0.8,
      friction: 0.1,
      density: 0.01,
      render: {
        visible: false,
      },
    });
    ballBodyRef.current = ball;

    const ground = Bodies.rectangle(width / 2, height - 100, width, 20, { isStatic: true });
    const leftWall = Bodies.rectangle(0, height / 2, 20, height, { isStatic: true });
    const rightWall = Bodies.rectangle(width, height / 2, 20, height, { isStatic: true });
    const ceiling = Bodies.rectangle(width / 2, 0, width, 20, { isStatic: true });

    World.add(engine.world, [ball, ground, leftWall, rightWall, ceiling]);

    const mouse = Mouse.create(container);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    World.add(engine.world, mouseConstraint);

    const runner = Runner.create();
    Runner.run(runner, engine);
    runnerRef.current = runner;

    Matter.Events.on(engine, 'afterUpdate', () => {
      if (ballRef.current && ballBodyRef.current) {
        ballRef.current.style.left = `${ballBodyRef.current.position.x - 15}px`;
        ballRef.current.style.top = `${ballBodyRef.current.position.y - 15}px`;
      }
    });

    return () => {
      console.log('BouncingBall: Cleaning up Matter.js');
      Render.stop(render);
      World.clear(engine.world);
      Engine.clear(engine);
      Runner.stop(runner);
      render.canvas.remove();
    };
  }, [room, containerRef]);

  if (!room || !room.startsWith('myhome_')) {
    console.log('BouncingBall: Not rendering (not myhome_)');
    return null;
  }

  console.log('BouncingBall: Rendering component');
  return (
    <BallContainer>
      <Ball
        ref={ballRef}
        onClick={handleBallClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      />
    </BallContainer>
  );
}

export default BouncingBall;
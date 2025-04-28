import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import styled from 'styled-components';

// Определяем BallContainer
const BallContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
`;

// Определяем Ball с динамической прозрачностью
const Ball = styled.div`
  position: absolute;
  width: 30px;
  height: 30px;
  background: radial-gradient(circle at 30% 30%, #ff6666, #cc0000);
  border-radius: 50%;
  pointer-events: auto;
  cursor: pointer;
  opacity: ${props => (props.isTransparent ? 0.5 : 1)};
  transition: opacity 0.2s ease;
`;

function BouncingBall({ room, containerRef }) {
  const ballRef = useRef(null);
  const engineRef = useRef(null);
  const runnerRef = useRef(null);
  const [isTransparent, setIsTransparent] = useState(false);

  useEffect(() => {
    if (!room || !room.startsWith('myhome_') || !containerRef.current) return;

    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Mouse = Matter.Mouse;
    const MouseConstraint = Matter.MouseConstraint;

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

    World.add(engine.world, [ball, ground, leftWall, rightWall, ceiling]);

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

    const runner = Engine.run(engine);
    runnerRef.current = runner;

    const ballElement = ballRef.current;
    Matter.Events.on(engine, 'afterUpdate', () => {
      if (ballElement) {
        ballElement.style.left = `${ball.position.x - 15}px`;
        ballElement.style.top = `${ball.position.y - 15}px`;
      }
    });

    const handleBallClick = () => {
      const forceMagnitude = 0.02;
      const angle = Math.random() * 2 * Math.PI;
      Matter.Body.applyForce(ball, ball.position, {
        x: forceMagnitude * Math.cos(angle),
        y: forceMagnitude * Math.sin(angle),
      });

      setIsTransparent(true);
      setTimeout(() => {
        setIsTransparent(false);
      }, 500);
    };

    if (ballElement) {
      ballElement.addEventListener('click', handleBallClick);
    }

    return () => {
      if (ballElement) {
        ballElement.removeEventListener('click', handleBallClick);
      }
      Render.stop(render);
      World.clear(engine.world);
      Engine.clear(engine);
      runner.enabled = false;
      render.canvas.remove();
    };
  }, [room, containerRef]);

  if (!room || !room.startsWith('myhome_')) return null;

  return (
    <BallContainer>
      <Ball ref={ballRef} isTransparent={isTransparent} />
    </BallContainer>
  );
}

export default BouncingBall;
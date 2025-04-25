// BouncingBall.js
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Ball = styled.div`
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff5e62, #ff9966);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 1;
  user-select: none;
  touch-action: none;
`;

const BouncingBall = ({ room }) => {
  const [position, setPosition] = useState({ x: 50, y: -30 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const ballRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const containerRef = useRef(null);
  const inputContainerHeight = 60; // Высота блока с полем ввода

  // Проверяем, домашняя ли это локация
  const isHomeRoom = room && room.startsWith('myhome_');

  useEffect(() => {
    if (!isHomeRoom) return;

    const container = document.querySelector('.messages-container');
    if (!container) return;

    containerRef.current = container;

    // Начальная позиция мяча (случайная по горизонтали)
    const startX = Math.random() * (container.clientWidth - 30);
    setPosition({ x: startX, y: -30 });
    setVelocity({ x: 0, y: 0 });

    const handleClick = (e) => {
      if (e.target === ballRef.current) {
        // При клике задаем случайную скорость для отскока
        const newVelocity = {
          x: (Math.random() - 0.5) * 10,
          y: -Math.random() * 15 - 5
        };
        setVelocity(newVelocity);
        e.stopPropagation();
      }
    };

    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isHomeRoom, room]);

  useEffect(() => {
    if (!isHomeRoom || !containerRef.current) return;

    const gravity = 0.5;
    const friction = 0.99;
    const bounce = 0.7;

    const updateBallPosition = (timestamp) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      
      const deltaTime = (timestamp - lastTimeRef.current) / 16; // Нормализуем время
      lastTimeRef.current = timestamp;

      setPosition(prevPos => {
        setVelocity(prevVel => {
          let newVelX = prevVel.x * friction;
          let newVelY = prevVel.y + gravity;

          // Проверка столкновения с границами контейнера
          const container = containerRef.current;
          if (!container) return { x: newVelX, y: newVelY };

          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight - inputContainerHeight;

          let newPosX = prevPos.x + newVelX * deltaTime;
          let newPosY = prevPos.y + newVelY * deltaTime;

          // Столкновение с правой границей
          if (newPosX + 30 > containerWidth) {
            newPosX = containerWidth - 30;
            newVelX = -newVelX * bounce;
          }
          // Столкновение с левой границей
          else if (newPosX < 0) {
            newPosX = 0;
            newVelX = -newVelX * bounce;
          }

          // Столкновение с нижней границей
          if (newPosY + 30 > containerHeight) {
            newPosY = containerHeight - 30;
            newVelY = -newVelY * bounce;
            
            // Добавляем небольшое трение при ударе о нижнюю границу
            newVelX *= 0.9;
          }
          // Столкновение с верхней границей
          else if (newPosY < 0) {
            newPosY = 0;
            newVelY = -newVelY * bounce;
          }

          return { x: newVelX, y: newVelY };
        });

        return { x: prevPos.x + velocity.x * deltaTime, y: prevPos.y + velocity.y * deltaTime };
      });

      animationRef.current = requestAnimationFrame(updateBallPosition);
    };

    animationRef.current = requestAnimationFrame(updateBallPosition);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isHomeRoom, velocity.x, velocity.y]);

  if (!isHomeRoom) return null;

  return (
    <Ball
      ref={ballRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `rotate(${position.x * 2}deg)`,
        display: position.y < -100 ? 'none' : 'block'
      }}
    />
  );
};

export default BouncingBall;
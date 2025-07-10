import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Matter from 'matter-js';
import wallpaperImage from '../images/dwelling/wallpaper.jpg';
import floorImage from '../images/dwelling/floor.jpg';
import { furnitureMap } from '../utils/furnitureMap';

const SaveButton = styled.button`
      position: absolute;
      top: 10px;
      right: 60px;
      background: ${({ theme, isSaved }) =>
        isSaved ? '#4CAF50' : (theme === 'dark' ? '#4A4A4A' : '#D3D3D3')};
      color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#000')};
      border: none;
      border-radius: 5px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 16px;
      z-index: 2000;
      transition: background 0.3s ease;
      animation: ${({ isSaved }) => isSaved ? 'blink 0.666s ease 3' : 'none'}; // 3 мигания за 2 секунды (2 / 3 = 0.666s на цикл)

      @keyframes blink {
          0%, 100% { background: #4CAF50; } // Зелёный
          50% { background: ${({ theme }) => (theme === 'dark' ? '#4A4A4A' : '#D3D3D3')}; } // Исходный цвет
      }

      &:hover {
          background: ${({ theme, isSaved }) =>
        isSaved ? '#45a049' : (theme === 'dark' ? '#5A5A5A' : '#B0B0B0')};
      }
  `;

const CloseIcon = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: ${({ theme }) => (theme === 'dark' ? '#4A4A4A' : '#D3D3D3')};
  color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#000')};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 24px;
  z-index: 2000;

  &:hover {
    background: ${({ theme }) => (theme === 'dark' ? '#5A5A5A' : '#B0B0B0')};
  }
`;

const ShelterContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: ${({ theme }) => (theme === 'dark' ? '#2A2A2A' : '#fff')};
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

function MyShelter({ theme, setShowMyShelter, userId, socket, currentRoom }) {
    const [isSaved, setIsSaved] = useState(false);
    const canvasRef = useRef(null);
    const engineRef = useRef(Matter.Engine.create());
    const runnerRef = useRef(null);
    const wallpaperImgRef = useRef(new Image());
    const floorImgRef = useRef(new Image());
    const imageRefs = useRef({});
    const imagesLoadedRef = useRef({});

    const wallRef = useRef(null);
    const floorRef = useRef(null);
    const itemDataRef = useRef([]);
    const draggedItemRef = useRef(null);
    const initialDimensionsRef = useRef({ width: 0, height: 0, wallHeight: 0, floorHeight: 0 });
    const [locationItems, setLocationItems] = useState([]);

    useEffect(() => {
        wallpaperImgRef.current.src = wallpaperImage;
        floorImgRef.current.src = floorImage;
        wallpaperImgRef.current.onload = () => (imagesLoadedRef.current.wallpaper = true);
        floorImgRef.current.onload = () => (imagesLoadedRef.current.floor = true);
        wallpaperImgRef.current.onerror = () => imagesLoadedRef.current.wallpaper = true;
        floorImgRef.current.onerror = () => imagesLoadedRef.current.floor = true;
        furnitureMap.forEach(({ key, image }) => {
            const img = new Image();
            img.src = image;
            imageRefs.current[key] = img;
            imagesLoadedRef.current[key] = false;
            img.onload = () => (imagesLoadedRef.current[key] = true);
            img.onerror = () => (imagesLoadedRef.current[key] = true);
        });
    }, []);

    useEffect(() => {
        if (!socket || !currentRoom) return;
        const owner = currentRoom;
        socket.emit('getItems', { owner });
        socket.on('items', (data) => {
            if (data.owner === owner) {
                setLocationItems(data.items.map((item) => ({ ...item, _id: item._id.toString() })));
            }
        });
        socket.on('itemPositionsUpdate', (data) => {
            if (data.owner === currentRoom) {
                setLocationItems(data.items.map((item) => ({ ...item, _id: item._id.toString() })));
            }
        });
        return () => {
            socket.off('items');
            socket.off('itemPositionsUpdate');
        };
    }, [socket, currentRoom]);

    const handleSave = () => {
        const canvas = canvasRef.current;
        const width = canvas.width;
        const height = canvas.height;
        const positions = locationItems.reduce((acc, item) => {
            const refItem = itemDataRef.current.find((i) => i.id === item._id);
            if (!refItem) return acc;
            acc[`item_${item._id}`] = {
                x: refItem.x / width,
                y: refItem.y / height,
                scaleFactor: refItem.scaleFactor,
                zIndex: refItem.zIndex,
            };
            return acc;
        }, {});
        socket.emit('updateItemPositions', { owner: currentRoom, positions }, (res) => {
            if (res.success) {
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 2000);
            } else {
                console.error('Ошибка сохранения позиций:', res.message);
            }
        });
    };

    const handleClose = () => setShowMyShelter(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const width = canvas.parentElement.clientWidth;
        const height = canvas.parentElement.clientHeight;
        canvas.width = width;
        canvas.height = height;
        const engine = engineRef.current;
        engine.gravity.y = 0;

        itemDataRef.current = locationItems.map((item) => {
            const meta = furnitureMap.get(item.name);
            if (!meta) return null;
            return {
                id: item._id,
                x: item.x * width,
                y: item.y * height,
                scaleFactor: item.scaleFactor,
                zIndex: item.zIndex,
                width: meta.size,
                height: meta.size,
                texture: meta.image,
                key: meta.key,
                opacity: 1,
            };
        }).filter(Boolean);

        const restrictPosition = (item) => {
            const halfW = (item.width * item.scaleFactor) / 2;
            const halfH = (item.height * item.scaleFactor) / 2;
            item.x = Math.max(halfW, Math.min(item.x, width - halfW));
            item.y = Math.max(halfH, Math.min(item.y, height - halfH));
        };

        const bringToFront = (item) => {
            const maxZ = Math.max(...itemDataRef.current.map(i => i.zIndex || 0));
            item.zIndex = maxZ + 1;
            item.opacity = 0.8;
        };

        const getItemUnderCursor = (x, y) => {
            return [...itemDataRef.current].reverse().find(item => {
                const hw = (item.width * item.scaleFactor) / 2;
                const hh = (item.height * item.scaleFactor) / 2;
                return x >= item.x - hw && x <= item.x + hw && y >= item.y - hh && y <= item.y + hh;
            });
        };

        const handlePointerDown = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
            const item = getItemUnderCursor(x, y);
            if (item) {
                bringToFront(item);
                draggedItemRef.current = item;
            }
        };

        const handlePointerMove = (e) => {
            if (!draggedItemRef.current) return;
            const rect = canvas.getBoundingClientRect();
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
            draggedItemRef.current.x = x;
            draggedItemRef.current.y = y;
            restrictPosition(draggedItemRef.current);
        };

        const handlePointerUp = () => {
            if (draggedItemRef.current) {
                draggedItemRef.current.opacity = 1;
                draggedItemRef.current = null;
            }
        };

        canvas.addEventListener('mousedown', handlePointerDown);
        canvas.addEventListener('mousemove', handlePointerMove);
        canvas.addEventListener('mouseup', handlePointerUp);
        canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
        canvas.addEventListener('touchmove', handlePointerMove, { passive: false });
        canvas.addEventListener('touchend', handlePointerUp);

        const renderLoop = () => {
            context.clearRect(0, 0, width, height);
            context.fillStyle = theme === 'dark' ? '#2A2A2A' : '#fff';
            context.fillRect(0, 0, width, height);

            itemDataRef.current.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).forEach(item => {
                const img = imageRefs.current[item.key];
                const loaded = imagesLoadedRef.current[item.key];
                if (!img || !loaded) return;
                const aspect = img.width / img.height;
                const h = item.height * item.scaleFactor;
                const w = h * aspect;
                context.globalAlpha = item.opacity;
                context.drawImage(img, item.x - w / 2, item.y - h / 2, w, h);
                context.globalAlpha = 1;
            });

            requestAnimationFrame(renderLoop);
        };
        renderLoop();

        return () => {
            canvas.removeEventListener('mousedown', handlePointerDown);
            canvas.removeEventListener('mousemove', handlePointerMove);
            canvas.removeEventListener('mouseup', handlePointerUp);
            canvas.removeEventListener('touchstart', handlePointerDown);
            canvas.removeEventListener('touchmove', handlePointerMove);
            canvas.removeEventListener('touchend', handlePointerUp);
        };
    }, [theme, userId, socket, currentRoom, locationItems]);

    return (
        <ShelterContainer theme={theme}>
            <CloseIcon theme={theme} onClick={handleClose}>×</CloseIcon>
            <SaveButton theme={theme} isSaved={isSaved} onClick={handleSave}>Сохранить</SaveButton>
            <CanvasContainer>
                <canvas ref={canvasRef} />
            </CanvasContainer>
        </ShelterContainer>
    );
}

export default MyShelter;
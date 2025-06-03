import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Matter from 'matter-js';
import wallpaperImage from '../images/dwelling/wallpaper.jpg';
import floorImage from '../images/dwelling/floor.jpg';
import stickImage from '../images/dwelling/furniture/stick.png';
import garbageImage from '../images/dwelling/furniture/garbage.png';
import berryImage from '../images/dwelling/furniture/berry.png';
import mushroomsImage from '../images/dwelling/furniture/mushrooms.png';
import boardImage from '../images/dwelling/furniture/board.png';
import chairImage from '../images/dwelling/furniture/chair.png';
import tableImage from '../images/dwelling/furniture/table.png';
import wardrobeImage from '../images/dwelling/furniture/wardrobe.png';
import sofaImage from '../images/dwelling/furniture/sofa.png';
import chestImage from '../images/dwelling/furniture/chest.png';

const SaveButton = styled.button`
    position: absolute;
    top: 10px;
    right: 60px;
    background: ${({ theme }) => (theme === 'dark' ? '#4A4A4A' : '#D3D3D3')};
    color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#000')};
    border: none;
    border-radius: 5px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 16px;
    z-index: 2000;

    &:hover {
      background: ${({ theme }) => (theme === 'dark' ? '#5A5A5A' : '#B0B0B0')};
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
`;

function MyShelter({ theme, setShowMyShelter, userId, socket, currentRoom }) {
    const canvasRef = useRef(null);
    const engineRef = useRef(Matter.Engine.create());
    const runnerRef = useRef(null);
    const wallpaperImgRef = useRef(new Image());
    const floorImgRef = useRef(new Image());
    const stickImgRef = useRef(new Image());
    const garbageImgRef = useRef(new Image());
    const berryImgRef = useRef(new Image());
    const mushroomsImgRef = useRef(new Image());
    const boardImgRef = useRef(new Image());
    const chairImgRef = useRef(new Image());
    const tableImgRef = useRef(new Image());
    const wardrobeImgRef = useRef(new Image());
    const sofaImgRef = useRef(new Image());
    const chestImgRef = useRef(new Image());
    const imagesLoadedRef = useRef({
        wallpaper: false,
        floor: false,
        stick: false,
        garbage: false,
        berry: false,
        mushrooms: false,
        board: false,
        chair: false,
        table: false,
        wardrobe: false,
        sofa: false,
        chest: false
    });
    const [locationItems, setLocationItems] = useState([]);
    const wallRef = useRef(null);
    const floorRef = useRef(null);
    const itemDataRef = useRef([]);
    const draggedItemRef = useRef(null);

    // Загрузка изображений
    useEffect(() => {
        wallpaperImgRef.current.src = wallpaperImage;
        floorImgRef.current.src = floorImage;
        stickImgRef.current.src = stickImage;
        garbageImgRef.current.src = garbageImage;
        berryImgRef.current.src = berryImage;
        mushroomsImgRef.current.src = mushroomsImage;
        boardImgRef.current.src = boardImage;
        chairImgRef.current.src = chairImage;
        tableImgRef.current.src = tableImage;
        wardrobeImgRef.current.src = wardrobeImage;
        sofaImgRef.current.src = sofaImage;
        chestImgRef.current.src = chestImage;

        wallpaperImgRef.current.onload = () => {
            imagesLoadedRef.current.wallpaper = true;
        };
        floorImgRef.current.onload = () => {
            imagesLoadedRef.current.floor = true;
        };
        stickImgRef.current.onload = () => {
            imagesLoadedRef.current.stick = true;
        };
        garbageImgRef.current.onload = () => {
            imagesLoadedRef.current.garbage = true;
        };
        berryImgRef.current.onload = () => {
            imagesLoadedRef.current.berry = true;
        };
        mushroomsImgRef.current.onload = () => {
            imagesLoadedRef.current.mushrooms = true;
        };
        boardImgRef.current.onload = () => {
            imagesLoadedRef.current.board = true;
        };
        chairImgRef.current.onload = () => {
            imagesLoadedRef.current.chair = true;
        };
        tableImgRef.current.onload = () => {
            imagesLoadedRef.current.table = true;
        };
        wardrobeImgRef.current.onload = () => {
            imagesLoadedRef.current.wardrobe = true;
        };
        sofaImgRef.current.onload = () => {
            imagesLoadedRef.current.sofa = true;
        };
        chestImgRef.current.onload = () => {
            imagesLoadedRef.current.chest = true;
        };

        wallpaperImgRef.current.onerror = () => {
            console.error('Failed to load wallpaper image');
            imagesLoadedRef.current.wallpaper = true;
        };
        floorImgRef.current.onerror = () => {
            console.error('Failed to load floor image');
            imagesLoadedRef.current.floor = true;
        };
        stickImgRef.current.onerror = () => {
            console.error('Failed to load stick image');
            imagesLoadedRef.current.stick = true;
        };
        garbageImgRef.current.onerror = () => {
            console.error('Failed to load garbage image');
            imagesLoadedRef.current.garbage = true;
        };
        berryImgRef.current.onerror = () => {
            console.error('Failed to load berry image');
            imagesLoadedRef.current.berry = true;
        };
        mushroomsImgRef.current.onerror = () => {
            console.error('Failed to load mushrooms image');
            imagesLoadedRef.current.mushrooms = true;
        };
        boardImgRef.current.onerror = () => {
            console.error('Failed to load board image');
            imagesLoadedRef.current.board = true;
        };
        chairImgRef.current.onerror = () => {
            console.error('Failed to load chair image');
            imagesLoadedRef.current.chair = true;
        };
        tableImgRef.current.onerror = () => {
            console.error('Failed to load table image');
            imagesLoadedRef.current.table = true;
        };
        wardrobeImgRef.current.onerror = () => {
            console.error('Failed to load wardrobe image');
            imagesLoadedRef.current.wardrobe = true;
        };
        sofaImgRef.current.onerror = () => {
            console.error('Failed to load sofa image');
            imagesLoadedRef.current.sofa = true;
        };
        chestImgRef.current.onerror = () => {
            console.error('Failed to load chest image');
            imagesLoadedRef.current.chest = true;
        };
    }, []);

    // Создание стены и пола
    useEffect(() => {
        const engine = engineRef.current;
        const canvas = canvasRef.current;
        const parent = canvas.parentElement;
        const width = parent.getBoundingClientRect().width;
        const height = parent.getBoundingClientRect().height;

        const wallHeight = height * 0.4;
        const floorHeight = height * 0.6;
        const staticCollisionFilter = { category: 0x0002, mask: 0 };

        const wall = Matter.Bodies.rectangle(width / 2, wallHeight / 2, width, wallHeight, {
            isStatic: true,
            restitution: 0,
            friction: 0,
            frictionAir: 0,
            render: {
                zIndex: -100
            },
            collisionFilter: staticCollisionFilter
        });

        const floor = Matter.Bodies.rectangle(width / 2, height - floorHeight / 2, width, floorHeight, {
            isStatic: true,
            restitution: 0,
            friction: 0,
            frictionAir: 0,
            render: {
                zIndex: -100
            },
            collisionFilter: staticCollisionFilter
        });

        wallRef.current = wall;
        floorRef.current = floor;
        Matter.World.add(engine.world, [wall, floor]);

        return () => {
            Matter.World.remove(engine.world, [wall, floor]);
        };
    }, []);

    // Получение предметов текущей локации
    useEffect(() => {
        if (!socket || !currentRoom) return;

        const owner = currentRoom;
        socket.emit('getItems', { owner });

        socket.on('items', (data) => {
            if (data.owner === owner) {
                setLocationItems(data.items.map(item => ({
                    ...item,
                    _id: item._id.toString(),
                })));
            }
        });

        // Обработчик обновления позиций предметов от сервера
        socket.on('itemPositionsUpdate', (data) => {
            if (data.owner === currentRoom) {
                setLocationItems(data.items.map(item => ({
                    ...item,
                    _id: item._id.toString(),
                })));
            }
        });

        return () => {
            socket.off('items');
            socket.off('itemPositionsUpdate');
        };
    }, [socket, currentRoom]);

    // Сохранение позиций предметов на сервере
    const handleSave = () => {
        const canvas = canvasRef.current;
        const width = canvas.width;
        const height = canvas.height;

        const positions = {
            ...locationItems.reduce((acc, item) => ({
                ...acc,
                [`item_${item._id}`]: {
                    x: (itemDataRef.current.find(i => i.id === item._id)?.x || (width * 0.2)) / width,
                    y: (itemDataRef.current.find(i => i.id === item._id)?.y || (height * 0.4)) / height,
                    scaleFactor: itemDataRef.current.find(i => i.id === item._id)?.scaleFactor || 1,
                    zIndex: itemDataRef.current.find(i => i.id === item._id)?.zIndex || 0
                }
            }), {})
        };

        socket.emit('updateItemPositions', { owner: currentRoom, positions }, (response) => {
            if (response.success) {
                console.log('Позиции предметов успешно сохранены на сервере');
            } else {
                console.error('Ошибка сохранения позиций:', response.message);
            }
        });
    };

    const handleClose = () => {
        setShowMyShelter(false); // Закрываем без сохранения
    };

    // Основной эффект для рендеринга
    useEffect(() => {
        const canvas = canvasRef.current;
        const parent = canvas.parentElement;
        const width = parent.getBoundingClientRect().width;
        const height = parent.getBoundingClientRect().height;
        canvas.width = width;
        canvas.height = height;

        const engine = engineRef.current;
        engine.gravity.y = 0;

        const boundaryOptions = {
            isStatic: true,
            restitution: 0,
            friction: 1,
            render: { visible: false },
            collisionFilter: { category: 0x0003, mask: 0x0001 }
        };
        const boundaries = [
            Matter.Bodies.rectangle(width / 2, -25, width, 50, boundaryOptions),
            Matter.Bodies.rectangle(width / 2, height + 25, width, 50, boundaryOptions),
            Matter.Bodies.rectangle(-25, height / 2, 50, height, boundaryOptions),
            Matter.Bodies.rectangle(width + 25, height / 2, 50, height, boundaryOptions),
        ];
        Matter.World.add(engine.world, boundaries);

        // Формируем данные для предметов на основе данных из базы
        itemDataRef.current = locationItems.map((item, index) => {
            const isStick = item.name === 'Палка';
            const isGarbage = item.name === 'Мусор';
            const isBerry = item.name === 'Лесные ягоды';
            const isMushrooms = item.name === 'Лесные грибы';
            const isBoard = item.name === 'Доска';
            const isChair = item.name === 'Стул';
            const isTable = item.name === 'Стол';
            const isWardrobe = item.name === 'Шкаф';
            const isSofa = item.name === 'Кровать';
            const isChest = item.name === 'Тумба';

            const size = isChair ? 100 :
                isBoard ? 100 :
                    isBerry || isMushrooms ? 50 :
                        isStick || isGarbage ? 67 :
                            200;

            return {
                id: item._id,
                x: item.x * width, // Преобразуем относительную x в абсолютную
                y: item.y * height, // Преобразуем относительную y в абсолютную
                scaleFactor: item.scaleFactor,
                zIndex: item.zIndex,
                width: size,
                height: size,
                texture: isStick ? stickImage :
                    isGarbage ? garbageImage :
                        isBerry ? berryImage :
                            isMushrooms ? mushroomsImage :
                                isBoard ? boardImage :
                                    isChair ? chairImage :
                                        isTable ? tableImage :
                                            isWardrobe ? wardrobeImage :
                                                isSofa ? sofaImage :
                                                    isChest ? chestImage : undefined,
                opacity: 1
            };
        });

        const restrictPosition = (item) => {
            const margin = 5 / width;
            const halfWidth = (item.width * item.scaleFactor) / (2 * width);
            const halfHeight = (item.height * item.scaleFactor) / (2 * height);

            item.x = Math.max(margin + halfWidth, Math.min(item.x / width, 1 - margin - halfWidth)) * width;
            item.y = Math.max(margin + halfHeight, Math.min(item.y / height, 1 - margin - halfHeight)) * height;
        };

        const bringToFront = (item) => {
            const maxZIndex = Math.max(...itemDataRef.current.map(i => i.zIndex || 0));
            item.zIndex = maxZIndex + 1;
            item.opacity = 0.8;
        };

        const handleMouseDown = (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

            const itemsUnderCursor = itemDataRef.current
                .map(item => {
                    const halfWidth = (item.width * item.scaleFactor) / 2;
                    const halfHeight = (item.height * item.scaleFactor) / 2;

                    if (
                        mouseX >= item.x - halfWidth &&
                        mouseX <= item.x + halfWidth &&
                        mouseY >= item.y - halfHeight &&
                        mouseY <= item.y + halfHeight
                    ) {
                        const image = item.texture === stickImage ? stickImgRef.current :
                            item.texture === garbageImage ? garbageImgRef.current :
                                item.texture === berryImage ? berryImgRef.current :
                                    item.texture === mushroomsImage ? mushroomsImgRef.current :
                                        item.texture === boardImage ? boardImgRef.current :
                                            item.texture === chairImage ? chairImgRef.current :
                                                item.texture === tableImage ? tableImgRef.current :
                                                    item.texture === wardrobeImage ? wardrobeImgRef.current :
                                                        item.texture === sofaImage ? sofaImgRef.current :
                                                            chestImgRef.current;

                        if (image.width && image.height && imagesLoadedRef.current[item.texture === stickImage ? 'stick' :
                            item.texture === garbageImage ? 'garbage' :
                                item.texture === berryImage ? 'berry' :
                                    item.texture === mushroomsImage ? 'mushrooms' :
                                        item.texture === boardImage ? 'board' :
                                            item.texture === chairImage ? 'chair' :
                                                item.texture === tableImage ? 'table' :
                                                    item.texture === wardrobeImage ? 'wardrobe' :
                                                        item.texture === sofaImage ? 'sofa' : 'chest']) {
                            const aspectRatio = image.width / image.height;
                            const textureHeight = item.height * item.scaleFactor;
                            const textureWidth = textureHeight * aspectRatio;

                            tempCanvas.width = image.width;
                            tempCanvas.height = image.height;
                            tempCtx.drawImage(image, 0, 0, image.width, image.height);

                            const localX = (mouseX - (item.x - halfWidth)) / (textureWidth / image.width);
                            const localY = (mouseY - (item.y - halfHeight)) / (textureHeight / image.height);

                            if (localX >= 0 && localX < image.width && localY >= 0 && localY < image.height) {
                                try {
                                    const pixelData = tempCtx.getImageData(Math.floor(localX), Math.floor(localY), 1, 1).data;
                                    const isNotTransparent = pixelData[3] > 0;
                                    return { item, isNotTransparent };
                                } catch (error) {
                                    console.error('Error reading pixel data for item:', item.id, error);
                                    return null;
                                }
                            }
                        }
                        return null;
                    }
                    return null;
                })
                .filter(item => item && item.isNotTransparent)
                .sort((a, b) => (b.item.zIndex || 0) - (a.item.zIndex || 0));

            const clickedItem = itemsUnderCursor.length > 0 ? itemsUnderCursor[0].item : null;

            if (clickedItem) {
                bringToFront(clickedItem);
                draggedItemRef.current = clickedItem;
            }
        };

        const handleMouseMove = (event) => {
            if (draggedItemRef.current) {
                const rect = canvas.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;
                draggedItemRef.current.x = mouseX;
                draggedItemRef.current.y = mouseY;
                restrictPosition(draggedItemRef.current);
            }
        };

        const handleMouseUp = () => {
            if (draggedItemRef.current) {
                draggedItemRef.current.opacity = 1;
                draggedItemRef.current = null;
            }
        };

        const handleTouchStart = (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            const rect = canvas.getBoundingClientRect();
            const mouseX = touch.clientX - rect.left;
            const mouseY = touch.clientY - rect.top;

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

            const itemsUnderCursor = itemDataRef.current
                .map(item => {
                    const halfWidth = (item.width * item.scaleFactor) / 2;
                    const halfHeight = (item.height * item.scaleFactor) / 2;

                    if (
                        mouseX >= item.x - halfWidth &&
                        mouseX <= item.x + halfWidth &&
                        mouseY >= item.y - halfHeight &&
                        mouseY <= item.y + halfHeight
                    ) {
                        const image = item.texture === stickImage ? stickImgRef.current :
                            item.texture === garbageImage ? garbageImgRef.current :
                                item.texture === berryImage ? berryImgRef.current :
                                    item.texture === mushroomsImage ? mushroomsImgRef.current :
                                        item.texture === boardImage ? boardImgRef.current :
                                            item.texture === chairImage ? chairImgRef.current :
                                                item.texture === tableImage ? tableImgRef.current :
                                                    item.texture === wardrobeImage ? wardrobeImgRef.current :
                                                        item.texture === sofaImage ? sofaImgRef.current :
                                                            chestImgRef.current;

                        if (image.width && image.height && imagesLoadedRef.current[item.texture === stickImage ? 'stick' :
                            item.texture === garbageImage ? 'garbage' :
                                item.texture === berryImage ? 'berry' :
                                    item.texture === mushroomsImage ? 'mushrooms' :
                                        item.texture === boardImage ? 'board' :
                                            item.texture === chairImage ? 'chair' :
                                                item.texture === tableImage ? 'table' :
                                                    item.texture === wardrobeImage ? 'wardrobe' :
                                                        item.texture === sofaImage ? 'sofa' : 'chest']) {
                            const aspectRatio = image.width / image.height;
                            const textureHeight = item.height * item.scaleFactor;
                            const textureWidth = textureHeight * aspectRatio;

                            tempCanvas.width = image.width;
                            tempCanvas.height = image.height;
                            tempCtx.drawImage(image, 0, 0, image.width, image.height);

                            const localX = (mouseX - (item.x - halfWidth)) / (textureWidth / image.width);
                            const localY = (mouseY - (item.y - halfHeight)) / (textureHeight / image.height);

                            if (localX >= 0 && localX < image.width && localY >= 0 && localY < image.height) {
                                try {
                                    const pixelData = tempCtx.getImageData(Math.floor(localX), Math.floor(localY), 1, 1).data;
                                    const isNotTransparent = pixelData[3] > 0;
                                    return { item, isNotTransparent };
                                } catch (error) {
                                    console.error('Error reading pixel data for item:', item.id, error);
                                    return null;
                                }
                            }
                        }
                        return null;
                    }
                    return null;
                })
                .filter(item => item && item.isNotTransparent)
                .sort((a, b) => (b.item.zIndex || 0) - (a.item.zIndex || 0));

            const touchedItem = itemsUnderCursor.length > 0 ? itemsUnderCursor[0].item : null;

            if (touchedItem) {
                bringToFront(touchedItem);
                draggedItemRef.current = touchedItem;
            }
        };

        const handleTouchMove = (event) => {
            event.preventDefault();
            if (draggedItemRef.current) {
                const touch = event.touches[0];
                const rect = canvas.getBoundingClientRect();
                const mouseX = touch.clientX - rect.left;
                const mouseY = touch.clientY - rect.top;
                draggedItemRef.current.x = mouseX;
                draggedItemRef.current.y = mouseY;
                restrictPosition(draggedItemRef.current);
            }
        };

        const handleTouchEnd = (event) => {
            event.preventDefault();
            if (draggedItemRef.current) {
                draggedItemRef.current.opacity = 1;
                draggedItemRef.current = null;
            }
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

        const context = canvas.getContext('2d');
        let animationFrameId;

        const renderLoop = () => {
            context.fillStyle = theme === 'dark' ? '#2A2A2A' : '#fff';
            context.fillRect(0, 0, canvas.width, canvas.height);

            [wallRef.current, floorRef.current].forEach(body => {
                const vertices = body.vertices;
                const minX = Math.min(...vertices.map(v => v.x));
                const maxX = Math.max(...vertices.map(v => v.x));
                const minY = Math.min(...vertices.map(v => v.y));
                const maxY = Math.max(...vertices.map(v => v.y));
                const objWidth = maxX - minX;
                const objHeight = maxY - minY;

                context.save();
                context.beginPath();
                context.moveTo(vertices[0].x, vertices[0].y);
                for (let j = 1; j < vertices.length; j++) {
                    context.lineTo(vertices[j].x, vertices[j].y);
                }
                context.closePath();
                context.clip();

                const isWall = body === wallRef.current;
                const image = isWall ? wallpaperImgRef.current : floorImgRef.current;
                const isImageLoaded = isWall ? imagesLoadedRef.current.wallpaper : imagesLoadedRef.current.floor;

                if (isImageLoaded && image.width && image.height) {
                    const aspectRatio = image.width / image.height;
                    const textureHeight = objHeight;
                    const textureWidth = textureHeight * aspectRatio;

                    if (textureWidth < objWidth) {
                        const pattern = context.createPattern(image, 'repeat-x');
                        context.fillStyle = pattern;
                        context.translate(minX, minY);
                        context.scale(textureWidth / image.width, textureHeight / image.height);
                        context.fill();
                    } else {
                        context.drawImage(image, minX, minY, textureWidth, textureHeight);
                    }
                } else {
                    context.fillStyle = isWall ? (theme === 'dark' ? '#4A4A4A' : '#D3D3D3') : (theme === 'dark' ? '#3A3A3A' : '#A9A9A9');
                    context.fill();
                }
                context.restore();
            });

            itemDataRef.current.forEach(item => {
                const margin = 5;
                const halfWidth = (item.width * item.scaleFactor) / 2;
                const halfHeight = (item.height * item.scaleFactor) / 2;
                item.x = Math.max(margin + halfWidth, Math.min(item.x, canvas.width - margin - halfWidth));
                item.y = Math.max(margin + halfHeight, Math.min(item.y, canvas.height - margin - halfHeight));

                const y = item.y;
                const minY = height * 0.4;
                const maxY = height;
                let targetScale = 1;
                if (y >= minY && y <= maxY) {
                    targetScale = 1 + (y - minY) / (maxY - minY);
                } else if (y > maxY) {
                    targetScale = 2;
                }
                item.scaleFactor = targetScale;
            });

            const items = itemDataRef.current.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
            items.forEach(item => {
                context.globalAlpha = item.opacity;
                if (item.texture &&
                    [stickImage, garbageImage, berryImage, mushroomsImage, boardImage, chairImage, tableImage, wardrobeImage, sofaImage, chestImage].includes(item.texture) &&
                    imagesLoadedRef.current[item.texture === stickImage ? 'stick' :
                        item.texture === garbageImage ? 'garbage' :
                            item.texture === berryImage ? 'berry' :
                                item.texture === mushroomsImage ? 'mushrooms' :
                                    item.texture === boardImage ? 'board' :
                                        item.texture === chairImage ? 'chair' :
                                            item.texture === tableImage ? 'table' :
                                                item.texture === wardrobeImage ? 'wardrobe' :
                                                    item.texture === sofaImage ? 'sofa' : 'chest']) {
                    const image = item.texture === stickImage ? stickImgRef.current :
                        item.texture === garbageImage ? garbageImgRef.current :
                            item.texture === berryImage ? berryImgRef.current :
                                item.texture === mushroomsImage ? mushroomsImgRef.current :
                                    item.texture === boardImage ? boardImgRef.current :
                                        item.texture === chairImage ? chairImgRef.current :
                                            item.texture === tableImage ? tableImgRef.current :
                                                item.texture === wardrobeImage ? wardrobeImgRef.current :
                                                    item.texture === sofaImage ? sofaImgRef.current :
                                                        chestImgRef.current;
                    if (image.width && image.height) {
                        const aspectRatio = image.width / image.height;
                        const textureHeight = item.height * item.scaleFactor;
                        const textureWidth = textureHeight * aspectRatio;
                        context.save();
                        context.shadowColor = 'rgba(0, 0, 0, 0.3)';
                        context.shadowBlur = 5;
                        context.shadowOffsetX = 3;
                        context.shadowOffsetY = 3;
                        context.drawImage(image, item.x - textureWidth / 2, item.y - textureHeight / 2, textureWidth, textureHeight);
                        context.shadowColor = 'rgba(0, 0, 0, 0)';
                        context.shadowBlur = 0;
                        context.shadowOffsetX = 0;
                        context.shadowOffsetY = 0;
                        context.restore();
                    }
                }
                context.globalAlpha = 1;
            });

            animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop();

        runnerRef.current = Matter.Runner.create();
        Matter.Runner.run(runnerRef.current, engine);

        const handleResize = () => {
            const newWidth = canvas.parentElement.getBoundingClientRect().width;
            const newHeight = canvas.parentElement.getBoundingClientRect().height;
            canvas.width = newWidth;
            canvas.height = newHeight;

            Matter.Body.setPosition(boundaries[0], { x: newWidth / 2, y: -25 });
            Matter.Body.setPosition(boundaries[1], { x: newWidth / 2, y: newHeight + 25 });
            Matter.Body.setPosition(boundaries[2], { x: -25, y: newHeight / 2 });
            Matter.Body.setPosition(boundaries[3], { x: newWidth + 25, y: newHeight / 2 });

            itemDataRef.current.forEach(item => {
                item.x = (item.x / width) * newWidth;
                item.y = (item.y / height) * newHeight;
                const margin = 5;
                const halfWidth = (item.width * item.scaleFactor) / 2;
                const halfHeight = (item.height * item.scaleFactor) / 2;
                item.x = Math.max(margin + halfWidth, Math.min(item.x, newWidth - margin - halfWidth));
                item.y = Math.max(margin + halfHeight, Math.min(item.y, newHeight - margin - halfHeight));
            });

            const wallHeight = newHeight * 0.4;
            const floorHeight = newHeight * 0.6;
            Matter.Body.setPosition(wallRef.current, { x: newWidth / 2, y: wallHeight / 2 });
            Matter.Body.setPosition(floorRef.current, { x: newWidth / 2, y: newHeight - floorHeight / 2 });
            Matter.Body.setVertices(wallRef.current, Matter.Bodies.rectangle(newWidth / 2, wallHeight / 2, newWidth, wallHeight).vertices);
            Matter.Body.setVertices(floorRef.current, Matter.Bodies.rectangle(newWidth / 2, newHeight - floorHeight / 2, newWidth, floorHeight).vertices);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('resize', handleResize);
            Matter.Runner.stop(runnerRef.current);
            Matter.World.clear(engine.world);
            Matter.Engine.clear(engine);
        };
    }, [theme, userId, socket, currentRoom, locationItems]);

    return (
        <ShelterContainer theme={theme}>
            <CloseIcon theme={theme} onClick={handleClose}>×</CloseIcon>
            <SaveButton theme={theme} onClick={handleSave}>Сохранить</SaveButton>
            <CanvasContainer>
                <canvas ref={canvasRef} />
            </CanvasContainer>
        </ShelterContainer>
    );
}

export default MyShelter;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

const FightContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: ${({ theme }) => (theme === 'dark' ? '#1A1A1A' : '#fff')};
  color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#000')};
  height: 100%;
  position: relative;
`;

const MannequinContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
`;

const Mannequin = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 45%;
`;

const MannequinLabel = styled.h3`
  margin-bottom: 10px;
  font-size: 1.2em;
  text-align: center;
`;

const HPBar = styled.div`
  width: 100%;
  height: 20px;
  background: #ccc;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
`;

const HPFill = styled.div`
  width: ${({ hp }) => hp}%;
  height: 100%;
  background: ${({ hp }) => (hp > 50 ? 'green' : hp > 20 ? 'orange' : 'red')};
  transition: width 0.3s;
`;

const ZoneGrid = styled.div`
  display: grid;
  grid-template-areas:
    "head head"
    "back belly"
    "legs legs";
  gap: 5px;
  width: 100%;
`;

const Zone = styled.div`
  padding: 10px;
  border: 2px solid ${({ theme, selected, isAttack }) =>
        selected ? (isAttack ? 'red' : 'blue') : theme === 'dark' ? '#555' : '#ccc'};
  background: ${({ theme, selected, isAttack }) =>
        selected ? (isAttack ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 0, 255, 0.2)') : 'transparent'};
  border-radius: 5px;
  text-align: center;
  cursor: pointer;
  font-size: 0.9em;

  &.head { grid-area: head; }
  &.back { grid-area: back; }
  &.belly { grid-area: belly; }
  &.legs { grid-area: legs; }
`;

const TimerDisplay = styled.div`
  font-size: 1.2em;
  margin-bottom: 20px;
  color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#000')};
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#000')};
  font-size: 1.5em;
  cursor: pointer;
`;

const Notification = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => (theme === 'dark' ? '#333' : '#f0f0f0')};
  color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#000')};
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: ${({ show }) => (show ? 'block' : 'none')};
`;

function Fight({ theme, socket, user, npc, onClose, showNotification }) {
    const [playerHP, setPlayerHP] = useState(100);
    const [npcHP, setNpcHP] = useState(100);
    const [playerAttackZone, setPlayerAttackZone] = useState(null);
    const [playerDefenseZones, setPlayerDefenseZones] = useState([]);
    const [npcAttackZone, setNpcAttackZone] = useState(null);
    const [npcDefenseZones, setNpcDefenseZones] = useState([]);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isRoundActive, setIsRoundActive] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '' });

    // Оборачиваем zones в useMemo для стабильности
    const zones = useMemo(() => ['head', 'back', 'belly', 'legs'], []);

    // Завершение раунда
    const handleRoundEnd = useCallback(() => {
        if (!socket || isProcessing) return;

        setIsProcessing(true);

        // Генерируем действия NPC
        const npcAttack = zones[Math.floor(Math.random() * zones.length)];
        const npcDefense = [];
        while (npcDefense.length < 2) {
            const zone = zones[Math.floor(Math.random() * zones.length)];
            if (!npcDefense.includes(zone)) npcDefense.push(zone);
        }

        setNpcAttackZone(npcAttack);
        setNpcDefenseZones(npcDefense);

        // Отправляем данные на сервер
        socket.emit('fightRound', {
            userId: user.userId,
            npcId: npc.id,
            playerAttackZone,
            playerDefenseZones,
            npcAttackZone: npcAttack,
            npcDefenseZones: npcDefense
        }, (response) => {
            if (response.success) {
                setPlayerHP(response.playerHP);
                setNpcHP(response.npcHP);
                setNotification({ show: true, message: response.message });
                setTimeout(() => setNotification({ show: false, message: '' }), 3000);

                // Сбрасываем выбор зон
                setPlayerAttackZone(null);
                setPlayerDefenseZones([]);
                setNpcAttackZone(null);
                setNpcDefenseZones([]);

                if (response.playerHP <= 0 || response.npcHP <= 0) {
                    setIsRoundActive(false);
                    showNotification(response.playerHP <= 0 ? 'Вы проиграли!' : 'Вы победили!');
                    setTimeout(onClose, 2000);
                } else {
                    setIsRoundActive(true);
                    setTimeLeft(30);
                }
            } else {
                setNotification({ show: true, message: 'Ошибка в бою' });
                setTimeout(() => setNotification({ show: false, message: '' }), 3000);
            }
            setIsProcessing(false);
        });
    }, [socket, user, npc, playerAttackZone, playerDefenseZones, zones, showNotification, onClose, isProcessing]);

    // Таймер раунда
    useEffect(() => {
        if (!isRoundActive) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleRoundEnd();
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isRoundActive, handleRoundEnd]); // Добавляем handleRoundEnd в зависимости

    // Обработка выбора зон игроком
    const handleZoneClick = useCallback((zone, isPlayerMannequin, isAttack) => {
        if (!isRoundActive || isProcessing) return;

        if (isPlayerMannequin && isAttack) {
            setPlayerAttackZone(zone);
        } else if (isPlayerMannequin && !isAttack) {
            setPlayerDefenseZones((prev) => {
                if (prev.includes(zone)) {
                    return prev.filter((z) => z !== zone);
                }
                if (prev.length < 2) {
                    return [...prev, zone];
                }
                return prev;
            });
        }
    }, [isRoundActive, isProcessing]);



    // Проверка завершения боя
    useEffect(() => {
        if (playerHP <= 0 || npcHP <= 0) {
            setIsRoundActive(false);
        }
    }, [playerHP, npcHP]);

    return (
        <FightContainer theme={theme}>
            <CloseButton theme={theme} onClick={onClose}><FaTimes /></CloseButton>
            <TimerDisplay theme={theme}>
                Время до конца раунда: {timeLeft} сек
            </TimerDisplay>
            <MannequinContainer>
                <Mannequin>
                    <MannequinLabel theme={theme}>{user.name}</MannequinLabel>
                    <HPBar>
                        <HPFill hp={playerHP} />
                    </HPBar>
                    <ZoneGrid>
                        {zones.map((zone) => (
                            <Zone
                                key={zone}
                                className={zone}
                                theme={theme}
                                selected={playerAttackZone === zone || playerDefenseZones.includes(zone)}
                                isAttack={playerAttackZone === zone}
                                onClick={() => handleZoneClick(zone, true, playerAttackZone === zone || !playerAttackZone)}
                            >
                                {zone === 'head' ? 'Голова' : zone === 'back' ? 'Спина' : zone === 'belly' ? 'Живот' : 'Ноги'}
                            </Zone>
                        ))}
                    </ZoneGrid>
                </Mannequin>
                <Mannequin>
                    <MannequinLabel theme={theme}>{npc.name}</MannequinLabel>
                    <HPBar>
                        <HPFill hp={npcHP} />
                    </HPBar>
                    <ZoneGrid>
                        {zones.map((zone) => (
                            <Zone
                                key={zone}
                                className={zone}
                                theme={theme}
                                selected={npcAttackZone === zone || npcDefenseZones.includes(zone)}
                                isAttack={npcAttackZone === zone}
                            >
                                {zone === 'head' ? 'Голова' : zone === 'back' ? 'Спина' : zone === 'belly' ? 'Живот' : 'Ноги'}
                            </Zone>
                        ))}
                    </ZoneGrid>
                </Mannequin>
            </MannequinContainer>
            <ActionButton
                onClick={handleRoundEnd}
                disabled={isProcessing || !playerAttackZone || playerDefenseZones.length !== 2}
            >
                {isProcessing ? <ClipLoader color="#fff" size={20} /> : 'Подтвердить ход'}
            </ActionButton>
            <Notification show={notification.show} theme={theme}>
                {notification.message}
            </Notification>
        </FightContainer>
    );
}

export default Fight;
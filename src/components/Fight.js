import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { Avatar, DefaultAvatar } from '../styles/ChatStyles';

// Обновление стилей InstructionLabel с условным цветом
const InstructionLabel = styled.div`
  margin-top: 10px;
  font-size: 0.9em;
  color: ${({ theme, isReady }) => (isReady ? '#28a745' : theme === 'dark' ? '#aaa' : '#666')};
  text-align: center;
`;

const FightContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: ${({ theme }) => (theme === 'dark' ? '#1A1A1A' : '#fff')};
  color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#000')};
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  box-sizing: border-box;
`;

const TimeProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background: ${({ theme }) => (theme === 'dark' ? '#555' : '#ccc')};
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const TimeProgressFill = styled.div`
  width: ${({ progress }) => progress}%;
  height: 100%;
  background: #007AFF;
  transition: width 0.3s linear;
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

const AvatarContainer = styled.div`
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
`;

const LargeAvatar = styled(Avatar)`
  width: 72px;
  height: 72px;
  border-radius: 50%;
`;

const LargeDefaultAvatar = styled(DefaultAvatar)`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  font-size: 28px;
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

const LogContainer = styled.div`
  width: 100%;
  max-width: 600px;
  height: 150px;
  background: ${({ theme }) => (theme === 'dark' ? '#2A2A2A' : '#f5f5f5')};
  border: 1px solid ${({ theme }) => (theme === 'dark' ? '#555' : '#ddd')};
  border-radius: 5px;
  margin-top: 10px;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;
  gap: 5px;
`;

const LogItem = styled.div`
  font-size: 0.9em;
  color: ${({ theme }) => (theme === 'dark' ? '#ccc' : '#333')};
  word-break: break-word;
  background: ${({ isHighlighted }) => (isHighlighted ? 'rgba(0, 255, 0, 0.2)' : 'transparent')};
  padding: 2px 5px;
  border-radius: 3px;
  transition: background 0.3s ease;
`;

function Fight({ theme, socket, user, npc, onClose, showNotification }) {
  const [playerHP, setPlayerHP] = useState(100);
  const [npcHP, setNpcHP] = useState(npc.stats?.health || 100);
  const [playerAttackZone, setPlayerAttackZone] = useState(null);
  const [playerDefenseZones, setPlayerDefenseZones] = useState([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isRoundActive, setIsRoundActive] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [battleLogs, setBattleLogs] = useState([]);
  const [highlightNewLog, setHighlightNewLog] = useState(false);

  const zones = useMemo(() => ['head', 'back', 'belly', 'legs'], []);

  const displayName = !user.isHuman && user.name 
    ? user.name 
    : `${user?.firstName || 'Игрок'} ${user?.lastName || ''}`.trim();

  const playerInitial = (user.firstName || user.name || 'И').charAt(0).toUpperCase();
  const npcInitial = (npc.name || 'N').charAt(0).toUpperCase();

  const timeProgress = useMemo(() => (timeLeft / 20) * 100, [timeLeft]);

  // Функция для получения текста надписи для защиты
  const getDefenseInstruction = () => {
    if (playerDefenseZones.length === 0) {
      return 'Поставьте 2 защиты';
    } else if (playerDefenseZones.length === 1) {
      return 'Поставьте 1 защиту';
    } else {
      return 'Защита готова!';
    }
  };

  // Функция для получения текста надписи для атаки
  const getAttackInstruction = () => {
    return playerAttackZone ? 'Вы готовы атаковать!' : 'Укажите место атаки';
  };

  useEffect(() => {
    if (battleLogs.length === 0 || !highlightNewLog) return;

    const timer = setTimeout(() => {
      setHighlightNewLog(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [battleLogs, highlightNewLog]);

  useEffect(() => {
    if (battleLogs.length === 0 || !highlightNewLog) return;

    const timer = setTimeout(() => {
      setHighlightNewLog(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [battleLogs, highlightNewLog]);

  // Функция для замены английских названий зон на русские в сообщениях
  const replaceZoneNames = (message) => {
    const zoneMap = {
      head: 'голову',
      back: 'спину',
      belly: 'живот',
      legs: 'ноги'
    };
    let updatedMessage = message;
    Object.keys(zoneMap).forEach((zone) => {
      const regex = new RegExp(`\\b${zone}\\b`, 'g');
      updatedMessage = updatedMessage.replace(regex, zoneMap[zone]);
    });
    return updatedMessage;
  };

  const handleRoundEnd = useCallback(() => {
    if (!socket || isProcessing) return;

    setIsProcessing(true);

    const npcAttack = zones[Math.floor(Math.random() * zones.length)];
    const npcDefense = [];
    while (npcDefense.length < 2) {
      const zone = zones[Math.floor(Math.random() * zones.length)];
      if (!npcDefense.includes(zone)) npcDefense.push(zone);
    }

    socket.emit('fightRound', {
      userId: user.userId,
      npcId: npc.id,
      playerAttackZone,
      playerDefenseZones,
      npcAttackZone: npcAttack,
      npcDefenseZones: npcDefense,
      playerAttack: 10 // Фиксированная атака игрока (можно заменить на user.stats.attack, если добавите)
    }, (response) => {
      if (response.success) {
        setPlayerHP(response.playerHP);
        setNpcHP(response.npcHP);
        let logMessage;
        if (playerAttackZone === null) {
          const sentences = response.message.split(/[.!]\s+/);
          const npcAction = sentences[1] ? replaceZoneNames(sentences[1]) : '';
          logMessage = `Вы не атаковали.${npcAction ? ' ' + npcAction : ''}`;
        } else {
          logMessage = replaceZoneNames(response.message);
        }
        setBattleLogs((prev) => [
          `${new Date().toLocaleTimeString()}: ${logMessage}`,
          ...prev
        ]);
        setHighlightNewLog(true);

        setPlayerAttackZone(null);
        setPlayerDefenseZones([]);

        if (response.playerHP <= 0 || response.npcHP <= 0) {
          setIsRoundActive(false);
          const finalMessage = response.playerHP <= 0 ? 'Вы проиграли!' : 'Вы победили!';
          setBattleLogs((prev) => [
            `${new Date().toLocaleTimeString()}: ${finalMessage}`,
            ...prev
          ]);
          setHighlightNewLog(true);
          showNotification(finalMessage);
          setTimeout(onClose, 2000);
        } else {
          setIsRoundActive(true);
          setTimeLeft(20);
        }
      } else {
        setBattleLogs((prev) => [
          `${new Date().toLocaleTimeString()}: Ошибка в бою`,
          ...prev
        ]);
        setHighlightNewLog(true);
      }
      setIsProcessing(false);
    });
  }, [socket, user, npc, playerAttackZone, playerDefenseZones, zones, showNotification, onClose, isProcessing]);

  useEffect(() => {
    if (!isRoundActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleRoundEnd();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRoundActive, handleRoundEnd]);

  const handleZoneClick = useCallback((zone, isPlayerMannequin) => {
    if (!isRoundActive || isProcessing) return;

    if (isPlayerMannequin) {
      setPlayerDefenseZones((prev) => {
        if (prev.includes(zone)) {
          return prev.filter((z) => z !== zone);
        }
        if (prev.length < 2) {
          return [...prev, zone];
        }
        return prev;
      });
    } else {
      setPlayerAttackZone(zone);
    }
  }, [isRoundActive, isProcessing]);

  useEffect(() => {
    if (playerHP <= 0 || npcHP <= 0) {
      setIsRoundActive(false);
    }
  }, [playerHP, npcHP]);

  return (
    <FightContainer theme={theme}>
      <CloseButton theme={theme} onClick={onClose}><FaTimes /></CloseButton>
      <TimeProgressBar theme={theme}>
        <TimeProgressFill progress={timeProgress} />
      </TimeProgressBar>
      <MannequinContainer>
        <Mannequin>
          <MannequinLabel theme={theme}>{displayName}</MannequinLabel>
          <AvatarContainer>
            {user.photoUrl && user.photoUrl.trim() ? (
              <LargeAvatar src={user.photoUrl} alt="Player Avatar" />
            ) : (
              <LargeDefaultAvatar>{playerInitial}</LargeDefaultAvatar>
            )}
          </AvatarContainer>
          <HPBar>
            <HPFill hp={(playerHP / 100) * 100} />
          </HPBar>
          <ZoneGrid>
            {zones.map((zone) => (
              <Zone
                key={zone}
                className={zone}
                theme={theme}
                selected={playerDefenseZones.includes(zone)}
                isAttack={false}
                onClick={() => handleZoneClick(zone, true)}
              >
                {zone === 'head' ? 'Голова' : zone === 'back' ? 'Спина' : zone === 'belly' ? 'Живот' : 'Ноги'}
              </Zone>
            ))}
          </ZoneGrid>
          {/* Динамическая надпись для защиты с условным цветом */}
          <InstructionLabel theme={theme} isReady={playerDefenseZones.length === 2}>
            {getDefenseInstruction()}
          </InstructionLabel>
        </Mannequin>
        <Mannequin>
          <MannequinLabel theme={theme}>{npc.name}</MannequinLabel>
          <AvatarContainer>
            {npc.photoUrl && npc.photoUrl.trim() ? (
              <LargeAvatar src={npc.photoUrl} alt="NPC Avatar" />
            ) : (
              <LargeDefaultAvatar>{npcInitial}</LargeDefaultAvatar>
            )}
          </AvatarContainer>
          <HPBar>
            <HPFill hp={(npcHP / npc.stats.health) * 100} />
          </HPBar>
          <ZoneGrid>
            {zones.map((zone) => (
              <Zone
                key={zone}
                className={zone}
                theme={theme}
                selected={playerAttackZone === zone}
                isAttack={playerAttackZone === zone}
                onClick={() => handleZoneClick(zone, false)}
              >
                {zone === 'head' ? 'Голова' : zone === 'back' ? 'Спина' : zone === 'belly' ? 'Живот' : 'Ноги'}
              </Zone>
            ))}
          </ZoneGrid>
          {/* Динамическая надпись для атаки с условным цветом */}
          <InstructionLabel theme={theme} isReady={!!playerAttackZone}>
            {getAttackInstruction()}
          </InstructionLabel>
        </Mannequin>
      </MannequinContainer>
      <ActionButton
        onClick={handleRoundEnd}
        disabled={isProcessing || !playerAttackZone || playerDefenseZones.length !== 2}
      >
        {isProcessing ? <ClipLoader color="#fff" size={20} /> : 'Подтвердить ход'}
      </ActionButton>
      <LogContainer theme={theme}>
        {battleLogs.map((log, index) => (
          <LogItem
            key={index}
            theme={theme}
            isHighlighted={index === 0 && highlightNewLog}
          >
            {log}
          </LogItem>
        ))}
      </LogContainer>
    </FightContainer>
  );
}

export default Fight;
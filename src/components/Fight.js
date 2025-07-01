import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { FaRunning, FaFistRaised, FaShieldAlt } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { Avatar, DefaultAvatar } from '../styles/ChatStyles';
import fightImage from '../images/fight.jpg'; // Импортируем изображение
//import { useNotification } from '../utils/NotificationContext'; // Новый импорт

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px; /* Расстояние между кнопками */
  margin-top: 10px;
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
  z-index: 1001; /* Добавляем z-index, чтобы иконка была выше прогрессбара */
`;
const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 20px); /* Учитываем padding */
  margin-bottom: 20px;
`;

const TimeProgressBar = styled.div`
  width: calc(100% - 20px); /* Уменьшаем ширину для размещения иконки */
  height: 8px;
  background: ${({ theme }) => (theme === 'dark' ? '#555' : '#ccc')};
  border-radius: 4px;
  overflow: hidden;
`;

const FightContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: ${({ theme }) => (theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)')} url(${fightImage}) no-repeat center center;
  background-size: cover; /* Растягиваем изображение на весь контейнер */
  color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#000')};
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  box-sizing: border-box;
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

const StatsDisplay = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 0.9em;
  color: ${({ theme }) => (theme === 'dark' ? '#ccc' : '#333')};
  align-items: center;
  text-shadow: ${({ theme }) => (theme === 'dark' ? '1px 1px 2px rgba(0, 0, 0, 0.5)' : '1px 1px 2px rgba(0, 0, 0, 0.3)')}; /* Добавляем тень для текста и иконок */
`;

const HPBar = styled.div`
  width: 100%;
  height: 20px;
  background: #ccc;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
  position: relative;
`;

const HPFill = styled.div`
  width: ${({ hpPercentage }) => hpPercentage}%;
  height: 100%;
  background: ${({ hpPercentage }) => (hpPercentage > 50 ? 'green' : hpPercentage > 20 ? 'orange' : 'red')};
  transition: width 0.3s;
`;

const HPText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8em;
  color: #fff;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
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
    selected
      ? (isAttack ? 'rgba(255, 0, 0, 1)' : 'rgba(0, 0, 255, 1)')
      : theme === 'dark' ? '#333' : '#f5f5f5'};
  border-radius: 5px;
  text-align: center;
  cursor: pointer;
  font-size: 0.9em;
  text-shadow: ${({ theme }) => (theme === 'dark' ? '1px 1px 2px rgba(0, 0, 0, 0.5)' : '1px 1px 2px rgba(0, 0, 0, 0.3)')}; /* Добавляем тень для текста */

  &.head { grid-area: head; }
  &.back { grid-area: back; }
  &.belly { grid-area: belly; }
  &.legs { grid-area: legs; }
`;

const InstructionLabel = styled.div`
  margin-top: 10px;
  font-size: 0.8em;
  color: ${({ theme, isReady }) => (isReady ? '#28a745' : theme === 'dark' ? '#aaa' : '#666')};
  text-align: center;
  transition: color 0.3s ease;
  background: ${({ theme }) => (theme === 'dark' ? 'rgba(50, 50, 50, 0.8)' : 'rgba(245, 245, 245, 0.8)')};
  padding: 5px 10px;
  border-radius: 5px;
  text-shadow: ${({ theme }) => (theme === 'dark' ? '1px 1px 2px rgba(0, 0, 0, 0.5)' : '1px 1px 2px rgba(0, 0, 0, 0.3)')}; /* Добавляем тень для текста */
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

const AutoStrikeButton = styled(ActionButton)`
  background: #28a745; /* Зелёный цвет для отличия от основной кнопки */
  margin-top: 10px;
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

function Fight({ theme, socket, user, npc, onClose, showNotification, updateUser }) {
  const [playerHP, setPlayerHP] = useState(user.stats?.health ?? 0);
  const [npcHP, setNpcHP] = useState(npc.stats?.health || 100);
  const [playerAttackZone, setPlayerAttackZone] = useState(null);
  const [playerDefenseZones, setPlayerDefenseZones] = useState([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isRoundActive, setIsRoundActive] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [battleLogs, setBattleLogs] = useState([]);
  const [highlightNewLog, setHighlightNewLog] = useState(false);

  const zones = useMemo(() => ['head', 'back', 'belly', 'legs'], []);

  const handleClose = useCallback(() => {
    if (socket && user?.userId) {
      socket.emit('endFight', { userId: user.userId });
      console.log('Sent endFight for user:', user.userId);

      socket.emit('getUser', { userId: user.userId }, (response) => {
        if (response.success && response.user) {
          console.log('Received user data on fight close:', response.user);
          setPlayerHP(response.user.stats.health);
          updateUser(response.user);
        } else {
          console.error('Failed to fetch user data on fight close:', response.message);
        }
        onClose();
      });
    } else {
      onClose();
    }
  }, [socket, user, onClose, updateUser]);

  const displayName = !user.isHuman && user.name
    ? user.name
    : `${user?.firstName || 'Игрок'} ${user?.lastName || ''}`.trim();

  const playerInitial = (user.firstName || user.name || 'И').charAt(0).toUpperCase();
  const npcInitial = (npc.name || 'N').charAt(0).toUpperCase();

  const timeProgress = useMemo(() => (timeLeft / 20) * 100, [timeLeft]);

  // Вычисляем процент здоровья для прогресс-баров
  const playerHPPercentage = (playerHP / (user.stats?.maxHealth || 100)) * 100;
  const npcHPPercentage = (npcHP / (npc.stats?.health || 100)) * 100;

  // Параметры NPC по умолчанию, если они отсутствуют
  const npcStats = {
    attack: npc.stats?.attack || 10,
    defense: npc.stats?.defense || 20
  };

  useEffect(() => {
    setPlayerHP(user.stats?.health ?? 0);
  }, [user.stats?.health]);

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
    return playerAttackZone ? 'Атака готова!' : 'Укажите атаку';
  };

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

  const handleRoundEnd = useCallback((attackZone = playerAttackZone, defenseZones = playerDefenseZones) => {
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
      playerAttackZone: attackZone,
      playerDefenseZones: defenseZones,
      npcAttackZone: npcAttack,
      npcDefenseZones: npcDefense,
      playerAttack: user.stats?.attack || 10,
      playerDefense: user.stats?.defense || 20
    }, (response) => {
      if (response.success) {
        setPlayerHP(response.playerHP);
        setNpcHP(response.npcHP);
        let logMessage;
        if (attackZone === null) {
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
          // Формируем сообщение для уведомления
          const changes = [];
          if (response.expGain > 0) changes.push(`+${response.expGain} опыта`);
          if (response.moodChange !== 0) changes.push(`${response.moodChange > 0 ? '+' : ''}${response.moodChange} настроения`);
          if (response.energyChange !== 0) changes.push(`-${response.energyChange} энергии`);
          const notificationMessage = `${finalMessage}${changes.length > 0 ? '\n' + changes.join(', ') : ''}`;
          showNotification(notificationMessage, response.playerHP <= 0 ? 'error' : 'success');
          setBattleLogs((prev) => [
            `${new Date().toLocaleTimeString()}: ${finalMessage}`,
            ...prev
          ]);
          setHighlightNewLog(true);
          // Запрашиваем актуальные данные пользователя перед закрытием
          socket.emit('getUser', { userId: user.userId }, (getUserResponse) => {
            if (getUserResponse.success && getUserResponse.user) {
              console.log('Received user data on fight end:', getUserResponse.user);
              setPlayerHP(getUserResponse.user.stats.health);
              updateUser(getUserResponse.user);
            } else {
              console.error('Failed to fetch user data on fight end:', getUserResponse.message);
            }
            setTimeout(onClose, 1000); // Закрываем бой после получения данных
          });
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
  }, [socket, user, npc, playerAttackZone, playerDefenseZones, zones, showNotification, onClose, updateUser, isProcessing]);

  // Функция для автоматического выбора зон и подтверждения хода
  const handleAutoStrike = useCallback(() => {
    if (!isRoundActive || isProcessing) return;

    // Случайный выбор одной зоны для атаки
    const randomAttackZone = zones[Math.floor(Math.random() * zones.length)];

    // Случайный выбор двух зон для защиты
    const shuffledZones = [...zones].sort(() => Math.random() - 0.5);
    const randomDefenseZones = shuffledZones.slice(0, 2);

    // Обновление состояния для визуальной обратной связи
    setPlayerAttackZone(randomAttackZone);
    setPlayerDefenseZones(randomDefenseZones);

    // Передаём зоны напрямую в handleRoundEnd
    handleRoundEnd(randomAttackZone, randomDefenseZones);
  }, [isRoundActive, isProcessing, zones, handleRoundEnd]);

  useEffect(() => {
    if (battleLogs.length === 0 || !highlightNewLog) return;

    const timer = setTimeout(() => {
      setHighlightNewLog(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [battleLogs, highlightNewLog]);

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

  return (
    <FightContainer theme={theme}>
      <HeaderContainer>
        <TimeProgressBar theme={theme}>
          <TimeProgressFill progress={timeProgress} />
        </TimeProgressBar>
        <CloseButton theme={theme} onClick={handleClose}><FaRunning /></CloseButton>
      </HeaderContainer>
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
          <StatsDisplay theme={theme}>
            <span><FaFistRaised style={{ marginRight: '5px' }} />{user.stats?.attack || 10}</span>
            <span><FaShieldAlt style={{ marginRight: '5px' }} />{user.stats?.defense || 20}</span>
          </StatsDisplay>
          <HPBar>
            <HPFill hpPercentage={playerHPPercentage} />
            <HPText>{Math.round(playerHP)}/{user.stats?.maxHealth || 100}</HPText>
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
          <StatsDisplay theme={theme}>
            <span><FaFistRaised style={{ marginRight: '5px' }} />{npcStats.attack}</span>
            <span><FaShieldAlt style={{ marginRight: '5px' }} />{npcStats.defense}</span>
          </StatsDisplay>
          <HPBar>
            <HPFill hpPercentage={npcHPPercentage} />
            <HPText>{Math.round(npcHP)}/{npc.stats?.health || 100}</HPText>
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
          <InstructionLabel theme={theme} isReady={!!playerAttackZone}>
            {getAttackInstruction()}
          </InstructionLabel>
        </Mannequin>
      </MannequinContainer>
      <ButtonContainer>
        <ActionButton
          onClick={() => handleRoundEnd()}
          disabled={isProcessing || !playerAttackZone || playerDefenseZones.length !== 2}
        >
          {isProcessing ? <ClipLoader color="#fff" size={20} /> : 'Атаковать'}
        </ActionButton>
        <AutoStrikeButton
          onClick={handleAutoStrike}
          disabled={!isRoundActive || isProcessing}
        >
          {isProcessing ? <ClipLoader color="#fff" size={20} /> : 'Автоудар'}
        </AutoStrikeButton>
      </ButtonContainer>
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
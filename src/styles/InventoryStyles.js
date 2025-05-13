import styled, { keyframes } from 'styled-components';

export const ItemEffect = styled.p`
  font-size: 12px;
  margin: 5px 0 0 0;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
`;

export const WeightCostWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
`;

export const ItemContentWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;+  margin-bottom: 10px;
`;

export const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid ${props => props.theme === 'dark' ? '#333' : '#ddd'};
`;

export const ItemDetailsWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

// Анимации
export const fadeOutRight = keyframes`
  0% { opacity: 1; transform: translateX(0); }
  100% { opacity: 0; transform: translateX(100px); }
`;

export const fadeOutLeft = keyframes`
  0% { opacity: 1; transform: translateX(0); }
  100% { opacity: 0; transform: translateX(-100px); }
`;

export const shrinkToPoint = keyframes`
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0); }
`;

export const growFromPoint = keyframes`
  0% { opacity: 0; transform: scale(0); }
  100% { opacity: 1; transform: scale(1); }
`;

export const splitAndFade = keyframes`
  0% { opacity: 1; transform: scale(1) translate(0, 0); }
  20% { opacity: 0.9; transform: scale(1.1); clip-path: polygon(0% 0%, 40% 0%, 30% 100%, 0% 100%); }
  40% { opacity: 0.7; transform: scale(1.3) translate(10px, -15px); clip-path: polygon(40% 0%, 70% 0%, 60% 100%, 30% 100%); }
  60% { opacity: 0.5; transform: scale(1.5) translate(-20px, 20px); clip-path: polygon(70% 0%, 100% 0%, 100% 100%, 60% 100%); }
  80% { opacity: 0.3; transform: scale(1.7) translate(30px, -30px); clip-path: polygon(0% 0%, 100% 0%, 100% 40%, 0% 60%); }
  100% { opacity: 0; transform: scale(2) translate(-40px, 40px); clip-path: polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%); }
`;

export const fillProgress = keyframes`
  0% { width: 0%; }
  100% { width: 100%; }
`;

// Компоненты
export const SubTabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  margin-bottom: 15px;
`;

export const SubTab = styled.button`
  flex: 1;
  padding: 8px;
  background: ${props => props.active ? '#007AFF' : 'transparent'};
  color: ${props => props.active ? 'white' : (props.theme === 'dark' ? '#ccc' : '#333')};
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
  &:hover {
    background: ${props => props.active ? '#005BBB' : (props.theme === 'dark' ? '#333' : '#f0f0f0')};
  }
`;

export const AnimalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 5px;
  width: 100%;
`;

export const AnimalCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
`;

export const StatusCircle = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.isOnline ? 'green' : 'gray'};
  margin-right: 10px;
`;

export const Avatar = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
`;

export const AnimalName = styled.span`
  font-size: 14px;
  color: ${props => props.theme === 'dark' ? '#fff' : '#000'};
  flex-grow: 1;
`;

export const TakeHomeButton = styled.button`
  padding: 5px 10px;
  background: #32CD32;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  &:hover { background: #28A828; }
`;

export const InventoryContainer = styled.div`
  height: 100%;
  background: ${props => props.theme === 'dark' ? '#1A1A1A' : '#f5f5f5'};
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  display: flex;
  flex-direction: column;
  padding: 10;
  box-sizing: border-box;
`;

export const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  margin-bottom: 10px;
`;

export const Tab = styled.button`
  flex: 1;
  padding: 10px;
  background: ${props => props.active ? '#007AFF' : 'transparent'};
  color: ${props => props.active ? 'white' : (props.theme === 'dark' ? '#ccc' : '#333')};
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
  &:hover {
    background: ${props => props.active ? '#005BBB' : (props.theme === 'dark' ? '#333' : '#f0f0f0')};
  }
`;

export const ContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0px;
`;

export const ItemList = styled.div`
  padding: 5px;
  display: grid;
  gap: 15px;
  ${props => props.subTab === 'personal' && `grid-template-columns: 1fr;`}
  ${props => props.subTab === 'location' && `grid-template-columns: repeat(2, 1fr);`}
`;

export const ItemCard = styled.div`
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  animation: ${props => {
    if (props.isAnimating === 'move') return fadeOutRight;
    if (props.isAnimating === 'pickup') return fadeOutLeft;
    if (props.isAnimating === 'shrink') return shrinkToPoint;
    if (props.isAnimating === 'grow') return growFromPoint;
    if (props.isAnimating === 'split') return splitAndFade;
    return 'none';
  }};
  animation-duration: 1s;
  animation-fill-mode: forwards;
  &:hover {
    background: ${props => props.theme === 'dark' ? '#333' : '#f0f0f0'};
  }
`;

export const ItemInfo = styled.div`
  cursor: pointer;
  &:hover {
    background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#f0f0f0'};
  }
`;

export const ItemTitle = styled.h4`
  font-size: 14px;
  margin: 0 0 5px 0;
  color: ${props => props.theme === 'dark' ? '#fff' : '#000'};
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

export const ItemDetail = styled.p`
  font-size: 12px;
  margin: 2px 0;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

export const WeightLimit = styled.div`
  padding: 10px;
  font-size: 12px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 5px;
  margin-top: 5px;
`;

export const ActionButton = styled.button`
  position: relative;
  padding: 5px 10px;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  font-size: 12px;
  transition: background 0.2s;
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    opacity: ${props => (props.disabled ? 0.5 : 0.9)};
  }
`;

export const ProgressBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  animation: ${fillProgress} 1.5s linear forwards;
`;

export const MoveButton = styled(ActionButton)`
  background: #007AFF;
  color: white;
`;

export const DeleteButton = styled(ActionButton)`
  background: #FF0000;
  color: white;
`;

export const PickupButton = styled(ActionButton)`
  background: #32CD32;
  color: white;
`;

export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => (props.isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  &:hover {
    cursor: ${props => props.isConfirm ? 'auto' : 'pointer'};
  }
`;

export const ModalContent = styled.div`
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  text-align: center;
`;

export const ConfirmModalContent = styled(ModalContent)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ConfirmText = styled.p`
  font-size: 16px;
  margin-bottom: 20px;
`;

export const ConfirmButtons = styled.div`
  display: flex;
  gap: 20px;
`;

export const ConfirmButton = styled(ActionButton)`
  width: 80px;
  height: 40px;
  background: ${props => props.type === 'yes' ? '#32CD32' : '#FF0000'};
  color: white;
  font-size: 16px;
  padding: 0;
  &:hover {
    opacity: ${props => props.disabled ? 0.5 : 0.9};
  }
`;

export const ItemCount = styled.span`
  font-size: 12px;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
  margin-left: 5px;
`;

export const QuantityModalContent = styled(ModalContent)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const QuantitySlider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  margin: 10px 0;
`;

export const QuantityText = styled.p`
  font-size: 14px;
  margin: 10px 0;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
`;


// Добавляем стили для новых элементов
export const RenameIcon = styled.div`
  cursor: pointer;
  margin-left: 10px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#007AFF'};
  font-size: 18px;
  display: inline-block;
  vertical-align: middle;
`;

export const RenameModalContent = styled.div`
  background: ${props => props.theme === 'dark' ? '#333' : '#fff'};
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  text-align: center;
`;

export const RenameInput = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ccc'};
  border-radius: 4px;
  font-size: 16px;
  background: ${props => props.theme === 'dark' ? '#222' : '#fff'};
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
`;

export const FreeRoamCheckbox = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  input {
    margin-right: 10px;
  }
  label {
    color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
    font-size: 16px;
  }
`;
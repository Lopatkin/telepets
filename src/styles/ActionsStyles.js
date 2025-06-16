import styled from 'styled-components';

export const ProgressBarContainer = styled.div`
  width: 100%;
  height: 10px;
  background: ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 5px;
  margin-bottom: 20px;
`;

export const Progress = styled.div`
  width: ${props => props.progress}%;
  height: 100%;
  background: #007AFF;
  border-radius: 5px;
  transition: width 0.3s ease;
`;

export const StartButton = styled.button`
  background: ${props => props.disabled ? '#ccc' : '#32CD32'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  width: 100%;
  margin-top: 10px;

  &:hover {
    background: ${props => props.disabled ? '#ccc' : '#28A428'};
  }
`;

export const CheckboxContainer = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  margin-right: 10px;
`;

export const SliderContainer = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

export const SliderLabel = styled.label`
  display: block;
  font-size: 14px;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
  margin-bottom: 5px;
`;

export const Slider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  -webkit-appearance: none;
  height: 8px;
  border-radius: 4px;
  background: ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #007AFF;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #007AFF;
    cursor: pointer;
  }
`;

export const SliderValue = styled.span`
  font-size: 12px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  margin-left: 10px;
`;

export const Select = styled.select`
  width: 100%;
  padding: 8px;
  margin-bottom: 15px;
  border-radius: 4px;
  border: 1px solid ${props => props.theme === 'dark' ? '#555' : '#ddd'};
  background: ${props => props.theme === 'dark' ? '#444' : '#fff'};
  color: ${props => props.theme === 'dark' ? '#fff' : '#000'};
  font-size: 14px;
`;

export const MaterialsText = styled.p`
  font-size: 14px;
  margin: 0 0 20px 0;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
`;

export const ActionsContainer = styled.div`
  height: 100%;
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  display: flex;
  flex-direction: column;
  padding: 0;
  box-sizing: border-box;
`;

export const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 600px;
  margin: 0 auto;
`;

export const ContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

export const ActionCard = styled.div`
  background: ${props => props.theme === 'dark' ? '#444' : '#f9f9f9'};
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: transform 0.2s;
  position: relative;
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    transform: ${props => (props.disabled ? 'none' : 'translateY(-5px)')};
  }
`;

export const ActionTitle = styled.h4`
  font-size: 16px;
  margin: 0 0 10px 0;
  color: ${props => props.theme === 'dark' ? '#fff' : '#000'};
`;

export const ActionDescription = styled.p`
  font-size: 12px;
  margin: 0;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: ${props => props.theme === 'dark' ? '#2A2A2A' : '#fff'};
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  position: relative;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
`;

export const ModalTitle = styled.h3`
  font-size: 18px;
  margin: 0 0 10px 0;
  color: ${props => props.theme === 'dark' ? '#fff' : '#000'};
`;

export const ModalDescription = styled.p`
  font-size: 14px;
  margin: 0 0 20px 0;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#333'};
  cursor: pointer;
`;

export const ActionButton = styled.button`
  background: ${props => props.disabled ? '#ccc' : '#007AFF'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.disabled ? '#ccc' : '#0056b3'};
  }
`;

export const ProgressBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  width: ${props => props.progress}%;
  transition: width 1s linear;
  z-index: 1;
`;

export const Notification = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ type }) =>
    type === 'success' ? '#32CD32' : // Зелёный фон для успешных уведомлений
      type === 'error' ? '#DC3545' :   // Красный фон для ошибок
        '#32CD32'};                      // Fallback на зелёный, если тип не указан
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2); // Добавляем тень для лучшей видимости
  z-index: 1001;
  opacity: ${({ show }) => (show ? 1 : 0)}; // Исправлено: props.show -> show
  transition: opacity 0.5s;
  pointer-events: none; // Убираем взаимодействие с уведомлением
`;

export const TimerDisplay = styled.div`
  font-size: 12px;
  color: ${props => props.theme === 'dark' ? '#bbb' : '#666'};
  margin-top: 10px;
  text-align: center;
  white-space: nowrap;
  z-index: 2;
`;
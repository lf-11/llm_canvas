import styled from 'styled-components';

export const CanvasContainer = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: auto;
  position: relative;
`;

export const CanvasContent = styled.div`
  width: 3000px;  // Larger than viewport
  height: 2000px; // Larger than viewport
  background-color: #2c2c2c;
  position: relative;
  background-image: radial-gradient(circle, #3c3c3c 1px, transparent 1px);
  background-size: 20px 20px;
  transform-origin: 0 0;
  transform: scale(${props => props.zoom});
`;

export const AddButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #646cff;
  color: white;
  font-size: 24px;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  z-index: 1000;

  &:hover {
    background-color: #535bf2;
  }
`;

export const ServerSwitchContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #2c2c2c;
  padding: 5px;
  border-radius: 25px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  z-index: 1000;
`;

export const SwitchLabel = styled.span`
  color: ${props => props.active ? '#fff' : '#666'};
  font-size: 12px;
  user-select: none;
  transition: color 0.3s ease;
`;

export const ServerSwitch = styled.button`
  width: 50px;
  height: 24px;
  border-radius: 12px;
  background-color: #1a1a1a;
  position: relative;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0 4px;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: ${props => props.isRemote ? '#4CAF50' : '#646cff'};
    transform: translateX(${props => props.isRemote ? '26px' : '0'});
    transition: transform 0.3s ease, background-color 0.3s ease;
  }

  &:hover::after {
    background-color: ${props => props.isRemote ? '#45a049' : '#535bf2'};
  }
`;

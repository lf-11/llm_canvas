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

import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import {
  FloatingContainer,
  WindowHeader,
  WindowTitle,
  CloseButton,
  WindowContent,
  Table,
  Th,
  Td,
  Tr
} from './FloatingWindow.styles';

const FloatingBatchResults = ({ results, onClose }) => {
  const nodeRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Calculate center position when component mounts
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const elementWidth = 0.7 * windowWidth;  // 70vw from styles
    const elementHeight = 0.7 * windowHeight; // 70vh from styles
    
    // Get scroll position of the canvas container
    const canvasContainer = document.querySelector('.canvas-container');
    const scrollLeft = canvasContainer ? canvasContainer.scrollLeft : 0;
    const scrollTop = canvasContainer ? canvasContainer.scrollTop : 0;

    setPosition({
      x: scrollLeft + (windowWidth - elementWidth) / 2,
      y: scrollTop + (windowHeight - elementHeight) / 2,
    });
  }, []);

  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  return (
    <Draggable
      handle=".window-header"
      position={position}
      onDrag={handleDrag}
      nodeRef={nodeRef}
    >
      <FloatingContainer ref={nodeRef}>
        <WindowHeader className="window-header">
          <WindowTitle>Batch Results</WindowTitle>
          <CloseButton onClick={onClose}>✖</CloseButton>
        </WindowHeader>
        <WindowContent>
          <Table>
            <thead>
              <tr>
                <Th>#</Th>
                <Th>Output</Th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <Tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td>{result}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </WindowContent>
      </FloatingContainer>
    </Draggable>
  );
};

export default FloatingBatchResults;
import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import {
  FloatingContainer,
  WindowHeader,
  WindowTitle,
  CloseButton,
  WindowContent,
  Table,
  Th,
  Td
} from './FloatingWindow.styles';

const FloatingBatchResults = ({ results, onClose, initialPosition = { x: 100, y: 100 } }) => {
  const [position, setPosition] = useState(initialPosition);
  const nodeRef = useRef(null);

  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  return (
    <Draggable
      handle=".window-header"
      defaultPosition={position}
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
                <tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td>{result}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </WindowContent>
      </FloatingContainer>
    </Draggable>
  );
};

export default FloatingBatchResults;
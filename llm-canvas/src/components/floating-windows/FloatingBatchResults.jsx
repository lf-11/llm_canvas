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
} from './FloatingWindow.styles.jsx';

const FloatingBatchResults = ({ results, onClose }) => {
  const nodeRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isRowLayout = results.length > 5;

  useEffect(() => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const elementWidth = isRowLayout ? 0.7 * windowWidth : 0.9 * windowWidth;
    const elementHeight = isRowLayout ? 0.7 * windowHeight : 0.5 * windowHeight;

    // Center in viewport, accounting for element size
    setPosition({
      x: (windowWidth - elementWidth) / 2,
      y: (windowHeight - elementHeight) / 2
    });
  }, [results.length, isRowLayout]);

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
      <FloatingContainer ref={nodeRef} style={{
        width: isRowLayout ? '70vw' : '90vw',
        height: isRowLayout ? '70vh' : '50vh'
      }}>
        <WindowHeader className="window-header">
          <WindowTitle>Batch Results</WindowTitle>
          <CloseButton onClick={onClose}>✖</CloseButton>
        </WindowHeader>
        <WindowContent>
          <Table>
            <thead>
              <tr>
                {isRowLayout ? (
                  <>
                    <Th>#</Th>
                    <Th>Output</Th>
                  </>
                ) : (
                  results.map((_, index) => (
                    <Th key={index} style={{ width: `${100/results.length}%` }}>
                      #{index + 1}
                    </Th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {isRowLayout ? (
                results.map((result, index) => (
                  <Tr key={index}>
                    <Td isRowLayout>{index + 1}</Td>
                    <Td isRowLayout>{result}</Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  {results.map((result, index) => (
                    <Td 
                      key={index} 
                      style={{ width: `${100/results.length}%` }}
                    >
                      {result}
                    </Td>
                  ))}
                </Tr>
              )}
            </tbody>
          </Table>
        </WindowContent>
      </FloatingContainer>
    </Draggable>
  );
};

export default FloatingBatchResults;
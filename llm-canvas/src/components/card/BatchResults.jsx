import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 20px;
  padding: 5px;

  &:hover {
    color: white;
  }
`;

const ModalContainer = styled.div`
  position: relative;
  background: #1a2b3c;
  border-radius: 8px;
  padding: 20px;
  width: 80vw;
  max-height: 80vh;
  overflow-y: auto;
  color: white;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const BatchResults = ({ results, onClose }) => {
  const [responses, setResponses] = useState(Array(results.length).fill(''));

  useEffect(() => {
    setResponses(results);
  }, [results]);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>✖</CloseButton>
        <h2>Batch Results</h2>
        <Table>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Output</Th>
            </tr>
          </thead>
          <tbody>
            {responses.map((response, index) => (
              <tr key={index}>
                <Td>{index + 1}</Td>
                <Td>{response}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default BatchResults;
import styled from 'styled-components';

export const FloatingContainer = styled.div`
  position: fixed;
  background: #2d3748;
  border: 1px solid #000;
  color: white;
  min-width: 300px;
  width: 70vw;
  height: 70vh;
  max-width: 90vw;
  max-height: 90vh;
  z-index: 1000;
  resize: both;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

export const WindowHeader = styled.div`
  padding: 12px 15px;
  background: #1a202c;
  border-bottom: 1px solid #000;
  cursor: move;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  flex-shrink: 0;
`;

export const WindowTitle = styled.h2`
  margin: 0;
  font-size: 1.1em;
  color: #e2e8f0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 20px;
  padding: 5px;
  transition: color 0.2s ease;

  &:hover {
    color: #fc8181;
  }
`;

export const WindowContent = styled.div`
  padding: 20px;
  overflow: auto;
  background: #2d3748;
  flex-grow: 1;
  height: calc(100% - 45px);
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background: #2d3748;
`;

export const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  background: #1a202c;
  border-bottom: 1px solid #000;
  color: #e2e8f0;
  font-weight: 600;
`;

export const Td = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  white-space: pre-wrap;
  background: #2d3748;

  &:first-child {
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    width: 50px;
    text-align: center;
    color: #a0aec0;
  }
`;

export const Tr = styled.tr`
  &:hover td {
    background: #3a4659;
  }
`; 
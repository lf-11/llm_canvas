// components/card/Card.styles.js
import styled from 'styled-components';

export const CardContainer = styled.div`
  width: fit-content;
  min-width: 320px;
  background-color: #1a2b3c;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  color: white;
  position: absolute;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.4);
  }
`;

export const SectionsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  padding: 0 15px;
  gap: 15px;
`;

export const SectionContainer = styled.div`
  padding: ${props => props.isExpanded ? '15px 0' : '8px 0'};
  min-width: ${props => props.isExpanded ? '290px' : '40px'};
  transition: all 0.3s ease;
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: ${props => props.isExpanded ? '10px' : '0'};
  padding: 0 8px;
`;

export const ToggleButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  width: 15px;
  height: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 0;
  font-size: 7px;
  min-width: 15px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

export const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

export const Divider = styled.div`
  width: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  align-self: stretch;
`;

export const TextArea = styled.textarea`
  width: 290px;
  min-height: ${props => props.isOutput ? '60px' : '100px'};
  background-color: ${props => props.isOutput ? '#1e2936' : '#2c3e50'};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
  padding: 8px;
  resize: both;
  min-width: 100px;
  max-width: 770px;
  ${props => props.isOutput && `
    cursor: default;
    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
  `}

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

export const ParametersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
`;

export const ParametersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 8px;
`;

export const ParametersContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
`;

export const StyledSelect = styled.select`
  background-color: #2c3e50;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  width: 100%;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

export const SelectContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: ${props => props.noMargin ? '0' : '10px'};
  flex-wrap: wrap;
  
  ${StyledSelect} {
    flex: 1;
    min-width: 90px;
  }
`;


export const SliderContainer = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 40px;
  align-items: center;
  gap: 8px;
  font-size: 12px;
`;

export const StyledSlider = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: #2c3e50;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
  }
`;

export const InputField = styled.input`
  background-color: #2c3e50;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  width: 60px;
  font-size: 12px;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

export const SliderValue = styled.span`
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  text-align: right;
`;

export const Label = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
`;

export const ParameterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const ParameterLabel = styled.label`
  min-width: 100px;
  color: rgba(255, 255, 255, 0.8);
`;

export const ParameterInput = styled.input`
  background-color: #2c3e50;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  width: 100px;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

export const CardHeader = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

export const CardTitle = styled.input`
  background: none;
  border: 1px solid transparent;
  color: white;
  font-size: 1.17em;
  font-weight: bold;
  padding: 4px;
  margin: 0;
  width: fit-content;
  cursor: ${props => props.isEditing ? 'text' : 'default'};
  pointer-events: ${props => props.isEditing ? 'auto' : 'none'};

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
`;

export const AddSectionButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 4px;
  padding: 2px 6px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

export const GlobalToggleButton = styled(ToggleButton)`
  margin-right: 10px;
`;

export const EditButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  margin-left: 8px;

  &:hover {
    color: white;
  }
`;

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row-reverse;  // This will put the edit button on the left
  justify-content: flex-end;    // This ensures the title stays at the start
  gap: 8px;   
`;

export const CardWrapper = styled.div`
  position: absolute;
  left: ${props => props.position?.x || 0}px;
  top: ${props => props.position?.y || 0}px;
`;

export const HorizontalDivider = styled.div`
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
  width: 100%;
`;

export const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;

  &:hover {
    color: red;
  }
`;

export const RunButton = styled.button`
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid rgba(0, 255, 0, 0.2);
  color: rgba(0, 255, 0, 0.8);
  cursor: pointer;
  width: 15px;
  height: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 0;
  font-size: 10px;
  min-width: 15px;

  &:hover {
    background-color: rgba(0, 255, 0, 0.2);
    border-color: rgba(0, 255, 0, 0.3);
  }

  &:disabled {
    background-color: rgba(128, 128, 128, 0.1);
    border-color: rgba(128, 128, 128, 0.2);
    color: rgba(128, 128, 128, 0.5);
    cursor: not-allowed;
  }
`;

export const BatchButton = styled(RunButton)`
  background-color: #4a90e2;
  
  &:hover:not(:disabled) {
    background-color: #357abd;
  }
`;

export const BatchInput = styled.input`
  width: 50px;
  height: 24px;
  padding: 0 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

export const ViewResultsButton = styled(RunButton)`
  background-color: #6c757d;
  
  &:hover:not(:disabled) {
    background-color: #5a6268;
  }
`;

export const ModalOverlay = styled.div`
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

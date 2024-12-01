import React from 'react';
import { 
  ParametersContainer, 
  ParameterRow,
  ParameterLabel,
  ParameterInput 
} from './Card.styles';

const CardParameters = ({ parameters, onParameterChange }) => {
  return (
    <ParametersContainer>
      {Object.entries(parameters).map(([key, value]) => (
        <ParameterRow key={key}>
          <ParameterLabel>{key}</ParameterLabel>
          <ParameterInput
            value={value}
            onChange={(e) => onParameterChange(key, e.target.value)}
          />
        </ParameterRow>
      ))}
    </ParametersContainer>
  );
};
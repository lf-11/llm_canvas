import React, { useState } from 'react';
import {
  ParametersContainer,
  SelectContainer,
  StyledSelect,
  SliderContainer,
  InputField,
  Label,
  ParametersHeader,
  ToggleButton,
  ParametersContent,
  HorizontalDivider
} from './Card.styles';

const SectionParameters = ({ parameters, onParameterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const models = ['Mistral-Small-Instruct-2409-Q6_K_L.gguf'];
  const systemPrompts = ['Default', 'Creative', 'Technical', 'Professional'];
  const parameterConfigs = ['Default', 'Creative', 'Precise', 'Diverse'];

  // Add predefined parameter configurations
  const configs = {
    Default: {
      temperature: 1.0,
      topK: 50,
      topP: 0.7,
      minP: 0.1,
      repetitionPenalty: 1.1,
      frequencyPenalty: 0
    },
    Creative: {
      temperature: 1.5,
      topK: 80,
      topP: 0.9,
      minP: 0.05,
      repetitionPenalty: 1.0,
      frequencyPenalty: -0.2
    },
    // ... add other configurations
  };

  const handleConfigChange = (configName) => {
    const newConfig = configs[configName];
    Object.entries(newConfig).forEach(([key, value]) => {
      onParameterChange(key, value);
    });
  };

  const handleInputMouseDown = (e) => {
    e.stopPropagation();
  };

  return (
    <ParametersContainer onMouseDown={handleInputMouseDown}>
      {/* Model and System Prompt always visible */}
      <SelectContainer noMargin>
        <StyledSelect
          value={parameters.model}
          onChange={(e) => onParameterChange('model', e.target.value)}
          onMouseDown={handleInputMouseDown}
        >
          {models.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </StyledSelect>
        <StyledSelect
          value={parameters.systemPrompt}
          onChange={(e) => onParameterChange('systemPrompt', e.target.value)}
          onMouseDown={handleInputMouseDown}
        >
          {systemPrompts.map(prompt => (
            <option key={prompt} value={prompt}>{prompt}</option>
          ))}
        </StyledSelect>
      </SelectContainer>

      <HorizontalDivider />

      {/* Collapsible parameters section */}
      <SelectContainer noMargin>
        <StyledSelect
          onChange={(e) => handleConfigChange(e.target.value)}
          onMouseDown={handleInputMouseDown}
        >
          <option value="">Select Configuration</option>
          {parameterConfigs.map(config => (
            <option key={config} value={config}>{config}</option>
          ))}
        </StyledSelect>
      </SelectContainer>
      <ToggleButton 
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ alignSelf: 'flex-start', marginTop: '8px' }}
      >
        {isExpanded ? '−' : '+'}
      </ToggleButton>

      {isExpanded && (
        <ParametersContent>
          <SliderContainer>
            <Label>Temperature</Label>
            <InputField
              type="number"
              value={parameters.temperature}
              onChange={(e) => onParameterChange('temperature', parseFloat(e.target.value))}
              onMouseDown={handleInputMouseDown}
              step="0.1"
              min="0"
              max="2"
            />
          </SliderContainer>

          <SliderContainer>
            <Label>Top-k</Label>
            <InputField
              type="number"
              value={parameters.topK}
              onChange={(e) => onParameterChange('topK', parseFloat(e.target.value))}
              onMouseDown={handleInputMouseDown}
              step="1"
              min="0"
              max="100"
            />
          </SliderContainer>

          <SliderContainer>
            <Label>Top-p</Label>
            <InputField
              type="number"
              value={parameters.topP}
              onChange={(e) => onParameterChange('topP', parseFloat(e.target.value))}
              onMouseDown={handleInputMouseDown}
              step="0.05"
              min="0"
              max="1"
            />
          </SliderContainer>

          <SliderContainer>
            <Label>Min-p</Label>
            <InputField
              type="number"
              value={parameters.minP}
              onChange={(e) => onParameterChange('minP', parseFloat(e.target.value))}
              onMouseDown={handleInputMouseDown}
              step="0.05"
              min="0"
              max="1"
            />
          </SliderContainer>

          <SliderContainer>
            <Label>Rep. Penalty</Label>
            <InputField
              type="number"
              value={parameters.repetitionPenalty}
              onChange={(e) => onParameterChange('repetitionPenalty', parseFloat(e.target.value))}
              onMouseDown={handleInputMouseDown}
              step="0.1"
              min="1"
              max="2"
            />
          </SliderContainer>

          <SliderContainer>
            <Label>Freq. Penalty</Label>
            <InputField
              type="number"
              value={parameters.frequencyPenalty}
              onChange={(e) => onParameterChange('frequencyPenalty', parseFloat(e.target.value))}
              onMouseDown={handleInputMouseDown}
              step="0.1"
              min="-2"
              max="2"
            />
          </SliderContainer>
        </ParametersContent>
      )}
    </ParametersContainer>
  );
};

export default SectionParameters; 
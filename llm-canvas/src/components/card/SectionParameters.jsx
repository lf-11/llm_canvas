import React, { useState, useEffect } from 'react';
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
  const [systemPrompts, setSystemPrompts] = useState([]);
  const models = ['Mistral-Small-Instruct-2409-Q6_K_L.gguf'];
  const parameterConfigs = ['Default', 'Creative', 'Precise', 'Diverse'];

  useEffect(() => {
    fetchSystemPrompts();
  }, []);

  const fetchSystemPrompts = async () => {
    try {
      const response = await fetch('http://localhost:3000/system-prompts');
      const data = await response.json();
      setSystemPrompts(data);
    } catch (error) {
      console.error('Error fetching system prompts:', error);
    }
  };

  // Simplified configs with only temperature
  const configs = {
    Default: {
      temperature: 1.0
    },
    Creative: {
      temperature: 1.5
    },
    Precise: {
      temperature: 0.5
    },
    Diverse: {
      temperature: 1.2
    },
    Deterministic: {
      temperature: 0.0
    }
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

  const updatePromptUsage = async (promptId) => {
    try {
      await fetch('http://localhost:3000/system-prompts/increment-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId })
      });
    } catch (error) {
      console.error('Error updating prompt usage:', error);
    }
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
          value={(() => {
            if (parameters.systemPromptId) {
              return parameters.systemPromptId;
            }
            if (parameters.systemPrompt) {
              const matchingPrompt = systemPrompts.find(p => p.prompt_text === parameters.systemPrompt);
              return matchingPrompt ? matchingPrompt.id : '';
            }
            return '';
          })()}
          onChange={(e) => {
            const selectedValue = e.target.value;
            const selectedPrompt = systemPrompts.find(p => p.id === parseInt(selectedValue));
            if (selectedPrompt) {
              onParameterChange('systemPromptId', parseInt(selectedValue));
              onParameterChange('systemPrompt', selectedPrompt.prompt_text);
              updatePromptUsage(selectedPrompt.id);
            }
          }}
          onMouseDown={handleInputMouseDown}
        >
          <option value="">Select a System Prompt</option>
          {systemPrompts.map(prompt => (
            <option key={prompt.id} value={prompt.id}>
              {prompt.name}
            </option>
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
            <Label>Top-k (TBD)</Label>
            <InputField disabled value="TBD" />
          </SliderContainer>

          <SliderContainer>
            <Label>Top-p (TBD)</Label>
            <InputField disabled value="TBD" />
          </SliderContainer>

          <SliderContainer>
            <Label>Min-p (TBD)</Label>
            <InputField disabled value="TBD" />
          </SliderContainer>

          <SliderContainer>
            <Label>Rep. Penalty (TBD)</Label>
            <InputField disabled value="TBD" />
          </SliderContainer>

          <SliderContainer>
            <Label>Freq. Penalty (TBD)</Label>
            <InputField disabled value="TBD" />
          </SliderContainer>
        </ParametersContent>
      )}
    </ParametersContainer>
  );
};

export default SectionParameters; 

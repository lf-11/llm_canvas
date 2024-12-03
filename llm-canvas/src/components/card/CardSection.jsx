// components/card/CardSection.jsx
import React, { useState, useEffect } from 'react';
import { 
  SectionContainer, 
  SectionContent, 
  TextArea, 
  Divider,
  SectionHeader,
  ToggleButton,
  RunButton,
  BatchButton,
  BatchInput,
} from './Card.styles';
import SectionParameters from './SectionParameters';

const defaultParameters = {
  model: 'Mistral-Small-Instruct-2409-Q6_K_L.gguf',
  systemPrompt: 'Default',
  temperature: 1.0,
  topK: 50,
  topP: 0.7,
  minP: 0.1,
  repetitionPenalty: 1.1,
  frequencyPenalty: 0,
  maxTokens: 2000
};

const CardSection = ({ section, isLast, onInputChange, onShowBatchResults }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchCount, setBatchCount] = useState(5);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    const handleToggleAll = (e) => {
      setIsExpanded(e.detail.expanded);
    };

    document.addEventListener('toggleAllSections', handleToggleAll);
    return () => {
      document.removeEventListener('toggleAllSections', handleToggleAll);
    };
  }, []);

  useEffect(() => {
    if (!section.parameters) {
      onInputChange(section.id, 'parameters', defaultParameters);
    }
  }, [section.id, onInputChange]);

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'TEXTAREA') {
      e.stopPropagation();
    }
  };

  const handleParameterChange = (name, value) => {
    const updatedParameters = {
      ...(section.parameters || defaultParameters),
      [name]: value
    };
    onInputChange(section.id, 'parameters', updatedParameters);
  };

  const generateResponse = async () => {
    try {
      const { model, systemPrompt, ...parameters } = section.parameters || defaultParameters;
      
      // Clear existing output
      onInputChange(section.id, 'output', '');

      const requestBody = {
        messages: [
          { role: "system", content: systemPrompt || '' },
          { role: "user", content: section.input }
        ],
        temperature: parameters.temperature,
        topK: parameters.topK,
        topP: parameters.topP,
        maxTokens: parameters.maxTokens || 2000
      };

      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.text) {
                accumulatedText += data.text;
                onInputChange(section.id, 'output', accumulatedText);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Detailed error:', error);
      onInputChange(section.id, 'output', `Error: ${error.message}`);
    }
  };

  const handleRunClick = async (e) => {
    e.stopPropagation();
    if (!section.input.trim()) return;
    
    setIsGenerating(true);
    try {
      await generateResponse();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBatchProcess = async (e) => {
    e.stopPropagation();
    if (!section.input.trim()) return;
    
    setIsBatchProcessing(true);
    setResponses(Array(batchCount).fill(''));

    try {
      const { model, systemPrompt, ...parameters } = section.parameters || defaultParameters;
      
      const requestBody = {
        messages: [
          { role: "system", content: systemPrompt || '' },
          { role: "user", content: section.input }
        ],
        batchCount,
        ...parameters
      };

      const response = await fetch('http://localhost:3000/chat/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let currentResponses = Array(batchCount).fill('');
      const processedChunks = new Set(); // Track processed chunks

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const data = JSON.parse(line.slice(5));
              const chunkId = `${data.index}-${data.text}`; // Create unique identifier for chunk
              
              if (data.index !== undefined && data.text && !processedChunks.has(chunkId)) {
                processedChunks.add(chunkId);
                currentResponses[data.index] = (currentResponses[data.index] || '') + data.text;
                setResponses([...currentResponses]);
                // Pass results up to parent
                onShowBatchResults([...currentResponses]);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Batch processing error:', error);
    } finally {
      setIsBatchProcessing(false);
    }
  };

  return (
    <>
      <SectionContainer isExpanded={isExpanded}>
        <SectionHeader isExpanded={isExpanded}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ToggleButton 
              onClick={() => setIsExpanded(!isExpanded)}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {isExpanded ? '−' : '+'}
            </ToggleButton>
            <RunButton
              onClick={handleRunClick}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={isGenerating || !section.input.trim()}
              title="Generate response"
            >
              ▶
            </RunButton>
            <BatchButton
              onClick={handleBatchProcess}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={isBatchProcessing || !section.input.trim()}
              title="Run batch processing"
            >
              B
            </BatchButton>
            <BatchInput
              type="number"
              min="1"
              max="40"
              value={batchCount}
              onChange={(e) => {
                const input = e.target.value;
                if (input === '') {
                  setBatchCount('');
                } else {
                  const value = Math.min(40, Math.max(1, parseInt(input) || 1));
                  setBatchCount(value);
                }
              }}
              onBlur={(e) => {
                if (batchCount === '') {
                  setBatchCount(1);
                }
              }}
              disabled={isBatchProcessing}
            />
          </div>
        </SectionHeader>
        {isExpanded && (
          <SectionContent>
            <SectionParameters 
              parameters={section.parameters || defaultParameters}
              onParameterChange={handleParameterChange}
            />
            <TextArea
              value={section.input}
              onChange={(e) => onInputChange(section.id, 'input', e.target.value)}
              placeholder="Enter your prompt..."
              onMouseDown={handleMouseDown}
              onMouseUp={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
            <TextArea
              value={section.output || ''}
              readOnly
              isOutput
              placeholder="Output will appear here..."
              onMouseDown={handleMouseDown}
              onMouseUp={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
          </SectionContent>
        )}
      </SectionContainer>
      {!isLast && <Divider />}
    </>
  );
};

export default CardSection;
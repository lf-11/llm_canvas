import React, { useState, useEffect } from 'react';
import Card from '../card/Card';
import FloatingBatchResults from '../floating-windows/FloatingBatchResults';
import { 
  CanvasContainer, 
  CanvasContent, 
  AddButton, 
  ServerSwitch,
  ServerSwitchContainer,
  SwitchLabel 
} from './Canvas.styles';

const Canvas = ({ onShowBatchResults }) => {
  const [zoom, setZoom] = useState(1);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isRemoteServer, setIsRemoteServer] = useState(false);
  const [cards, setCards] = useState([
    {
      id: 1,
      sections: [
        {
          id: 1,
          input: '',
          parameters: {
            temperature: 0.7,
            maxTokens: 100,
          },
          output: ''
        }
      ]
    }
  ]);

  const toggleServer = async () => {
    try {
      const response = await fetch('http://localhost:3000/switch-server', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          server: isRemoteServer ? 'local' : 'remote'
        }),
      });

      if (response.ok) {
        setIsRemoteServer(!isRemoteServer);
      } else {
        console.error('Failed to switch server');
      }
    } catch (error) {
      console.error('Error switching server:', error);
    }
  };

  // Check current server on component mount
  useEffect(() => {
    const checkCurrentServer = async () => {
      try {
        const response = await fetch('http://localhost:3000/current-server');
        const data = await response.json();
        setIsRemoteServer(data.currentServer === 'remote');
      } catch (error) {
        console.error('Error checking current server:', error);
      }
    };

    checkCurrentServer();
  }, []);

  const handleAddSection = (cardId) => {
    setCards(cards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          sections: [...card.sections, {
            id: Date.now(),
            input: '',
            parameters: { ...card.sections[0].parameters },
            output: ''
          }]
        };
      }
      return card;
    }));
  };

  const handleInputChange = (cardId, sectionId, field, value) => {
    setCards(prevCards => prevCards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          sections: card.sections.map(section => 
            section.id === sectionId 
              ? { ...section, [field]: value }
              : section
          )
        };
      }
      return card;
    }));
  };

  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prevZoom => Math.min(Math.max(0.1, prevZoom * delta), 5));
    }
  };

  const handleMouseMove = (e) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left + container.scrollLeft) / zoom;
    const y = (e.clientY - rect.top + container.scrollTop) / zoom;
    setCursorPosition({ x, y });
  };

  const handleAddCard = () => {
    const container = document.querySelector('.canvas-container');
    
    // Get the container's viewport dimensions
    const viewportWidth = container.clientWidth;
    const viewportHeight = container.clientHeight;
    
    // Get the scroll position
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;
    
    // Approximate card dimensions (you may want to make these constants)
    const cardWidth = 400;  // Adjust based on your card's width
    const cardHeight = 300; // Adjust based on your card's height
    
    // Calculate the center position, accounting for zoom and card dimensions
    const centerX = (scrollLeft + viewportWidth / 2) / zoom - cardWidth / 2;
    const centerY = (scrollTop + viewportHeight / 2) / zoom - cardHeight / 2;

    const newCard = {
      id: Date.now(),
      position: { x: centerX, y: centerY },
      sections: [
        {
          id: Date.now(),
          input: '',
          parameters: {
            temperature: 0.7,
            maxTokens: 100,
          },
          output: ''
        }
      ]
    };
    setCards([...cards, newCard]);
  };

  const handleDeleteCard = (cardId) => {
    setCards(cards.filter(card => card.id !== cardId));
  };

  const handleShowBatchResults = (results) => {
    console.log('Showing batch results:', results); // Debug log
    onShowBatchResults(results);
  };

  useEffect(() => {
    const container = document.querySelector('.canvas-container');
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <>
      <CanvasContainer 
        className="canvas-container"
        onMouseMove={handleMouseMove}
      >
        <CanvasContent zoom={zoom}>
          {cards.map(card => (
            <Card 
              key={card.id}
              id={card.id}
              sections={card.sections}
              position={card.position}
              onAddSection={handleAddSection}
              onInputChange={(sectionId, field, value) => 
                handleInputChange(card.id, sectionId, field, value)
              }
              onDelete={handleDeleteCard}
              onShowBatchResults={handleShowBatchResults}
            />
          ))}
        </CanvasContent>
      </CanvasContainer>
      <ServerSwitchContainer>
        <SwitchLabel active={!isRemoteServer}>Local</SwitchLabel>
        <ServerSwitch 
          onClick={toggleServer} 
          isRemote={isRemoteServer}
          aria-label="Toggle between local and remote server"
        />
        <SwitchLabel active={isRemoteServer}>Remote</SwitchLabel>
      </ServerSwitchContainer>
      <AddButton onClick={handleAddCard}>+</AddButton>
    </>
  );
};

export default Canvas;
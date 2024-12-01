import React, { useState } from 'react';
import Canvas from './components/canvas/Canvas';
import { GlobalStyle } from './styles/GlobalStyle';
import FloatingBatchResults from './components/floating-windows/FloatingBatchResults';

function App() {
  const [floatingWindows, setFloatingWindows] = useState([]);

  const addBatchResults = (results) => {
    setFloatingWindows(prev => [...prev, {
      id: Date.now(),
      type: 'batchResults',
      results,
      position: { x: 100, y: 100 }
    }]);
  };

  const closeWindow = (id) => {
    setFloatingWindows(prev => prev.filter(window => window.id !== id));
  };

  return (
    <>
      <GlobalStyle />
      <Canvas onShowBatchResults={addBatchResults} />
      {floatingWindows.map(window => {
        if (window.type === 'batchResults') {
          return (
            <FloatingBatchResults
              key={window.id}
              results={window.results}
              onClose={() => closeWindow(window.id)}
              initialPosition={window.position}
            />
          );
        }
        return null;
      })}
    </>
  );
}

export default App;

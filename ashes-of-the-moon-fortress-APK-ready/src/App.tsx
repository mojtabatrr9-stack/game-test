import { useEffect, useRef, useState } from 'react';
import { startGame } from './game';
import { createProjectZip } from './game/utils/ZipExporter';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);
  const [downloading, setDownloading] = useState(false);
  const [showDownloadBtn, setShowDownloadBtn] = useState(true);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      gameRef.current = startGame(containerRef.current);
    }
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await createProjectZip();
    } catch (error) {
      console.error('Error creating zip:', error);
      alert('Error creating ZIP file. Please try again.');
    }
    setDownloading(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {showDownloadBtn && (
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '10px 20px',
            backgroundColor: downloading ? '#666' : '#8b5cf6',
            color: 'white',
            border: '2px solid #fbbf24',
            borderRadius: '8px',
            cursor: downloading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            fontFamily: 'monospace',
          }}
        >
          {downloading ? '⏳ Creating ZIP...' : '📦 Download Full Project (ZIP)'}
        </button>
      )}
    </div>
  );
}

export default App;

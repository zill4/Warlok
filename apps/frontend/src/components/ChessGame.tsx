import { useEffect, useRef, useState } from 'preact/hooks';
import type { ComponentProps } from 'preact';
import './ChessGame.css';

interface HistoryEntry {
    type: 'piece' | 'card';
    from: string;
    to: string;
    pieceType?: string;
    color: 'white' | 'black';
    captured?: string;
    timestamp: number;
}

interface ChessGameProps extends ComponentProps<'div'> {
  containerId?: string;
}

export default function ChessGame({ containerId = 'game-container', ...props }: ChessGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTurn, setCurrentTurn] = useState<string>("White's turn");
  const [turnNumber, setTurnNumber] = useState<number>(1);
  const [botThinking, setBotThinking] = useState<boolean>(false);
  const [thinkingTime, setThinkingTime] = useState<number>(3);
  const [moveHistory, setMoveHistory] = useState<HistoryEntry[]>([]);
  const [showFullHistory, setShowFullHistory] = useState<boolean>(false);

  const formatMove = (entry: HistoryEntry): string => {
    const pieceStr = entry.pieceType ? entry.pieceType.charAt(0).toUpperCase() + entry.pieceType.slice(1) : '';
    const colorStr = entry.color.charAt(0).toUpperCase() + entry.color.slice(1);
    
    if (entry.type === 'card') {
      return `${colorStr} placed ${pieceStr} at ${entry.to}`;
    } else if (entry.from === 'CAPTURED' && entry.to === 'CAPTURED') {
      return `${colorStr} ${pieceStr} was captured`;
    } else if (typeof entry.from === 'string' && typeof entry.to === 'string') {
      return `${colorStr} ${pieceStr} moved ${entry.from} → ${entry.to}`;
    }
  };

  useEffect(() => {
    // We'll dynamically import the game to avoid SSR issues
    import('../game/app').then(({ ChessGame }) => {
      if (containerRef.current) {
        const game = new ChessGame(containerId);
        
        // Subscribe to turn changes
        (window as any).onTurnChange = (player: string, turn: number, history: HistoryEntry[]) => {
          console.log('Turn change:', { player, turn, history }); // Debug log
          
          // Update turn information
          if (player === 'black') {
            setBotThinking(true);
            setThinkingTime(3);
            setCurrentTurn("Black's turn");
          } else {
            setBotThinking(false);
            setCurrentTurn("White's turn");
          }
          
          // Update turn number
          setTurnNumber(turn);
          
          // Update move history
          setMoveHistory(history);
        };

        // Listen for move history updates
        window.addEventListener('moveHistoryUpdate', ((event: CustomEvent<HistoryEntry[]>) => {
          setMoveHistory(event.detail);
        }) as EventListener);
      }
    });

    // Cleanup function
    return () => {
      (window as any).onTurnChange = null;
      window.removeEventListener('moveHistoryUpdate', (() => {}) as EventListener);
    };
  }, [containerId]);

  // Simple 1-second countdown when it's bot's turn
  useEffect(() => {
    let timer: number;
    if (botThinking && thinkingTime > 0) {
      timer = window.setInterval(() => {
        setThinkingTime(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [botThinking, thinkingTime]);

  // Calculate displayed history - show last 3 moves unless expanded
  const displayedHistory = showFullHistory ? moveHistory : moveHistory.slice(-3);

  return (
    <div id={containerId} ref={containerRef} {...props}>
      <div className="game-info">
        <div id="turn-indicator">
          Turn {turnNumber}: {currentTurn}
          {botThinking && thinkingTime > 0 && (
            <span className="thinking-indicator"> (thinking... {thinkingTime}s)</span>
          )}
        </div>
        
        {moveHistory.length > 0 && (
          <div className="move-history">
            <div className="history-entries">
              {displayedHistory.map((move, index) => (
                <div key={`move-${move.timestamp}-${index}`} className="history-entry">
                  {formatMove(move)}
                </div>
              ))}
            </div>
            {moveHistory.length > 3 && (
              <button 
                className="history-toggle"
                onClick={() => setShowFullHistory(prev => !prev)}
              >
                {showFullHistory ? 'Show Less' : 'Show More...'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
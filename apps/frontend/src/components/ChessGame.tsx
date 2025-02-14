import { useEffect, useRef, useState } from 'preact/hooks';
import type { ComponentProps } from 'preact';
import './ChessGame.css';

interface ChessGameProps extends ComponentProps<'div'> {
  containerId?: string;
}

export default function ChessGame({ containerId = 'game-container', ...props }: ChessGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTurn, setCurrentTurn] = useState<string>("White's turn");
  const [turnNumber, setTurnNumber] = useState<number>(1);
  const [botThinking, setBotThinking] = useState<boolean>(false);
  const [thinkingTime, setThinkingTime] = useState<number>(3);

  useEffect(() => {
    // We'll dynamically import the game to avoid SSR issues
    import('../game/app').then(({ ChessGame }) => {
      if (containerRef.current) {
        const game = new ChessGame(containerId);
        
        // Subscribe to turn changes
        (window as any).onTurnChange = (player: string, turn: number) => {
          if (player === 'black') {
            setBotThinking(true);
            setThinkingTime(3);
            setCurrentTurn("Black's turn");
          } else {
            setBotThinking(false);
            setCurrentTurn("White's turn");
          }
          setTurnNumber(turn);
        };
      }
    });
  }, [containerId]);

  // Timer effect for bot's turn
  useEffect(() => {
    let timer: number;
    if (botThinking && thinkingTime > 0) {
      timer = window.setInterval(() => {
        setThinkingTime((prev) => prev - 1);
      }, 3000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [botThinking, thinkingTime]);

  return (
    <div id={containerId} ref={containerRef} {...props}>
      <div id="turn-indicator">
        Turn {turnNumber}: {currentTurn}
        {botThinking && thinkingTime > 0 && (
          <span className="thinking-indicator">
            {" "}(thinking... {thinkingTime}s)
          </span>
        )}
      </div>
    </div>
  );
} 
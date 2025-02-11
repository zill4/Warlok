import { useEffect, useRef } from 'preact/hooks';
import type { ComponentProps } from 'preact';
import './ChessGame.css';

interface ChessGameProps extends ComponentProps<'div'> {
  containerId?: string;
}

export default function ChessGame({ containerId = 'game-container', ...props }: ChessGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We'll dynamically import the game to avoid SSR issues
    import('../game/app').then(({ ChessGame }) => {
      if (containerRef.current) {
        new ChessGame(containerId);
      }
    });
  }, [containerId]);

  return (
    <div id={containerId} ref={containerRef} {...props}>
      <div id="turn-indicator">White's turn</div>
    </div>
  );
} 
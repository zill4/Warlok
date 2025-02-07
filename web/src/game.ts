import * as THREE from 'three';
import { ChessPiece } from './core';
import { BOARD_CONFIG } from './config';

export class GameState {
  selectedPiece: ChessPiece | null = null;
  currentPlayer: 'WHITE' | 'BLACK' = 'WHITE';
  pieces: ChessPiece[] = [];
  
  constructor(private scene: THREE.Scene) {}

  handlePieceSelection(piece: ChessPiece) {
    if(piece.isBlack !== (this.currentPlayer === 'BLACK')) return;

    this.selectedPiece = piece;
    this.highlightValidMoves(piece);
  }

  private highlightValidMoves(piece: ChessPiece) {
    // Implementation similar to Python's show_valid_moves
    const boardState = this.getBoardState();
    const validMoves = piece.getValidMoves(boardState);
    
    validMoves.forEach(([x, z]) => {
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.2),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      );
      marker.position.set(
        x * BOARD_CONFIG.SQUARE_SIZE - (BOARD_CONFIG.SIZE * BOARD_CONFIG.SQUARE_SIZE)/2,
        0.1,
        z * BOARD_CONFIG.SQUARE_SIZE - (BOARD_CONFIG.SIZE * BOARD_CONFIG.SQUARE_SIZE)/2
      );
      this.scene.add(marker);
    });
  }

  private getBoardState(): (ChessPiece | null)[][] {
    // Create 2D array representing board state
    const board = Array(BOARD_CONFIG.SIZE).fill(null)
      .map(() => Array(BOARD_CONFIG.SIZE).fill(null));
    
    this.pieces.forEach(piece => {
      board[piece.gridZ][piece.gridX] = piece;
    });
    
    return board;
  }
} 
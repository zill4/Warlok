import * as THREE from 'three';
import { ChessPiece } from './core';
import { BOARD_CONFIG } from './config';

export interface Card {
    texture: string;
    pieceType: string;
    color: 'white' | 'black';
}

export class GameState {
    private _scene: THREE.Scene;  // Add underscore to indicate private
    selectedPiece: ChessPiece | null = null;
    currentPlayer: 'WHITE' | 'BLACK' = 'WHITE';
    pieces: ChessPiece[] = [];
    boardCards: THREE.Mesh[] = [];
    validMoves: Array<{x: number, z: number}> = [];
    
    // Mirror Python's virtual grid
    virtualGrid: Array<Array<ChessPiece | null>> = 
        Array(8).fill(null).map(() => Array(8).fill(null));

    public board: (string | null)[][];  // Add board property

    constructor(scene: THREE.Scene) {
        this._scene = scene;
        // Initialize 8x8 board with null values
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    }

    // Add getter for scene if needed
    public getScene(): THREE.Scene {
        return this._scene;
    }

    // Move the highlight moves functionality from game.ts to here
    highlightValidMoves(piece: ChessPiece) {
        const validMoves = piece.getValidMoves(this.virtualGrid);
        
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
            this._scene.add(marker);
        });
    }

    // Add getPieceAt method
    public getPieceAt(x: number, z: number): string | null {
        if (x >= 0 && x < 8 && z >= 0 && z < 8) {
            return this.board[z][x];
        }
        return null;
    }

    // Add method to set piece
    public setPieceAt(x: number, z: number, piece: string | null): void {
        if (x >= 0 && x < 8 && z >= 0 && z < 8) {
            this.board[z][x] = piece;
        }
    }
}
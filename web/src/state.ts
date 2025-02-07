import * as THREE from 'three';
import { ChessPiece } from './core';

export interface Card {
    texture: string;
    pieceType: string;
    color: 'white' | 'black';
}

export class GameState {
    selectedPiece: ChessPiece | null = null;
    currentPlayer: 'WHITE' | 'BLACK' = 'WHITE';
    pieces: ChessPiece[] = [];
    boardCards: THREE.Mesh[] = [];
    validMoves: Array<{x: number, z: number}> = [];
    
    // Mirror Python's virtual grid
    virtualGrid: Array<Array<ChessPiece | null>> = 
        Array(8).fill(null).map(() => Array(8).fill(null));

    constructor(public scene: THREE.Scene) {}
}
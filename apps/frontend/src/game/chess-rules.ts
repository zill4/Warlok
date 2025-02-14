import { ChessPiece } from './core';
import { BOARD_CONFIG } from './config';

export class ChessRules {
    static getValidMoves(piece: ChessPiece, virtualGrid: (ChessPiece | null)[][]): {x: number, z: number}[] {
        const moves: {x: number, z: number}[] = [];
        const x = piece.gridX;
        const z = piece.gridZ;
        
        switch(piece.type.toLowerCase()) {
            case 'pawn':
                this.getPawnMoves(piece, virtualGrid, moves);
                break;
            case 'knight':
                this.getKnightMoves(piece, virtualGrid, moves);
                break;
            case 'bishop':
                this.getBishopMoves(piece, virtualGrid, moves);
                break;
            case 'rook':
                this.getRookMoves(piece, virtualGrid, moves);
                break;
            case 'queen':
                this.getQueenMoves(piece, virtualGrid, moves);
                break;
            case 'king':
                this.getKingMoves(piece, virtualGrid, moves);
                break;
        }
        
        return moves;
    }

    private static isValidPosition(x: number, z: number): boolean {
        return x >= 0 && x < BOARD_CONFIG.SIZE && z >= 0 && z < BOARD_CONFIG.SIZE;
    }

    private static isOccupiedBySameColor(x: number, z: number, piece: ChessPiece, virtualGrid: (ChessPiece | null)[][]): boolean {
        const targetPiece = virtualGrid[z][x];
        return targetPiece !== null && targetPiece.color === piece.color;
    }

    private static addMoveIfValid(x: number, z: number, piece: ChessPiece, virtualGrid: (ChessPiece | null)[][], moves: {x: number, z: number}[]): boolean {
        if (!this.isValidPosition(x, z)) return false;
        if (this.isOccupiedBySameColor(x, z, piece, virtualGrid)) return false;
        
        moves.push({x, z});
        // Return true if the space is empty, false if occupied (to stop sliding pieces)
        return virtualGrid[z][x] === null;
    }

    private static getPawnMoves(piece: ChessPiece, virtualGrid: (ChessPiece | null)[][], moves: {x: number, z: number}[]) {
        const direction = piece.color === 'black' ? 1 : -1;
        const startRank = piece.color === 'black' ? 1 : 6;

        // Forward move
        if (this.isValidPosition(piece.gridX, piece.gridZ + direction) && 
            virtualGrid[piece.gridZ + direction][piece.gridX] === null) {
            moves.push({x: piece.gridX, z: piece.gridZ + direction});

            // Double move from starting position
            if (piece.gridZ === startRank && 
                virtualGrid[piece.gridZ + 2 * direction][piece.gridX] === null) {
                moves.push({x: piece.gridX, z: piece.gridZ + 2 * direction});
            }
        }

        // Capture moves
        const captureSquares = [
            {x: piece.gridX - 1, z: piece.gridZ + direction},
            {x: piece.gridX + 1, z: piece.gridZ + direction}
        ];

        captureSquares.forEach(square => {
            if (this.isValidPosition(square.x, square.z) && 
                virtualGrid[square.z][square.x] !== null && 
                virtualGrid[square.z][square.x]!.color !== piece.color) {
                moves.push(square);
            }
        });
    }

    private static getKnightMoves(piece: ChessPiece, virtualGrid: (ChessPiece | null)[][], moves: {x: number, z: number}[]) {
        const knightMoves = [
            {x: 2, z: 1}, {x: 2, z: -1},
            {x: -2, z: 1}, {x: -2, z: -1},
            {x: 1, z: 2}, {x: 1, z: -2},
            {x: -1, z: 2}, {x: -1, z: -2}
        ];

        knightMoves.forEach(move => {
            const newX = piece.gridX + move.x;
            const newZ = piece.gridZ + move.z;
            this.addMoveIfValid(newX, newZ, piece, virtualGrid, moves);
        });
    }

    private static getBishopMoves(piece: ChessPiece, virtualGrid: (ChessPiece | null)[][], moves: {x: number, z: number}[]) {
        const directions = [
            {x: 1, z: 1}, {x: 1, z: -1},
            {x: -1, z: 1}, {x: -1, z: -1}
        ];

        this.getSlidingMoves(piece, virtualGrid, moves, directions);
    }

    private static getRookMoves(piece: ChessPiece, virtualGrid: (ChessPiece | null)[][], moves: {x: number, z: number}[]) {
        const directions = [
            {x: 0, z: 1}, {x: 0, z: -1},
            {x: 1, z: 0}, {x: -1, z: 0}
        ];

        this.getSlidingMoves(piece, virtualGrid, moves, directions);
    }

    private static getQueenMoves(piece: ChessPiece, virtualGrid: (ChessPiece | null)[][], moves: {x: number, z: number}[]) {
        // Queen combines rook and bishop moves
        this.getBishopMoves(piece, virtualGrid, moves);
        this.getRookMoves(piece, virtualGrid, moves);
    }

    private static getKingMoves(piece: ChessPiece, virtualGrid: (ChessPiece | null)[][], moves: {x: number, z: number}[]) {
        const directions = [
            {x: 1, z: 1}, {x: 1, z: -1},
            {x: -1, z: 1}, {x: -1, z: -1},
            {x: 0, z: 1}, {x: 0, z: -1},
            {x: 1, z: 0}, {x: -1, z: 0}
        ];

        directions.forEach(dir => {
            const newX = piece.gridX + dir.x;
            const newZ = piece.gridZ + dir.z;
            this.addMoveIfValid(newX, newZ, piece, virtualGrid, moves);
        });
    }

    private static getSlidingMoves(
        piece: ChessPiece, 
        virtualGrid: (ChessPiece | null)[][], 
        moves: {x: number, z: number}[],
        directions: {x: number, z: number}[]
    ) {
        directions.forEach(dir => {
            let distance = 1;
            while (true) {
                const newX = piece.gridX + dir.x * distance;
                const newZ = piece.gridZ + dir.z * distance;
                
                // If we can't add this move (either invalid or blocked), stop in this direction
                if (!this.addMoveIfValid(newX, newZ, piece, virtualGrid, moves)) {
                    break;
                }
                distance++;
            }
        });
    }
} 
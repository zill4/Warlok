import type { PlayerState } from './state';
import { ChessPiece } from './core';
import type { Card } from './card';

export type PlayerType = 'human' | 'computer';
export type PlayerColor = 'white' | 'black';

export class Player {
    private state: PlayerState;

    constructor(
        public readonly id: string,
        public readonly type: PlayerType,
        public readonly color: PlayerColor,
        initialState?: Partial<PlayerState>
    ) {
        this.state = {
            id: id,
            type: type,
            color: color,
            deck: [],
            hand: [],
            capturedPieces: [],
            score: 0,
            ...initialState
        };
    }

    public isComputer(): boolean {
        return this.type === 'computer';
    }

    public isHuman(): boolean {
        return this.type === 'human';
    }

    public getState(): PlayerState {
        return { ...this.state };
    }

    public getDeck(): Card[] {
        return [...this.state.deck];
    }

    public getHand(): Card[] {
        return [...this.state.hand];
    }

    public addToHand(card: Card): void {
        this.state.hand.push(card);
    }

    public removeFromHand(cardIndex: number): Card | undefined {
        return this.state.hand.splice(cardIndex, 1)[0];
    }

    public capturePiece(piece: ChessPiece): void {
        this.state.capturedPieces.push(piece);
        this.updateScore();
    }

    private updateScore(): void {
        // Define piece values
        const pieceValues: Record<string, number> = {
            pawn: 1,
            knight: 3,
            bishop: 3,
            rook: 5,
            queen: 9,
            king: 0 // King's capture would end the game
        };

        this.state.score = this.state.capturedPieces.reduce((total, piece) => {
            return total + (pieceValues[piece.type] || 0);
        }, 0);
    }
} 
import type { PlayerState } from './state';
import { ChessPiece } from './core';
import type { Card } from './card';

export type PlayerType = 'human' | 'computer';
export type PlayerColor = 'white' | 'black';

export class Player {
    private state: PlayerState;
    private readonly MAX_HAND_SIZE = 7;  // Match CardSystem's limit
    private ownedPieces: ChessPiece[] = [];

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

    public drawCard(): Card | undefined {
        if (this.state.hand.length >= this.MAX_HAND_SIZE) {
            console.log(`${this.color} player's hand is full`);
            return undefined;
        }

        if (this.state.deck.length === 0) {
            console.log(`${this.color} player's deck is empty`);
            return undefined;
        }

        const card = this.state.deck.pop()!;
        this.state.hand.push(card);
        console.log(`${this.color} player drew:`, card);
        return card;
    }

    public addToHand(card: Card): boolean {
        if (this.state.hand.length >= this.MAX_HAND_SIZE) {
            console.log(`Cannot add card to ${this.color} player's hand: hand is full`);
            return false;
        }
        this.state.hand.push(card);
        return true;
    }

    public removeFromHand(cardIndex: number): Card | undefined {
        if (cardIndex < 0 || cardIndex >= this.state.hand.length) {
            console.log(`Invalid card index for ${this.color} player's hand:`, cardIndex);
            return undefined;
        }
        return this.state.hand.splice(cardIndex, 1)[0];
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

    public addPiece(piece: ChessPiece): void {
        this.ownedPieces.push(piece);
    }

    public removePiece(piece: ChessPiece): void {
        const index = this.ownedPieces.indexOf(piece);
        if (index !== -1) {
            this.ownedPieces.splice(index, 1);
        }
    }

    public getOwnedPieces(): ChessPiece[] {
        return [...this.ownedPieces];
    }
} 
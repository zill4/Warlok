import { GameState } from './state';
import { BoardManager } from './board';
import { CardSystem } from './card';
import { Player } from './player';
import { ChessRules } from './chess-rules';
import type { Card } from './card';
import type { ChessPiece } from './core';

// Define available card types
// 'Ace_kunoichi',
// 'Chroma_king',
// 'Chroma_Queen',
// 'Faithful_Pal',
// 'Chroma_Dragon',
// 'Wicked_Assassin',
// 'Ye_Old_Bishop'

const CARD_TYPES: Card[] = [
    {
        cardType: 'normal',
        monsterType: 'dragon',
        pieceType: 'pawn',
        color: 'black',
        texture: 'Chroma_Dragon'
    },
    {
        cardType: 'normal',
        monsterType: 'dragon',
        pieceType: 'rook',
        color: 'black',
        texture: 'Ace_kunoichi'
    },
    {
        cardType: 'normal',
        monsterType: 'dragon',
        pieceType: 'bishop',
        color: 'black',
        texture: 'Ye_Old_Bishop'
    },
    {
        cardType: 'normal',
        monsterType: 'dragon',
        pieceType: 'knight',
        color: 'black',
        texture: 'Wicked_Assassin'
    },
    {
        cardType: 'normal',
        monsterType: 'dragon',
        pieceType: 'queen',
        color: 'black',
        texture: 'Chroma_Queen'
    },
    {
        cardType: 'normal',
        monsterType: 'dragon',
        pieceType: 'king',
        color: 'black',
        texture: 'Chroma_king'
    }
];

export class Bot {
    constructor(
        private gameState: GameState,
        private boardManager: BoardManager,
        private cardSystem: CardSystem,
        private botPlayer: Player
    ) {}

    public async makeMove(): Promise<void> {
        console.log("Bot thinking about move...");
        await new Promise(resolve => setTimeout(resolve, 1000));

        // First try to move existing pieces
        const botPieces = this.findBotPieces();
        console.log("Bot pieces:", botPieces);
        if (botPieces.length > 0) {
            // Try capture first
            if (this.tryCapture()) {
                console.log("Bot capturing piece");
                return;
            }
            // Then try regular move
            if (this.tryMove()) {
                console.log("Bot moving piece");
                return;
            }
        }

        // If no moves possible, try placing a new piece
        const emptySpaces = this.findEmptySpaces();
        if (emptySpaces.length > 0) {
            if (this.tryPlace()) {
                console.log("Bot placing new piece");
                return;
            }
        }
    }

    private findBotPieces(): { piece: ChessPiece, x: number, z: number }[] {
        // Get pieces owned by the bot player
        const botPieces = this.botPlayer.getOwnedPieces();
        return botPieces.map(piece => ({
            piece,
            x: piece.gridX,
            z: piece.gridZ
        }));
    }

    private tryCapture(): boolean {
        const nearestCapture = this.findNearestCapture();
        if (nearestCapture) {
            console.log("Bot capturing nearest piece");
            this.boardManager.movePiece(
                nearestCapture.piece,
                nearestCapture.toX,
                nearestCapture.toZ
            );
            return true;
        }
        return false;
    }

    private tryMove(): boolean {
        const botPieces = this.findBotPieces();
        if (botPieces.length === 0) return false;

        // Try each piece
        for (const { piece } of botPieces) {
            // Get valid moves for this piece
            const validMoves = ChessRules.getValidMoves(piece, this.gameState.virtualGrid);
            if (validMoves.length > 0) {
                // Pick a random valid move
                const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                console.log(`Bot moving ${piece.pieceType} to (${randomMove.x}, ${randomMove.z})`);
                this.boardManager.movePiece(piece, randomMove.x, randomMove.z);
                return true;
            }
        }
        return false;
    }

    private tryPlace(): boolean {
        const emptySpaces = this.findEmptySpaces();
        if (emptySpaces.length === 0) {
            return false;
        }

        const randomCard = CARD_TYPES[Math.floor(Math.random() * CARD_TYPES.length)];
        const randomSpace = emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
        
        console.log(`Bot playing ${randomCard.pieceType} at (${randomSpace.x}, ${randomSpace.z})`);
        this.boardManager.placeCardOnBoard(randomCard, randomSpace.x, randomSpace.z);
        return true;
    }

    private findNearestCapture(): { piece: ChessPiece, toX: number, toZ: number } | null {
        const botPieces = this.findBotPieces();
        let nearestCapture: { piece: ChessPiece, toX: number, toZ: number, distance: number } | null = null;

        // Check each piece for possible captures
        for (const { piece } of botPieces) {
            const validMoves = ChessRules.getValidMoves(piece, this.gameState.virtualGrid);
            
            for (const move of validMoves) {
                const { x: toX, z: toZ } = move; // Destructure the object properties
                // Check if this move would capture an enemy piece
                const targetPiece = this.gameState.virtualGrid[toZ][toX];
                if (targetPiece && targetPiece.color !== piece.color) {
                    const distance = Math.abs(toX - piece.gridX) + Math.abs(toZ - piece.gridZ);
                    if (!nearestCapture || distance < nearestCapture.distance) {
                        nearestCapture = {
                            piece,
                            toX,
                            toZ,
                            distance
                        };
                    }
                }
            }
        }

        return nearestCapture ? {
            piece: nearestCapture.piece,
            toX: nearestCapture.toX,
            toZ: nearestCapture.toZ
        } : null;
    }

    private findEmptySpaces(): Array<{x: number, z: number}> {
        const emptySpaces: Array<{x: number, z: number}> = [];
        const grid = this.gameState.virtualGrid;

        for (let z = 0; z < 8; z++) {
            for (let x = 0; x < 8; x++) {
                if (!grid[z][x]) {  // If the space is empty
                    emptySpaces.push({x, z});
                }
            }
        }

        return emptySpaces;
    }

    private canCaptureKing(card: Card, fromX: number, fromZ: number, kingPos: { x: number, z: number }): boolean {
        switch (card.pieceType) {
            case 'rook':
                return fromX === kingPos.x || fromZ === kingPos.z;
            case 'bishop':
                return Math.abs(fromX - kingPos.x) === Math.abs(fromZ - kingPos.z);
            case 'queen':
                return fromX === kingPos.x || fromZ === kingPos.z || 
                       Math.abs(fromX - kingPos.x) === Math.abs(fromZ - kingPos.z);
            case 'knight':
                const dx = Math.abs(fromX - kingPos.x);
                const dz = Math.abs(fromZ - kingPos.z);
                return (dx === 2 && dz === 1) || (dx === 1 && dz === 2);
            case 'pawn':
                // Pawns capture diagonally forward
                return Math.abs(fromX - kingPos.x) === 1 && (kingPos.z - fromZ) === 1;
            case 'king':
                // King can capture adjacent squares
                return Math.abs(fromX - kingPos.x) <= 1 && Math.abs(fromZ - kingPos.z) <= 1;
            default:
                return false;
        }
    }
} 
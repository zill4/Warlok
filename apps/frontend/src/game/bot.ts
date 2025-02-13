import { GameState } from './state';
import { BoardManager } from './board';
import { CardSystem } from './card';
import { Player } from './player';
import type { Card } from './card';

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
        
        // Add small delay to make it feel more natural
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get a random card type
        const randomCard = CARD_TYPES[Math.floor(Math.random() * CARD_TYPES.length)];

        // Find all empty spaces on the board
        const emptySpaces = this.findEmptySpaces();
        if (emptySpaces.length === 0) {
            console.log("No empty spaces on board!");
            return;
        }

        // Choose a random empty space
        const randomSpace = emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
        
        console.log(`Bot playing ${randomCard.pieceType} card at position (${randomSpace.x}, ${randomSpace.z})`);
        
        // Place the card
        this.boardManager.placeCardOnBoard(randomCard, randomSpace.x, randomSpace.z);
        
        // Switch turn back to player
        this.gameState.switchTurn();
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
} 
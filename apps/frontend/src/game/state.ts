import * as THREE from 'three';
import { ChessPiece } from './core';
import { BOARD_CONFIG } from './config';
import { Player,  type PlayerColor, type PlayerType } from './player';
import type { Card } from './card';
import { Bot } from './bot';

export interface Card {
    texture: string;
    pieceType: string;
    color: 'white' | 'black';
}

export interface PlayerState {
    id: string;
    type: PlayerType;
    color: PlayerColor;
    deck: Card[];
    hand: Card[];
    capturedPieces: ChessPiece[];
    score: number;
}

export interface GameStateData {
    players: {
        white: PlayerState;
        black: PlayerState;
    };
    board: (string | null)[][];
    currentTurn: PlayerColor;
}

export const INITIAL_GAME_STATE: GameStateData = {
    players: {
        white: {
            id: 'human-1',
            type: 'human',
            color: 'white',
            deck: [
                // Initial deck configuration for white
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'pawn', color: 'white', texture: 'Faithful_Pal' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'bishop', color: 'white', texture: 'Ye_Old_Bishop' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'knight', color: 'white', texture: 'Wicked_Assassin' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'rook', color: 'white', texture: 'Faithful_Pal' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'queen', color: 'white', texture: 'Chroma_Queen' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'king', color: 'white', texture: 'Faithful_Pal' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'pawn', color: 'white', texture: 'Faithful_Pal' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'bishop', color: 'white', texture: 'Ye_Old_Bishop' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'knight', color: 'white', texture: 'Wicked_Assassin' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'rook', color: 'white', texture: 'Faithful_Pal' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'queen', color: 'white', texture: 'Chroma_Queen' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'king', color: 'white', texture: 'Faithful_Pal' },
                // ... add more cards
            ],
            hand: [],
            capturedPieces: [],
            score: 0
        },
        black: {
            id: 'computer-1',
            type: 'computer',
            color: 'black',
            deck: [
                // Initial deck configuration for black
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'knight', color: 'black', texture: 'Wicked_Assassin' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'queen', color: 'black', texture: 'Chroma_Queen' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'king', color: 'black', texture: 'Faithful_Pal' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'pawn', color: 'black', texture: 'Faithful_Pal' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'bishop', color: 'black', texture: 'Ye_Old_Bishop' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'knight', color: 'black', texture: 'Wicked_Assassin' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'rook', color: 'black', texture: 'Faithful_Pal' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'queen', color: 'black', texture: 'Chroma_Queen' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'king', color: 'black', texture: 'Faithful_Pal' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'pawn', color: 'black', texture: 'Faithful_Pal' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'bishop', color: 'black', texture: 'Ye_Old_Bishop' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'knight', color: 'black', texture: 'Wicked_Assassin' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'rook', color: 'black', texture: 'Faithful_Pal' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'queen', color: 'black', texture: 'Chroma_Queen' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'king', color: 'black', texture: 'Faithful_Pal' },
                // ... add more cards
            ],
            hand: [],
            capturedPieces: [],
            score: 0
        }
    },
    board: Array(8).fill(null).map(() => Array(8).fill(null)),
    currentTurn: 'white'
};

export class GameState {
    private _scene: THREE.Scene;  // Add underscore to indicate private
    selectedPiece: ChessPiece | null = null;
    pieces: ChessPiece[] = [];
    boardCards: THREE.Mesh[] = [];
    validMoves: Array<{x: number, z: number}> = [];
    
    // Mirror Python's virtual grid
    public virtualGrid: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

    public board: (string | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));  // Add board property
    private players: Map<string, Player>;
    private currentPlayer: Player;
    private localPlayer: Player;
    private gameActive: boolean = false;
    private bot: Bot | null = null;
    private turnCount: number = 1;  // Start at turn 1

    constructor(scene: THREE.Scene) {
        this._scene = scene;
        this.players = new Map();
        
        // Create the two players with consistent IDs
        const player1 = new Player(
            'player_1',
            'human',
            'white',
            INITIAL_GAME_STATE.players.white
        );
        
        const player2 = new Player(
            'bot',
            'computer',
            'black',
            INITIAL_GAME_STATE.players.black
        );

        // Store players in map with consistent IDs
        this.players.set('player_1', player1);
        this.players.set('bot', player2);

        // Set initial current player and local player
        this.currentPlayer = player1;  // White moves first
        this.localPlayer = player1;    // Local player is always player_1
        
        console.log('GameState initialized with players:', {
            player1: player1.id,
            player2: player2.id,
            currentPlayer: this.currentPlayer.id,
            turn: this.turnCount
        });

        // Start the game
        this.startGame();
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

    public startGame() {
        // Make sure we have a valid current player
        if (!this.currentPlayer) {
            this.currentPlayer = this.players.get('player_1')!;
        }
        
        this.gameActive = true;
        console.log(`Game started - ${this.currentPlayer.color} (${this.currentPlayer.type}) to play`);
    }

    public getCurrentPlayer(): Player {
        return this.currentPlayer;
    }

    public isPlayerTurn(playerId: string): boolean {
        return this.currentPlayer.id === playerId;
    }

    public switchTurn() {
        const nextPlayerId = this.currentPlayer.id === 'player_1' ? 'bot' : 'player_1';
        const nextPlayer = this.players.get(nextPlayerId);
        
        if (!nextPlayer) {
            console.error('Failed to find next player:', nextPlayerId);
            return;
        }

        this.currentPlayer = nextPlayer;
        this.turnCount++;
        
        console.log(`Turn ${this.turnCount}: ${this.currentPlayer.id} (${this.currentPlayer.type})`);
        
        // Notify UI of turn change
        if (typeof window !== 'undefined' && (window as any).onTurnChange) {
            (window as any).onTurnChange(this.currentPlayer.color, this.turnCount);
        }
        
        // If it's the bot's turn and we have a bot instance, make a move after delay
        if (this.currentPlayer.id === 'bot' && this.bot) {
            console.log('Bot turn - waiting before making move');
            setTimeout(() => {
                console.log('Bot making move');
                this.bot?.makeMove();
            }, 5000); // 5 second delay
        }
    }

    public getPlayer(color: PlayerColor): Player | undefined {
        // Find player by color
        for (const player of this.players.values()) {
            if (player.color === color) {
                return player;
            }
        }
        return undefined;
    }

    public isGameActive(): boolean {
        return this.gameActive;
    }

    public endGame() {
        this.gameActive = false;
    }

    // Add method to get local player
    public getLocalPlayer(): Player {
        return this.localPlayer;
    }

    public setBotInstance(bot: Bot) {
        this.bot = bot;
        console.log('Bot instance set for player:', this.players.get('bot')?.id);
    }

    public getTurnCount(): number {
        return this.turnCount;
    }

    public getCurrentTurnPlayer(): string {
        return `Turn ${this.turnCount}: ${this.currentPlayer.color}`;
    }
}
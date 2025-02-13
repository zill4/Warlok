import * as THREE from 'three';
import { ChessPiece } from './core';
import { BOARD_CONFIG } from './config';
import { Player,  type PlayerColor } from './player';
import { Bot } from './bot';

export interface Card {
    texture: string;
    pieceType: string;
    color: 'white' | 'black';
}

export class GameState {
    private _scene: THREE.Scene;  // Add underscore to indicate private
    selectedPiece: ChessPiece | null = null;
    pieces: ChessPiece[] = [];
    boardCards: THREE.Mesh[] = [];
    validMoves: Array<{x: number, z: number}> = [];
    
    // Mirror Python's virtual grid
    public virtualGrid: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

    public board: (string | null)[][];  // Add board property
    private players: Map<PlayerColor, Player>;
    private currentPlayer: Player;
    private gameActive: boolean = false;
    private localPlayer: Player;
    private bot: Bot | null = null;

    constructor(private scene: THREE.Scene) {
        this._scene = scene;
        // Initialize 8x8 board with null values
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        // Initialize players
        this.players = new Map();
        const humanPlayer = new Player('human-1', 'human', 'white'); // Color could be determined by user choice
        const computerPlayer = new Player('computer-1', 'computer', 'black');
        
        this.players.set('white', humanPlayer);
        this.players.set('black', computerPlayer);
        
        // Set the local player (this could be determined by game configuration)
        this.localPlayer = humanPlayer;
        
        // Set initial player
        this.currentPlayer = humanPlayer;
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
        this.currentPlayer = this.players.get('white')!; // White always starts
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
        this.currentPlayer = this.currentPlayer.color === 'white' ? 
            this.players.get('black')! : 
            this.players.get('white')!;
            
        console.log(`Turn switched to ${this.currentPlayer.color} (${this.currentPlayer.type})`);
        
        // If it's the bot's turn, make a move
        if (this.currentPlayer.isComputer() && this.bot) {
            this.bot.makeMove();
        }
    }

    public getPlayer(color: PlayerColor): Player {
        return this.players.get(color)!;
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
    }
}
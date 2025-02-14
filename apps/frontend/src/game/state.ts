import * as THREE from 'three';
import { ChessPiece } from './core';
import { BOARD_CONFIG } from './config';
import { Player,  type PlayerColor, type PlayerType } from './player';
import type { Card } from './card';
import { Bot } from './bot';
import { EffectsManager } from './effects-manager';

// export interface Card {
//     texture: string;
//     pieceType: string;
//     color: 'white' | 'black';
// }

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
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'queen', color: 'white', texture: 'Chroma_Queen' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'king', color: 'white', texture: 'Faithful_Pal' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'bishop', color: 'white', texture: 'Ye_Old_Bishop' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'knight', color: 'white', texture: 'Wicked_Assassin' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'queen', color: 'white', texture: 'Chroma_Queen' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'pawn', color: 'white', texture: 'Faithful_Pal' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'bishop', color: 'white', texture: 'Ye_Old_Bishop' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'knight', color: 'white', texture: 'Wicked_Assassin' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'queen', color: 'white', texture: 'Chroma_Queen' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'king', color: 'white', texture: 'Faithful_Pal' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'bishop', color: 'white', texture: 'Ye_Old_Bishop' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'knight', color: 'white', texture: 'Wicked_Assassin' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'queen', color: 'white', texture: 'Chroma_Queen' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'pawn', color: 'white', texture: 'Faithful_Pal' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'bishop', color: 'white', texture: 'Ye_Old_Bishop' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'knight', color: 'white', texture: 'Wicked_Assassin' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'queen', color: 'white', texture: 'Chroma_Queen' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'king', color: 'white', texture: 'Faithful_Pal' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'bishop', color: 'white', texture: 'Ye_Old_Bishop' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'knight', color: 'white', texture: 'Wicked_Assassin' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'queen', color: 'white', texture: 'Chroma_Queen' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'pawn', color: 'white', texture: 'Faithful_Pal' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'bishop', color: 'white', texture: 'Ye_Old_Bishop' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'knight', color: 'white', texture: 'Wicked_Assassin' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'queen', color: 'white', texture: 'Chroma_Queen' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'king', color: 'white', texture: 'Faithful_Pal' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'bishop', color: 'white', texture: 'Ye_Old_Bishop' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'knight', color: 'white', texture: 'Wicked_Assassin' },
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'queen', color: 'white', texture: 'Chroma_Queen' },
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
                { cardType: 'normal', monsterType: 'dragon', pieceType: 'knight', color: 'black', texture: 'Wicked_Assassin' },
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

interface TurnMove {
    piece: string;
    from?: { x: number, z: number };
    to: { x: number, z: number };
    isCapture: boolean;
    isPlacement: boolean;
}

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
    private effectsManager: EffectsManager;
    private moveHistory: {
        white: TurnMove[],
        black: TurnMove[]
    } = {
        white: [],
        black: []
    };
    private gameOver: boolean = false;
    private winner: PlayerColor | null = null;
    private finalTurnCount: number = 0;

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
        this.effectsManager = new EffectsManager(scene);
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
        if (!this.currentPlayer) {
            this.currentPlayer = this.players.get('player_1')!;
        }
        
        // Draw initial hands for both players
        for (const player of this.players.values()) {
            // Get the player's initial deck from INITIAL_GAME_STATE
            const initialDeck = player.color === 'white' ? 
                [...INITIAL_GAME_STATE.players.white.deck] : 
                [...INITIAL_GAME_STATE.players.black.deck];
            
            // Shuffle the deck
            for (let i = initialDeck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [initialDeck[i], initialDeck[j]] = [initialDeck[j], initialDeck[i]];
            }
            
            // Set the player's deck
            player.updateDeck(initialDeck);
            
            // Draw 7 cards from deck to hand
            for (let i = 0; i < 7 && player.getDeck().length > 0; i++) {
                player.drawCard();
            }
            
            console.log(`Drew initial hand for ${player.color}:`, player.getHand());
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
        if (this.gameOver) return; // Don't switch turns if game is over
        
        const nextPlayerId = this.currentPlayer.id === 'player_1' ? 'bot' : 'player_1';
        const nextPlayer = this.players.get(nextPlayerId);
        
        if (!nextPlayer) {
            console.error('Failed to find next player:', nextPlayerId);
            return;
        }

        this.currentPlayer = nextPlayer;
        this.turnCount++;
        
        console.log(`Turn ${this.turnCount}: ${this.currentPlayer.id} (${this.currentPlayer.type})`);
        
        // If it's the bot's turn and we have a bot instance, make a move after delay
        if (!this.gameOver && this.currentPlayer.id === 'bot' && this.bot) {
            setTimeout(() => {
                if (!this.gameOver) {
                    this.bot?.makeMove();
                }
            }, 1000);
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
        this.gameOver = true;
        this.winner = this.currentPlayer.color;
        this.finalTurnCount = this.turnCount;
        
        // Create and show the end game menu
        this.showEndGameMenu();
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

    public capturePiece(piece: ChessPiece, capturedBy: Player) {
        console.log(`${piece.color} ${piece.type} captured by ${capturedBy.color}`);
        
        // Add to player's captured pieces
        capturedBy.capturePiece(piece);
        
        // Check if the captured piece was a king
        if (piece.type === 'king') {
            this.endGame(capturedBy.color);
        }
        
        // Remove from virtual grid
        const [x, z] = piece.getPosition();
        this.virtualGrid[z][x] = null;
        
        // Find and remove the associated card mesh
        const cardMesh = this.boardCards.find(card => {
            const cardPos = card.position;
            return Math.abs(cardPos.x - piece.position.x) < 0.1 && 
                   Math.abs(cardPos.z - piece.position.z) < 0.1;
        });

        if (cardMesh) {
            this._scene.remove(cardMesh);
            // Remove from boardCards array
            const cardIndex = this.boardCards.indexOf(cardMesh);
            if (cardIndex > -1) {
                this.boardCards.splice(cardIndex, 1);
            }
            // Dispose of geometries and materials
            if (cardMesh.geometry) cardMesh.geometry.dispose();
            if (cardMesh.material) {
                if (Array.isArray(cardMesh.material)) {
                    cardMesh.material.forEach(m => m.dispose());
                } else {
                    cardMesh.material.dispose();
                }
            }
        }
        
        // Remove the piece from the scene
        this._scene.remove(piece);
        // Dispose of piece geometries and materials
        piece.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });
        
        // Trigger destruction animation
        this.effectsManager.animatePieceDestruction(piece);
    }

    private showEndGameMenu() {
        // Create menu container
        const menuContainer = document.createElement('div');
        menuContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 2rem;
            border-radius: 10px;
            color: white;
            text-align: center;
            z-index: 1000;
        `;

        // Add content
        menuContainer.innerHTML = `
            <h2 style="margin-bottom: 1rem;">Game Over!</h2>
            <p style="margin-bottom: 0.5rem;">${this.winner} wins!</p>
            <p style="margin-bottom: 1rem;">Game lasted ${this.finalTurnCount} turns</p>
            <button id="playAgainBtn" style="
                padding: 0.5rem 1rem;
                background: #4CAF50;
                border: none;
                border-radius: 5px;
                color: white;
                cursor: pointer;
                font-size: 1rem;
            ">Play Again</button>
        `;

        // Add to document
        document.body.appendChild(menuContainer);

        // Add play again functionality
        const playAgainBtn = document.getElementById('playAgainBtn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                document.body.removeChild(menuContainer);
                window.location.reload(); // Simple reload for now
            });
        }
    }

    public recordMove(piece: ChessPiece | Card, to: { x: number, z: number }, from?: { x: number, z: number }, isCapture: boolean = false) {
        const currentColor = this.currentPlayer.color;
        const move: TurnMove = {
            piece: 'piece' in piece ? piece.pieceType : piece.pieceType,
            to: to,
            from: from,
            isCapture: isCapture,
            isPlacement: !from
        };

        this.moveHistory[currentColor].push(move);
        
        // Log the move in chess notation
        console.log(this.getMoveNotation(move));
    }

    private getMoveNotation(move: TurnMove): string {
        let notation = '';
        
        // Add piece letter (except for pawns)
        if (move.piece !== 'pawn') {
            notation += move.piece[0].toUpperCase();
        }
        
        // Add 'x' if it's a capture
        if (move.isCapture) {
            if (move.piece === 'pawn') {
                notation += String.fromCharCode(97 + move.from!.x); // Add starting file for pawn captures
            }
            notation += 'x';
        }
        
        // Add destination square
        notation += String.fromCharCode(97 + move.to.x); // Convert to a-h
        notation += (8 - move.to.z); // Convert to 1-8
        
        return notation;
    }

    public getMoveHistory(): string[] {
        const history: string[] = [];
        const maxMoves = Math.max(this.moveHistory.white.length, this.moveHistory.black.length);
        
        for (let i = 0; i < maxMoves; i++) {
            const moveNum = i + 1;
            const whiteMoveNotation = this.moveHistory.white[i] ? 
                this.getMoveNotation(this.moveHistory.white[i]) : '';
            const blackMoveNotation = this.moveHistory.black[i] ? 
                this.getMoveNotation(this.moveHistory.black[i]) : '';
            
            history.push(`${moveNum}. ${whiteMoveNotation} ${blackMoveNotation}`);
        }
        
        return history;
    }
}
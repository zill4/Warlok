import * as THREE from 'three';
import { BOARD_CONFIG } from './config.js';
import { GameState } from './state.js';
import { ChessPiece } from './core.js';
import type { Card } from './card.js';
import { CardSystem } from './card.js';
import { Player, type PlayerColor } from './player.js';

export class BoardManager {
    private scene: THREE.Scene;
    private pieces: ChessPiece[] = [];
    private pieceModels!: Map<string, THREE.Group>;
    private state: GameState;
    private board: THREE.Group;
    private isInitialized = false;
    private cardSystem: CardSystem;
    private camera: THREE.Camera;
    private readonly playerId: string;
    private readonly localPlayer: Player;

    constructor(scene: THREE.Scene, state: GameState, cardSystem: CardSystem, camera: THREE.Camera) {
        this.scene = scene;
        this.state = state;
        this.cardSystem = cardSystem;
        this.camera = camera;
        this.board = new THREE.Group();
        this.scene.add(this.board);
        
        console.log("BoardManager initialized");
        
        // Make BoardManager available globally for CardSystem
        (window as any).boardManagerInstance = this;
        this.playerId = state.getPlayer('white').id;
        this.localPlayer = state.getLocalPlayer();
    }

    public setPieceModels(models: Map<string, THREE.Group>) {
        if (this.pieceModels) {
            console.warn('Piece models already set, skipping...');
            return;
        }
        this.pieceModels = models;
        console.log('Piece models set in BoardManager');
    }

    public createBoard() {
        if (this.isInitialized) {
            console.warn('Board already created, skipping...');
            return;
        }

        console.log("Creating board...");
        
        // Create board container
        const boardGeometry = new THREE.BoxGeometry(
            BOARD_CONFIG.SIZE * BOARD_CONFIG.SQUARE_SIZE,
            0.2,
            BOARD_CONFIG.SIZE * BOARD_CONFIG.SQUARE_SIZE
        );
        const boardMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x202020,
            emissive: 0x000000  // Ensure no emission
        });
        const boardBase = new THREE.Mesh(boardGeometry, boardMaterial);
        boardBase.position.y = -0.1;
        this.board.add(boardBase);

        // Create squares
        const squareGeometry = new THREE.BoxGeometry(
            BOARD_CONFIG.SQUARE_SIZE * 0.98,
            0.1,
            BOARD_CONFIG.SQUARE_SIZE * 0.98
        );

        const offset = (BOARD_CONFIG.SIZE * BOARD_CONFIG.SQUARE_SIZE) / 2 - BOARD_CONFIG.SQUARE_SIZE / 2;

        for (let z = 0; z < BOARD_CONFIG.SIZE; z++) {
            for (let x = 0; x < BOARD_CONFIG.SIZE; x++) {
                const isWhite = (x + z) % 2 === 0;
                const material = new THREE.MeshStandardMaterial({
                    color: isWhite ? BOARD_CONFIG.COLORS.WHITE : BOARD_CONFIG.COLORS.BLACK,
                    emissive: 0x000000  // Ensure no emission
                });

                const square = new THREE.Mesh(squareGeometry, material);
                square.position.set(
                    x * BOARD_CONFIG.SQUARE_SIZE - offset,
                    0,
                    z * BOARD_CONFIG.SQUARE_SIZE - offset
                );
                this.board.add(square);
            }
        }

        // Add board frame
        const frameSize = BOARD_CONFIG.SIZE * BOARD_CONFIG.SQUARE_SIZE + 0.4;
        const frameThickness = 0.4;
        const frameHeight = 0.3;
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xA5A1A2 });

        // Create frame pieces with proper typing
        interface FrameSide {
            pos: [number, number, number];
            scale: [number, number, number];
        }

        const sides: FrameSide[] = [
            // North
            { pos: [0, 0, -frameSize/2], scale: [frameSize, frameHeight, frameThickness] },
            // South
            { pos: [0, 0, frameSize/2], scale: [frameSize, frameHeight, frameThickness] },
            // East
            { pos: [frameSize/2, 0, 0], scale: [frameThickness, frameHeight, frameSize] },
            // West
            { pos: [-frameSize/2, 0, 0], scale: [frameThickness, frameHeight, frameSize] }
        ];

        sides.forEach(side => {
            const frameGeometry = new THREE.BoxGeometry(1, 1, 1);
            const framePiece = new THREE.Mesh(frameGeometry, frameMaterial);
            framePiece.position.set(side.pos[0], side.pos[1], side.pos[2]);
            framePiece.scale.set(side.scale[0], side.scale[1], side.scale[2]);
            framePiece.position.y = frameHeight/2 - 0.1;
            this.board.add(framePiece);
        });

        this.isInitialized = true;
    }

    public setupInitialPieces() {
        if (this.pieces.length > 0) {
            console.warn('Pieces already set up, skipping...');
            return;
        }
        console.log("Setting up initial pieces...");
        
        // Setup piece positions - swapped colors from previous setup
        const pieceSetup = [
            // Black pieces on bottom ranks (0,1)
            { type: 'rook', positions: [[0, 0], [7, 0]], color: 'black' },
            { type: 'knight', positions: [[1, 0], [6, 0]], color: 'black' },
            { type: 'bishop', positions: [[2, 0], [5, 0]], color: 'black' },
            { type: 'queen', positions: [[4, 0]], color: 'black' },
            { type: 'king', positions: [[3, 0]], color: 'black' },
            { type: 'pawn', positions: Array.from({length: 8}, (_, i) => [i, 1]), color: 'black' },
            
            // White pieces on top ranks (6,7)
            { type: 'rook', positions: [[0, 7], [7, 7]], color: 'white' },
            { type: 'knight', positions: [[1, 7], [6, 7]], color: 'white' },
            { type: 'bishop', positions: [[2, 7], [5, 7]], color: 'white' },
            { type: 'queen', positions: [[4, 7]], color: 'white' },
            { type: 'king', positions: [[3, 7]], color: 'white' },
            { type: 'pawn', positions: Array.from({length: 8}, (_, i) => [i, 6]), color: 'white' }
        ];

        // Place all pieces
        pieceSetup.forEach(({ type, positions, color }) => {
            positions.forEach(([x, z]) => {
                this.placeInitialPiece(type, color as PlayerColor, x, z);
            });
        });
    }

    private placeInitialPiece(type: string, color: PlayerColor, x: number, z: number) {
        const modelKey = `${color}_${type}`;
        const model = this.pieceModels.get(modelKey);
        console.log("placing initial piece:", modelKey);
        if (!model) {
            console.error(`Missing model for ${modelKey}`);
            return;
        }

        const piece = new ChessPiece(type, color === 'black', x, z, model.clone());
        
        const offset = (BOARD_CONFIG.SIZE * BOARD_CONFIG.SQUARE_SIZE) / 2 - BOARD_CONFIG.SQUARE_SIZE / 2;
        piece.position.set(
            x * BOARD_CONFIG.SQUARE_SIZE - offset,
            0.1,
            z * BOARD_CONFIG.SQUARE_SIZE - offset
        );

        this.scene.add(piece);
        this.pieces.push(piece);
        this.state.virtualGrid[z][x] = piece;
        
        console.log(`Placed ${color} ${type} at (${x}, ${z})`);
    }

    // Method to get piece at grid position
    public getPieceAt(x: number, z: number): ChessPiece | null {
        return this.state.virtualGrid[z][x];
    }

    // Method to move piece
    public movePiece(piece: ChessPiece, newX: number, newZ: number) {
        const offset = (BOARD_CONFIG.SIZE * BOARD_CONFIG.SQUARE_SIZE) / 2 - BOARD_CONFIG.SQUARE_SIZE / 2;
        
        // Update virtual grid
        this.state.virtualGrid[piece.gridZ][piece.gridX] = null;
        this.state.virtualGrid[newZ][newX] = piece;

        // Update piece position
        piece.gridX = newX;
        piece.gridZ = newZ;
        piece.position.set(
            newX * BOARD_CONFIG.SQUARE_SIZE - offset,
            0.1, // Keep consistent height with initial placement
            newZ * BOARD_CONFIG.SQUARE_SIZE - offset
        );
    }

    placeCardOnBoard(card: Card, gridX: number, gridZ: number) {
        // Check if it's local player's turn

        console.log("BoardManager placing card:", card, "at", gridX, gridZ);
        
        // Make card smaller than the square size
        const squareSize = BOARD_CONFIG.SQUARE_SIZE;
        const cardHeight = squareSize * 0.8;  // 80% of square height
        const cardWidth = cardHeight * 0.666;  // Maintain aspect ratio (1:1.5)
        
        // Create card mesh with adjusted dimensions
        const cardGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
        const material = new THREE.MeshStandardMaterial({
            transparent: true,
            side: THREE.DoubleSide
        });

        // Load texture
        const textureLoader = new THREE.TextureLoader();
        console.log('placing card texture:', card.texture);
        textureLoader.load(
            `/assets/images/${card.texture}.png`,
            (texture) => {
                material.map = texture;
                material.needsUpdate = true;
            }
        );

        const cardMesh = new THREE.Mesh(cardGeometry, material);
        
        // Calculate world position (centered in square)
        const worldX = (gridX - 3.5) * squareSize;
        const worldZ = (gridZ - 3.5) * squareSize;
        
        cardMesh.position.set(
            worldX,      // Center X
            0.1,        // Slightly above board
            worldZ      // Center Z
        );
        cardMesh.rotation.x = -Math.PI / 2; // Lay flat
        cardMesh.rotation.z = card.color === 'black' ? Math.PI : 0;

        // Add to scene and track
        this.scene.add(cardMesh);
        this.state.boardCards.push(cardMesh);
        
        console.log("Card mesh added to scene at:", cardMesh.position);

        // Create and place piece if needed
        if (card.pieceType) {
            const modelKey = `${card.color}_${card.pieceType}`;
            const pieceModel = this.pieceModels.get(modelKey);
            
            if (pieceModel) {
                const piece = new ChessPiece(
                    card.pieceType,
                    card.color === 'black',
                    gridX,
                    gridZ,
                    pieceModel.clone()
                );
                
                // Position piece
                piece.position.set(worldX, 0.125, worldZ);
                this.scene.add(piece);
                this.pieces.push(piece);
                
                // Update virtual grid
                this.state.virtualGrid[gridZ][gridX] = piece;
            }
        }
    }

    // Add method to access cardSystem
    public getCardSystem(): CardSystem {
        return this.cardSystem;
    }

    // Add getter for board squares
    public getBoardSquares(): THREE.Object3D[] {
        return this.board.children.filter(child => 
            child instanceof THREE.Mesh && 
            child.geometry instanceof THREE.BoxGeometry &&
            child.geometry.parameters.width === BOARD_CONFIG.SQUARE_SIZE * 0.98
        );
    }

    // Rename onBoardClick to handleBoardClick and update signature
    public handleBoardClick(mouse: THREE.Vector2, camera: THREE.Camera) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const squares = this.getBoardSquares();
        const intersects = raycaster.intersectObjects(squares);
        
        if (intersects.length > 0) {
            const square = intersects[0].object as THREE.Mesh;
            const gridPosition = this.getGridPosition(square.position);
            
            if (!this.state.board[gridPosition.z][gridPosition.x]) {
                const selectedCards = this.cardSystem.getSelectedCards();
                if (selectedCards.length > 0) {
                    this.cardSystem.placeCardOnBoard(gridPosition.x, gridPosition.z);
                    this.cardSystem.removeSelectedCard();
                }
            }
        }
    }

    private getGridPosition(position: THREE.Vector3): THREE.Vector3 {
        const gridX = Math.round(position.x / BOARD_CONFIG.SQUARE_SIZE + (BOARD_CONFIG.SIZE - 1) / 2);
        const gridZ = Math.round(position.z / BOARD_CONFIG.SQUARE_SIZE + (BOARD_CONFIG.SIZE - 1) / 2);
        return new THREE.Vector3(gridX, 0, gridZ);
    }

    // Update computer turn handler to not assume black
    private handleComputerTurn() {
        const players = Array.from(this.state.players.values());
        const computerPlayer = players.find(p => p.isComputer());
        
        if (computerPlayer && this.state.isPlayerTurn(computerPlayer.id)) {
            console.log("Computer thinking about its move...");
            // TODO: Implement computer move logic
        }
    }
}

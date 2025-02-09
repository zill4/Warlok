import * as THREE from 'three';
import { BOARD_CONFIG } from './config';
import { GameState } from './state';
import { ChessPiece } from './core';
import { Card } from './card';
import { CardSystem } from './card';

export class BoardManager {
    private scene: THREE.Scene;
    private pieces: ChessPiece[] = [];
    private pieceModels!: Map<string, THREE.Group>;
    private state: GameState;
    private board: THREE.Group;
    private isInitialized = false;
    private cardSystem: CardSystem;
    private camera: THREE.Camera;

    constructor(scene: THREE.Scene, state: GameState, cardSystem: CardSystem, camera: THREE.Camera) {
        this.scene = scene;
        this.state = state;
        this.cardSystem = cardSystem;
        this.camera = camera;
        this.board = new THREE.Group();
        this.scene.add(this.board);
        
        window.addEventListener('click', (event) => this.onBoardClick(event));
        console.log("BoardManager initialized");
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
        const boardMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x202020
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
                const material = new THREE.MeshBasicMaterial({
                    color: isWhite ? BOARD_CONFIG.COLORS.WHITE : BOARD_CONFIG.COLORS.BLACK
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
        const frameMaterial = new THREE.MeshBasicMaterial({ color: 0x4a3019 });

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
        
        // Setup piece positions
        const pieceSetup = [
            { type: 'rook', positions: [[0, 0], [7, 0], [0, 7], [7, 7]] },
            { type: 'knight', positions: [[1, 0], [6, 0], [1, 7], [6, 7]] },
            { type: 'bishop', positions: [[2, 0], [5, 0], [2, 7], [5, 7]] },
            { type: 'queen', positions: [[3, 0], [3, 7]] },
            { type: 'king', positions: [[4, 0], [4, 7]] }
        ];

        // Place main pieces
        pieceSetup.forEach(({ type, positions }) => {
            positions.forEach(([x, z]) => {
                const isBlack = z > 4;
                const color = isBlack ? 'black' : 'white';
                this.placeInitialPiece(type, color, x, z);
            });
        });

        // Place pawns
        for (let x = 0; x < BOARD_CONFIG.SIZE; x++) {
            this.placeInitialPiece('pawn', 'white', x, 1);
            this.placeInitialPiece('pawn', 'black', x, 6);
        }
    }

    private placeInitialPiece(type: string, color: 'white' | 'black', x: number, z: number) {
        const modelKey = `${color}_${type}`;
        const model = this.pieceModels.get(modelKey);
        
        if (!model) {
            console.error(`Missing model for ${modelKey}`);
            return;
        }

        const piece = new ChessPiece(type, color === 'black', x, z, model.clone());
        
        // Enable shadows for the piece
        piece.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        const offset = (BOARD_CONFIG.SIZE * BOARD_CONFIG.SQUARE_SIZE) / 2 - BOARD_CONFIG.SQUARE_SIZE / 2;
        piece.position.set(
            x * BOARD_CONFIG.SQUARE_SIZE - offset,
            0.5,
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
            0.1,
            newZ * BOARD_CONFIG.SQUARE_SIZE - offset
        );
    }

    placeCardOnBoard(card: Card, gridX: number, gridZ: number) {
        // Clean up existing card at position
        this.state.boardCards = this.state.boardCards.filter(existingCard => {
            if (existingCard.position.x === gridX && existingCard.position.z === gridZ) {
                this.scene.remove(existingCard);
                return false;
            }
            return true;
        });

        // Create new card entity
        const cardEntity = this.createCardEntity(card);
        cardEntity.position.set(gridX - 3.5, 0.2, gridZ - 3.5);
        this.scene.add(cardEntity);
        this.state.boardCards.push(cardEntity);

        // Create piece
        const piece = new ChessPiece(
            card.pieceType, 
            card.color === 'black', 
            gridX, 
            gridZ, 
            this.pieceModels.get(`${card.color === 'black' ? 'black' : 'white'}_${card.pieceType}`)!
        );

        this.scene.add(piece.mesh);
        this.state.pieces.push(piece);
    }

    private createCardEntity(card: Card): THREE.Mesh {
        const geometry = new THREE.PlaneGeometry(0.8, 0.8);
        const texture = new THREE.TextureLoader().load(`assets/cards/${card.texture}.png`);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const cardMesh = new THREE.Mesh(geometry, material);
        cardMesh.rotation.x = -Math.PI / 2;
        return cardMesh;
    }

    // Add method to access cardSystem
    public getCardSystem(): CardSystem {
        return this.cardSystem;
    }

    private onBoardClick(event: MouseEvent) {
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        const squares = this.board.children.filter(child => 
            child instanceof THREE.Mesh && 
            child.geometry instanceof THREE.BoxGeometry &&
            child.geometry.parameters.width === BOARD_CONFIG.SQUARE_SIZE * 0.98
        );

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
}

import * as THREE from 'three';
import { BOARD_CONFIG } from './config';
import { GameState } from './state';
import { ChessPiece } from './core';
import { Card } from './card';

export class BoardManager {
    private scene: THREE.Scene;
    public pieces: ChessPiece[] = [];
    private pieceModels!: Map<string, THREE.Group>;
    private state: GameState;

    constructor(scene: THREE.Scene, state: GameState) {
        this.scene = scene;
        this.state = state;
        this.createBoard();
    }

    public setPieceModels(models: Map<string, THREE.Group>) {
        this.pieceModels = models;
    }

    public createBoard() {
        // Chess board creation logic from Python
        for(let z = 0; z < BOARD_CONFIG.SIZE; z++) {
            for(let x = 0; x < BOARD_CONFIG.SIZE; x++) {
                const color = (x + z) % 2 === 0 ? BOARD_CONFIG.COLORS.WHITE : BOARD_CONFIG.COLORS.BLACK;
                const geometry = new THREE.PlaneGeometry(BOARD_CONFIG.SQUARE_SIZE, BOARD_CONFIG.SQUARE_SIZE);
                const material = new THREE.MeshStandardMaterial({ color });
                const square = new THREE.Mesh(geometry, material);
                square.rotation.x = -Math.PI / 2;
                square.position.set(
                    x * BOARD_CONFIG.SQUARE_SIZE - (BOARD_CONFIG.SIZE * BOARD_CONFIG.SQUARE_SIZE)/2,
                    0,
                    z * BOARD_CONFIG.SQUARE_SIZE - (BOARD_CONFIG.SIZE * BOARD_CONFIG.SQUARE_SIZE)/2
                );
                this.scene.add(square);
            }
        }
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

    public setupInitialPieces() {
        // White back rank
        this.placeInitialPiece('rook', 'white', 0, 0);
        this.placeInitialPiece('knight', 'white', 1, 0);
        this.placeInitialPiece('bishop', 'white', 2, 0);
        this.placeInitialPiece('queen', 'white', 3, 0);
        this.placeInitialPiece('king', 'white', 4, 0);
        this.placeInitialPiece('bishop', 'white', 5, 0);
        this.placeInitialPiece('knight', 'white', 6, 0);
        this.placeInitialPiece('rook', 'white', 7, 0);

        // White pawns
        for (let x = 0; x < 8; x++) {
            this.placeInitialPiece('pawn', 'white', x, 1);
        }

        // Black back rank
        this.placeInitialPiece('rook', 'black', 0, 7);
        this.placeInitialPiece('knight', 'black', 1, 7);
        this.placeInitialPiece('bishop', 'black', 2, 7);
        this.placeInitialPiece('queen', 'black', 3, 7);
        this.placeInitialPiece('king', 'black', 4, 7);
        this.placeInitialPiece('bishop', 'black', 5, 7);
        this.placeInitialPiece('knight', 'black', 6, 7);
        this.placeInitialPiece('rook', 'black', 7, 7);

        // Black pawns
        for (let x = 0; x < 8; x++) {
            this.placeInitialPiece('pawn', 'black', x, 6);
        }
    }

    private placeInitialPiece(type: string, color: 'white' | 'black', x: number, z: number) {
        const model = this.pieceModels.get(`${color}_${type}`);
        if (!model) throw new Error(`Missing model for ${color}_${type}`);
        
        const piece = new ChessPiece(
            type,
            color === 'black',
            x,
            z,
            model.clone()
        );
        
        // Calculate proper board position
        const boardCenter = (BOARD_CONFIG.SIZE * BOARD_CONFIG.SQUARE_SIZE) / 2;
        piece.position.set(
            x * BOARD_CONFIG.SQUARE_SIZE - boardCenter + BOARD_CONFIG.SQUARE_SIZE/2,
            0,
            z * BOARD_CONFIG.SQUARE_SIZE - boardCenter + BOARD_CONFIG.SQUARE_SIZE/2
        );
        
        this.scene.add(piece);
        this.pieces.push(piece);
    }
}

import * as THREE from 'three';
import { Player } from './player';

export type PieceColor = 'white' | 'black';
export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

export interface PieceData {
    type: PieceType;
    color: PieceColor;
    gridX: number;
    gridZ: number;
}

export class GameEntity extends THREE.Object3D {
    constructor(
        public readonly color: PieceColor,
        public gridX: number,
        public gridZ: number,
        public owner: Player
    ) {
        super();
    }

    getValidMoves(_boardState: (GameEntity | null)[][]): [number, number][] {
        return [];
    }

    getPosition(): [number, number] {
        return [this.gridX, this.gridZ];
    }
}

export class ChessPiece extends GameEntity {
    public readonly model: THREE.Group | null = null;
    public readonly pieceType: PieceType;

    constructor(
        public readonly type: PieceType,
        color: PieceColor,
        gridX: number,
        gridZ: number,
        owner: Player,
        model?: THREE.Group
    ) {
        super(color, gridX, gridZ, owner);
        this.pieceType = type;
        if (model) {
            this.model = model.clone();
            this.add(this.model);
        }
    }

    public getOwner(): Player {
        return this.owner;
    }
}

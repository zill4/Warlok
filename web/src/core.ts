import * as THREE from 'three';

export interface PieceData {
    type: string;
    color: 'white' | 'black';
    gridX: number;
    gridZ: number;
}

export class GameEntity extends THREE.Object3D {
    constructor(
        public isBlack: boolean,
        public gridX: number,
        public gridZ: number
    ) {
        super();
    }

    getValidMoves(_boardState: (GameEntity | null)[][]): [number, number][] {
        return [];
    }
}

export class ChessPiece extends GameEntity {
    public readonly mesh: THREE.Object3D;

    constructor(
        public readonly type: string,
        isBlack: boolean,
        gridX: number,
        gridZ: number,
        model: THREE.Object3D
    ) {
        super(isBlack, gridX, gridZ);
        this.mesh = model.clone();
        this.add(this.mesh);
    }

    getValidMoves(_boardState: (GameEntity | null)[][]): [number, number][] {
        // Implementation from Python logic here
        return [];
    }
}

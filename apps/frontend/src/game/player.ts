export type PlayerType = 'human' | 'computer';
export type PlayerColor = 'white' | 'black';

export class Player {
    constructor(
        public readonly id: string,
        public readonly type: PlayerType,
        public readonly color: PlayerColor
    ) {}

    public isComputer(): boolean {
        return this.type === 'computer';
    }

    public isHuman(): boolean {
        return this.type === 'human';
    }
} 
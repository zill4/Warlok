export class GameState {
    constructor() {
        this.board = Array(8).fill().map(() => Array(8).fill(null));
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
    }
    
    // Add game state methods similar to our Python implementation
}

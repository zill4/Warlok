export interface CardData {
    name: string;
    chessPieceType: string;
    pokerCardSymbol: 'Clubs' | 'Diamonds' | 'Spades' | 'Hearts';
    pokerCardType: 'Joker' | 'Ace' | '3' | '10' | string;
    cardType: 'Dragon' | 'Fiend' | 'Fairy' | string;
    description: string;
    effect: string;
    image?: File | string;
  }
  
  export interface HistoryEntry {
    type: string;
    from: string;
    to: string;
    pieceType?: string;
    color: 'white' | 'black';
    captured?: string;
    timestamp: number;
  }
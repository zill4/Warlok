export interface CardData {
    name: string;
    chessPieceType: string;
    pokerCardSymbol: 'Clubs' | 'Diamonds' | 'Spades' | 'Hearts';
    pokerCardType: 'Joker' | 'Ace' | '3' | '10' | string; // Expand as needed
    cardType: 'Dragon' | 'Fiend' | 'Fairy' | string; // Expand as needed
    description: string;
    effect: string;
    image?: File | string; // Added optional image field (File or URL)  }
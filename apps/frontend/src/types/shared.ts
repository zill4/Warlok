export interface CardData {
    name: string;
    chessPieceType: string;
    pokerCardSymbol: 'Clubs' | 'Diamonds' | 'Spades' | 'Hearts';
    pokerCardType: 'Joker' | 'Ace' | '3' | '10' | string; // Expand as needed
    cardType: 'Dragon' | 'Fiend' | 'Fairy' | string; // Expand as needed
    description: string;
    effect: string;
    image?: File | string; 
    edition?: string;
    creator?: string;  // userId of the creator
    id?: string;
    createdAt?: string;
    ownerWallet?: string;
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

export interface User {
  id: string;
  email: string;
  wallet: string;
  profile?: Profile;
  createdCards?: CardData[];
  createdAt: string;
}


export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthFormData {
  email: string;
  username?: string;
  password: string;
  confirmPassword?: string;
}

export interface UserData {
  id: string;
  email: string;
  wallet: string;
  profile: Profile;
  authTimestamp: number;
}

export interface Profile {
    id: string;
    userId: string;
    username: string;
    bio?: string;
  }
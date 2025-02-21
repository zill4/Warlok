import { signal } from '@preact/signals';
import type { CardData } from '@warlok/shared-types';

export interface CardStore {
  cardData: CardData;
  cardImage: string | null; // Store the actual image data
}

export const cardStore = signal<CardStore>({
  cardData: {
    name: '',
    chessPieceType: '',
    pokerCardSymbol: 'Clubs',
    pokerCardType: 'Ace',
    cardType: 'Dragon',
    description: '',
    effect: '',
    image: ''
  },
  cardImage: null
}); 
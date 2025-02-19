// src/components/CardForm.tsx
import { useState, useEffect } from 'preact/hooks';
import type { CardData } from '../types/card';
import ImageUpload from './ImageUpload';

interface CardFormProps {
  onCardUpdate?: (card: CardData) => void;
}

export default function CardForm({ onCardUpdate }: CardFormProps) {
  const [cardData, setCardData] = useState<CardData>({
    name: '',
    chessPieceType: '',
    pokerCardSymbol: 'Clubs',
    pokerCardType: 'Ace',
    cardType: 'Dragon',
    description: '',
    effect: '',
    image: '',
  });

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const newCardData = { ...cardData, [target.name]: target.value };
    setCardData(newCardData);
    
    // Emit custom event
    const event = new CustomEvent('cardupdate', {
      detail: newCardData,
      bubbles: true
    });
    target.dispatchEvent(event);
    
    // Also call the callback if provided
    if (onCardUpdate) {
      onCardUpdate(newCardData);
    }
  };

  const handleImageUpload = (imageData: string) => {
    const newCardData = { ...cardData, image: imageData };
    setCardData(newCardData);
    
    // Dispatch cardupdate event
    const event = new CustomEvent('cardupdate', {
      detail: newCardData,
      bubbles: true
    });
    document.dispatchEvent(event);
    console.log('Card update event dispatched');
    // Also call the callback if provided
    if (onCardUpdate) {
      onCardUpdate(newCardData);
    }
  };

  return (
    <form class="card-form" onSubmit={(e) => e.preventDefault()}>
      <div class="form-group">
        <label for="name">Card Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={cardData.name}
          onChange={handleInputChange}
        />
      </div>

      <div class="form-group">
        <label for="chessPieceType">Chess Piece Type</label>
        <select
          id="chessPieceType"
          name="chessPieceType"
          value={cardData.chessPieceType}
          onChange={handleInputChange}
        >
          <option value="">Select a piece</option>
          <option value="Pawn">Pawn</option>
          <option value="Knight">Knight</option>
          <option value="Bishop">Bishop</option>
          <option value="Rook">Rook</option>
          <option value="Queen">Queen</option>
          <option value="King">King</option>
        </select>
      </div>

      <div class="form-group">
        <label for="pokerCardSymbol">Card Symbol</label>
        <select
          id="pokerCardSymbol"
          name="pokerCardSymbol"
          value={cardData.pokerCardSymbol}
          onChange={handleInputChange}
        >
          <option value="Clubs">♣ Clubs</option>
          <option value="Diamonds">♦ Diamonds</option>
          <option value="Hearts">♥ Hearts</option>
          <option value="Spades">♠ Spades</option>
        </select>
      </div>

      <div class="form-group">
        <label for="pokerCardType">Card Value</label>
        <select
          id="pokerCardType"
          name="pokerCardType"
          value={cardData.pokerCardType}
          onChange={handleInputChange}
        >
          <option value="Ace">Ace</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
          <option value="Jack">Jack</option>
          <option value="Queen">Queen</option>
          <option value="King">King</option>
          <option value="Joker">Joker</option>
        </select>
      </div>

      <div class="form-group">
        <label for="cardType">Card Type</label>
        <select
          id="cardType"
          name="cardType"
          value={cardData.cardType}
          onChange={handleInputChange}
        >
          <option value="Dragon">Dragon</option>
          <option value="Fiend">Fiend</option>
          <option value="Fairy">Fairy</option>
        </select>
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={cardData.description}
          onChange={handleInputChange}
        />
      </div>

      <div class="form-group">
        <label for="effect">Effect</label>
        <textarea
          id="effect"
          name="effect"
          value={cardData.effect}
          onChange={handleInputChange}
        />
      </div>

      <div class="form-group">
        <label>Card Image</label>
        <ImageUpload onImageUpload={handleImageUpload} />
      </div>
    </form>
  );
}
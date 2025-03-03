// src/components/CardForm.tsx
import { useState, useEffect } from 'preact/hooks';
import type { CardData } from '../types/shared';
import ImageUpload from './ImageUpload';
import { cardStore } from '../store/cardStore';

interface CardFormProps {
  onCardUpdate?: (card: CardData) => void;
  cardPreviewId: string; // Changed from ref to id
}

export default function CardForm({ onCardUpdate, cardPreviewId }: CardFormProps) {
  const [cardData, setCardData] = useState<CardData>(cardStore.value.cardData);

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const newCardData = { ...cardData, [target.name]: target.value };
    setCardData(newCardData);
    
    // Update global store
    cardStore.value = {
      ...cardStore.value,
      cardData: newCardData
    };
    
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

  const captureCardPreview = async (): Promise<string> => {
    const previewElement = document.getElementById(cardPreviewId);
    console.log(previewElement);
    if (!previewElement || !('captureImage' in previewElement)) {
      throw new Error('Card preview not available');
    }

    try {
      // Get the 2D rendered version
      const imageData = await (previewElement as any).captureImage();
      if (!imageData) {
        throw new Error('Failed to capture card preview');
      }
      return imageData;
    } catch (error) {
      console.error('Error capturing card preview:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated');
      }

      if (!cardStore.value.cardImage) {
        throw new Error('Card image not ready');
      }

      const formData = new FormData();
      formData.append('cardData', JSON.stringify({
        ...cardData,
        creatorId: userId
      }));

      // Convert the stored image data to blob
      const response = await fetch(cardStore.value.cardImage);
      const blob = await response.blob();
      formData.append('image', blob, `${cardData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`);

      const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/cards`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create card');
      }

      const newCard = await res.json();
      console.log('Card created:', newCard);
      
      // Reset form and store
      const emptyCard = {
        name: '',
        chessPieceType: '',
        pokerCardSymbol: 'Clubs',
        pokerCardType: 'Ace',
        cardType: 'Dragon',
        description: '',
        effect: '',
        image: ''
      };
      
      setCardData(emptyCard);
      cardStore.value = {
        cardData: emptyCard,
        cardImage: null
      };

    } catch (error) {
      console.error('Error creating card:', error);
      // Handle error (show message to user, etc.)
    }
  };

  return (
    <form 
      class="card-form" 
      autocomplete="off" 
      onSubmit={handleSubmit}
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '12px',
        padding: '20px',
        background: '#1a1a1a',
        borderRadius: '8px',
        height: '100%',
        cursor: 'pointer'
      }}
    >
      {/* Creator section */}
      <div class="creator-section" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '4px'
      }}>
        <span style={{ 
          fontFamily: 'Space Mono', 
          color: '#D9D9D9',
          fontSize: '14px'
        }}>CREATOR:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src="https://pbs.twimg.com/profile_images/1882571472712974336/LBgD5N5R_400x400.jpg"
            alt="Creator avatar"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%'
            }}
          />
          <span style={{ color: '#D9D9D9', fontWeight: 'bold', fontSize: '14px' }}>Zil14</span>
          <span style={{
            background: '#1DA1F2',
            borderRadius: '50%',
            width: '14px',
            height: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '10px'
          }}>✓</span>
          <span style={{ color: '#666666', fontSize: '14px' }}>@__Zil14__</span>
        </div>
      </div>

      {/* Form fields with consistent styling */}
      <style>
        {`
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          
          .form-group label {
            color: #D9D9D9;
            font-family: 'Space Mono';
            font-size: 14px;
            min-width: 90%;
            max-width: 80%;
          }
        .form-group input {
            width: 100%;
            padding: 8px 12px;
            background: #2a2a2a;
            border: none;
            border-radius: 4px;
            color: #D9D9D9;
            font-family: 'Space Mono';
            font-size: 14px;
            min-width: 600px;
            max-width: 600px;
          }
       
          .form-group select,
          .form-group textarea {
            width: 100%;
            padding: 8px 12px;
            background: #2a2a2a;
            border: none;
            border-radius: 4px;
            color: #D9D9D9;
            font-family: 'Space Mono';
            font-size: 14px;
            min-width: 625px;
            max-width: 625px;
          }
          
          .form-group textarea {
            resize: vertical;
            min-height: 80px;
            min-width: 600px;
            max-width: 600px;
          }
        `}
      </style>

      <div class="form-group">
        <label for="name">Card Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={cardData.name}
          onChange={handleInputChange}
          autocomplete="off"
        />
      </div>

      <div class="form-group">
        <label for="chessPieceType">Chess Piece Type</label>
        <select
          id="chessPieceType"
          name="chessPieceType"
          value={cardData.chessPieceType}
          onChange={handleInputChange}
          autocomplete="off"
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
          autocomplete="off"
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
          autocomplete="off"
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
          autocomplete="off"
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
          autocomplete="off"
        />
      </div>

      <div class="form-group">
        <label for="effect">Effect</label>
        <textarea
          id="effect"
          name="effect"
          value={cardData.effect}
          onChange={handleInputChange}
          autocomplete="off"
        />
      </div>

      <div class="form-group">
        <label>Card Image</label>
        <ImageUpload onImageUpload={handleImageUpload} />
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}
import { useState } from 'preact/hooks';
import type { Card } from '../types/card';

interface CardListProps {
  cards: Card[];
}

export default function CardList({ cards }: CardListProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

    const handleNewCardClick = () => {
        window.location.href = '/create-card';
    }

  return (
    <div class="card-list-container">
      <div class="card-list">
        <div class="search-bar">
          <input type="text" placeholder="Search cards..." />
          <button onClick={handleNewCardClick}>+</button>
        </div>
        
        <div class="cards">
          {cards.map((card, index) => (
            <div 
              class={`card-item ${selectedCard?.id === card.id ? 'selected' : ''}`}
              onClick={() => setSelectedCard(card)}
            >
              <span class="index">{String(index).padStart(2, '0')}.</span>
              <span class="name">{card.name}</span>
              <span class="type">{card.type}</span>
            </div>
          ))}
        </div>
      </div>

      <div class="card-preview">
        {selectedCard && (
          <div class="card-details">
            <img src={selectedCard.image} alt={selectedCard.name} class="card-image" />
            <div class="card-info">
              <h2>{selectedCard.name}</h2>
              <p>{selectedCard.type} - {selectedCard.rarity}</p>
              <p class="description">{selectedCard.description}</p>
              <p class="effect">Effect: {selectedCard.effect}</p>
              <p class="creator">Creator: {selectedCard.creator}</p>
            </div>
          </div>
        )}
      </div>

      
    </div>
);
} 
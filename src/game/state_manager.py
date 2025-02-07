from ursina import destroy, DirectionalLight, AmbientLight, scene, color
from constants import PlayerCards

class GameStateManager:
    def __init__(self):
        self.piece_entities = []
        self.card_entities = []
        self.virtual_grid = [[None for _ in range(8)] for _ in range(8)]
        self.selected_piece = None
        self.selected_card = None
        self.card_state = None
        
    def clear_state(self):
        self.piece_entities.clear()
        self.card_entities.clear()
        self.virtual_grid = [[None for _ in range(8)] for _ in range(8)]
        self.selected_piece = None
        self.selected_card = None
        
    def initialize_card_state(self):
        """Initialize card state within the game state manager"""
        self.card_state = CardState()
        self.card_state.game_state = self
        return self.card_state

class CardState:
    def __init__(self):
        self.game_state = None  # Will be set by initialize_card_state
        self.current_player = 'WHITE'
        self.max_hand_size = 7  # Fixed hand size
        self.white_cards = {
            'hand': [],  # List of actual card entities
            'deck': [True] * 40,  # Cards remaining in deck
            'played': []  # Cards that have been used
        }
        self.black_cards = {
            'hand': [],
            'deck': [True] * 40,
            'played': []
        }
        print("Card state initialized")
        
        # Initialize starting hands
        self.deal_initial_hands()
        
    def deal_initial_hands(self):
        """Deal initial hands to both players"""
        # Deal to white player
        self.current_player = 'WHITE'
        for _ in range(5):  # Start with 5 cards
            self.draw_card()
            
        # Deal to black player
        self.current_player = 'BLACK'
        for _ in range(5):  # Start with 5 cards
            self.draw_card()
            
        # Reset to white player's turn
        self.current_player = 'WHITE'
        print("Initial hands dealt")
    
    def switch_turn(self):
        """Switch turns and draw a card for the new player"""
        self.current_player = 'BLACK' if self.current_player == 'WHITE' else 'WHITE'
        # Draw a card for the new player if their hand isn't full
        self.draw_card()
        return self.get_current_player_data()
    
    def get_current_player_data(self):
        return PlayerCards.BLACK if self.current_player == 'BLACK' else PlayerCards.WHITE
    
    def draw_card(self):
        """Draw a card if hand isn't full"""
        cards = self.black_cards if self.current_player == 'BLACK' else self.white_cards
        
        if len(cards['hand']) >= self.max_hand_size:
            print(f"{self.current_player}'s hand is full")
            return False
            
        if not any(cards['deck']):
            print(f"{self.current_player}'s deck is empty")
            return False
            
        for i, card in enumerate(cards['deck']):
            if card:
                cards['deck'][i] = False
                print(f"{self.current_player} drew a card")
                return True
        return False
    
    def remove_card_from_hand(self, card_entity):
        """Remove a card after it's played"""
        cards = self.black_cards if self.current_player == 'BLACK' else self.white_cards
        if card_entity in cards['hand']:
            cards['hand'].remove(card_entity)
            cards['played'].append(card_entity)
            print(f"Card removed from {self.current_player}'s hand")
            return True
        return False 
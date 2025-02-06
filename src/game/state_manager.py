class GameStateManager:
    def __init__(self):
        self.piece_entities = []
        self.card_entities = []
        self.virtual_grid = [[None for _ in range(8)] for _ in range(8)]
        self.selected_piece = None
        self.selected_card = None
        
    def clear_state(self):
        self.piece_entities.clear()
        self.card_entities.clear()
        self.virtual_grid = [[None for _ in range(8)] for _ in range(8)]
        self.selected_piece = None
        self.selected_card = None 
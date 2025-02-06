from ursina import Entity, Vec3, color, destroy, mouse, load_model
from entities.base import GameEntity
from constants import Position, Board, CardUI, PlayerCards, PieceRotation
from models import piece_models
from entities.pieces import piece_classes
from ursina.shaders import basic_lighting_shader


class CardBase(GameEntity):
    def __init__(self, is_black, grid_x, grid_z, symbol):
        super().__init__(is_black, grid_x, grid_z)
        self.symbol = symbol
        self.is_card = True
        self.card_texture = None
        self.piece_type = None  # The type of chess piece this card represents
    
    def get_valid_moves(self, grid):
        """Implement abstract method from GameEntity"""
        # Cards don't move on the board, so return empty list
        return []
        
    def create_piece_entity(self):
        """Factory method to create the corresponding chess piece"""
        if self.piece_type not in piece_classes:
            raise ValueError(f"Invalid piece type: {self.piece_type}")
            
        return piece_classes[self.piece_type](
            is_black=self.is_black,
            grid_x=self.grid_x,
            grid_z=self.grid_z,
            model=load_model(piece_models[self.piece_type]['black' if self.is_black else 'white']),
            scale=piece_models[self.piece_type]['scale'],
            rotation=PieceRotation.BLACK if self.is_black else PieceRotation.WHITE,
            position=(self.grid_x, Position.GROUND_HEIGHT, self.grid_z),
            shader=basic_lighting_shader,
            double_sided=True,
        )

class CardEntity:
    def __init__(self, parent, image, symbol, index, original_position, original_z, is_hovered=False):
        self.parent = parent
        self.image = image
        self.symbol = symbol
        self.index = index
        self.original_position = Vec3(original_position)
        self.original_z = original_z
        self.is_hovered = is_hovered
        self.is_selected = False
        
        # Set initial position and rotation
        self.parent.position = self.original_position
        self.parent.rotation = CardUI.CARD_ROTATION

    def hover(self):
        if not self.is_hovered and not self.is_selected:  # Don't hover if selected
            self.is_hovered = True
            # Convert original_position to Vec3 if it isn't already
            target_pos = Vec3(self.original_position) + Vec3(0, CardUI.HOVER_LIFT, CardUI.HOVER_FORWARD)
            self.parent.animate_position(
                target_pos,
                duration=0.1
            )
            self._adjust_adjacent_cards(True)
    
    def unhover(self):
        if self.is_hovered and not self.is_selected:  # Don't unhover if selected
            self.is_hovered = False
            # Ensure original_position is Vec3
            target_pos = Vec3(self.original_position)
            self.parent.animate_position(
                target_pos,
                duration=0.1
            )
            self._adjust_adjacent_cards(False)
    
    def _adjust_adjacent_cards(self, hovering):
        """Adjust positions of adjacent cards"""
        if not card_entities:
            return
        
        try:
            separation = CardUI.HOVER_SEPARATION if hovering else 0
            
            # Only adjust left card if we're not the first card
            if self.index > 0 and self.index - 1 < len(card_entities):
                left_card = card_entities[self.index - 1]
                left_target = Vec3(left_card.original_position)
                if hovering:
                    left_target += Vec3(-separation, 0, 0)
                left_card.parent.animate_position(left_target, duration=0.1)
            
            # Only adjust right card if we're not the last card
            if self.index < len(card_entities) - 1:
                right_card = card_entities[self.index + 1]
                right_target = Vec3(right_card.original_position)
                if hovering:
                    right_target += Vec3(separation, 0, 0)
                right_card.parent.animate_position(right_target, duration=0.1)
                    
        except Exception as e:
            print(f"Error in _adjust_adjacent_cards: {e}") 
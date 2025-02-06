from abc import ABC, abstractmethod
from ursina import Entity, Vec3, mouse
from constants import Position, PieceColors

class GameEntity(ABC):
    def __init__(self, is_black, grid_x, grid_z):
        self.is_black = is_black
        self.grid_x = grid_x
        self.grid_z = grid_z
        self.original_color = None
        self.valid_moves = []
        self.valid_move_markers = []

    @abstractmethod
    def get_valid_moves(self, grid):
        """Return list of valid moves for this entity"""
        pass

    def highlight(self):
        """Highlight entity when hovered"""
        if self.original_color is None:
            self.original_color = self.color
        self.color = (
            PieceColors.BLACK_HIGHLIGHT if self.is_black 
            else PieceColors.WHITE_HIGHLIGHT
        )

    def reset_color(self):
        """Reset to original color"""
        if self.original_color is not None:
            self.color = self.original_color

    def select(self):
        """Highlight entity when selected"""
        self.color = (
            PieceColors.SELECTED_BLACK if self.is_black 
            else PieceColors.SELECTED_WHITE
        ) 
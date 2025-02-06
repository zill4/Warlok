from ursina import Entity, Vec3, color, destroy, mouse
from entities.base import GameEntity
from constants import Position, Board, PieceColors


class ChessPiece(GameEntity):
    def __init__(self, is_black, grid_x, grid_z, **kwargs):
        super().__init__(is_black, grid_x, grid_z)
        self.original_color = PieceColors.BLACK if is_black else PieceColors.WHITE
        self.color = self.original_color
        self.original_y = Position.GROUND_HEIGHT
    
    def highlight(self):
        """Highlight piece when hovered"""
        if self.is_black:
            self.color = PieceColors.BLACK_HIGHLIGHT
        else:
            self.color = PieceColors.WHITE_HIGHLIGHT
    
    def reset_color(self):
        """Reset piece to original color"""
        self.color = self.original_color
    
    def select(self):
        """Highlight piece when selected"""
        if self.is_black:
            self.color = PieceColors.SELECTED_BLACK
        else:
            self.color = PieceColors.SELECTED_WHITE
    
    def update_visual_position(self):
        """Update the piece's visual position based on grid coordinates"""
        self.position = Vec3(self.grid_x, self.y, self.grid_z)
    
    def show_valid_moves(self, valid_moves):
        """Show markers for valid moves"""
        self.valid_moves = valid_moves
        self.clear_markers()
        
        for x, z in valid_moves:
            marker = Entity(
                model='sphere',
                color=color.rgba(0, 1, 0, 0.5),
                position=(x, Position.MARKER_HEIGHT, z),
                scale=Position.MARKER_SCALE
            )
            self.valid_move_markers.append(marker)
    
    def clear_markers(self):
        """Clear all valid move markers"""
        for marker in self.valid_move_markers:
            destroy(marker)
        self.valid_move_markers.clear()

    def update(self):
        """Handle hover highlighting"""
        if mouse.hovered_entity == self:
            self.highlight()
        else:
            self.reset_color()

class Pawn(ChessPiece):
    def get_valid_moves(self, grid):
        valid = []
        direction = 1 if self.is_black else -1  # Fix direction: white moves up (-z), black moves down (+z)
        new_z = self.grid_z + direction
        
        # Forward move one space
        if 0 <= new_z < Board.SIZE and not grid[new_z][self.grid_x]:
            valid.append((self.grid_x, new_z))
            
            # First move can be two spaces if path is clear
            if (self.is_black and self.grid_z == 1) or (not self.is_black and self.grid_z == 6):  # Starting positions
                two_spaces_z = new_z + direction  # One more space in same direction
                if 0 <= two_spaces_z < Board.SIZE and not grid[two_spaces_z][self.grid_x]:
                    valid.append((self.grid_x, two_spaces_z))
        
        # Captures
        for dx in [-1, 1]:
            new_x = self.grid_x + dx
            if 0 <= new_x < Board.SIZE and 0 <= new_z < Board.SIZE:
                target = grid[new_z][new_x]
                if target and target.is_black != self.is_black:
                    valid.append((new_x, new_z))
        
        return valid

class Rook(ChessPiece):
    def get_valid_moves(self, board_state):
        valid_positions = []
        x, z = int(self.grid_x), int(self.grid_z)
        
        # Horizontal and vertical moves
        for dx, dz in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            curr_x, curr_z = x, z
            while True:
                curr_x, curr_z = curr_x + dx, curr_z + dz
                if not (0 <= curr_x < Board.SIZE and 0 <= curr_z < Board.SIZE):
                    break
                
                target = board_state[curr_z][curr_x]
                valid_positions.append((curr_x, curr_z))
                if target:  # Stop if we hit a piece (after adding the position for capture)
                    break
        
        print(f"Rook at ({x}, {z}) valid moves: {valid_positions}")
        return valid_positions

class Knight(ChessPiece):
    def get_valid_moves(self, board_state):
        valid_positions = []
        x, z = int(self.grid_x), int(self.grid_z)
        
        moves = [
            (1, 2), (2, 1), (2, -1), (1, -2),
            (-1, -2), (-2, -1), (-2, 1), (-1, 2)
        ]
        for dx, dz in moves:
            new_x, new_z = x + dx, z + dz
            if 0 <= new_x < Board.SIZE and 0 <= new_z < Board.SIZE:
                target = board_state[new_z][new_x]
                if not target or target.is_black != self.is_black:
                    valid_positions.append((new_x, new_z))
        
        print(f"Knight at ({x}, {z}) valid moves: {valid_positions}")
        return valid_positions

class Bishop(ChessPiece):
    def get_valid_moves(self, board_state):
        valid_positions = []
        x, z = int(self.grid_x), int(self.grid_z)
        
        # Diagonal moves
        for dx, dz in [(1, 1), (1, -1), (-1, 1), (-1, -1)]:
            curr_x, curr_z = x, z
            while True:
                curr_x, curr_z = curr_x + dx, curr_z + dz
                if not (0 <= curr_x < Board.SIZE and 0 <= curr_z < Board.SIZE):
                    break
                
                target = board_state[curr_z][curr_x]
                valid_positions.append((curr_x, curr_z))
                if target:  # Stop if we hit a piece (after adding the position for capture)
                    break
        
        print(f"Bishop at ({x}, {z}) valid moves: {valid_positions}")
        return valid_positions

class Queen(ChessPiece):
    def get_valid_moves(self, board_state):
        valid_positions = []
        x, z = int(self.grid_x), int(self.grid_z)
        
        # Combine rook and bishop moves
        directions = [
            (0, 1), (0, -1), (1, 0), (-1, 0),  # Rook moves
            (1, 1), (1, -1), (-1, 1), (-1, -1)  # Bishop moves
        ]
        
        for dx, dz in directions:
            curr_x, curr_z = x, z
            while True:
                curr_x, curr_z = curr_x + dx, curr_z + dz
                if not (0 <= curr_x < Board.SIZE and 0 <= curr_z < Board.SIZE):
                    break
                
                target = board_state[curr_z][curr_x]
                valid_positions.append((curr_x, curr_z))
                if target:  # Stop if we hit a piece (after adding the position for capture)
                    break
        
        print(f"Queen at ({x}, {z}) valid moves: {valid_positions}")
        return valid_positions

class King(ChessPiece):
    def get_valid_moves(self, board_state):
        valid_positions = []
        x, z = int(self.grid_x), int(self.grid_z)
        
        # All adjacent squares
        directions = [
            (0, 1), (0, -1), (1, 0), (-1, 0),  # Orthogonal
            (1, 1), (1, -1), (-1, 1), (-1, -1)  # Diagonal
        ]
        
        for dx, dz in directions:
            new_x, new_z = x + dx, z + dz
            if 0 <= new_x < Board.SIZE and 0 <= new_z < Board.SIZE:
                target = board_state[new_z][new_x]
                if not target or target.is_black != self.is_black:
                    valid_positions.append((new_x, new_z))
        
        print(f"King at ({x}, {z}) valid moves: {valid_positions}")
        return valid_positions

# Define the piece_classes dictionary after all classes are defined
piece_classes = {
    'pawn': Pawn,
    'rook': Rook,
    'knight': Knight,
    'bishop': Bishop,
    'queen': Queen,
    'king': King
} 
from ursina import Entity, Vec3, color, destroy, mouse
from entities.base import GameEntity
from constants import Position, Board, PieceColors
from ursina.shaders import basic_lighting_shader

class ChessPiece(Entity):
    def __init__(self, is_black, grid_x, grid_z, **kwargs):
        # Remove color from kwargs to prevent override
        kwargs.pop('color', None)
        kwargs['collider'] = 'box'  # Add collider for mouse interaction
        kwargs['shader'] = basic_lighting_shader
        kwargs['double_sided'] = True
        super().__init__(**kwargs)
        
        # Initialize GameEntity properties
        self.is_black = is_black
        self.grid_x = grid_x
        self.grid_z = grid_z
        self.valid_moves = []
        
        # Set material properties
        self.texture = None  # Use model's texture
        self.color = color.rgb(0.8, 0.1, 0.1) if is_black else color.white
        self.alpha = 1.0
        
        # Initialize state
        self.original_color = self.color
        self.original_y = Position.GROUND_HEIGHT
        self.is_dragging = False
        self.start_pos = None
        self.hovered = False
        self.selected = False
        
        self.valid_move_markers = []
        self.texture_scale = (1, 1)
    
    def highlight(self):
        if not self.selected:  # Only highlight if not selected
            if self.is_black:
                self.color = color.rgb(1.0, 0.2, 0.2)  # Brighter red
            else:
                self.color = color.rgb(1.2, 1.2, 1.2)  # Slightly brighter white
    
    def reset_color(self):
        if not self.selected:  # Only reset if not selected
            self.color = self.original_color
    
    def select(self):
        self.selected = True
        if self.is_black:
            self.color = color.rgb(1.2, 0.3, 0.3)  # Even brighter red
        else:
            self.color = color.rgb(1.5, 1.5, 1.5)  # Even brighter white
    
    def deselect(self):
        self.selected = False
        self.reset_color()
    
    def start_drag(self):
        self.is_dragging = True
        self.start_pos = self.position
        self.y += 1  # Lift piece when dragging
    
    def end_drag(self):
        self.is_dragging = False
        self.y = self.original_y
    
    def update(self):
        if mouse.hovered_entity == self:
            if not self.hovered:
                self.hovered = True
                self.highlight()
        elif self.hovered:
            self.hovered = False
            self.reset_color()
    
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
        for marker in self.valid_move_moves:
            destroy(marker)
        self.valid_move_markers.clear()

    def get_valid_moves(self, grid):
        """Get valid moves for this piece"""
        return []  # Base class returns no moves

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
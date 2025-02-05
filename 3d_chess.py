from enum import Enum
from ursina import *
from ursina.prefabs.first_person_controller import FirstPersonController
from ursina.shaders import lit_with_shadows_shader, basic_lighting_shader
from random import uniform, randint
import os

app = Ursina()
window.title = '3D Chess'
window.color = color.black  # Set background color to black

# Add this at the top level (right after app = Ursina())
piece_entities = []

# Add at top level
VIRTUAL_GRID = [[None for _ in range(8)] for _ in range(8)]

# Board dimensions
class Board:
    SIZE = 8
    ROWS = range(SIZE)
    COLS = range(SIZE)
    MAX_INDEX = SIZE - 1  # 7 for coordinate conversion
    THICKNESS = 0.1  # Board square height

# Camera constants
class Camera:
    START_HEIGHT = 12         # Lower height for more natural view
    START_DISTANCE = -20     # Closer to board
    START_ROTATION = 30     # Less steep angle (more like sitting at table)
    PIVOT_HEIGHT = 0
    MIN_ROTATION_X = 15
    MAX_ROTATION_X = 89
    ROTATION_SPEED = 4
    MOUSE_SENSITIVITY = 40
    LERP_SPEED = 0.1
    BLACK_ROTATION_Y = 180  # Facing black's side (top of board)
    WHITE_ROTATION_Y = 0    # Facing white's side (bottom of board)
    ROTATION_SMOOTHING = 6

# Piece position constants
class Position:
    GROUND_HEIGHT = 0.2  # Reduced from 0.5 to 0.2 for base piece height
    HOVER_HEIGHT = 0.4   # Reduced from 0.8 to 0.4 for hover effect
    SELECTED_HEIGHT = 0.6  # Reduced from 1.0 to 0.6 for selected pieces
    HOVER_X_THRESHOLD = 0.3
    HOVER_Z_THRESHOLD = 0.1
    MARKER_SCALE = 0.3
    MARKER_HEIGHT = Board.THICKNESS * 1.5  # Reduced multiplier for markers

# Board colors
class BoardColors:
    WHITE = color.white
    BLACK = color.gray
    HOVER = color.green

# Player turns
class Turn(Enum):
    WHITE = "white"
    BLACK = "black"

# Starting rows for pieces
class PieceRows:
    BLACK_BACK = Board.MAX_INDEX
    BLACK_PAWN = Board.MAX_INDEX - 1
    WHITE_PAWN = 1
    WHITE_BACK = 0

# Piece scale factors (original values divided by 4)
class PieceScale:
    PAWN = 0.00375
    ROOK = 0.005
    KNIGHT = 0.0045
    BISHOP = 0.005
    QUEEN = 0.00625
    KING = 0.0075

# Light position
class Light:
    HEIGHT = 2
    DISTANCE = 3
    ROTATION = (45, -45, 45)
    INTENSITY = 1.0

# Board center for camera
class BoardCenter:
    X = (Board.SIZE - 1) / 2  # 3.5
    Z = (Board.SIZE - 1) / 2  # 3.5

# Piece rotation
class PieceRotation:
    WHITE = (0, 0, 0)
    BLACK = (0, 180, 0)

# Add to color constants
class PieceColors:
    WHITE = color.white
    BLACK = color.red  # Current red for black pieces
    WHITE_HIGHLIGHT = color.azure  # Light blue highlight for white
    BLACK_HIGHLIGHT = color.orange  # Orange highlight for black
    SELECTED_WHITE = color.cyan  # For selected white piece
    SELECTED_BLACK = color.yellow  # For selected black piece

# Add to your constants section
class CardUI:
    CARD_WIDTH = 0.1
    CARD_HEIGHT = 0.15
    CARD_SPACING = 0.08  # Reduced from 0.11 to create overlap
    BOTTOM_MARGIN = -0.35
    CARD_TEXTURE = './images/Normal_card.png'
    MAX_CARDS = 8
    # 3D effect constants
    MAX_ROTATION = 3
    STACK_HEIGHT = 0.001
    POSITION_VARIANCE = 0.002
    # Deck appearance constants
    DECK_CARDS = 30          # Increased number of visible cards
    DECK_SPACING = 0.0003    # Tighter spacing between cards
    DECK_SIDE_WIDTH = 0.01
    DECK_EXTRA_SPACING = 0.15  # Additional spacing between hand and deck
    HOVER_LIFT = 0.05       # How high the card lifts on hover
    HOVER_FORWARD = -0.05   # How far forward (towards screen) the card moves
    HOVER_SEPARATION = 0.03 # How far the card separates from others

class PlayerCards:
    WHITE = {
        'dragon_image': './images/blue_eyes_w_dragon.png',
        'deck_color': color.blue,
        'hand': [],
        'deck': [],
        'played': []
    }
    BLACK = {
        'dragon_image': './images/RedEyesBDragon.jpg',
        'deck_color': color.red,
        'hand': [],
        'deck': [],
        'played': []
    }

class CardState:
    def __init__(self):
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
            return None
            
        # Check if there are cards in the deck
        if not any(cards['deck']):
            print(f"{self.current_player}'s deck is empty")
            return None
            
        # Find first available card in deck
        for i, card in enumerate(cards['deck']):
            if card:
                cards['deck'][i] = False  # Remove from deck
                print(f"{self.current_player} drew a card")
                return True  # Signal to create new card in hand
        return None
    
    def remove_card_from_hand(self, card_entity):
        """Remove a card after it's played"""
        cards = self.black_cards if self.current_player == 'BLACK' else self.white_cards
        if card_entity in cards['hand']:
            cards['hand'].remove(card_entity)
            cards['played'].append(card_entity)
            print(f"Card removed from {self.current_player}'s hand")
            return True
        return False

class CardEntity:
    def __init__(self, parent, template, image, symbol, index, original_position, original_z):
        self.parent = parent
        self.template = template
        self.image = image
        self.symbol = symbol
        self.index = index
        self.original_position = original_position
        self.original_z = original_z
        self.is_hovered = False
        self.is_selected = False
        
        def update():
            if self.template.hovered:
                if not self.is_hovered:
                    self.hover()
                # Handle click selection
                if mouse.left and not self.is_selected:
                    self.select_card()
            elif not self.template.hovered and not mouse.left:
                if self.is_hovered:
                    self.unhover()
        
        self.template.update = update
    
    def hover(self):
        if not self.is_hovered and not self.is_selected:  # Don't hover if selected
            self.is_hovered = True
            self.parent.animate_position(
                self.original_position + Vec3(0, CardUI.HOVER_LIFT, CardUI.HOVER_FORWARD),
                duration=0.1
            )
            self._adjust_adjacent_cards(True)
    
    def unhover(self):
        if self.is_hovered and not self.is_selected:  # Don't unhover if selected
            self.is_hovered = False
            self.parent.animate_position(
                self.original_position,
                duration=0.1
            )
            self._adjust_adjacent_cards(False)
    
    def _adjust_adjacent_cards(self, hovering):
        """Adjust positions of adjacent cards, with bounds checking"""
        if not card_entities:  # Add safety check
            return
        
        try:
            separation = CardUI.HOVER_SEPARATION if hovering else 0
            
            # Only adjust left card if we're not the first card and index is valid
            if self.index > 0 and self.index - 1 < len(card_entities):
                try:
                    left_card = card_entities[self.index - 1]
                    left_card.parent.animate_position(
                        left_card.original_position + Vec3(-separation, 0, 0),
                        duration=0.1
                    )
                except Exception as e:
                    print(f"Error adjusting left card: {e}")
            
            # Only adjust right card if we're not the last card and index is valid
            if self.index < len(card_entities) - 1:
                try:
                    right_card = card_entities[self.index + 1]
                    right_card.parent.animate_position(
                        right_card.original_position + Vec3(separation, 0, 0),
                        duration=0.1
                    )
                except Exception as e:
                    print(f"Error adjusting right card: {e}")
                    
        except Exception as e:
            print(f"Error in _adjust_adjacent_cards: {e}")
    
    def select_card(self):
        global selected_card
        self.is_selected = True
        selected_card = self
        # Lift card higher to show it's selected
        self.parent.animate_position(
            self.original_position + Vec3(0, CardUI.HOVER_LIFT * 2, CardUI.HOVER_FORWARD),
            duration=0.1
        )
        print("Card selected")
    
    def get_piece_type_from_symbol(self):
        """Convert the card's chess symbol to a piece type"""
        # Get UV offset to determine which piece it represents
        uv_offset = self.symbol.texture_offset
        
        # Calculate piece index based on UV offset
        piece_index = int(uv_offset.x * ChessSymbols.SPRITE_COUNT)
        
        # Map piece index to piece type
        piece_types = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king']
        if 0 <= piece_index < len(piece_types):
            return piece_types[piece_index]
        
        print(f"Unknown piece type for UV offset: {uv_offset}")
        return None
    
    def place_on_board(self, grid_x, grid_z):
        try:
            # Create a 3D card entity at the board position
            card_3d = Entity(
                model='quad',
                texture=self.template.texture,
                scale=(1, 1.4, 1),
                position=(grid_x, Position.GROUND_HEIGHT + 0.01, grid_z),
                rotation_x=-90,
                double_sided=True,
                shader=lit_with_shadows_shader,
                color=color.rgb(255, 255, 255),
                always_on_top=True
            )
            
            # Add required attributes to prevent crashes in game logic
            card_3d.is_card = True
            card_3d.is_black = False  # Default value
            card_3d.grid_x = grid_x
            card_3d.grid_z = grid_z
            card_3d.valid_moves = []
            card_3d.valid_move_markers = []
            card_3d.highlight = lambda: None  # Empty function
            card_3d.reset_color = lambda: None  # Empty function
            card_3d.select = lambda: None  # Empty function
            card_3d.clear_markers = lambda: None  # Empty function
            
            # Create the dragon image on the card
            dragon_image = Entity(
                parent=card_3d,
                model='quad',
                texture=self.image.texture,
                scale=(0.8, 0.8, 1),
                position=(0, 0.002, 0),
                rotation_x=0,
                double_sided=True,
                shader=lit_with_shadows_shader,
                color=color.rgb(255, 255, 255),
                always_on_top=True
            )
            
            # Create the chess symbol on top
            symbol_3d = Entity(
                parent=card_3d,
                model='quad',
                texture=ChessSymbols.TEXTURE,
                texture_scale=self.symbol.texture_scale,
                texture_offset=self.symbol.texture_offset,
                scale=(0.3, 0.3, 1),
                position=(0, 0.003, 0),
                rotation_x=0,
                double_sided=True,
                shader=lit_with_shadows_shader,
                color=color.rgb(255, 255, 255),
                always_on_top=True
            )
            
            # Remove card from card_entities list before destroying
            if self in card_entities:
                card_entities.remove(self)
            
            # Remove the original card from the hand
            destroy(self.parent)
            
            # Update the game state
            VIRTUAL_GRID[grid_z][grid_x] = card_3d
            
            print(f"Successfully placed card at ({grid_x}, {grid_z})")
            return True
            
        except Exception as e:
            print(f"Error placing card: {e}")
            return False

# First define all piece classes
class ChessPiece(Entity):
    def __init__(self, is_black, grid_x, grid_z, **kwargs):
        super().__init__(**kwargs)
        self.is_black = is_black
        self.grid_x = grid_x
        self.grid_z = grid_z
        self.original_color = PieceColors.BLACK if is_black else PieceColors.WHITE
        self.color = self.original_color
        self.valid_move_markers = []
        self.valid_moves = []
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

# Then define the piece_classes dictionary AFTER all classes are defined
piece_classes = {
    'pawn': Pawn,
    'rook': Rook,
    'knight': Knight,
    'bishop': Bishop,
    'queen': Queen,
    'king': King
}

def create_piece_at_position(piece_type, grid_x, grid_z):
    """Create a new chess piece at the specified grid position"""
    try:
        # Get model path
        model_path = piece_models[piece_type]['black' if z <= PieceRows.WHITE_PAWN else piece_models[piece_type]['white']]
        
        # Verify model file exists
        if not os.path.exists(model_path):
            print(f"Error: Could not find model file at {model_path}")
            return None
            
        # Load model with error handling
        model = load_model(model_path)
        if not model:
            print(f"Error: Failed to load model from {model_path}")
            return None
            
        # Determine piece color based on position
        is_black = grid_z >= Board.SIZE / 2  # Top half of board for black pieces
        
        # Create the piece
        piece = piece_classes[piece_type](
            is_black=is_black,
            grid_x=grid_x,
            grid_z=grid_z,
            model=model,
            scale=piece_models[piece_type]['scale'],
            rotation=PieceRotation.BLACK if is_black else PieceRotation.WHITE,
            position=(grid_x, Position.GROUND_HEIGHT, grid_z),
            shader=basic_lighting_shader,
            double_sided=True,
        )
        
        # Update virtual grid
        VIRTUAL_GRID[grid_z][grid_x] = piece
        piece_entities.append(piece)
        
        print(f"Successfully created {piece_type} at ({grid_x}, {grid_z})")
        return piece
        
    except Exception as e:
        print(f"Error creating piece: {e}")
        return None

class ChessSymbols:
    TEXTURE = './images/chess_symbols.png'
    SPRITE_COUNT = 7
    UV_WIDTH = 1/7  # Each piece takes 1/7 of the width
    UV_HEIGHT = 0.5  # Each row takes half the height
    SYMBOL_SCALE = 0.025  # Made slightly smaller
    
    @staticmethod
    def get_random_symbol_uvs(is_black=False):
        piece_index = randint(0, ChessSymbols.SPRITE_COUNT - 1)
        # Calculate UV coordinates
        u = piece_index * ChessSymbols.UV_WIDTH
        v = 0.5 if not is_black else 0
        return {
            'offset': Vec2(u, v),
            'scale': Vec2(ChessSymbols.UV_WIDTH, ChessSymbols.UV_HEIGHT)
        }

class GameRules:
    def __init__(self, card_state, camera_pivot):
        self.card_state = card_state
        self.camera_pivot = camera_pivot
        self.camera_rotation_x = Camera.START_ROTATION
        self.camera_rotation_y = Camera.WHITE_ROTATION_Y
        self.manual_control = False

    def update_camera(self):
        """Handle both automatic and manual camera rotation"""
        # Automatic rotation based on turn
        if not self.manual_control:
            target_rotation_y = Camera.BLACK_ROTATION_Y if self.card_state.current_player == 'BLACK' else Camera.WHITE_ROTATION_Y
            self.camera_rotation_y = lerp(self.camera_rotation_y, target_rotation_y, time.dt * Camera.ROTATION_SMOOTHING)

        # Manual rotation with right mouse drag
        if mouse.right:
            self.manual_control = True
            self.camera_rotation_x -= mouse.velocity[1] * Camera.MOUSE_SENSITIVITY
            self.camera_rotation_x = clamp(self.camera_rotation_x, Camera.MIN_ROTATION_X, Camera.MAX_ROTATION_X)
            self.camera_rotation_y += mouse.velocity[0] * Camera.MOUSE_SENSITIVITY
        else:
            self.manual_control = False

        # Apply rotation to camera pivot
        self.camera_pivot.rotation = (
            lerp(self.camera_pivot.rotation_x, self.camera_rotation_x, time.dt * Camera.ROTATION_SMOOTHING),
            lerp(self.camera_pivot.rotation_y, self.camera_rotation_y, time.dt * Camera.ROTATION_SMOOTHING),
            0
        )

def start_game():
    global piece_entities, board_entities, selected_card, card_entities
    selected_card = None  # Initialize selected_card as None
    
    # Clear any existing entities from the menu
    for entity in scene.entities:
        destroy(entity)
    
    # Reset piece_entities list
    piece_entities.clear()
    
    # Enable lighting
    DirectionalLight(
        y=Light.HEIGHT,
        z=Light.DISTANCE,
        rotation=Light.ROTATION
    )
    
    # Create an empty entity to handle game state and updates
    game = Entity()
    
    # Chess board setup
    board_entities = []  # Initialize the list
    selected_piece = None
    current_turn = 'white'

    # Create materials for board (for board purposes only)
    board_mat = [color.white, color.gray]

    # Define tint colors for pieces.
    # White pieces will be tinted pure white, and black pieces will be tinted red.
    white_piece_material = color.white
    black_piece_material = color.red

    # Create 3D board
    for z in range(Board.SIZE):
        for x in range(Board.SIZE):
            board = Entity(
                model='cube',
                color=board_mat[(x+z) % 2],
                position=(x, 0.1, z),
                scale=(1, 0.1, 1),
                collider='box'
            )
            board_entities.append(board)

    # Initialize empty piece positions with just kings
    piece_positions = [
        ['', '', '', 'king', '', '', '', ''],  # Black king on e8 (index 4)
        ['']*8,
        ['']*8,
        ['']*8,
        ['']*8,
        ['']*8,
        ['']*8,
        ['', '', '', 'king', '', '', '', '']   # White king on e1 (index 4)
    ]

    # Update piece models configuration.
    # Note: scales are scaled down by 400% compared to your original values.
    piece_models = {
        'pawn': {
            'white': 'models/white_pawn.fbx',
            'black': 'models/black_pawn.fbx',
            'scale': PieceScale.PAWN
        },
        'rook': {
            'white': 'models/white_rook.fbx',
            'black': 'models/black_rook.fbx',
            'scale': PieceScale.ROOK
        },
        'knight': {
            'white': 'models/white_knight.fbx',
            'black': 'models/black_knight.fbx',
            'scale': PieceScale.KNIGHT
        },
        'bishop': {
            'white': 'models/white_bishop.fbx',
            'black': 'models/black_bishop.fbx',
            'scale': PieceScale.BISHOP
        },
        'queen': {
            'white': 'models/white_queen.fbx',
            'black': 'models/black_queen.fbx',
            'scale': PieceScale.QUEEN
        },
        'king': {
            'white': 'models/white_king.fbx',
            'black': 'models/black_king.fbx',
            'scale': PieceScale.KING
        }
    }

    # Modify the piece creation code to use the new classes
    piece_classes = {
        'pawn': Pawn,
        'rook': Rook,
        'knight': Knight,
        'bishop': Bishop,
        'queen': Queen,
        'king': King
    }

    # In your piece creation loop, replace ChessPiece with the appropriate class:
    for z in range(Board.SIZE):
        for x in range(Board.SIZE):
            piece_type = piece_positions[z][x]
            if piece_type:
                PieceClass = piece_classes[piece_type]
                grid_x = x
                grid_z = z  # Don't flip during initialization - keep natural coordinates
                
                # Create piece with correct 3D position
                piece = PieceClass(
                    is_black=(z <= PieceRows.WHITE_PAWN),  # First two rows are black
                    grid_x=grid_x,
                    grid_z=grid_z,
                    model=load_model(piece_models[piece_type]['black'] if z <= PieceRows.WHITE_PAWN else piece_models[piece_type]['white']),
                    scale=piece_models[piece_type]['scale'],
                    rotation=PieceRotation.BLACK if z <= PieceRows.WHITE_PAWN else PieceRotation.WHITE,
                    position=(grid_x, Position.GROUND_HEIGHT, grid_z),
                    shader=basic_lighting_shader,
                    double_sided=True,
                )
                
                # Update virtual grid with correct coordinates
                VIRTUAL_GRID[grid_z][grid_x] = piece
                piece_entities.append(piece)

    # Create card UI and get state before creating GameRules
    card_holder, cards, deck_cards, card_state = create_card_ui()
    
    # Create camera pivot and pass it to GameRules
    camera_pivot = Entity()
    game_rules = GameRules(card_state, camera_pivot)
    
    # Rest of camera setup remains the same
    camera.parent = camera_pivot
    camera_pivot.position = (BoardCenter.X, Camera.PIVOT_HEIGHT, BoardCenter.Z)
    camera.position = (0, Camera.START_HEIGHT, Camera.START_DISTANCE)
    camera.rotation_x = Camera.START_ROTATION

    def game_update():
        game_rules.update_camera()  # Update camera every frame
    
    game.update = game_update

    def on_board_click():
        global selected_card
        if selected_card and mouse.hovered_entity in board_entities:
            board_pos = mouse.hovered_entity.position
            grid_x = int(board_pos.x)
            grid_z = int(board_pos.z)
            print(f"Attempting to place card at ({grid_x}, {grid_z})")
            
            # Place the card on the board
            if selected_card.place_on_board(grid_x, grid_z):
                print("Card placed successfully")
                selected_card = None  # Reset selection
            else:
                print("Failed to place card")
                # Return card to original position if placement failed
                selected_card.parent.animate_position(
                    selected_card.original_position,
                    duration=0.2
                )
                selected_card.is_selected = False
                selected_card = None
    
    def input(key):
        if key == 'left mouse down' and mouse.hovered_entity in board_entities:
            on_board_click()
    
    # Attach input handler to game entity
    game.input = input

def exit_game():
    application.quit()

def create_menu():
    # Create a parent entity for menu items
    menu = Entity(parent=camera.ui)
    
    # Title text
    Text("3D Chess", parent=menu, y=0.3, x=0, origin=(0,0), scale=3)
    
    # Start button
    Button(text="Start Game", 
           parent=menu,
           y=0, 
           x=0,
           scale=(0.3, 0.1),
           color=color.azure,
           highlight_color=color.gray[2],
           pressed_color=color.blue,
           on_click=start_game)
    
    # Exit button
    Button(text="Exit", 
           parent=menu,
           y=-0.15, 
           x=0,
           scale=(0.3, 0.1),
           color=color.red,
           highlight_color=color.gray[2],
           pressed_color=color.red,
           on_click=exit_game)

# Create the main menu when the game starts
create_menu()

def input(key):
    if key == 'k':  # Press K to kill first black piece
        # Add safety check
        if not piece_entities:
            return
            
        for p in piece_entities:
            if p.is_black:
                destroy(p)
                piece_entities.remove(p)
                break

def create_card_ui():
    # Add at start of function
    # Verify required textures exist
    required_textures = [
        CardUI.CARD_TEXTURE,
        PlayerCards.WHITE['dragon_image'],
        PlayerCards.BLACK['dragon_image'],
        ChessSymbols.TEXTURE
    ]
    
    for texture_path in required_textures:
        if not os.path.exists(texture_path):
            print(f"Error: Missing required texture: {texture_path}")
            return None, None, None, None
    
    global card_entities  # Ensure we're modifying the global list
    card_holder = Entity(parent=camera.ui)
    card_state = CardState()
    
    # Clear existing card entities
    card_entities.clear()
    
    total_width = CardUI.CARD_SPACING * (CardUI.MAX_CARDS - 1) + CardUI.CARD_WIDTH
    start_x = -total_width/2
    
    cards = []
    for i in range(CardUI.MAX_CARDS):
        offset_x = uniform(-CardUI.POSITION_VARIANCE, CardUI.POSITION_VARIANCE)
        offset_y = uniform(-CardUI.POSITION_VARIANCE, CardUI.POSITION_VARIANCE)
        base_x = start_x + (i * CardUI.CARD_SPACING)
        base_y = CardUI.BOTTOM_MARGIN
        base_position = Vec3(base_x + offset_x, base_y + offset_y, 0)
        
        # Create parent entity to control all card components
        card_parent = Entity(
            parent=card_holder,
            position=base_position,
            rotation=(0, 0, uniform(-CardUI.MAX_ROTATION, CardUI.MAX_ROTATION))
        )
        
        # Card template (bottom layer)
        card_template = Entity(
            parent=card_parent,
            model='quad',
            texture=CardUI.CARD_TEXTURE,
            scale=(CardUI.CARD_WIDTH, CardUI.CARD_HEIGHT),
            z=-0.3 - (i * CardUI.STACK_HEIGHT),  # Moved back
            collider='box'
        )
        
        # Dragon image (middle layer)
        card_image = Entity(
            parent=card_parent,
            model='quad',
            texture=PlayerCards.WHITE['dragon_image'],
            scale=(CardUI.CARD_WIDTH * 0.85, CardUI.CARD_HEIGHT * 0.5),
            z=-0.2 - (i * CardUI.STACK_HEIGHT)  # Between template and symbol
        )
        
        # Symbol (top layer)
        uvs = ChessSymbols.get_random_symbol_uvs(False)
        symbol = Entity(
            parent=card_parent,
            model='quad',
            texture=ChessSymbols.TEXTURE,
            scale=(ChessSymbols.SYMBOL_SCALE, ChessSymbols.SYMBOL_SCALE),
            position=(
                CardUI.CARD_WIDTH/2 - ChessSymbols.SYMBOL_SCALE * 0.8,
                CardUI.CARD_HEIGHT/2 - ChessSymbols.SYMBOL_SCALE * 0.8,
                -0.5 - (i * CardUI.STACK_HEIGHT)  # Closest to camera
            ),
            z=-0.5 - (i * CardUI.STACK_HEIGHT),
            texture_scale=uvs['scale'],
            texture_offset=uvs['offset']
        )
        
        card_entity = CardEntity(
            card_parent,
            card_template,
            card_image,
            symbol,
            i,
            base_position,
            -0.1 - (i * CardUI.STACK_HEIGHT)
        )
        card_entities.append(card_entity)
        cards.append((card_template, card_image, symbol))

    # Create enhanced 3D deck
    deck_cards = []
    base_x = start_x + (CardUI.MAX_CARDS * CardUI.CARD_SPACING) + CardUI.DECK_EXTRA_SPACING
    
    # Create main deck cards with progressive offset
    for i in range(CardUI.DECK_CARDS):
        x_offset = uniform(-0.0005, 0.0005) * i  # Progressive variance
        y_offset = uniform(-0.0005, 0.0005) * i
        z_rotation = uniform(-0.5, 0.5)  # Slight random rotation
        
        deck_card = Entity(
            parent=card_holder,
            model='quad',
            color=PlayerCards.WHITE['deck_color'],
            scale=(CardUI.CARD_WIDTH, CardUI.CARD_HEIGHT),
            position=(
                base_x + x_offset,
                CardUI.BOTTOM_MARGIN + (i * CardUI.DECK_SPACING) + y_offset
            ),
            rotation=(0, 0, z_rotation),
            z=-0.1 - (i * CardUI.STACK_HEIGHT)
        )
        deck_cards.append(deck_card)
    
    # Add side edges for 3D effect
    edge_color = color.rgb(
        PlayerCards.WHITE['deck_color'].r * 0.7,
        PlayerCards.WHITE['deck_color'].g * 0.7,
        PlayerCards.WHITE['deck_color'].b * 0.7
    )
    
    # Right edge
    right_edge = Entity(
        parent=card_holder,
        model='quad',
        color=edge_color,
        scale=(CardUI.DECK_SPACING * CardUI.DECK_CARDS, CardUI.CARD_HEIGHT),
        position=(base_x + CardUI.CARD_WIDTH/2, CardUI.BOTTOM_MARGIN + (CardUI.DECK_CARDS * CardUI.DECK_SPACING)/2),
        rotation=(0, 90, 0),
        z=-0.1 - (CardUI.DECK_CARDS * CardUI.STACK_HEIGHT)/2
    )
    deck_cards.append(right_edge)
    
    # Bottom edge
    bottom_edge = Entity(
        parent=card_holder,
        model='quad',
        color=edge_color,
        scale=(CardUI.CARD_WIDTH, CardUI.DECK_SPACING * CardUI.DECK_CARDS),
        position=(base_x, CardUI.BOTTOM_MARGIN - CardUI.CARD_HEIGHT/2),
        rotation=(90, 0, 0),
        z=-0.1 - (CardUI.DECK_CARDS * CardUI.STACK_HEIGHT)/2
    )
    deck_cards.append(bottom_edge)
    
    # Create update function for this specific UI
    def update_cards():
        if mouse.hovered_entity:
            for card_entity in card_entities:
                if mouse.hovered_entity in (card_entity.template, card_entity.image):
                    card_entity.hover()
                else:
                    card_entity.unhover()
    
    # Add the update function to the card holder
    card_holder.update = update_cards
    
    # Verify texture loading
    if not os.path.exists(ChessSymbols.TEXTURE):
        print(f"Error: Could not find texture file at {ChessSymbols.TEXTURE}")
        return
    
    return card_holder, cards, deck_cards, card_state

def update_cards_for_turn(cards, deck_cards, card_state):
    """Update card images and deck color based on turn"""
    player_data = card_state.get_current_player_data()
    is_black_turn = player_data == PlayerCards.BLACK
    
    # Update all card images and symbols
    for _, card_image, symbol in cards:
        card_image.texture = player_data['dragon_image']
        # Update symbol UVs for current turn
        uvs = ChessSymbols.get_random_symbol_uvs(is_black_turn)
        symbol.texture_scale = uvs['scale']
        symbol.texture_offset = uvs['offset']
    
    # Update deck appearance
    base_color = player_data['deck_color']
    for deck_card in deck_cards:
        deck_card.color = base_color

# Make card_entities global so it can be accessed by CardEntity methods
card_entities = []

app.run() 
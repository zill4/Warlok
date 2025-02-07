from ursina import color, Vec3
from random import choice, randint

class Board:
    SIZE = 8
    ROWS = range(SIZE)
    COLS = range(SIZE)
    MAX_INDEX = SIZE - 1  # 7 for coordinate conversion
    THICKNESS = 0.1  # Board square height

    # Define starting positions for all pieces
    PIECE_POSITIONS = [
        ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],  # Black back row
        ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],          # Black pawns
        [None] * 8,
        [None] * 8,
        [None] * 8,
        [None] * 8,
        ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],          # White pawns
        ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],  # White back row
    ]

class Camera:
    PIVOT_HEIGHT = 8        # Lowered significantly
    START_HEIGHT = -5     # Reset to ground level
    START_DISTANCE = -20   # Brought much closer
    START_ROTATION = 35     # More natural viewing angle
    WHITE_ROTATION_Y = 180
    BLACK_ROTATION_Y = 0
    ROTATION_SMOOTHING = 8
    MOUSE_SENSITIVITY = 40
    MIN_ROTATION_X = 15
    MAX_ROTATION_X = 70
    MOVE_SPEED = 20
    FOV = 60               # Wider field of view

class Position:
    GROUND_HEIGHT = 0
    HOVER_HEIGHT = 0.4
    SELECTED_HEIGHT = 0.6
    HOVER_X_THRESHOLD = 0.3
    HOVER_Z_THRESHOLD = 0.1
    MARKER_SCALE = 0.5
    MARKER_HEIGHT = 0.1

class BoardColors:
    WHITE = color.white
    BLACK = color.gray
    HOVER = color.green

class PieceColors:
    WHITE = color.rgb(255, 255, 255)
    BLACK = color.rgb(50, 50, 50)
    WHITE_HIGHLIGHT = color.rgb(200, 255, 200)
    BLACK_HIGHLIGHT = color.rgb(50, 150, 50)
    SELECTED_WHITE = color.rgb(150, 255, 150)
    SELECTED_BLACK = color.rgb(0, 200, 0)

class CardUI:
    # Keep current card size
    CARD_WIDTH = 0.08
    CARD_HEIGHT = 0.12
    CARD_SPACING = 0.085
    BOTTOM_MARGIN = -0.42
    HORIZONTAL_OFFSET = 0
    Z_POSITION = 0
    CARD_TEXTURE = 'assets/images/Normal_card.png'
    MAX_CARDS = 8
    HOVER_LIFT = 0.05
    HOVER_FORWARD = -0.05
    HOVER_SEPARATION = 0.03
    CARD_ROTATION = (0, 0, 0)
    
    # Larger size and more to the right
    SYMBOL_SCALE = 0.08      # Increased size
    SYMBOL_X_OFFSET = 0.35   # More to the right
    SYMBOL_Y_OFFSET = 0.4    # Keep same height
    SYMBOL_Z_OFFSET = -0.2   

    # Z-ordering for card layers
    BASE_Z = 0
    OVERLAY_Z = -0.1
    SYMBOL_Z = -0.2

    # Card hover and selection effects
    MAX_ROTATION = 3        # Maximum random rotation for cards in hand
    POSITION_VARIANCE = 0.002  # Random position variance for natural look
    STACK_HEIGHT = 0.001    # Z-offset between cards

class Light:
    HEIGHT = 15            # Higher light position
    DISTANCE = 10          # Greater light distance
    ROTATION = (45, -45, 0)  # Simplified rotation
    INTENSITY = 2.0        # Increased brightness

class BoardCenter:
    X = 3.5                # Explicit center value
    Y = 0                  # Ground level
    Z = 3.5                # Explicit center value

class PieceRotation:
    WHITE = (0, 180, 0)
    BLACK = (0, 0, 0)

class InitialSetup:
    WHITE_KING_POS = (4, 0)  # e1
    BLACK_KING_POS = (4, 7)  # e8
    # Define starting positions for all pieces
    PIECE_POSITIONS = [
        ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],  # Black back row
        ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],          # Black pawns
        [None] * 8,
        [None] * 8,
        [None] * 8,
        [None] * 8,
        ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],          # White pawns
        ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],  # White back row
    ]

class ChessSymbols:
    TEXTURE = 'assets/images/chess_symbols.png'
    SYMBOLS_PER_ROW = 6
    SYMBOL_WIDTH = 1/6
    SYMBOL_HEIGHT = 0.5
    
    @staticmethod
    def get_symbol_uvs(piece_type, is_black):
        """Get UV coordinates for a specific chess symbol"""
        positions = {
            'pawn': 0,
            'rook': 1,
            'knight': 2,
            'bishop': 3,
            'queen': 4,
            'king': 5
        }
        
        x_offset = positions[piece_type] / ChessSymbols.SYMBOLS_PER_ROW
        y_offset = 0.5 if is_black else 0.0
        
        return {
            'scale': (1/ChessSymbols.SYMBOLS_PER_ROW, 0.5),
            'offset': (x_offset, y_offset)
        }
    @staticmethod
    def get_random_symbol_uvs(is_black):
        """Get UV coordinates for a random chess symbol"""
        col = randint(0, ChessSymbols.SYMBOLS_PER_ROW - 1)
        
        x_offset = col / ChessSymbols.SYMBOLS_PER_ROW   
        y_offset = 0.5 if is_black else 0.0
        
        return {
            'scale': (1/ChessSymbols.SYMBOLS_PER_ROW, 0.5),
            'offset': (x_offset, y_offset)
        }  
    
    

class PieceScale:
    PAWN = 0.00375
    ROOK = 0.005
    KNIGHT = 0.0045
    BISHOP = 0.005
    QUEEN = 0.00625
    KING = 0.0075

class PlayerCards:
    WHITE = {
        'dragon_image': 'assets/images/blue_eyes_w_dragon.png',
        'deck_color': color.blue,
        'hand': [],
        'deck': [],
        'played': []
    }
    BLACK = {
        'dragon_image': 'assets/images/RedEyesBDragon.jpg',
        'deck_color': color.red,
        'hand': [],
        'deck': [],
        'played': []
    } 
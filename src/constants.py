from ursina import color, Vec3
from random import choice

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
    CARD_HEIGHT = 0.15
    CARD_WIDTH = 0.1
    CARD_SPACING = 0.12
    BOTTOM_MARGIN = -0.45    # Lower position
    HORIZONTAL_OFFSET = 0    # Center cards
    CARD_TEXTURE = './src/assets/images/Normal_card.png'
    MAX_CARDS = 8
    HOVER_LIFT = 0.05
    HOVER_SEPARATION = 0.03
    STACK_HEIGHT = 0.001
    Z_POSITION = 0.1
    CARD_ROTATION = (0, 0, 0)

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
    TEXTURE = './src/assets/images/chess_symbols.png'
    SPRITE_WIDTH = 1280
    SPRITE_HEIGHT = 388
    SYMBOLS_PER_ROW = 6
    SYMBOLS_PER_COL = 2
    SYMBOL_WIDTH = 1/6
    SYMBOL_HEIGHT = 1/2
    
    @staticmethod
    def get_random_symbol_uvs(is_black):
        """Get UV coordinates for a random chess symbol"""
        # Define UV coordinates for each symbol in the texture atlas
        symbols = {
            'pawn': {'white': (0, 0), 'black': (0, 0.5)},
            'rook': {'white': (0.2, 0), 'black': (0.2, 0.5)},
            'knight': {'white': (0.4, 0), 'black': (0.4, 0.5)},
            'bishop': {'white': (0.6, 0), 'black': (0.6, 0.5)},
            'queen': {'white': (0.8, 0), 'black': (0.8, 0.5)},
            'king': {'white': (1.0, 0), 'black': (1.0, 0.5)}
        }
        
        # Select a random piece type
        piece_type = choice(list(symbols.keys()))
        color = 'black' if is_black else 'white'
        
        # Get the UV coordinates for the selected piece
        uv_pos = symbols[piece_type][color]
        
        return {
            'scale': (0.2, 0.5),  # Each symbol takes up 1/5 width, 1/2 height of texture
            'offset': uv_pos
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
        'dragon_image': './src/assets/images/blue_eyes_w_dragon.png',  # Updated path
        'deck_color': color.blue,
        'hand': [],
        'deck': [],
        'played': []
    }
    BLACK = {
        'dragon_image': './src/assets/images/RedEyesBDragon.jpg',  # Updated path
        'deck_color': color.red,
        'hand': [],
        'deck': [],
        'played': []
    } 
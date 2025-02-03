from enum import Enum
from ursina import *
from ursina.prefabs.first_person_controller import FirstPersonController
from ursina.shaders import lit_with_shadows_shader, basic_lighting_shader

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
    BLACK_ROTATION_Y = 0
    WHITE_ROTATION_Y = 180
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
    CARD_SPACING = 0.11
    BOTTOM_MARGIN = -0.35
    CARD_TEXTURE = './images/Normal_card.png'
    MAX_CARDS = 8

class PlayerCards:
    WHITE = {
        'dragon_image': './images/blue_eyes_w_dragon.png',
        'deck_color': color.blue
    }
    BLACK = {
        'dragon_image': './images/RedEyesBDragon.jpg',
        'deck_color': color.red
    }

def start_game():
    global piece_entities
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
    board_entities = []
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

    # Initialize piece positions (using standard chess layout)
    piece_positions = [
        ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
        ['pawn']*8,
        ['']*8,
        ['']*8,
        ['']*8,
        ['']*8,
        ['pawn']*8,
        ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
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

    # Add these class definitions before the start_game function
    class ChessPiece(Entity):
        def __init__(self, is_black, grid_x, grid_z, **kwargs):
            super().__init__(**kwargs)
            self.is_black = is_black
            self.grid_x = grid_x
            self.grid_z = grid_z
            self.original_color = PieceColors.BLACK if is_black else PieceColors.WHITE
            self.color = self.original_color
            self.valid_move_markers = []
            self.valid_moves = []  # Store valid moves here
            self.original_y = Position.GROUND_HEIGHT

        def highlight(self):
            """Highlight piece on hover"""
            self.color = PieceColors.BLACK_HIGHLIGHT if self.is_black else PieceColors.WHITE_HIGHLIGHT
        
        def select(self):
            """Highlight piece when selected"""
            self.color = PieceColors.SELECTED_BLACK if self.is_black else PieceColors.SELECTED_WHITE
        
        def reset_color(self):
            """Reset to original color"""
            self.color = self.original_color

        def get_valid_moves(self, board_state):
            raise NotImplementedError("Each piece must implement its own movement rules")

        def can_capture(self, target_piece):
            return target_piece.is_black != self.is_black

        def show_valid_moves(self, valid_positions):
            """Show and store valid moves"""
            self.valid_moves = valid_positions  # Store the valid moves
            self.reset_color()
            # Clear old markers
            for marker in self.valid_move_markers:
                destroy(marker)
            self.valid_move_markers.clear()
            
            # Create new markers
            for x, z in valid_positions:
                marker = Entity(
                    model='sphere',
                    color=BoardColors.HOVER,
                    position=(x, Position.MARKER_HEIGHT, z),
                    scale=Position.MARKER_SCALE,
                    shader=lit_with_shadows_shader,
                    billboard=True
                )
                self.valid_move_markers.append(marker)

        def update_visual_position(self):
            """Correctly converts grid coordinates to world positions"""
            self.position = (
                self.grid_x, 
                self.position.y, 
                self.grid_z  # Direct mapping without flipping
            )

        def clear_markers(self):
            """Clear all valid move markers"""
            for marker in self.valid_move_markers:
                destroy(marker)
            self.valid_move_markers.clear()
            self.valid_moves = []

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

    # Update the camera setup - ensure proper initialization
    camera_pivot = Entity()
    camera.parent = camera_pivot
    camera_pivot.position = (BoardCenter.X, Camera.PIVOT_HEIGHT, BoardCenter.Z)
    camera.position = (0, Camera.START_HEIGHT, Camera.START_DISTANCE)
    camera.rotation_x = Camera.START_ROTATION

    # Add this class before start_game()
    class GameRules:
        def __init__(self):
            self.current_turn = Turn.WHITE
            self.target_rotation = Camera.WHITE_ROTATION_Y
            print(f"\n=== Game Initialization ===")
            print(f"Starting turn: {self.current_turn}")
            self.print_board_state()
            
        def print_board_state(self):
            """Debug print both virtual and visual board states"""
            print("\nVirtual Board State (VIRTUAL_GRID):")
            for z in range(8):
                row = []
                for x in range(8):
                    piece = VIRTUAL_GRID[z][x]
                    if piece:
                        row.append(f"{'B' if piece.is_black else 'W'}{piece.__class__.__name__[0]}")
                    else:
                        row.append('--')
                print(f"Row {z}: {row}")
            
            print("\nVisual Piece Positions:")
            for piece in piece_entities:
                print(f"Piece: {piece.__class__.__name__} "
                      f"Color: {'Black' if piece.is_black else 'White'} "
                      f"Grid: ({piece.grid_x}, {piece.grid_z}) "
                      f"World: ({piece.position.x}, {piece.position.y}, {piece.position.z})")

        def can_move(self, piece):
            """Check if piece color matches current turn"""
            can_move = (self.current_turn == Turn.WHITE and not piece.is_black) or \
                       (self.current_turn == Turn.BLACK and piece.is_black)
            print(f"Move check: {piece.__class__.__name__} at ({piece.grid_x}, {piece.grid_z})")
            print(f"Is black: {piece.is_black}, Current turn: {self.current_turn}, Can move: {can_move}")
            return can_move

        def can_move_to_position(self, piece, target_pos, board_state):
            """Validate if a piece can move to the target position"""
            target_x, target_z = target_pos
            
            # Check if position is within board bounds
            if not (0 <= target_x < Board.SIZE and 0 <= target_z < Board.SIZE):
                print(f"Invalid move: Position ({target_x}, {target_z}) out of bounds")
                return False
            
            # Check if there's a piece at the target position
            target_piece = board_state[target_z][target_x]
            if target_piece:
                can_capture = piece.can_capture(target_piece)
                print(f"Target square occupied, can capture: {can_capture}")
                return can_capture
            
            print(f"Valid move to empty square ({target_x}, {target_z})")
            return True

        def get_valid_moves(self, piece, board_state):
            """Get valid moves considering game state"""
            if not self.can_move(piece):
                print(f"Piece cannot move: wrong turn or invalid piece")
                return []
            
            # Get the basic moves for the piece type
            potential_moves = piece.get_valid_moves(board_state)
            print(f"Potential moves for {piece.__class__.__name__} at ({piece.grid_x}, {piece.grid_z}): {potential_moves}")
            
            # Filter out invalid moves
            valid_moves = []
            for move in potential_moves:
                if self.can_move_to_position(piece, move, board_state):
                    valid_moves.append(move)
            
            print(f"Final filtered valid moves: {valid_moves}")
            return valid_moves

        def switch_turn(self):
            """Switch turns and rotate camera"""
            self.current_turn = Turn.BLACK if self.current_turn == Turn.WHITE else Turn.WHITE
            # Set target rotation based on turn
            self.target_rotation = Camera.BLACK_ROTATION_Y if self.current_turn == Turn.BLACK else Camera.WHITE_ROTATION_Y
            # Update cards for new turn
            update_cards_for_turn(cards, deck, self.current_turn == Turn.BLACK)
            print(f"\n=== Turn Change: Now {self.current_turn.value}'s turn ===\n")

    # Modify ChessActions to use GameRules
    class ChessActions:
        def __init__(self, game_rules):
            self.selected_piece = None
            self.game_rules = game_rules
            self.target_square = None
            self.dragging = False
            self.last_hover_pos = None
            self.mouse_pressed = False  # Add this to track mouse state

        def select_piece(self, piece):
            """Only allow selection of pieces matching current turn"""
            if not held_keys['left mouse'] or self.mouse_pressed:
                return
            
            self.mouse_pressed = True
            
            if piece and self.game_rules.can_move(piece):
                print(f"\n=== Piece Selection ===")
                print(f"Current turn: {self.game_rules.current_turn}")
                print(f"Selected: {piece.__class__.__name__} at ({piece.grid_x}, {piece.grid_z}) - {'Black' if piece.is_black else 'White'}")
                
                self.selected_piece = piece
                self.dragging = True
                piece.y = Position.SELECTED_HEIGHT
                valid_moves = self.game_rules.get_valid_moves(piece, VIRTUAL_GRID)  # Get moves from GameRules
                piece.show_valid_moves(valid_moves)
                print(f"Valid moves: {valid_moves}")

        def release_piece(self):
            """Handle piece release and movement"""
            self.mouse_pressed = False  # Reset mouse state
            
            if self.selected_piece and self.target_square:
                new_x, new_z = self.target_square
                current_x, current_z = self.selected_piece.grid_x, self.selected_piece.grid_z
                
                # Validate the move is in valid_moves
                valid_move = (new_x, new_z) in self.selected_piece.valid_moves
                
                print(f"\n=== Move Attempt ===")
                print(f"From: ({current_x}, {current_z}) To: ({new_x}, {new_z})")
                print(f"Valid move: {valid_move}")
                
                if valid_move:
                    # Check if there's a piece to capture
                    captured_piece = VIRTUAL_GRID[new_z][new_x]
                    if captured_piece:
                        print(f"Capturing piece at ({new_x}, {new_z})")
                        # Remove captured piece from the scene
                        destroy(captured_piece)
                        # Remove from piece_entities list
                        if captured_piece in piece_entities:
                            piece_entities.remove(captured_piece)
                    
                    # Update virtual grid
                    VIRTUAL_GRID[current_z][current_x] = None
                    VIRTUAL_GRID[new_z][new_x] = self.selected_piece
                    
                    # Update piece position
                    self.selected_piece.grid_x = new_x
                    self.selected_piece.grid_z = new_z
                    self.selected_piece.update_visual_position()
                    self.selected_piece.y = Position.GROUND_HEIGHT
                    
                    # Clear markers after successful move
                    self.selected_piece.clear_markers()
                    
                    print(f"Move completed: {self.selected_piece.__class__.__name__} to ({new_x}, {new_z})")
                    self.game_rules.switch_turn()
                else:
                    print(f"Invalid move - returning to ({current_x}, {current_z})")
                    # Return piece to original position
                    self.selected_piece.grid_x = current_x
                    self.selected_piece.grid_z = current_z
                    self.selected_piece.update_visual_position()
                    self.selected_piece.y = Position.GROUND_HEIGHT
                    # Clear markers on invalid move
                    self.selected_piece.clear_markers()

            # Reset selection state
            if self.selected_piece:
                self.selected_piece.reset_color()
            self.selected_piece = None
            self.target_square = None
            self.dragging = False

    # Create game rules and actions manager
    game_rules = GameRules()
    actions = ChessActions(game_rules)

    def game_update():
        nonlocal selected_piece, current_turn
        
        # Add debug output for board state
        if held_keys['shift']:  # Press shift to print board state
            board_state = [[None for _ in range(Board.SIZE)] for _ in range(Board.SIZE)]
            for p in piece_entities:
                x = int(round(p.grid_x))
                z = int(round(p.grid_z))
                if 0 <= x < 8 and 0 <= z < 8:
                    board_state[z][x] = p
            print("Current Board State:")
            for row in board_state:
                print([f"{'B' if p.is_black else 'W'}{p.__class__.__name__[0]}" if p else '--' for p in row])
        
        # Camera rotation with middle mouse button or WASD
        rotation_speed = Camera.ROTATION_SPEED * time.dt
        if held_keys['middle mouse']:
            camera_pivot.rotation_y += mouse.velocity[0] * Camera.MOUSE_SENSITIVITY
            target_rotation_x = min(Camera.MAX_ROTATION_X, 
                                  max(Camera.MIN_ROTATION_X, 
                                      camera.rotation_x - mouse.velocity[1] * Camera.MOUSE_SENSITIVITY))
            camera.rotation_x = lerp(camera.rotation_x, target_rotation_x, Camera.LERP_SPEED)
        else:
            # WASD for rotation
            if held_keys['d']:
                camera_pivot.rotation_y += rotation_speed
            if held_keys['a']:
                camera_pivot.rotation_y -= rotation_speed
            if held_keys['w']:
                target_rotation_x = min(Camera.MAX_ROTATION_X, camera.rotation_x + rotation_speed)
                camera.rotation_x = lerp(camera.rotation_x, target_rotation_x, Camera.LERP_SPEED)
            if held_keys['s']:
                target_rotation_x = max(Camera.MIN_ROTATION_X, camera.rotation_x - rotation_speed)
                camera.rotation_x = lerp(camera.rotation_x, target_rotation_x, Camera.LERP_SPEED)
        
        # Handle piece hovering and selection
        if mouse.hovered_entity and mouse.hovered_entity in board_entities + piece_entities:
            board_x = mouse.hovered_entity.position.x
            board_z = mouse.hovered_entity.position.z
            
            # Find piece under mouse
            hovered_piece = None
            for piece in piece_entities:
                if (abs(piece.position.x - board_x) <= Position.HOVER_X_THRESHOLD and 
                    abs(piece.position.z - board_z) <= Position.HOVER_Z_THRESHOLD):
                    hovered_piece = piece
                    if not actions.dragging and piece != actions.selected_piece:
                        piece.y = Position.HOVER_HEIGHT
                        piece.highlight()
                    break
            
            # Reset non-hovered pieces
            for piece in piece_entities:
                if piece != hovered_piece and piece != actions.selected_piece:
                    piece.y = Position.GROUND_HEIGHT
                    piece.reset_color()

        else:
            # Mouse not over board - reset all non-selected pieces
            for piece in piece_entities:
                if piece != actions.selected_piece:
                    piece.y = Position.GROUND_HEIGHT
                    piece.reset_color()

        if held_keys['shift']:
            print("\nCurrent Valid Moves:")
            if actions.selected_piece:
                print(f"Selected {type(actions.selected_piece).__name__} at ({actions.selected_piece.grid_x}, {actions.selected_piece.grid_z})")
                print("Valid moves:", actions.selected_piece.valid_moves)

        # Piece movement handling
        if mouse.hovered_entity and mouse.hovered_entity in board_entities:
            board_entity = mouse.hovered_entity
            # Convert board position to grid coordinates directly
            target_x = int(board_entity.position.x)
            target_z = int(board_entity.position.z)  # Remove the flip
            
            if held_keys['left mouse']:
                if not actions.selected_piece:
                    piece = VIRTUAL_GRID[target_z][target_x]
                    if piece and actions.game_rules.can_move(piece):
                        actions.select_piece(piece)
                else:
                    # Update both visual and target grid position
                    actions.target_square = (target_x, target_z)
                    actions.selected_piece.position = (
                        board_entity.position.x,
                        Position.SELECTED_HEIGHT,
                        board_entity.position.z
                    )
            elif actions.selected_piece:
                # Release piece and attempt move
                actions.target_square = (target_x, target_z)
                actions.release_piece()

        # Add camera rotation update
        if camera_pivot.rotation_y != game_rules.target_rotation:
            # Calculate shortest rotation direction
            diff = (game_rules.target_rotation - camera_pivot.rotation_y + 180) % 360 - 180
            # Smooth rotation
            camera_pivot.rotation_y += diff * time.dt * Camera.ROTATION_SPEED / Camera.ROTATION_SMOOTHING
            
            # Snap to target if very close
            if abs(diff) < 0.1:
                camera_pivot.rotation_y = game_rules.target_rotation

    # Attach the update function to the game entity
    game.update = game_update

    # Create card UI
    card_holder, cards, deck = create_card_ui()

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
    # Create parent entity for all cards
    card_holder = Entity(parent=camera.ui)
    
    # Calculate total width of displayed cards
    total_width = CardUI.CARD_SPACING * (CardUI.MAX_CARDS - 1) + CardUI.CARD_WIDTH
    start_x = -total_width/2
    
    cards = []
    for i in range(CardUI.MAX_CARDS):
        # Create card image (dragon) first
        card_image = Entity(
            parent=card_holder,
            model='quad',
            texture=PlayerCards.WHITE['dragon_image'],  # Start with Blue Eyes
            scale=(CardUI.CARD_WIDTH * 0.85, CardUI.CARD_HEIGHT * 0.5),
            position=(start_x + (i * CardUI.CARD_SPACING), CardUI.BOTTOM_MARGIN + 0.02),
            z=-0.1
        )
        
        # Card template on top
        card_template = Entity(
            parent=card_holder,
            model='quad',
            texture=CardUI.CARD_TEXTURE,
            scale=(CardUI.CARD_WIDTH, CardUI.CARD_HEIGHT),
            position=(start_x + (i * CardUI.CARD_SPACING), CardUI.BOTTOM_MARGIN),
            z=-0.05
        )
        cards.append((card_template, card_image))
    
    # Add deck with initial color
    deck = Entity(
        parent=card_holder,
        model='quad',
        color=PlayerCards.WHITE['deck_color'],  # Start with blue
        scale=(CardUI.CARD_WIDTH, CardUI.CARD_HEIGHT),
        position=(start_x + (CardUI.MAX_CARDS * CardUI.CARD_SPACING), CardUI.BOTTOM_MARGIN),
        z=-0.1
    )
    
    return card_holder, cards, deck

def update_cards_for_turn(cards, deck, is_black_turn):
    """Update card images and deck color based on turn"""
    player = PlayerCards.BLACK if is_black_turn else PlayerCards.WHITE
    
    # Update all card images
    for _, card_image in cards:
        card_image.texture = player['dragon_image']
    
    # Update deck color
    deck.color = player['deck_color']

app.run() 
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

def start_game():
    global piece_entities
    # Clear any existing entities from the menu
    for entity in scene.entities:
        destroy(entity)
    
    # Reset piece_entities list
    piece_entities.clear()
    
    # Enable lighting
    DirectionalLight(y=2, z=3, rotation=(45, -45, 45))
    
    # Create an empty entity to handle game state and updates
    game = Entity()
    
    # Chess board setup
    BOARD_SIZE = 8
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
    for z in range(BOARD_SIZE):
        for x in range(BOARD_SIZE):
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
            'scale': 0.00375  # 0.015 / 4
        },
        'rook': {
            'white': 'models/white_rook.fbx',
            'black': 'models/black_rook.fbx',
            'scale': 0.005  # 0.02 / 4
        },
        'knight': {
            'white': 'models/white_knight.fbx',
            'black': 'models/black_knight.fbx',
            'scale': 0.0045  # 0.018 / 4
        },
        'bishop': {
            'white': 'models/white_bishop.fbx',
            'black': 'models/white_bishop.fbx',
            'scale': 0.005  # 0.02 / 4
        },
        'queen': {
            'white': 'models/white_queen.fbx',
            'black': 'models/black_queen.fbx',
            'scale': 0.00625  # 0.025 / 4
        },
        'king': {
            'white': 'models/white_king.fbx',
            'black': 'models/black_king.fbx',
            'scale': 0.0075  # 0.03 / 4
        }
    }

    # Add these class definitions before the start_game function
    class ChessPiece(Entity):
        def __init__(self, is_black, grid_x, grid_z, **kwargs):
            super().__init__(**kwargs)
            self.is_black = is_black
            self.grid_x = grid_x
            self.grid_z = grid_z
            self.visual_x = grid_x
            self.visual_z = grid_z
            self.original_color = black_piece_material if is_black else white_piece_material
            self.color = self.original_color
            self.valid_move_markers = []
            self.valid_moves = []
            self.original_y = 0.5

        def reset_color(self):
            self.color = self.original_color
            for marker in self.valid_move_markers:
                destroy(marker)
            self.valid_move_markers.clear()

        def get_valid_moves(self, board_state):
            raise NotImplementedError("Each piece must implement its own movement rules")

        def can_capture(self, target_piece):
            return target_piece.is_black != self.is_black

        def show_valid_moves(self, valid_positions):
            self.reset_color()
            for x, z in valid_positions:
                marker = Entity(
                    model='sphere',
                    color=color.green,
                    position=(x, 0.2, z),  # Match grid coordinates directly
                    scale=0.3,
                    shader=lit_with_shadows_shader,
                    billboard=True
                )
                self.valid_move_markers.append(marker)

        def update_visual_position(self):
            self.position = (self.visual_x, self.position.y, self.visual_z)

    class Pawn(ChessPiece):
        def get_valid_moves(self, grid):
            valid = []
            direction = -1 if self.is_black else 1  # Flipped direction
            new_z = self.grid_z + direction
            
            # Forward move
            if 0 <= new_z < 8 and not grid[new_z][self.grid_x]:
                valid.append((self.grid_x, new_z))
            
            # Captures
            for dx in [-1, 1]:
                if 0 <= self.grid_x + dx < 8 and 0 <= new_z < 8:
                    target = grid[new_z][self.grid_x + dx]
                    if target and target.is_black != self.is_black:
                        valid.append((self.grid_x + dx, new_z))
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
                    if not (0 <= curr_x < 8 and 0 <= curr_z < 8):
                        break
                    valid_positions.append((curr_x, curr_z))
                    if board_state[curr_z][curr_x]:
                        break
            
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
                if 0 <= new_x < 8 and 0 <= new_z < 8:
                    valid_positions.append((new_x, new_z))
            
            return valid_positions

    class Bishop(ChessPiece):
        def get_valid_moves(self, board_state):
            valid_positions = []
            x, z = int(self.grid_x), int(self.grid_z)
            
            for dx, dz in [(1, 1), (1, -1), (-1, 1), (-1, -1)]:
                curr_x, curr_z = x, z
                while True:
                    curr_x, curr_z = curr_x + dx, curr_z + dz
                    if not (0 <= curr_x < 8 and 0 <= curr_z < 8):
                        break
                    valid_positions.append((curr_x, curr_z))
                    if board_state[curr_z][curr_x]:
                        break
            
            return valid_positions

    class Queen(ChessPiece):
        def get_valid_moves(self, board_state):
            valid_positions = []
            x, z = int(self.grid_x), int(self.grid_z)
            
            directions = [
                (0, 1), (0, -1), (1, 0), (-1, 0),
                (1, 1), (1, -1), (-1, 1), (-1, -1)
            ]
            for dx, dz in directions:
                curr_x, curr_z = x, z
                while True:
                    curr_x, curr_z = curr_x + dx, curr_z + dz
                    if not (0 <= curr_x < 8 and 0 <= curr_z < 8):
                        break
                    valid_positions.append((curr_x, curr_z))
                    if board_state[curr_z][curr_x]:
                        break
            
            return valid_positions

    class King(ChessPiece):
        def get_valid_moves(self, board_state):
            valid_positions = []
            x, z = int(self.grid_x), int(self.grid_z)
            
            directions = [
                (0, 1), (0, -1), (1, 0), (-1, 0),
                (1, 1), (1, -1), (-1, 1), (-1, -1)
            ]
            for dx, dz in directions:
                new_x, new_z = x + dx, z + dz
                if 0 <= new_x < 8 and 0 <= new_z < 8:
                    valid_positions.append((new_x, new_z))
            
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
    for z in range(BOARD_SIZE):
        for x in range(BOARD_SIZE):
            piece_type = piece_positions[z][x]
            if piece_type:
                PieceClass = piece_classes[piece_type]
                grid_x = x
                grid_z = 7 - z  # Flip Z-axis to match chess coordinates
                
                # Create piece with correct 3D position
                piece = PieceClass(
                    is_black=(z <= 1),  # First two rows are black
                    grid_x=grid_x,
                    grid_z=grid_z,
                    model=load_model(piece_models[piece_type]['black'] if z <= 1 else piece_models[piece_type]['white']),
                    scale=piece_models[piece_type]['scale'],
                    rotation=(0, 180, 0) if z <= 1 else (0, 0, 0),
                    position=(grid_x, 0.5, grid_z),  # Direct grid-to-3D mapping
                    shader=basic_lighting_shader,
                    double_sided=True,
                )
                
                # Update virtual grid
                VIRTUAL_GRID[grid_z][grid_x] = piece
                piece_entities.append(piece)

    # Update the camera setup
    camera_pivot = Entity()
    camera.parent = camera_pivot
    camera_pivot.position = (3.5, 0, 3.5)
    camera.position = (0, 12, -20)
    camera.rotation_x = 30

    # Add this class before start_game()
    class GameRules:
        def __init__(self):
            self.current_turn = 'white'

        def can_move(self, piece):
            """Check if the piece can move based on current turn"""
            return (piece.is_black and self.current_turn == 'black') or \
                   (not piece.is_black and self.current_turn == 'white')

        def can_move_to_position(self, piece, target_pos, board_state):
            target_x, target_z = target_pos
            
            # Check if position is within board bounds
            if not (0 <= target_x < 8 and 0 <= target_z < 8):
                return False
            
            # Check if there's a piece at the target position
            target_piece = board_state[target_z][target_x]
            if target_piece:
                # Can capture if it's an enemy piece
                return piece.can_capture(target_piece)
            
            return True

        def get_valid_moves(self, piece, board_state):
            # Get the basic moves for the piece type
            potential_moves = piece.get_valid_moves(board_state)
            
            # Filter out invalid moves based on game rules
            valid_moves = []
            for move in potential_moves:
                if self.can_move_to_position(piece, move, board_state):
                    valid_moves.append(move)
                
            return valid_moves

    # Modify ChessActions to use GameRules
    class ChessActions:
        def __init__(self, game_rules):
            self.selected_piece = None
            self.hovered_piece = None
            self.game_rules = game_rules
            self.target_square = None  # Track where we're trying to move

        def hover_piece(self, piece):
            # Reset previous hover if different piece
            if self.hovered_piece and self.hovered_piece != piece:
                self.hovered_piece.color = self.hovered_piece.original_color
            
            # Set new hover
            if piece != self.selected_piece:  # Don't highlight if piece is selected
                self.hovered_piece = piece
                piece.color = color.yellow

        def clear_hover(self):
            if self.hovered_piece and self.hovered_piece != self.selected_piece:
                self.hovered_piece.color = self.hovered_piece.original_color
                self.hovered_piece = None

        def select_piece(self, piece):
            if self.game_rules.can_move(piece):
                self.selected_piece = piece
                piece.y = 1.0  # Lift piece
                piece.valid_moves = self.game_rules.get_valid_moves(piece, VIRTUAL_GRID)
                piece.show_valid_moves(piece.valid_moves)

        def release_piece(self):
            if self.selected_piece and self.target_square:
                new_x, new_z = self.target_square
                # Validate move
                if (new_x, new_z) in self.selected_piece.valid_moves:
                    # Handle capture
                    target_piece = VIRTUAL_GRID[new_z][new_x]
                    if target_piece and target_piece != self.selected_piece:
                        if target_piece in piece_entities:
                            piece_entities.remove(target_piece)
                        destroy(target_piece)
                    
                    # Update grid
                    VIRTUAL_GRID[self.selected_piece.grid_z][self.selected_piece.grid_x] = None
                    VIRTUAL_GRID[new_z][new_x] = self.selected_piece
                    
                    # Update piece position
                    self.selected_piece.grid_x = new_x
                    self.selected_piece.grid_z = new_z
                    self.selected_piece.update_visual_position()
                    
                    # Switch turns
                    self.game_rules.current_turn = 'black' if self.game_rules.current_turn == 'white' else 'white'
                
                self.selected_piece.y = 0.5  # Lower piece
                self.selected_piece.reset_color()
                self.selected_piece = None
                self.target_square = None

    # Create game rules and actions manager
    game_rules = GameRules()
    actions = ChessActions(game_rules)

    def game_update():
        nonlocal selected_piece, current_turn
        
        # Add debug output for board state
        if held_keys['shift']:  # Press shift to print board state
            board_state = [[None for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]
            for p in piece_entities:
                x = int(round(p.grid_x))
                z = int(round(p.grid_z))
                if 0 <= x < 8 and 0 <= z < 8:
                    board_state[z][x] = p
            print("Current Board State:")
            for row in board_state:
                print([f"{'B' if p.is_black else 'W'}{p.__class__.__name__[0]}" if p else '--' for p in row])
        
        # Camera rotation with middle mouse button or WASD
        rotation_speed = 100 * time.dt
        if held_keys['middle mouse']:
            camera_pivot.rotation_y += mouse.velocity[0] * 40
            target_rotation_x = min(85, max(-85, camera.rotation_x - mouse.velocity[1] * 40))
            camera.rotation_x = lerp(camera.rotation_x, target_rotation_x, 0.1)
        else:
            # WASD for rotation
            if held_keys['d']:
                camera_pivot.rotation_y += rotation_speed
            if held_keys['a']:
                camera_pivot.rotation_y -= rotation_speed
            if held_keys['w']:
                target_rotation_x = min(85, camera.rotation_x + rotation_speed)
                camera.rotation_x = lerp(camera.rotation_x, target_rotation_x, 0.1)
            if held_keys['s']:
                target_rotation_x = max(-85, camera.rotation_x - rotation_speed)
                camera.rotation_x = lerp(camera.rotation_x, target_rotation_x, 0.1)
        
        # Handle piece hovering
        if mouse.hovered_entity is not None:
            board_x = mouse.hovered_entity.position.x
            board_z = mouse.hovered_entity.position.z
            for piece in piece_entities:
                if (abs(piece.position.x - board_x) <= 0.3 and 
                    abs(piece.position.z - board_z) <= 0.1):
                    actions.hover_piece(piece)
                    break
            else:  # No piece found
                actions.clear_hover()
        else: 
            actions.clear_hover()
        
        # Piece movement handling
        if mouse.hovered_entity and mouse.hovered_entity in board_entities:
            board_entity = mouse.hovered_entity
            target_x = int(board_entity.position.x)
            target_z = int(board_entity.position.z)
            
            if held_keys['left mouse']:
                if not actions.selected_piece:
                    # Try to select piece
                    piece = VIRTUAL_GRID[target_z][target_x]
                    if piece and game_rules.can_move(piece):
                        actions.select_piece(piece)
                else:
                    # Track potential target square
                    actions.target_square = (target_x, target_z)
            else:
                if actions.selected_piece:
                    # Release piece and attempt move
                    actions.release_piece()

        if held_keys['shift']:
            print("\nCurrent Valid Moves:")
            if actions.selected_piece:
                print(f"Selected {type(actions.selected_piece).__name__} at ({actions.selected_piece.grid_x}, {actions.selected_piece.grid_z})")
                print("Valid moves:", actions.selected_piece.valid_moves)

    # Attach the update function to the game entity
    game.update = game_update

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

app.run() 
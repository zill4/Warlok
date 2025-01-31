from ursina import *
from ursina.prefabs.first_person_controller import FirstPersonController
from ursina.shaders import lit_with_shadows_shader, basic_lighting_shader

app = Ursina()
window.title = '3D Chess'
window.color = color.black  # Set background color to black

# Enable lighting
DirectionalLight(y=2, z=3, rotation=(45, -45, 45))

# Chess board setup
BOARD_SIZE = 8
board_entities = []
piece_entities = []

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
            position=(x, 0, z),
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

# Add this class definition before the piece creation code
class ChessPiece(Entity):
    def __init__(self, piece_type, is_black, position, **kwargs):
        super().__init__(**kwargs)
        self.piece_type = piece_type
        self.is_black = is_black
        self.position = position
        self.original_color = black_piece_material if is_black else white_piece_material
        self.color = self.original_color

    def reset_color(self):
        self.color = self.original_color

# Modify the piece creation code
for z in range(BOARD_SIZE):
    for x in range(BOARD_SIZE):
        piece_type = piece_positions[z][x]
        if piece_type:
            # For black pieces: usually the top side of the board (rows 0 and 1)
            if z <= 1:
                model_path = piece_models[piece_type]['black']
                model_loaded = load_model(model_path)
                x_position = x
                if piece_type == 'bishop':
                    x_position = x - 0.3  # Offset bishop to the left
                
                piece = ChessPiece(
                    piece_type=piece_type,
                    is_black=True,
                    position=(x_position, 0.1, z),
                    model=model_loaded,
                    scale=piece_models[piece_type]['scale'],
                    rotation=(0, 0, 0),
                    shader=basic_lighting_shader,
                    double_sided=True,
                )
                piece_entities.append(piece)
            # For white pieces: typically the bottom side (rows 6 and 7)
            elif z >= 6:
                model_path = piece_models[piece_type]['white']
                model_loaded = load_model(model_path)
                piece = ChessPiece(
                    piece_type=piece_type,
                    is_black=False,
                    position=(x, 0, z),
                    model=model_loaded,
                    scale=piece_models[piece_type]['scale'],
                    rotation=(0, 180, 0),
                    shader=basic_lighting_shader,
                    double_sided=True,
                )
                piece_entities.append(piece)

# Game logic variables
selected_piece = None
current_turn = 'white'

# Update the camera setup
camera_pivot = Entity()
camera.parent = camera_pivot
camera_pivot.position = (3.5, 0, 3.5)  # Center of the board
camera.position = (0, 12, -20)  # Moved camera back further (-15 -> -20)
camera.rotation_x = 30

def update():
    global selected_piece, current_turn
    
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
    
    # Existing piece highlighting and movement code
    for piece in piece_entities:
        if piece.color == color.yellow:  # If piece was highlighted
            piece.reset_color()
    
    # Highlight piece under mouse if any
    if mouse.hovered_entity is not None:
        board_x = mouse.hovered_entity.position.x
        board_z = mouse.hovered_entity.position.z
        for piece in piece_entities:
            if (abs(piece.position.x - board_x) <= 0.3 and 
                abs(piece.position.z - board_z) <= 0.1):
                piece.color = color.yellow  # Highlight color
                break
    
    # Existing movement logic
    if held_keys['left mouse']:
        if mouse.hovered_entity is not None and mouse.hovered_entity in board_entities:
            if not selected_piece:
                board_x = mouse.hovered_entity.position.x
                board_z = mouse.hovered_entity.position.z
                for piece in piece_entities:
                    if (abs(piece.position.x - board_x) <= 0.3 and 
                        abs(piece.position.z - board_z) <= 0.1):
                        selected_piece = piece
                        selected_piece.y += 0.5  # Lift piece for visual feedback
                        break
            else:
                new_x = mouse.hovered_entity.position.x
                new_z = mouse.hovered_entity.position.z
                selected_piece.position = (new_x, selected_piece.y, new_z)
    else:
        if selected_piece:
            selected_piece.y -= 0.5  # Lower piece back to board level
            selected_piece.reset_color()  # Reset to original color based on piece type
            current_turn = 'black' if current_turn == 'white' else 'white'
            selected_piece = None

app.run() 
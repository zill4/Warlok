from ursina import (
    Ursina, window, scene, color, Vec3,
    DirectionalLight, AmbientLight, destroy, Entity  # Add these imports
)
from constants import Light, BoardCenter
from game.state_manager import GameStateManager
from game.rules import GameRules
from game.board import create_board, create_pieces
from game.ui import update_cards_for_turn, create_card_ui, update as ui_update
from game.input_handler import handle_input
from game.menu import create_menu

app = Ursina()
window.title = '3D Chess'
window.color = color.black

# Initialize game state manager and rules globally
game_state = GameStateManager()
game_rules = None

def start_game():
    global game_rules
    print("Starting game...")
    
    # Clear existing entities except menu
    for entity in scene.entities:
        if entity != menu:
            destroy(entity)
    
    game_state.clear_state()
    game_state.initialize_card_state()
    
    # Create a pivot point for the board and pieces
    board_pivot = Entity()
    
    # Single source of lighting setup - attach to scene, not board
    main_light = DirectionalLight(
        parent=scene,  # Important: Parent to scene, not board
        y=Light.HEIGHT,
        z=Light.DISTANCE,
        shadows=True,
        shadow_map_resolution=(2048, 2048)
    )
    main_light.look_at(Vec3(BoardCenter.X, 0, BoardCenter.Z))
    main_light.rotation = Vec3(*Light.ROTATION)
    
    # Add fill light to reduce harsh shadows
    fill_light = DirectionalLight(
        parent=scene,
        y=Light.HEIGHT,
        z=-Light.DISTANCE,  # Opposite direction
        shadows=False  # No shadows for fill light
    )
    fill_light.look_at(Vec3(BoardCenter.X, 0, BoardCenter.Z))
    
    # Setup camera and board
    camera_pivot = Entity()
    game_rules = GameRules(game_state.card_state, camera_pivot)
    game_rules.setup_camera()
    
    # Create game entities - parent to board_pivot
    game_state.board = create_board(parent=board_pivot)
    game_state.pieces = create_pieces(game_state, parent=board_pivot)
    game_state.cards = create_card_ui(game_state)
    
    # Clean up menu
    for child in menu.children:
        destroy(child)
    destroy(menu)
    
    return game_rules, game_state.card_state

def update():
    if game_rules and game_state.card_state:
        game_rules.update_camera()
        if game_state.cards:
            update_cards_for_turn(game_state.card_state)
        ui_update(game_state)

def input(key):
    handle_input(key, game_state)

# Create menu and wait for button click
menu = create_menu(start_game)

# Set the update function
app.update = update

app.run() 
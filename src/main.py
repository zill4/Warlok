from ursina import *
from constants import *
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
    
    # Setup scene lighting
    main_light = DirectionalLight(parent=scene, y=Light.HEIGHT, z=Light.DISTANCE, shadows=True)
    main_light.rotation = Vec3(*Light.ROTATION)
    main_light.intensity = Light.INTENSITY
    AmbientLight(parent=scene, color=color.rgba(100, 100, 100, 0.1))
    
    # Setup camera and board
    camera_pivot = Entity()
    game_rules = GameRules(game_state.card_state, camera_pivot)
    game_rules.setup_camera()
    
    # Create game entities
    game_state.board = create_board()
    game_state.pieces = create_pieces(game_state)
    
    # Create card UI - Pass game_state here
    game_state.cards = create_card_ui(game_state)
    
    # Instead of disabling menu, destroy it
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
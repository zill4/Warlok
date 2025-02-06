from ursina import *
from constants import *
from game.state import CardState
from game.state_manager import GameStateManager
from game.rules import GameRules
from game.board import create_board, create_pieces
from game.ui import update_cards, update_cards_for_turn
from game.input_handler import handle_input
from game.menu import create_menu

app = Ursina()
window.title = '3D Chess'
window.color = color.black

# Initialize game state manager
game_state = GameStateManager()
game_rules = None  # Global reference to game rules

def start_game():
    global game_rules  # Use global reference
    print("Starting game...")  # Debug print
    
    # Clear existing entities except menu
    for entity in scene.entities:
        if entity != menu:
            destroy(entity)
    
    game_state.clear_state()
    
    # Initialize game state
    card_state = CardState()
    
    # Setup scene lighting
    main_light = DirectionalLight(parent=scene, y=Light.HEIGHT, z=Light.DISTANCE, shadows=True)
    main_light.rotation = Vec3(*Light.ROTATION)
    main_light.intensity = Light.INTENSITY
    AmbientLight(parent=scene, color=color.rgba(100, 100, 100, 0.1))
    
    # Setup camera
    camera_pivot = Entity()
    game_rules = GameRules(card_state, camera_pivot)
    game_rules.setup_camera()
    
    print("Creating board and pieces...")  # Debug print
    # Create game entities and store them in game_state
    game_state.board = create_board()
    game_state.pieces = create_pieces(game_state)
    
    # Instead of disabling menu, destroy it
    for child in menu.children:
        destroy(child)
    destroy(menu)
    
    return game_rules, card_state

def update():
    # Make sure game_rules exists before calling update_camera
    if game_rules:
        game_rules.update_camera()
        if hasattr(game_state, 'card_state'):
            update_cards(game_state.card_state)

def input(key):
    handle_input(key, game_state)

# Create menu and wait for button click
menu = create_menu(start_game)

# Set the update function
app.update = update

app.run() 
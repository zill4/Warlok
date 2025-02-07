from ursina import (
    Ursina, window, scene, color, Vec3,
    DirectionalLight, AmbientLight, destroy, Entity, application, mouse
)
from constants import Light, BoardCenter
from game.state_manager import GameStateManager
from game.rules import GameRules
from game.board import create_board, create_pieces
from game.ui import update_cards_for_turn, create_card_ui, update as ui_update
from game.input_handler import handle_input
from game.menu import create_menu
from ursina.shaders import basic_lighting_shader, lit_with_shadows_shader

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
    
    # Main directional light with much lower intensity
    main_light = DirectionalLight(
        parent=scene,
        y=Light.HEIGHT * 2,
        z=Light.DISTANCE,
        shadows=True,
        rotation=(60, -45, 45),
        shadow_map_resolution=(4096, 4096),
        color=color.rgba(1, 1, 1, 0.3)  # Much lower intensity
    )
    main_light.look_at(Vec3(BoardCenter.X, 0, BoardCenter.Z))
    
    # Very minimal ambient light
    AmbientLight(
        parent=scene,
        color=color.rgba(0.1, 0.1, 0.12, 0.1)  # Much darker ambient
    )
    
    # Subtle fill light
    fill_light = DirectionalLight(
        parent=scene,
        y=Light.HEIGHT,
        z=-Light.DISTANCE,
        shadows=False,
        rotation=(-45, 135, -45),
        color=color.rgba(0.2, 0.2, 0.25, 0.1)  # Very subtle fill
    )
    fill_light.look_at(Vec3(BoardCenter.X, 0, BoardCenter.Z))
    
    # Make sure scene has lighting enabled
    scene.light_nodes = [main_light, fill_light]
    
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
    
    if hasattr(game_state, 'piece_entities'):
        for piece in game_state.piece_entities:
            if hasattr(piece, 'update'):
                piece.update()
                
            # Handle piece selection
            if mouse.left and mouse.hovered_entity == piece:
                if not piece.selected:
                    piece.select()
                    game_state.selected_piece = piece
            elif mouse.right and piece.selected:
                piece.deselect()
                game_state.selected_piece = None

def input(key):
    handle_input(key, game_state)

# Create menu and wait for button click
menu = create_menu(start_game)

# Set the update function
application.update = update

app.run() 
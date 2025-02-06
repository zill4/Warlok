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

def start_game():
    # Clear existing entities
    for entity in scene.entities:
        destroy(entity)
    
    game_state.clear_state()
    
    # Initialize game state
    card_state = CardState()
    camera_pivot = Entity()
    game_rules = GameRules(card_state, camera_pivot)
    game_rules.setup_camera()
    
    # Create board and pieces
    board = create_board()
    pieces = create_pieces(game_state)
    
    def update():
        game_rules.update_camera()
        update_cards(card_state)
    
    app.update = update
    
    return game_rules, card_state

def input(key):
    handle_input(key, game_state)

menu = create_menu(start_game)
game_rules, card_state = start_game()
app.run() 
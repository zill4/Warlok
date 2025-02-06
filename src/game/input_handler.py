from ursina import destroy, held_keys, mouse
from constants import Camera

def handle_input(key, game_state):
    """Handle game-specific keyboard inputs"""
    if key == 'k':  # Press K to kill first black piece
        if not game_state.piece_entities:
            return
            
        for p in game_state.piece_entities:
            if p.is_black:
                destroy(p)
                game_state.piece_entities.remove(p)
                break
    # Add other game-specific keyboard inputs here 

    # Camera controls are handled in GameRules.update_camera() 
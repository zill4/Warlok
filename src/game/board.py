from ursina import Entity, load_model, color, Vec3, destroy
from ursina.shaders import basic_lighting_shader
from constants import Board, BoardColors, Position, PieceRotation
from entities.pieces import piece_classes
from models import piece_models

def create_board(parent=None):
    """Create the chess board"""
    board_parent = Entity(parent=parent)
    
    # Create a base under the board with basic lighting
    base = Entity(
        parent=board_parent,
        model='cube',
        scale=(9, 0.5, 9),
        position=(3.5, -0.25, 3.5),
        color=color.dark_gray,
        shader=basic_lighting_shader,
        double_sided=True
    )
    
    # Create the checkered board with colliders
    for row in Board.ROWS:
        for col in Board.COLS:
            is_white = (row + col) % 2 == 0
            square = Entity(
                parent=board_parent,
                model='cube',
                collider='box',
                scale=(1, Board.THICKNESS, 1),
                position=(col, 0, row),
                color=BoardColors.WHITE if is_white else BoardColors.BLACK,
                shader=basic_lighting_shader,
                double_sided=True
            )
            square.is_board_square = True
            square.grid_x = col
            square.grid_z = row
    
    return board_parent

def place_card_on_board(card, grid_x, grid_z, game_state):
    """Place a card and create corresponding piece on the board"""
    try:
        print(f"Placing card on board: {card}")
        print(f"Current player: {game_state.card_state.current_player}")  # Debug current player
        piece = card.card_data.create_piece_entity()
        if piece:
            piece.grid_x = grid_x
            piece.grid_z = grid_z
            piece.position = Vec3(grid_x, Position.GROUND_HEIGHT, grid_z)
            
            game_state.virtual_grid[grid_z][grid_x] = piece
            game_state.piece_entities.append(piece)
            
            # Determine card rotation based on current player
            is_black_turn = game_state.card_state.current_player == 'BLACK'
            card_rotation = (90, 180, 0) if is_black_turn else (90, 0, 0)
            print(f"Is black's turn: {is_black_turn}")  # Debug turn state
            print(f"Card rotation: {card_rotation}")  # Debug rotation
            
            # Create a visual card on the board and store it
            board_card = Entity(
                parent=game_state.board,
                model='quad',
                texture=card.texture,
                scale=(0.8, 0.8),
                position=(grid_x, 0.01, grid_z),
                rotation=card_rotation,  # Apply rotation based on player
                always_on_top=True
            )
            
            if not hasattr(game_state, 'board_cards'):
                game_state.board_cards = []
            game_state.board_cards.append(board_card)
            
            # After placing, switch turns
            game_state.card_state.switch_turn()
            print(f"Turn switched to: {game_state.card_state.current_player}")  # Debug turn switch
            
            return True
            
    except Exception as e:
        print(f"Error placing card: {e}")
        return False

def create_pieces(game_state, parent=None):
    """Create all chess pieces"""
    pieces_parent = Entity(parent=parent)
    
    for row in Board.ROWS:
        for col in Board.COLS:
            piece_type = Board.PIECE_POSITIONS[row][col]
            if piece_type:
                is_black = row < 4
                
                piece = piece_classes[piece_type](
                    parent=pieces_parent,
                    is_black=is_black,
                    grid_x=col,
                    grid_z=row,
                    model=load_model(piece_models[piece_type]['black' if is_black else 'white']),
                    scale=piece_models[piece_type]['scale'],
                    rotation=PieceRotation.BLACK if is_black else PieceRotation.WHITE,
                    position=(col, Position.GROUND_HEIGHT, row),
                    shader=basic_lighting_shader,
                    double_sided=True
                )
                
                game_state.virtual_grid[row][col] = piece
                game_state.piece_entities.append(piece)
    
    return pieces_parent 
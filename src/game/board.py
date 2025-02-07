from ursina import Entity, load_model, color, Vec3, destroy
from ursina.shaders import lit_with_shadows_shader, basic_lighting_shader
from constants import Board, BoardColors, Position, PieceRotation
from entities.pieces import piece_classes
from models import piece_models

def create_board():
    """Create the chess board"""
    board_parent = Entity()
    
    # Create a base under the board
    base = Entity(
        parent=board_parent,
        model='cube',
        scale=(9, 0.5, 9),
        position=(3.5, -0.25, 3.5),  # Center the base under the board
        color=color.dark_gray,
        shader=lit_with_shadows_shader
    )
    
    # Create the checkered board with colliders
    for row in Board.ROWS:
        for col in Board.COLS:
            is_white = (row + col) % 2 == 0
            square = Entity(
                parent=board_parent,
                model='cube',
                collider='box',  # Add collider for mouse interaction
                scale=(1, Board.THICKNESS, 1),
                position=(col, 0, row),
                color=BoardColors.WHITE if is_white else BoardColors.BLACK,
                shader=lit_with_shadows_shader
            )
            # Mark as board square and store grid position
            square.is_board_square = True
            square.grid_x = col
            square.grid_z = row
    
    # Move the entire board to be centered
    board_parent.position = Vec3(0, 0, 0)
    return board_parent

def place_card_on_board(card, grid_x, grid_z, game_state):
    """Place a card and create corresponding piece on the board"""
    try:
        print(f"Placing card on board: {card}")
        # Create the chess piece from card data
        piece = card.card_data.create_piece_entity()
        if piece:
            # Set the piece position
            piece.grid_x = grid_x
            piece.grid_z = grid_z
            piece.position = Vec3(grid_x, Position.GROUND_HEIGHT, grid_z)
            
            # Update the virtual grid
            game_state.virtual_grid[grid_z][grid_x] = piece
            game_state.piece_entities.append(piece)
            
            # Create a visual card on the board and store it
            board_card = Entity(
                parent=game_state.board,  # Parent to the board
                model='quad',
                texture=card.texture,
                scale=(0.8, 0.8),  # Slightly smaller than board square
                position=(grid_x, 0.01, grid_z),  # Slightly above board
                rotation=(90, 0, 0),  # Lay flat on board
                always_on_top=True
            )
            
            # Store the board card in game state
            if not hasattr(game_state, 'board_cards'):
                game_state.board_cards = []
            game_state.board_cards.append(board_card)
            
            return True
            
    except Exception as e:
        print(f"Error placing card: {e}")
        return False

def create_pieces(game_state):
    """Create all chess pieces"""
    pieces_parent = Entity()
    
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
from ursina import Entity, load_model, color, Vec3
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
    
    # Create the checkered board
    for row in Board.ROWS:
        for col in Board.COLS:
            is_white = (row + col) % 2 == 0
            square = Entity(
                parent=board_parent,
                model='cube',
                scale=(1, Board.THICKNESS, 1),
                position=(col, 0, row),
                color=BoardColors.WHITE if is_white else BoardColors.BLACK,
                shader=lit_with_shadows_shader
            )
    
    # Move the entire board to be centered
    board_parent.position = Vec3(0, 0, 0)
    return board_parent

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
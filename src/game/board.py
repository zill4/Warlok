from ursina import Entity, load_model
from ursina.shaders import lit_with_shadows_shader, basic_lighting_shader
from constants import Board, BoardColors, Position, PieceRotation
from entities.pieces import piece_classes
from models import piece_models


def create_board():
    """Create the chess board"""
    board_parent = Entity()
    
    for row in Board.ROWS:
        for col in Board.COLS:
            is_white = (row + col) % 2 == 0
            Entity(
                parent=board_parent,
                model='cube',
                scale=(1, Board.THICKNESS, 1),
                position=(col, 0, row),
                color=BoardColors.WHITE if is_white else BoardColors.BLACK,
                shader=lit_with_shadows_shader
            )
    
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
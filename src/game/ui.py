from ursina import Entity, Vec3, mouse, camera, color, os, Text, Texture, Button, destroy, Vec2
from random import uniform, randint, choice
from constants import CardUI, PlayerCards, BoardCenter, ChessSymbols, Board
from entities import CardBase
from game.board import place_card_on_board
from ursina.shaders import  unlit_shader



# Global variable to store card entities
card_entities = []

def get_random_symbol_uvs(is_black):
    """Get UV coordinates for a random chess symbol"""
    # Random symbol index (0-5 for white pieces, 6-11 for black pieces)
    row = 1 if is_black else 0
    col = randint(0, ChessSymbols.SYMBOLS_PER_ROW - 1)
    
    # Calculate UV coordinates
    u = col * ChessSymbols.SYMBOL_WIDTH
    v = row * ChessSymbols.SYMBOL_HEIGHT
    
    return {
        'scale': (ChessSymbols.SYMBOL_WIDTH, ChessSymbols.SYMBOL_HEIGHT),
        'offset': (u, v)
    }

def create_card_ui(game_state):
    """Create the UI elements for cards"""
    cards_parent = Entity(parent=camera.ui)
    cards = []
    
    piece_types = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king']
    
    for i in range(CardUI.MAX_CARDS):
        random_piece_type = choice(piece_types)
        is_black = game_state.card_state.current_player == 'BLACK'
        card_data = CardBase(is_black, 0, 0)
        card_data.piece_type = random_piece_type
        
        # Use pre-composed texture that includes both dragon and symbol
        card_texture = f'assets/images/chess_pieces/{"black" if is_black else "white"}_{random_piece_type}.png'
        
        # Calculate base position
        base_position = Vec3(
            (i - CardUI.MAX_CARDS/2) * CardUI.CARD_SPACING + CardUI.HORIZONTAL_OFFSET,
            CardUI.BOTTOM_MARGIN,
            CardUI.Z_POSITION
        )
        
        card = Button(
            parent=cards_parent,
            model='quad',
            texture=card_texture,  # Single texture with everything baked in
            scale=(CardUI.CARD_WIDTH, CardUI.CARD_HEIGHT),
            position=base_position,
            rotation=CardUI.CARD_ROTATION,
            z=CardUI.Z_POSITION + (i * CardUI.STACK_HEIGHT),
            color=color.white,
            highlight_color=color.white,
            pressed_color=color.white
        )
        
        # Store original position and data
        card.original_position = base_position
        card.is_selected = False
        card.card_data = card_data
        card.piece_type = random_piece_type
        card.is_destroyed = False
        
        # Normal card overlay
        card_overlay = Entity(
            parent=card,
            model='quad',
            texture=CardUI.CARD_TEXTURE,
            scale=(1, 1),
            position=(0, 0, CardUI.OVERLAY_Z),
            shader=unlit_shader,
            z_bias=-50
        )
        
        # Chess symbol with sprite sheet UV mapping
        symbol_data = ChessSymbols.get_random_symbol_uvs(is_black)
        symbol = Entity(
            parent=card,
            model='quad',
            texture=ChessSymbols.TEXTURE,  # Use the sprite sheet texture
            texture_scale=symbol_data['scale'],  # Set UV scale
            texture_offset=symbol_data['offset'],  # Set UV offset
            position=(CardUI.SYMBOL_X_OFFSET, CardUI.SYMBOL_Y_OFFSET, CardUI.SYMBOL_Z),
            scale=ChessSymbols.SYMBOL_SCALE,
            color=color.white,
            shader=unlit_shader,
            always_on_top=True
        )
        
        # Lock the UV coordinates
        if hasattr(symbol, 'texture'):
            symbol.texture.filtering = None
            symbol.texture.mipmap = True
            # Store the UV data to prevent updates
            symbol._texture_scale = symbol_data['scale']
            symbol._texture_offset = symbol_data['offset']
        
        def on_click(card=card):
            if not hasattr(card, 'is_destroyed') or card.is_destroyed:
                return
                
            print(f"\n=== Camera Debug Info ===")
            print(f"Camera Position: {camera.position}")
            print(f"Camera World Position: {camera.world_position}")
            print(f"Camera Rotation: {camera.rotation}")
            print(f"Camera Parent Position: {camera.parent.position if camera.parent else 'No parent'}")
            print(f"Camera Parent Rotation: {camera.parent.rotation if camera.parent else 'No parent'}")
            print(f"======================\n")
            
            print(f"Card clicked: {card}")
            if not card.is_selected:
                # Deselect other cards
                for other_card, _, _ in game_state.card_entities:
                    if (other_card != card and 
                        hasattr(other_card, 'is_selected') and 
                        other_card.is_selected and 
                        not other_card.is_destroyed):
                        other_card.is_selected = False
                        other_card.animate_position(other_card.original_position, duration=0.1)
                
                card.is_selected = True
                selected_pos = card.original_position + Vec3(0, CardUI.HOVER_LIFT * 2, CardUI.HOVER_FORWARD)
                card.animate_position(selected_pos, duration=0.2)
                print(f"Card selected: {card}")
            else:
                card.is_selected = False
                card.animate_position(card.original_position, duration=0.1)
                print(f"Card deselected: {card}")
        
        # Define hover behavior
        def on_hover(card=card):
            if not hasattr(card, 'is_destroyed') or card.is_destroyed:
                return
            if not card.is_selected:
                hover_pos = card.original_position + Vec3(0, CardUI.HOVER_LIFT, CardUI.HOVER_FORWARD)
                card.animate_position(hover_pos, duration=0.1)
        
        def on_unhover(card=card):
            if not hasattr(card, 'is_destroyed') or card.is_destroyed:
                return
            if not card.is_selected:
                card.animate_position(card.original_position, duration=0.1)
        
        # Bind the events
        card.on_click = on_click
        card.on_mouse_enter = on_hover
        card.on_mouse_exit = on_unhover
        
        # Store card in game state
        game_state.card_entities.append((card, card_overlay, symbol))
        cards.append((card, card_overlay, symbol))
    
    return cards

def create_deck(card_holder, start_x):
    """Create the 3D deck of cards"""
    deck_cards = []
    base_x = start_x + (CardUI.MAX_CARDS * CardUI.CARD_SPACING) + CardUI.DECK_EXTRA_SPACING
    
    # Create main deck cards with progressive offset
    for i in range(CardUI.DECK_CARDS):
        x_offset = uniform(-0.0005, 0.0005) * i  # Progressive variance
        y_offset = uniform(-0.0005, 0.0005) * i
        z_rotation = uniform(-0.5, 0.5)  # Slight random rotation
        
        deck_card = Entity(
            parent=card_holder,
            model='quad',
            color=PlayerCards.WHITE['deck_color'],
            scale=(CardUI.CARD_WIDTH, CardUI.CARD_HEIGHT),
            position=(
                base_x + x_offset,
                CardUI.BOTTOM_MARGIN + (i * CardUI.DECK_SPACING) + y_offset
            ),
            rotation=(0, 0, z_rotation),
            z=-0.1 - (i * CardUI.STACK_HEIGHT)
        )
        deck_cards.append(deck_card)
    
    # Add deck edges
    create_deck_edges(card_holder, base_x, deck_cards)
    
    return deck_cards

def create_deck_edges(card_holder, base_x, deck_cards):
    """Create the 3D edges for the deck"""
    edge_color = color.rgb(
        PlayerCards.WHITE['deck_color'].r * 0.7,
        PlayerCards.WHITE['deck_color'].g * 0.7,
        PlayerCards.WHITE['deck_color'].b * 0.7
    )
    
    # Right edge
    right_edge = Entity(
        parent=card_holder,
        model='quad',
        color=edge_color,
        scale=(CardUI.DECK_SPACING * CardUI.DECK_CARDS, CardUI.CARD_HEIGHT),
        position=(base_x + CardUI.CARD_WIDTH/2, CardUI.BOTTOM_MARGIN + (CardUI.DECK_CARDS * CardUI.DECK_SPACING)/2),
        rotation=(0, 90, 0),
        z=-0.1 - (CardUI.DECK_CARDS * CardUI.STACK_HEIGHT)/2
    )
    deck_cards.append(right_edge)
    
    # Bottom edge
    bottom_edge = Entity(
        parent=card_holder,
        model='quad',
        color=edge_color,
        scale=(CardUI.CARD_WIDTH, CardUI.DECK_SPACING * CardUI.DECK_CARDS),
        position=(base_x, CardUI.BOTTOM_MARGIN - CardUI.CARD_HEIGHT/2),
        rotation=(90, 0, 0),
        z=-0.1 - (CardUI.DECK_CARDS * CardUI.STACK_HEIGHT)/2
    )
    deck_cards.append(bottom_edge)

def update_cards(card_state):
    """Update card positions and appearance"""
    if not card_state:
        return
        
    player_data = card_state.get_current_player_data()
    hand = player_data['hand']
    
    # Update card positions and visibility
    for i, card in enumerate(hand):
        if i < CardUI.MAX_CARDS:
            card.visible = True
            # Calculate new position with hover effect if needed
            base_pos = Vec3(
                (i - len(hand)/2) * CardUI.CARD_SPACING,
                CardUI.BOTTOM_MARGIN,
                CardUI.Z_POSITION
            )
            
            if card.hovered:
                base_pos.y += CardUI.HOVER_LIFT
                base_pos.z -= CardUI.HOVER_SEPARATION
            
            card.position = base_pos
        else:
            card.visible = False

def update_cards_for_turn(card_state):
    """Update card images and deck color based on turn"""
    if not card_state:
        return
        
    player_data = card_state.get_current_player_data()
    
    # Update all card images and symbols
    for card, _, symbol in card_state.game_state.card_entities:
        card.texture = player_data['dragon_image']
        # Update symbol UVs for current turn
        symbol_data = ChessSymbols.get_random_symbol_uvs(player_data == PlayerCards.BLACK)
        symbol.texture_scale = symbol_data['scale']
        symbol.texture_offset = symbol_data['offset']

def update_cards():
    """Update card positions and handle hovering"""
    global card_entities  # Declare we're using the global variable
    
    if not card_entities:  # Check if list exists and has items
        return
        
    for card_entity in card_entities:
        # Check if mouse is hovering over the card's parent entity
        if mouse.hovered_entity == card_entity.parent:
            if not card_entity.is_hovered:
                card_entity.hover()
            # Handle click selection
            if mouse.left and not card_entity.is_selected:
                card_entity.select_card()
        elif not mouse.left:
            if card_entity.is_hovered:
                card_entity.unhover()

def update(game_state):
    """Update function to handle board interaction"""
    if mouse.left and mouse.hovered_entity:
        if hasattr(mouse.hovered_entity, 'is_board_square'):
            selected_card = None
            for card, overlay, symbol in game_state.card_entities:
                if hasattr(card, 'is_selected') and card.is_selected and not card.is_destroyed:
                    selected_card = card
                    break
            
            if selected_card:
                grid_x = mouse.hovered_entity.grid_x
                grid_z = mouse.hovered_entity.grid_z
                print(f"Attempting to place card at: {grid_x}, {grid_z}")
                if place_card_on_board(selected_card, grid_x, grid_z, game_state):
                    game_state.card_entities.remove((selected_card, overlay, symbol))
                    selected_card.is_destroyed = True
                    destroy(selected_card) 
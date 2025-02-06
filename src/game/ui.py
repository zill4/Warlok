from ursina import Entity, Vec3, mouse, camera, color, os, Text, Texture
from random import uniform, randint, choice
from constants import CardUI, PlayerCards, BoardCenter, ChessSymbols
from entities.cards import CardEntity, CardBase


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

def create_card_ui():
    """Create the UI elements for cards"""
    cards_parent = Entity(parent=camera.ui)
    cards = []
    
    # Define available piece types
    piece_types = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king']
    
    for i in range(CardUI.MAX_CARDS):
        # Randomly select a piece type for this card
        random_piece_type = choice(piece_types)
        card_data = CardBase(False, 0, 0)
        card_data.piece_type = random_piece_type  # Assign the random piece type
        is_black = False  # Start with white symbols
        
        # Base card entity (Dragon)
        card = Entity(
            parent=cards_parent,
            model='quad',
            texture=PlayerCards.BLACK['dragon_image'],
            scale=(CardUI.CARD_WIDTH, CardUI.CARD_HEIGHT),
            position=Vec3(
                (i - CardUI.MAX_CARDS/2) * CardUI.CARD_SPACING + CardUI.HORIZONTAL_OFFSET,
                CardUI.BOTTOM_MARGIN,
                CardUI.BASE_Z
            ),
            rotation=CardUI.CARD_ROTATION
        )
        
        # Normal card overlay
        card_overlay = Entity(
            parent=card,
            model='quad',
            texture=CardUI.CARD_TEXTURE,
            scale=(1, 1),
            position=(0, 0, CardUI.OVERLAY_Z)
        )
        
        # Background for symbol
        symbol_bg = Entity(
            parent=card,
            model='quad',
            color=color.red if is_black else color.black,  # Contrasting background
            scale=(CardUI.SYMBOL_SCALE, CardUI.SYMBOL_SCALE),
            position=(
                CardUI.SYMBOL_X_OFFSET,
                CardUI.SYMBOL_Y_OFFSET,
                CardUI.SYMBOL_Z
            ),
            always_on_top=True
        )
        
        # Chess symbol
        symbol = Entity(
            parent=symbol_bg,
            model='quad',
            texture=ChessSymbols.TEXTURE,
            scale=(1, 1),
            position=(0, 0, -0.01),
            color=color.white,
            always_on_top=True
        )
        
        # Set UV coordinates for the random piece type
        symbol_data = ChessSymbols.get_symbol_uvs(random_piece_type, is_black)
        symbol.texture_scale = symbol_data['scale']
        symbol.texture_offset = symbol_data['offset']
        
        print(f"Card {i} assigned piece type: {random_piece_type}")  # Debug print
        
        cards.append((card, card_overlay, symbol, card_data))
    
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
    is_black = player_data == PlayerCards.BLACK
    
    # Get the cards from the card_state's current player
    current_cards = card_state.black_cards['hand'] if is_black else card_state.white_cards['hand']
    
    # Update all card images and symbols
    for card, overlay, symbol, card_data in current_cards:
        card.texture = player_data['dragon_image']
        # Update symbol UVs based on the card's piece type
        symbol_data = ChessSymbols.get_symbol_uvs(card_data.piece_type, is_black)
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
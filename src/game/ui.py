from ursina import Entity, Vec3, mouse, camera, color, os
from random import uniform, randint
from constants import CardUI, PlayerCards, BoardCenter, ChessSymbols
from entities.cards import CardEntity


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

def create_card_ui(card_state):
    """Create UI for a new card"""
    global card_entities
    
    # Calculate card position based on current hand size
    cards = card_state.black_cards if card_state.current_player == 'BLACK' else card_state.white_cards
    card_index = len(cards['hand'])
    
    # Get player data for textures
    player_data = card_state.get_current_player_data()
    
    # Calculate base position - center the cards
    total_width = CardUI.CARD_SPACING * (CardUI.MAX_CARDS - 1)
    start_x = -(total_width/2)
    
    base_position = Vec3(
        start_x + (card_index * CardUI.CARD_SPACING),
        CardUI.BOTTOM_MARGIN,
        0
    )
    
    # Create card parent entity
    card_parent = Entity(
        parent=camera.ui,
        position=base_position,
        scale=Vec3(CardUI.CARD_WIDTH, CardUI.CARD_HEIGHT, 1),
        rotation=(0, 0, 0),
        always_on_top=True
    )
    
    # Dragon artwork (background)
    dragon_image = Entity(
        parent=card_parent,
        model='quad',
        texture=player_data['dragon_image'],
        color=color.white,
        scale=(0.9, 0.9, 1),  # Slightly smaller than frame
        z=0.01
    )
    
    # Card frame overlay
    card_frame = Entity(
        parent=card_parent,
        model='quad',
        texture=CardUI.CARD_TEXTURE,
        color=color.white,
        scale=(1, 1, 1),
        z=0
    )
    
    # Chess symbol (top right)
    symbol = Entity(
        parent=card_parent,
        model='quad',
        texture=ChessSymbols.TEXTURE,
        scale=(0.2, 0.2, 1),
        position=(0.35, 0.35, -0.01),
        z=-0.01
    )
    
    # Set up symbol texture coordinates with fixed UV mapping
    uvs = get_random_symbol_uvs(card_state.current_player == 'BLACK')
    symbol.texture_scale = uvs['scale']
    symbol.texture_offset = uvs['offset']
    
    # Create card entity
    card_entity = CardEntity(
        card_parent,
        dragon_image,
        symbol,
        card_index,
        base_position,
        0
    )
    
    card_entities.append(card_entity)
    return card_entity

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

def update_cards_for_turn(cards, deck_cards, card_state):
    """Update card images and deck color based on turn"""
    player_data = card_state.get_current_player_data()
    is_black_turn = player_data == PlayerCards.BLACK
    
    # Update all card images and symbols
    for _, card_image, symbol in cards:
        card_image.texture = player_data['dragon_image']
        # Update symbol UVs for current turn
        uvs = get_random_symbol_uvs(is_black_turn)
        symbol.texture_scale = uvs['scale']
        symbol.texture_offset = uvs['offset']
    
    # Update deck appearance
    base_color = player_data['deck_color']
    for deck_card in deck_cards:
        deck_card.color = base_color 
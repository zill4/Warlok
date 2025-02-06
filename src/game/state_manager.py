class GameStateManager:
    def __init__(self):
        self.piece_entities = []
        self.card_entities = []
        self.virtual_grid = [[None for _ in range(8)] for _ in range(8)]
        self.selected_piece = None
        self.selected_card = None
        self.lights = []  # Add storage for lights
        
    def clear_state(self):
        self.piece_entities.clear()
        self.card_entities.clear()
        self.virtual_grid = [[None for _ in range(8)] for _ in range(8)]
        self.selected_piece = None
        self.selected_card = None
        for light in self.lights:  # Clear any existing lights
            destroy(light)
        self.lights.clear()
        
    def setup_lighting(self):
        """Setup and store scene lighting"""
        from ursina import DirectionalLight, AmbientLight, scene, color
        
        main_light = DirectionalLight(parent=scene, y=2, z=3, shadows=True)
        ambient = AmbientLight(parent=scene, color=color.rgba(100, 100, 100, 0.1))
        
        self.lights.extend([main_light, ambient])
        return main_light, ambient 
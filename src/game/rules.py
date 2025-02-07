from ursina import time, mouse, camera, lerp, clamp, held_keys, Vec3, Entity, invoke, curve
from constants import Camera, BoardCenter
import math

class GameRules:
    def __init__(self, card_state, camera_pivot):
        self.card_state = card_state
        self.camera_pivot = camera_pivot
        self.current_rotation = Camera.WHITE_ROTATION_Y
        self.manual_control = False
        # Initialize camera rotation variables
        self.camera_rotation_x = Camera.START_ROTATION
        self.camera_rotation_y = Camera.WHITE_ROTATION_Y

    def setup_camera(self):
        """Initialize camera settings with board center as pivot point"""
        # Set pivot exactly at board center using BoardCenter constants
        self.camera_pivot.position = Vec3(BoardCenter.X, BoardCenter.Y, BoardCenter.Z)
        camera.parent = self.camera_pivot
        
        # Position camera using Camera constants
        camera.position = Vec3(
            0,
            Camera.START_HEIGHT,
            Camera.START_DISTANCE
        )
        
        # Set initial rotations
        camera.rotation_x = Camera.START_ROTATION
        self.camera_pivot.rotation_y = Camera.WHITE_ROTATION_Y
        self.current_rotation = Camera.WHITE_ROTATION_Y
        
    def update_camera(self):
        """Handle camera rotation while maintaining manual control"""
        # Automatic rotation when not manually controlled
        if not self.manual_control:
            # Target rotation based on current player
            target_rotation_y = Camera.BLACK_ROTATION_Y if self.card_state.current_player == 'BLACK' else Camera.WHITE_ROTATION_Y
            target_rotation_x = Camera.START_ROTATION
            
            # Smoothly interpolate towards target
            self.camera_rotation_x = lerp(self.camera_rotation_x, target_rotation_x, time.dt * Camera.ROTATION_SMOOTHING)
            self.camera_rotation_y = lerp(self.camera_rotation_y, target_rotation_y, time.dt * Camera.ROTATION_SMOOTHING)
            
            # Apply the rotations
            self.camera_pivot.rotation = Vec3(self.camera_rotation_x, self.camera_rotation_y, 0)

        # Handle manual camera controls
        if mouse.middle:
            self.manual_control = True
            self.camera_rotation_y += mouse.velocity[0] * Camera.MOUSE_SENSITIVITY
            self.camera_rotation_x -= mouse.velocity[1] * Camera.MOUSE_SENSITIVITY
            self.camera_rotation_x = clamp(self.camera_rotation_x, Camera.MIN_ROTATION_X, Camera.MAX_ROTATION_X)
            self.camera_pivot.rotation = Vec3(self.camera_rotation_x, self.camera_rotation_y, 0)

        # Handle keyboard movement
        move_speed = Camera.MOVE_SPEED * time.dt
        if held_keys['w']: self.camera_pivot.z -= move_speed
        if held_keys['s']: self.camera_pivot.z += move_speed
        if held_keys['a']: self.camera_pivot.x += move_speed
        if held_keys['d']: self.camera_pivot.x -= move_speed
        if held_keys['q']: self.camera_pivot.y += move_speed
        if held_keys['e']: self.camera_pivot.y -= move_speed
        
        # Update camera rotation
        self.camera_pivot.rotation = Vec3(self.camera_rotation_x, self.camera_rotation_y, 0) 
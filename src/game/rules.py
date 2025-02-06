from ursina import time, mouse, camera, lerp, clamp, held_keys, Vec3, Entity
from constants import Camera, BoardCenter
import math

class GameRules:
    def __init__(self, card_state, camera_pivot):
        self.card_state = card_state
        self.camera_pivot = camera_pivot
        self.camera_rotation_x = Camera.START_ROTATION
        self.camera_rotation_y = Camera.WHITE_ROTATION_Y
        self.manual_control = False

    def setup_camera(self):
        """Initialize camera position and settings"""
        # First set up the pivot point at board center
        self.camera_pivot.position = Vec3(
            BoardCenter.X, 
            Camera.PIVOT_HEIGHT,
            BoardCenter.Z
        )
        self.camera_pivot.rotation = Vec3(
            self.camera_rotation_x,
            self.camera_rotation_y,
            0
        )
        
        # Then set up the camera relative to pivot
        camera.parent = self.camera_pivot
        camera.position = Vec3(
            0,
            Camera.START_HEIGHT,
            Camera.START_DISTANCE
        )
        camera.rotation = Vec3(0, 0, 0)
        camera.fov = Camera.FOV
        
    def update_camera(self):
        """Handle camera movement and rotation"""
        # Mouse rotation control
        if mouse.middle:
            self.manual_control = True
            self.camera_rotation_y += mouse.velocity[0] * Camera.MOUSE_SENSITIVITY
            self.camera_rotation_x -= mouse.velocity[1] * Camera.MOUSE_SENSITIVITY
            self.camera_rotation_x = clamp(self.camera_rotation_x, Camera.MIN_ROTATION_X, Camera.MAX_ROTATION_X)

        # Keyboard movement control
        move_speed = Camera.MOVE_SPEED * time.dt
        if held_keys['w']:
            self.camera_pivot.z -= move_speed
        if held_keys['s']:
            self.camera_pivot.z += move_speed
        if held_keys['a']:
            self.camera_pivot.x += move_speed
        if held_keys['d']:
            self.camera_pivot.x -= move_speed
        
        # Optional: Add Q/E for height control
        if held_keys['q']:  # Move down
            self.camera_pivot.y += move_speed
        if held_keys['e']:  # Move up
            self.camera_pivot.y -= move_speed

        # Always update rotation
        self.camera_pivot.rotation = Vec3(self.camera_rotation_x, self.camera_rotation_y, 0) 
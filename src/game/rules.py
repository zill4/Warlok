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
        camera.parent = self.camera_pivot
        self.camera_pivot.position = Vec3(
            BoardCenter.X, 
            Camera.PIVOT_HEIGHT,
            BoardCenter.Z
        )
        camera.position = (0, 0, Camera.START_DISTANCE)
        camera.rotation = (0, 0, 0)

    def update_camera(self):
        """Handle camera movement and rotation"""
        # Handle WASD movement
        move_speed = Camera.MOVE_SPEED * time.dt
        move = Vec3(0, 0, 0)
        
        if held_keys['w']: move.z += 1
        if held_keys['s']: move.z -= 1
        if held_keys['a']: move.x -= 1
        if held_keys['d']: move.x += 1
        
        if move.length() > 0:
            move = move.normalized()
            angle = math.radians(self.camera_rotation_y)
            rotated_x = move.x * math.cos(angle) - move.z * math.sin(angle)
            rotated_z = move.x * math.sin(angle) + move.z * math.cos(angle)
            self.camera_pivot.position += Vec3(rotated_x, 0, rotated_z) * move_speed

        # Handle middle mouse rotation
        if mouse.middle:
            self.manual_control = True
            self.camera_rotation_y += mouse.velocity[0] * Camera.MOUSE_SENSITIVITY
            self.camera_rotation_x -= mouse.velocity[1] * Camera.MOUSE_SENSITIVITY
            self.camera_rotation_x = clamp(self.camera_rotation_x, Camera.MIN_ROTATION_X, Camera.MAX_ROTATION_X)

        # Always update rotation
        self.camera_pivot.rotation = (self.camera_rotation_x, self.camera_rotation_y, 0) 
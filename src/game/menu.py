from ursina import Entity, Text, Button, color, camera
import sys

def create_menu(start_game_callback):
    menu = Entity(parent=camera.ui)
    Text("3D Chess", parent=menu, y=0.3, x=0, origin=(0,0), scale=3)
    
    Button(text="Start Game", 
           parent=menu,
           y=0, 
           x=0,
           scale=(0.3, 0.1),
           color=color.azure,
           highlight_color=color.gray[2],
           pressed_color=color.blue,
           on_click=start_game_callback)
    
    Button(text="Exit", 
           parent=menu,
           y=-0.15, 
           x=0,
           scale=(0.3, 0.1),
           color=color.red,
           highlight_color=color.gray[2],
           pressed_color=color.red,
           on_click=sys.exit)
    
    return menu 
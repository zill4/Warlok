import * as THREE from 'three';
import { CardSystem } from './card';
import { BoardManager } from './board';

export class InputManager {
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    public onMouseClick(event: MouseEvent, mouse: THREE.Vector2, raycaster: THREE.Raycaster, camera: THREE.Camera, cardHand: CardSystem, boardManager: BoardManager) {
        event.preventDefault(); // Prevent any double-clicking
        const rect = this.container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update raycaster
        raycaster.setFromCamera(mouse, camera);
        
        // First check for card interactions
        const cardIntersects = cardHand.raycaster.intersectObjects(cardHand.getCardMeshes());
        if (cardIntersects.length > 0) {
            cardHand.handleClick(mouse.x, mouse.y);
            return; // Stop here if we clicked a card
        }
        
        // Then check for board interactions
        const boardIntersects = raycaster.intersectObjects(boardManager.getBoardSquares());
        if (boardIntersects.length > 0) {
            console.log("Board intersects", boardIntersects);
            boardManager.handleBoardClick(mouse, camera);
            return;
        }
    }

    public onMouseMove(event: MouseEvent, cardHand: CardSystem, raycaster: THREE.Raycaster, camera: THREE.Camera, mouse: THREE.Vector2) {
            const rect = this.container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            // Update raycaster
            raycaster.setFromCamera(mouse, camera);
            
            // Let the card system handle its own hover detection
            if (cardHand) {
                //TODO: We are using event.clientX, event.clientY instead of mouse.x, mouse.y because the mouse.x, mouse.y is not updating correctly
                cardHand.handleMouseMove(event.clientX, event.clientY);
            }
        
    }

    
}

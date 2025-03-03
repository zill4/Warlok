import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import gsap from 'gsap';
import { BOARD_CONFIG } from './app';  // Import BOARD_CONFIG
import { GameState } from './state';
import { Player } from './player';

// Card properties interfaces
interface CardProperties {
    cardType: 'normal';
    monsterType: 'dragon';
    pieceType: 'pawn' | 'rook' | 'bishop' | 'knight' | 'king' | 'queen';
    color: 'white' | 'black';
}

export interface Card extends CardProperties {
    texture: string;
    model?: THREE.Group;
}

// Original texture dimensions and aspect ratio
export const ORIGINAL_CARD_WIDTH = 1139;   // Original texture width in pixels
export const ORIGINAL_CARD_HEIGHT = 2138;  // Original texture height in pixels
export const ORIGINAL_CARD_RATIO = ORIGINAL_CARD_HEIGHT / ORIGINAL_CARD_WIDTH;

// Base card dimensions and other constants (these won't be used for scaling now)
export const BASE_CARD_WIDTH = ORIGINAL_CARD_WIDTH;
export const BASE_CARD_HEIGHT = ORIGINAL_CARD_HEIGHT;
export const GAME_CARD_SCALE = 0.7;
export const BASE_CARD_SPACING = 1.2;
export const BASE_CARD_Y_POSITION = -9;
export const BASE_CARD_X_POSITION = 1;

// Reference resolution (not used for scaling anymore)
export const REFERENCE_WIDTH = 1920;
export const REFERENCE_HEIGHT = 1080;

export class CardSystem {
    public static debug = false;
    private deck: Card[] = [];
    private cards: Card[] = [];
    private cardMeshes: THREE.Mesh[] = [];
    private uiScene: THREE.Scene;
    private uiCamera: THREE.OrthographicCamera;
    public raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private hoveredCard: THREE.Mesh | null = null;
    private selectedCards: Set<THREE.Mesh> = new Set();
    private originalPositions: Map<THREE.Mesh, THREE.Vector3> = new Map();
    private readonly MAX_SELECTED_CARDS = 5;
    private gameState: GameState;
    private localPlayer: Player;
    // We'll use window dimensions directly
    private windowWidth: number = window.innerWidth;
    private windowHeight: number = window.innerHeight;
    private scaledCardWidth: number;
    private scaledCardHeight: number;
    private scaledCardSpacing: number;
    private resizeTimeout: NodeJS.Timeout | null = null;
    // These values will be recalculated based on window dimensions
    private baseCardYPosition: number;
    // private baseCardXPosition: number = 0;
    // private aspectRatio: number;
    private zoomedCard: THREE.Mesh | null = null;
    private originalScale: THREE.Vector3 | null = null;
    private originalPosition: THREE.Vector3 | null = null;

    constructor(gameState: GameState) {
        this.gameState = gameState;
        this.localPlayer = gameState.getLocalPlayer();
        // Create the UI scene
        this.uiScene = new THREE.Scene();
        
        // Make CardSystem available globally for debugging
        (window as any).CardSystem = CardSystem;
        this.updateDebugBackground();

        // Set up the UI camera so that 1 unit = 1 pixel.
        this.uiCamera = new THREE.OrthographicCamera(
            0, window.innerWidth, window.innerHeight, 0, 0.1, 1000
        );
        this.uiCamera.position.z = 10;
        
        console.log("UI Camera position:", this.uiCamera.position);
        console.log("UI Camera frustum:", {
            left: this.uiCamera.left,
            right: this.uiCamera.right,
            top: this.uiCamera.top,
            bottom: this.uiCamera.bottom
        });

        // Initialize other properties
        this.cards = [];
        this.cardMeshes = [];
        this.originalPositions = new Map();
        this.selectedCards = new Set();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredCard = null;

        // Initial scaled dimensions (they will be updated in updateCardScaling)
        this.scaledCardWidth = BASE_CARD_WIDTH * GAME_CARD_SCALE;
        this.scaledCardHeight = BASE_CARD_HEIGHT * GAME_CARD_SCALE;
        this.scaledCardSpacing = BASE_CARD_SPACING;
        this.baseCardYPosition = 0;  // will be recalculated

        // Listen to window resize events
        window.addEventListener('resize', () => {
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }
            
            this.resizeTimeout = setTimeout(() => {
                this.windowWidth = window.innerWidth;
                this.windowHeight = window.innerHeight;
                
                // Update the UI camera to use new window dimensions (1 unit = 1 pixel)
                this.uiCamera.left = 0;
                this.uiCamera.right = window.innerWidth;
                this.uiCamera.top = window.innerHeight;
                this.uiCamera.bottom = 0;
                this.uiCamera.updateProjectionMatrix();
                
                // Recalculate card scaling based on the new window size
                this.updateCardScaling();
            }, 100);
        });

        // Initial scaling call
        this.updateCardScaling();

        // Expose instance for debugging
        (window as any).cardSystemInstance = this;
    }

    /**
     * updateCardScaling uses the actual window dimensions (in pixels) to determine the card size.
     *
     * - The card height is set to 40% of the window height.
     * - The card width is derived from the original aspect ratio.
     * - A base spacing (15% of the card width) is used, and if 7 cards exceed the window width,
     *   the spacing is adjusted (possibly negative, resulting in overlap) without changing card size.
     *
     * The hand is then centered horizontally and positioned a fixed margin from the bottom.
     */
    private updateCardScaling() {
        const container = document.getElementById('game-container');
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        // Increase base card size - make cards 35% of container height instead of 25%
        const CARD_HEIGHT_RATIO = 0.3; // Increased from 0.25
        const desiredCardHeight = containerHeight * CARD_HEIGHT_RATIO;
        const desiredCardWidth = desiredCardHeight / ORIGINAL_CARD_RATIO;

        // Calculate how many cards we can fit with proper spacing
        const numCards = this.cards.length;
        const minSpacing = desiredCardWidth * 0.1; // Reduced spacing to 10% to accommodate larger cards
        
        // Calculate total width needed
        const totalWidth = (numCards * desiredCardWidth) + ((numCards - 1) * minSpacing);
        
        // If cards would overflow, scale everything down proportionally
        let scale = 1;
        if (totalWidth > containerWidth * 0.95) { // Increased from 0.9 to allow more width
            scale = (containerWidth * 0.95) / totalWidth;
        }

        // Apply scale to final dimensions
        this.scaledCardHeight = desiredCardHeight * scale;
        this.scaledCardWidth = desiredCardWidth * scale;
        this.scaledCardSpacing = minSpacing * scale;

        // Keep existing camera and position updates
        this.uiCamera.left = 0;
        this.uiCamera.right = containerWidth;
        this.uiCamera.top = containerHeight;
        this.uiCamera.bottom = 0;
        this.uiCamera.updateProjectionMatrix();

        const marginBottom = containerHeight * 0.7;
        this.baseCardYPosition = containerHeight - (this.scaledCardHeight / 2) - marginBottom;

        this.updateHandDisplay();
    }

    // Debug visualization (unchanged except for logging)
    private updateDebugBackground() {
        if (CardSystem.debug) {
            const debugMaterial = new THREE.MeshBasicMaterial({
                color: 0x0000ff,
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide
            });
            const debugPlane = new THREE.PlaneGeometry(100, 100);
            const debugMesh = new THREE.Mesh(debugPlane, debugMaterial);
            debugMesh.name = 'debugBackground';
            debugMesh.position.z = -1;
            this.uiScene.add(debugMesh);
            console.log('Debug visualization enabled');
        } else {
            const debugBg = this.uiScene.getObjectByName('debugBackground');
            if (debugBg) {
                this.uiScene.remove(debugBg);
                console.log('Debug visualization disabled');
            }
            this.uiScene.background = null;
        }
    }

    public static toggleDebug() {
        CardSystem.debug = !CardSystem.debug;
        const instance = (window as any).cardSystemInstance;
        if (instance) {
            instance.updateDebugBackground();
        }
        console.log(`Debug mode ${CardSystem.debug ? 'enabled' : 'disabled'}`);
    }

    private shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    public drawCard(): Card | null {
        if (this.deck.length === 0) {
            console.log('Deck is empty!');
            return null;
        }
        if (this.cards.length >= 7) {
            console.log('Hand is full!');
            return null;
        }
        const card = this.deck.pop()!;
        console.log("Drawing card:", card);
        this.cards.push(card);
        this.localPlayer.addToHand(card);
        this.updateHandDisplay();
        return card;
    }

    public drawInitialHand(count: number = 7) {
        const playerHand = this.localPlayer.getHand();
        console.log("Initial hand from player:", playerHand);
        this.cards = [...playerHand];
        console.log("Updated cards array:", this.cards);
        this.updateHandDisplay();
    }

    public getRemainingDeckSize(): number {
        return this.deck.length;
    }

    public resetDeck(playerColor: 'white' | 'black') {
        this.deck = [];
        this.cards = [];
        this.clearSelection();
        this.cardMeshes.forEach(mesh => this.uiScene.remove(mesh));
        this.cardMeshes = [];
        this.originalPositions.clear();
    }

    private createCompositeTexture(cardTexture: THREE.Texture): THREE.CanvasTexture {
        const targetAspect = ORIGINAL_CARD_HEIGHT / ORIGINAL_CARD_WIDTH;
        const canvasWidth = 512;
        const canvasHeight = canvasWidth * targetAspect;
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const context = canvas.getContext('2d')!;
        if (cardTexture.image) {
            context.drawImage(cardTexture.image,
                0, 0,
                cardTexture.image.width,
                cardTexture.image.height,
                0, 0,
                canvasWidth,
                canvasHeight
            );
        } else {
            console.error('Card texture image not loaded');
        }
        return new THREE.CanvasTexture(canvas);
    }

    public handleMouseMove(clientX: number, clientY: number) {
        const container = document.getElementById('game-container');
        if (!container) return;
        const rect = container.getBoundingClientRect();
      
        // Increase offset calculation - more aggressive upward adjustment
        const offsetY = Math.max(0, (1000 - rect.height) * 0.02); // Increased from 0.15 to 0.35


        // Adjust clientY with the increased offset
        const adjustedClientY = clientY - offsetY;
        
        // Calculate normalized coordinates
        this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((adjustedClientY - rect.top) / rect.height) * 2 + 1;
        
        // Update raycaster and check intersections
        this.raycaster.setFromCamera(this.mouse, this.uiCamera);
        const intersects = this.raycaster.intersectObjects(this.cardMeshes);

        // Handle hover states
        if (this.hoveredCard && (!intersects.length || intersects[0].object !== this.hoveredCard)) {
            this.animateCardDown(this.hoveredCard);
            this.hoveredCard = null;
        }
        if (intersects.length > 0) {
            const newHoveredCard = intersects[0].object as THREE.Mesh;
            if (newHoveredCard !== this.hoveredCard) {
                this.hoveredCard = newHoveredCard;
                this.animateCardUp(newHoveredCard);
            }
        }
    }

    public handleClick(normalizedX: number, normalizedY: number) {
        if (!this.gameState.isPlayerTurn(this.localPlayer.id)) {
            console.log("Not your turn!");
            return;
        }
        console.log("Handling click");
        this.mouse.x = normalizedX;
        this.mouse.y = normalizedY;
        this.raycaster.setFromCamera(this.mouse, this.uiCamera);
        const intersects = this.raycaster.intersectObjects(this.cardMeshes);
        console.log("Intersects:", intersects);
        if (intersects.length > 0) {

            const clickedCard = intersects[0].object as THREE.Mesh;
            console.log("Clicked card:", clickedCard);
          
            if (this.selectedCards.has(clickedCard)) {
                this.deselectCard(clickedCard);
                this.updateSelectedCardsPosition();
                console.log("Deselected card");
            } else if (this.selectedCards.size < this.MAX_SELECTED_CARDS) {
                this.selectCard(clickedCard);
                this.updateSelectedCardsPosition();
                console.log("Selected card");
            }
        }
    }

    private selectCard(card: THREE.Mesh) {
        this.selectedCards.add(card);
        const originalPos = this.originalPositions.get(card)!;
        gsap.to(card.position, {
            y: originalPos.y - 10, // move upward (in pixel coordinates, lower y is higher)
            duration: 0.3,
            ease: "power2.out"
        });
        gsap.to(card.scale, {
            x: 1.15,
            y: 1.15,
            duration: 0.3,
            ease: "power2.out"
        });
    }

    private deselectCard(card: THREE.Mesh) {
        this.selectedCards.delete(card);
        const originalPos = this.originalPositions.get(card)!;
        gsap.to(card.position, {
            x: originalPos.x,
            y: originalPos.y,
            duration: 0.4,
            ease: "power2.out"
        });
        gsap.to(card.scale, {
            x: 1,
            y: 1,
            duration: 0.4,
            ease: "power2.out"
        });
        card.renderOrder = 0;
        (card.material as THREE.Material).depthTest = true;
    }

    private animateCardUp(card: THREE.Mesh) {
        if (this.zoomedCard) {
            return;
        }
        if (!this.selectedCards.has(card)) {
            const originalPos = this.originalPositions.get(card)!;
            gsap.to(card.position, {
                y: originalPos.y - 5,
                duration: 0.3,
                ease: "power2.out"
            });
            gsap.to(card.scale, {
                x: 1.2,
                y: 1.2,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }

    private animateCardDown(card: THREE.Mesh) {
        if (this.zoomedCard) {
            return;
        }
        if (!this.selectedCards.has(card)) {
            const originalPos = this.originalPositions.get(card)!;
            gsap.to(card.position, {
                x: originalPos.x,
                y: originalPos.y,
                duration: 0.3,
                ease: "power2.out"
            });
            gsap.to(card.scale, {
                x: 1,
                y: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }

    /**
     * updateHandDisplay positions cards using the current scaled dimensions.
     * The hand is centered horizontally in the window.
     */
    private updateHandDisplay() {
        this.cards.forEach((card, index) => {
            // Calculate card position
            const totalCardsWidth = (this.cards.length * this.scaledCardWidth) + 
                                   ((this.cards.length - 1) * this.scaledCardSpacing);
            const startX = (this.uiCamera.right / 2) - (totalCardsWidth / 2);
            const xPos = startX + (index * (this.scaledCardWidth + this.scaledCardSpacing));
            
            let cardMesh: THREE.Mesh;
            if (index < this.cardMeshes.length) {
                cardMesh = this.cardMeshes[index];
                // Update existing mesh geometry
                cardMesh.geometry.dispose(); // Clean up old geometry
                cardMesh.geometry = new THREE.PlaneGeometry(
                    this.scaledCardWidth,
                    this.scaledCardHeight
                );
            } else {
                // Create new mesh with correct dimensions
                const geometry = new THREE.PlaneGeometry(
                    this.scaledCardWidth,
                    this.scaledCardHeight
                );
                const material = new THREE.MeshBasicMaterial({
                    transparent: true,
                    side: THREE.DoubleSide
                });
                cardMesh = new THREE.Mesh(geometry, material);
                this.cardMeshes.push(cardMesh);
                this.uiScene.add(cardMesh);

                // Load texture with proper settings
                const textureLoader = new THREE.TextureLoader();
                textureLoader.load(
                    `/assets/images/${card.texture}.png`,
                    (texture) => {
                        // Calculate appropriate resolution based on container size
                        const container = document.getElementById('game-container');
                        if (!container) return;
                        
                        const containerRect = container.getBoundingClientRect();
                        const containerWidth = containerRect.width;
                        
                        // Base resolution on container width
                        // Smaller screens: ~256px, Larger screens: up to 384px
                        const baseResolution = Math.min(384, Math.max(256, containerWidth * 0.15));
                        const maxDimension = Math.floor(baseResolution); // Round down to nearest pixel
                        
                        // Create a temporary canvas to resize the texture
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d')!;
                        
                        // Set canvas size to our calculated dimensions
                        canvas.width = maxDimension;
                        canvas.height = (maxDimension * 1.75); // Maintain card aspect ratio
                        
                        // Draw and scale the image to fit our desired dimensions
                        ctx.drawImage(
                            texture.image,
                            0, 0,
                            texture.image.width, texture.image.height,  // Source dimensions
                            0, 0, 
                            canvas.width, canvas.height  // Destination dimensions
                        );
                        
                        // Create new texture from the resized canvas
                        const resizedTexture = new THREE.CanvasTexture(canvas);
                        resizedTexture.encoding = THREE.sRGBEncoding;
                        resizedTexture.colorSpace = 'srgb';
                        resizedTexture.minFilter = THREE.LinearFilter;
                        resizedTexture.magFilter = THREE.LinearFilter;
                        
                        // Apply the resized texture to the card
                        const material = cardMesh.material as THREE.MeshBasicMaterial;
                        material.map = resizedTexture;
                        material.needsUpdate = true;
                    }
                );
            }

            // Position card and store original position
            cardMesh.position.set(xPos, this.baseCardYPosition, 0);
            // Store the original position for hover/selection effects
            this.originalPositions.set(cardMesh, cardMesh.position.clone());
            
            // If this card was selected, maintain its selected state
            if (this.selectedCards.has(cardMesh)) {
                const originalPos = this.originalPositions.get(cardMesh)!;
                cardMesh.position.y = originalPos.y - 10;
                cardMesh.scale.set(1.15, 1.15, 1);
            } else if (cardMesh === this.hoveredCard) {
                // Maintain hover state if this was the hovered card
                const originalPos = this.originalPositions.get(cardMesh)!;
                cardMesh.position.y = originalPos.y - 5;
                cardMesh.scale.set(1.2, 1.2, 1);
            } else {
                // Reset to normal state
                cardMesh.scale.set(1, 1, 1);
            }
        });

        // Clean up any extra card meshes
        while (this.cardMeshes.length > this.cards.length) {
            const mesh = this.cardMeshes.pop()!;
            this.originalPositions.delete(mesh);
            this.selectedCards.delete(mesh);
            if (this.hoveredCard === mesh) {
                this.hoveredCard = null;
            }
            this.uiScene.remove(mesh);
        }
    }

    public async renderAsync(renderer: WebGPURenderer): Promise<void> {
        renderer.autoClear = false;
        await renderer.renderAsync(this.uiScene, this.uiCamera);
    }

    public render(renderer: THREE.WebGLRenderer): void {
        renderer.autoClear = false;
        renderer.render(this.uiScene, this.uiCamera);
    }

    public addCard(card: Card) {
        console.log("Adding card:", card);
        this.cards.push(card);
        this.updateHandDisplay();
    }

    public removeCard(index: number) {
        const removedCard = this.cards.splice(index, 1)[0];
        if (removedCard) {
            const handIndex = this.localPlayer.getHand().findIndex(c => 
                c.texture === removedCard.texture && 
                c.pieceType === removedCard.pieceType
            );
            if (handIndex !== -1) {
                this.localPlayer.removeFromHand(handIndex);
            }
        }
        this.updateHandDisplay();
    }

    public getCards(): Card[] {
        return this.cards;
    }

    public placeCardOnBoard(gridX: number, gridZ: number) {
        if (!this.gameState.isPlayerTurn(this.localPlayer.id)) {
            console.log("Not your turn!");
            return;
        }
        console.log("CardSystem: Initiating card placement at", gridX, gridZ);
        const selectedCards = this.getSelectedCards();
        if (selectedCards.length === 0) return null;
        const card = selectedCards[0];
        const boardManager = (window as any).boardManagerInstance;
        if (boardManager) {
            boardManager.placeCardOnBoard(card, gridX, gridZ);
            this.removeSelectedCard();
        } else {
            console.error("BoardManager instance not found");
        }
    }

    public getSelectedCards(): Card[] {
        return Array.from(this.selectedCards).map(cardMesh => {
            const index = this.cardMeshes.indexOf(cardMesh);
            return this.cards[index];
        });
    }

    public isHandFull(): boolean {
        return this.selectedCards.size >= this.MAX_SELECTED_CARDS;
    }

    public clearSelection() {
        Array.from(this.selectedCards).forEach(card => this.deselectCard(card));
    }

    public getDeckStats() {
        const stats = new Map<string, number>();
        this.deck.forEach(card => {
            const key = card.pieceType;
            stats.set(key, (stats.get(key) || 0) + 1);
        });
        return Object.fromEntries(stats);
    }

    public removeSelectedCard() {
        const selectedCards = Array.from(this.selectedCards);
        if (selectedCards.length > 0) {
            const cardMesh = selectedCards[0];
            const index = this.cardMeshes.indexOf(cardMesh);
            if (index !== -1) {
                this.cards.splice(index, 1);
                this.cardMeshes.splice(index, 1);
                this.selectedCards.delete(cardMesh);
                this.originalPositions.delete(cardMesh);
                this.uiScene.remove(cardMesh);
                this.updateHandDisplay();
            }
        }
    }

    private updateSelectedCardsPosition() {
        console.log("Updating selected cards position");
        const selectedArray = Array.from(this.selectedCards);
        const cardSpacing = this.scaledCardWidth * 1.2; // Space between cards relative to card width
        const totalWidth = selectedArray.length * cardSpacing;
        const startX = (this.uiCamera.right / 2) - (totalWidth / 2) + (cardSpacing / 2);
        
        // Position cards at approximately 1/3 from the top of the screen
        const targetY = this.uiCamera.top * .80; // Position at about 33% from the top
        
        selectedArray.forEach((card, index) => {
            gsap.to(card.position, {
                x: startX + (index * cardSpacing),
                y: targetY,
                z: 1, // Ensure cards are above others
                duration: 0.4,
                ease: "power2.out"
            });
            gsap.to(card.scale, {
                x: 1.2,
                y: 1.2,
                duration: 0.4,
                ease: "power2.out"
            });
            card.renderOrder = 1;
            (card.material as THREE.Material).depthTest = false;
        });
    }

    public getCardMeshes(): THREE.Mesh[] {
        return this.cardMeshes;
    }

    public updateCameraViewport(width: number, height: number) {
        // Set camera to match pixel dimensions exactly
        this.uiCamera.left = 0;
        this.uiCamera.right = width;
        this.uiCamera.top = height;
        this.uiCamera.bottom = 0;
        this.uiCamera.near = 0.1;
        this.uiCamera.far = 1000;
        this.uiCamera.updateProjectionMatrix();

        // Update internal dimensions
        this.windowWidth = width;
        this.windowHeight = height;
        this.aspectRatio = width / height;

        // Recalculate card scaling with new dimensions
        this.updateCardScaling();
    }

    // Add this method to handle window/container resizing
    public onContainerResize() {
        this.updateCardScaling();
    }

    public handleRightClick(normalizedX: number, normalizedY: number) {
        this.mouse.x = normalizedX;
        this.mouse.y = normalizedY;
        this.raycaster.setFromCamera(this.mouse, this.uiCamera);
        const intersects = this.raycaster.intersectObjects(this.cardMeshes);
        
        if (intersects.length > 0) {
            const clickedCard = intersects[0].object as THREE.Mesh;

            // If we already have a zoomed card, restore it
            if (this.zoomedCard) {
                this.unzoomCard();
                return;
            }
            
            // Store original properties
            this.zoomedCard = clickedCard;
            this.originalScale = clickedCard.scale.clone();
            this.originalPosition = clickedCard.position.clone();
            
            // Calculate container dimensions
            const container = document.getElementById('game-container');
            if (!container) return;
            const rect = container.getBoundingClientRect();
            
            // Calculate zoom size (70% of container height)
            const zoomHeight = rect.height * 0.7;
            const zoomWidth = zoomHeight / ORIGINAL_CARD_RATIO;
            const scale = zoomHeight / this.scaledCardHeight;
            
            // Center position in UI camera coordinates
            const centerX = this.uiCamera.right / 2;
            const centerY = this.uiCamera.top / 2;
            
            // Animate to zoomed state
            gsap.to(clickedCard.position, {
                x: centerX,
                y: centerY,
                z: 2, // Keep a smaller z value to stay in camera view
                duration: 0.3,
                ease: "power2.out"
            });
            
            gsap.to(clickedCard.scale, {
                x: scale,
                y: scale,
                duration: 0.3,
                ease: "power2.out"
            });
            
            // Ensure it renders on top
            clickedCard.renderOrder = 1000;
            (clickedCard.material as THREE.Material).depthTest = false;
        }
    }

    private unzoomCard() {

        if (this.zoomedCard && this.originalScale && this.originalPosition) {
            // Animate back to original state
            gsap.to(this.zoomedCard.position, {
                x: this.originalPosition.x,
                y: this.originalPosition.y,
                z: this.originalPosition.z,
                duration: 0.3,
                ease: "power2.out"
            });
            
            gsap.to(this.zoomedCard.scale, {
                x: this.originalScale.x,
                y: this.originalScale.y,
                duration: 0.3,
                ease: "power2.out"
            });
            
            // Reset render order
            this.zoomedCard.renderOrder = 0;
            (this.zoomedCard.material as THREE.Material).depthTest = true;
            
            // Clear zoomed card
            this.zoomedCard = null;
            this.originalScale = null;
            this.originalPosition = null;
        }
    }

    // Add method to check if a card is zoomed
    public isCardZoomed(): boolean {
        return this.zoomedCard !== null;
    }
}

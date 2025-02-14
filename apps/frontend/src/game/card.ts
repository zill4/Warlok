import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import gsap from 'gsap';
import { BOARD_CONFIG } from './app';  // Import BOARD_CONFIG
import { GameState } from './state';
import { Player } from './player';

// Add new interfaces for card properties
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

export const CARD_X: number = 2.1;
export const CARD_Y: number = 3.15;
export const CARD_SPACING: number = 1;
export const CARD_Y_POSITION: number = -7;


// Rename CardHand to CardSystem for consistency with imports
export class CardSystem {
    // Add debug flag as a static property so it's accessible from console
    public static debug = false;
    private deck: Card[] = [];
    private cards: Card[] = [];
    private cardMeshes: THREE.Mesh[] = [];
    // private scene: THREE.Scene;
    private uiScene: THREE.Scene;  // Separate scene for UI
    private uiCamera: THREE.OrthographicCamera;  // Orthographic camera for UI
    public raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private hoveredCard: THREE.Mesh | null = null;
    private selectedCards: Set<THREE.Mesh> = new Set();  // Change to Set for multiple selections
    private originalPositions: Map<THREE.Mesh, THREE.Vector3> = new Map();
    private readonly MAX_SELECTED_CARDS = 5;  // Maximum cards in hand
    private gameState: GameState;
    private localPlayer: Player;
    
    constructor(gameState: GameState) {
        this.gameState = gameState;
        this.localPlayer = gameState.getLocalPlayer();
        // Initialize UI scene
        this.uiScene = new THREE.Scene();
        
        // Make CardSystem available in console for debugging
        (window as any).CardSystem = CardSystem;
        
        // Set background based on debug mode
        this.updateDebugBackground();

        // Set up UI camera with orthographic projection for 2D-style rendering
        const aspectRatio = window.innerWidth / window.innerHeight;
        this.uiCamera = new THREE.OrthographicCamera(
            -10 * aspectRatio, 10 * aspectRatio,  // left, right
            10, -10,                              // top, bottom
            0.1, 1000                             // near, far
        );
        this.uiCamera.position.z = 10;
        
        // Add debug helpers
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
        this.initializeDeck('white');
        
        // Load the card frame texture once and ensure it's loaded
        // const textureLoader = new THREE.TextureLoader();
        // this.frameTexture = textureLoader.load('/assets/images/Normal_Card.png', 
        //     // Success callback
        //     (loadedTexture) => {
        //         console.log('Frame texture loaded successfully:', loadedTexture);
        //         this.frameTexture = loadedTexture; // Use the loaded texture
        //         this.updateHandDisplay(); // Refresh cards when frame is loaded
        //     },
        //     // Progress callback
        //     undefined,
        //     // Error callback
        //     (error) => {
        //         console.error('Error loading frame texture:', error);
        //     }
        // );

        // Handle window resize
        window.addEventListener('resize', () => {
            const newAspect = window.innerWidth / window.innerHeight;
            this.uiCamera.left = -10 * newAspect;
            this.uiCamera.right = 10 * newAspect;
            this.uiCamera.updateProjectionMatrix();
        });

        // Store instance reference for debug access
        (window as any).cardSystemInstance = this;
    }

    // Add method to update debug visualization
    private updateDebugBackground() {
        if (CardSystem.debug) {
            const debugMaterial = new THREE.MeshBasicMaterial({
                color: 0x0000ff,
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide
            });
            
            // Create a large plane for the debug background
            const debugPlane = new THREE.PlaneGeometry(100, 100);
            const debugMesh = new THREE.Mesh(debugPlane, debugMaterial);
            debugMesh.name = 'debugBackground';
            debugMesh.position.z = -1;  // Behind cards
            this.uiScene.add(debugMesh);
            
            console.log('Debug visualization enabled');
        } else {
            // Remove debug background if it exists
            const debugBg = this.uiScene.getObjectByName('debugBackground');
            if (debugBg) {
                this.uiScene.remove(debugBg);
                console.log('Debug visualization disabled');
            }
            this.uiScene.background = null;
        }
    }

    // Add method to toggle debug mode
    public static toggleDebug() {
        CardSystem.debug = !CardSystem.debug;
        const instance = (window as any).cardSystemInstance;
        if (instance) {
            instance.updateDebugBackground();
        }
        console.log(`Debug mode ${CardSystem.debug ? 'enabled' : 'disabled'}`);
    }

    private initializeDeck(playerColor: 'white' | 'black') {
        this.deck = [];  // Clear existing deck
        
        // Define all available cards
        const cardTypes = [
            'Ace_kunoichi',
            'Chroma_king',
            'Chroma_Queen',
            'Faithful_Pal',
            'Chroma_Dragon',
            'Wicked_Assassin',
            'Ye_Old_Bishop'
        ];

        // Create one of each card type
        cardTypes.forEach(cardType => {
            this.deck.push({
                cardType: 'normal',
                monsterType: 'dragon',
                pieceType: 'pawn', // You might want to map these to appropriate piece types
                color: playerColor,
                texture: cardType
            });
        });

        this.shuffleDeck();
        console.log(`Initialized deck with ${this.deck.length} cards:`, this.deck);
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

    private drawInitialHand(count: number = 7) {
        console.log(`Drawing initial hand of ${count} cards for ${this.localPlayer.color}`);
        for (let i = 0; i < count && this.deck.length > 0; i++) {
            const card = this.deck.pop()!;
            this.cards.push(card);
            this.localPlayer.addToHand(card);
        }
        console.log("Initial hand drawn:", this.cards);
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
        this.initializeDeck(playerColor);
    }

    private createCompositeTexture(cardTexture: THREE.Texture): THREE.CanvasTexture {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 768;
        const context = canvas.getContext('2d')!;

        // Draw the card art at full size
        if (cardTexture.image) {
            context.drawImage(cardTexture.image,
                0, 0,      // Start at top left
                512, 768   // Full size
            );
        } else {
            console.error('Card texture image not loaded');
        }

        return new THREE.CanvasTexture(canvas);
    }

    public handleMouseMove(clientX: number, clientY: number) {
        this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.uiCamera);
        const intersects = this.raycaster.intersectObjects(this.cardMeshes);
        // Reset previously hovered card
        if (this.hoveredCard && (!intersects.length || intersects[0].object !== this.hoveredCard)) {
            this.animateCardDown(this.hoveredCard);
            this.hoveredCard = null;
        }

        // Handle new hover
        if (intersects.length > 0) {
            const newHoveredCard = intersects[0].object as THREE.Mesh;
            if (newHoveredCard !== this.hoveredCard) {
                this.hoveredCard = newHoveredCard;
                this.animateCardUp(newHoveredCard);
            }
        }
    }

    public handleClick(normalizedX: number, normalizedY: number) {
        // Check if it's local player's turn
        if (!this.gameState.isPlayerTurn(this.localPlayer.id)) {
            console.log("Not your turn!");
            return;
        }

        console.log("Handling click");
        
        // Update mouse position
        this.mouse.x = normalizedX;
        this.mouse.y = normalizedY;
        
        // Update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.uiCamera);

        // Calculate objects intersecting the picking ray
        const intersects = this.raycaster.intersectObjects(this.cardMeshes);
        console.log("Intersects:", intersects);
        
        if (intersects.length > 0) {
            const clickedCard = intersects[0].object as THREE.Mesh;
            console.log("Clicked card:", clickedCard);
            
            if (this.selectedCards.has(clickedCard)) {
                this.deselectCard(clickedCard);
                this.updateSelectedCardsPosition(); // Reposition remaining selected cards
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
            y: originalPos.y + 1,
            z: originalPos.z - 1,
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
            z: originalPos.z,
            duration: 0.4,
            ease: "power2.out"
        });
        
        gsap.to(card.scale, {
            x: 1,
            y: 1,
            duration: 0.4,
            ease: "power2.out"
        });

        // Restore original rendering properties
        card.renderOrder = 0;
        (card.material as THREE.Material).depthTest = true;
    }

    private animateCardUp(card: THREE.Mesh) {
        if (!this.selectedCards.has(card)) {
            const originalPos = this.originalPositions.get(card)!;
            gsap.to(card.position, {
                y: originalPos.y + 0.5,
                z: originalPos.z - 0.5,
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
        if (!this.selectedCards.has(card)) {
            const originalPos = this.originalPositions.get(card)!;
            gsap.to(card.position, {
                y: originalPos.y,
                z: originalPos.z,
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

    private updateHandDisplay() {
        console.log("Updating hand display with cards:", this.cards);

        // Clear existing card meshes
        this.cardMeshes.forEach(mesh => {
            console.log("Removing mesh:", mesh.uuid);
            this.uiScene.remove(mesh);
        });
        this.cardMeshes = [];
        this.originalPositions.clear();

        // Scale down card dimensions
        const cardWidth = CARD_X;
        const cardHeight = CARD_Y;
        const spacing = CARD_SPACING;

        // Calculate total width of all cards with spacing
        const totalWidth = (this.cards.length * cardWidth) + ((this.cards.length - 1) * spacing);
        const startX = -totalWidth / 2;

        console.log("Hand layout:", {
            totalWidth,
            startX,
            cardCount: this.cards.length
        });

        this.cards.forEach((card, index) => {
            try {
                const cardGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
                const material = new THREE.MeshBasicMaterial({
                    transparent: true,
                    side: THREE.DoubleSide,
                    color: 0xcccccc,
                    toneMapped: false
                });
                console.log("Loading texture for card:", card.texture);
                const textureLoader = new THREE.TextureLoader();
                textureLoader.load(
                    `/assets/images/${card.texture}.png`,
                    (cardTexture) => {
                        cardTexture.encoding = THREE.sRGBEncoding;
                        cardTexture.colorSpace = 'srgb';
                        // Increase texture quality
                        cardTexture.minFilter = THREE.LinearFilter;
                        cardTexture.magFilter = THREE.LinearFilter;
                        cardTexture.anisotropy = 16; // Increase texture sharpness
                        material.map = cardTexture;
                        material.needsUpdate = true;
                    },
                    undefined,
                    (error) => {
                        console.error(`Error loading texture for card ${card.texture}:`, error);
                    }
                );
                console.log("Texture loaded for card:", card.texture);
                const cardMesh = new THREE.Mesh(cardGeometry, material);
                console.log("Card mesh created for card:", card.texture);
                const position = new THREE.Vector3(
                    startX + (index * (cardWidth + spacing)),
                    CARD_Y_POSITION,
                    0
                );
                console.log("Position set for card:", card.texture);
                cardMesh.position.copy(position);
                this.originalPositions.set(cardMesh, position.clone());
                console.log("Adding card mesh to scene");
                this.uiScene.add(cardMesh);
                this.cardMeshes.push(cardMesh);
                console.log(`Creating card ${index} at position:`, {
                    x: startX + (index * (cardWidth + spacing)),
                    y: CARD_Y_POSITION,
                    z: 0
                });
            } catch (error) {
                console.error('Error updating hand display:', error);
            }
        });
    }

    public async renderAsync(renderer: WebGPURenderer): Promise<void> {
        renderer.autoClear = false;  // Don't clear the previous render
        await renderer.renderAsync(this.uiScene, this.uiCamera);
    }

    public render(renderer: THREE.WebGLRenderer): void {
        renderer.autoClear = false;  // Don't clear the previous render
        renderer.render(this.uiScene, this.uiCamera);
    }

    public addCard(card: Card) {
        console.log("Adding card:", card);
        this.cards.push(card);
        this.updateHandDisplay();
    }

    public removeCard(index: number) {
        const removedCard = this.cards.splice(index, 1)[0];
        // Sync with player state
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
        // Check if it's local player's turn
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
            this.gameState.switchTurn();
        } else {
            console.error("BoardManager instance not found");
        }
    }

    // Update getter to return all selected cards
    public getSelectedCards(): Card[] {
        return Array.from(this.selectedCards).map(cardMesh => {
            const index = this.cardMeshes.indexOf(cardMesh);
            return this.cards[index];
        });
    }

    // Add method to check if max cards are selected
    public isHandFull(): boolean {
        return this.selectedCards.size >= this.MAX_SELECTED_CARDS;
    }

    // Add method to clear all selections
    public clearSelection() {
        Array.from(this.selectedCards).forEach(card => this.deselectCard(card));
    }

    // Optional: Add method to get deck statistics
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
                // Remove from arrays and sets
                this.cards.splice(index, 1);
                this.cardMeshes.splice(index, 1);
                this.selectedCards.delete(cardMesh);
                this.originalPositions.delete(cardMesh);
                
                // Remove from scene
                this.uiScene.remove(cardMesh);
                
                // Update display
                this.updateHandDisplay();
            }
        }
    }

    // Add new method to update selected cards positions
    private updateSelectedCardsPosition() {
        console.log("Updating selected cards position");
        const selectedArray = Array.from(this.selectedCards);
        const cardSpacing = 4; // Spacing between selected cards
        const totalWidth = (selectedArray.length * cardSpacing);
        const startX = -totalWidth / 2 + cardSpacing / 2;

        selectedArray.forEach((card, index) => {
            gsap.to(card.position, {
                x: startX + (index * cardSpacing),
                y: 7, // Center vertically (0 is middle of screen)
                z: -5, // Bring forward significantly
                duration: 0.4,
                ease: "power2.out"
            });
            
            gsap.to(card.scale, {
                x: 1.5, // Moderate scale for visibility
                y: 1.5,
                duration: 0.4,
                ease: "power2.out"
            });

            // Ensure selected cards render above others
            card.renderOrder = 1;
            (card.material as THREE.Material).depthTest = false;
        });
    }

    // Add getter for card meshes
    public getCardMeshes(): THREE.Mesh[] {
        return this.cardMeshes;
    }
}
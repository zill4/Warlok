import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import gsap from 'gsap';
import { BOARD_CONFIG } from './app';  // Import BOARD_CONFIG

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

// Rename CardHand to CardSystem for consistency with imports
export class CardSystem {
    private deck: Card[] = [];
    private cards: Card[] = [];
    private cardMeshes: THREE.Mesh[] = [];
    // private scene: THREE.Scene;
    private uiScene: THREE.Scene;  // Separate scene for UI
    private uiCamera: THREE.OrthographicCamera;  // Orthographic camera for UI
    private frameTexture: THREE.Texture;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private hoveredCard: THREE.Mesh | null = null;
    private selectedCards: Set<THREE.Mesh> = new Set();  // Change to Set for multiple selections
    private originalPositions: Map<THREE.Mesh, THREE.Vector3> = new Map();
    private readonly MAX_SELECTED_CARDS = 5;  // Maximum cards in hand
    
    constructor() {
        // this.scene = scene;
        
        // Create separate scene for UI elements
        this.uiScene = new THREE.Scene();
        
        // Setup raycaster and mouse
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Adjust camera to better fit cards
        const aspect = window.innerWidth / window.innerHeight;
        this.uiCamera = new THREE.OrthographicCamera(
            -15 * aspect, 15 * aspect,  // left, right (increased from -10/10)
            15, -15,                    // top, bottom (increased from 10/-10)
            0.1, 1000                   // near, far
        );
        this.uiCamera.position.z = 10;

        // Load the card frame texture once and ensure it's loaded
        const textureLoader = new THREE.TextureLoader();
        this.frameTexture = textureLoader.load('/assets/images/Normal_Card.png', 
            // Success callback
            (loadedTexture) => {
                console.log('Frame texture loaded successfully:', loadedTexture);
                this.frameTexture = loadedTexture; // Use the loaded texture
                this.updateHandDisplay(); // Refresh cards when frame is loaded
            },
            // Progress callback
            undefined,
            // Error callback
            (error) => {
                console.error('Error loading frame texture:', error);
            }
        );

        // Handle window resize
        window.addEventListener('resize', () => {
            const newAspect = window.innerWidth / window.innerHeight;
            this.uiCamera.left = -15 * newAspect;
            this.uiCamera.right = 15 * newAspect;
            this.uiCamera.updateProjectionMatrix();
        });

        // Add mouse move listener
        window.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event.clientX, event.clientY);
        });

        // Add click listener
        window.addEventListener('click', () => this.handleClick(event.clientX, event.clientY));

        this.initializeDeck('white');  // Initialize with player color
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

        const card = this.deck.pop()!;
        this.addCard(card);
        return card;
    }

    public drawInitialHand(count: number = 7) {
        console.log(`Drawing initial hand of ${count} cards`);
        for (let i = 0; i < count && this.deck.length > 0; i++) {
            const card = this.drawCard();
            console.log(`Drew card ${i + 1}:`, card);
        }
        console.log(`Hand size after drawing: ${this.cards.length}`);
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

    public handleMouseMove(normalizedX: number, normalizedY: number) {
        this.mouse.x = normalizedX;
        this.mouse.y = normalizedY;

        // Update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.uiCamera);

        // Calculate objects intersecting the picking ray
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
        this.mouse.x = normalizedX;
        this.mouse.y = normalizedY;

        this.raycaster.setFromCamera(this.mouse, this.uiCamera);
        const intersects = this.raycaster.intersectObjects(this.cardMeshes);

        if (intersects.length > 0) {
            const clickedCard = intersects[0].object as THREE.Mesh;
            
            if (this.selectedCards.has(clickedCard)) {
                this.deselectCard(clickedCard);
            } else if (!this.isHandFull()) {
                this.selectCard(clickedCard);
                
                // Move to center and up
                gsap.to(clickedCard.position, {
                    x: 0, // Center horizontally
                    y: 0, // Move to vertical center
                    z: -5, // Bring forward significantly
                    duration: 0.4,
                    ease: "power2.out"
                });
                
                gsap.to(clickedCard.scale, {
                    x: 2.5, // Even larger scale for better readability
                    y: 2.5,
                    duration: 0.4,
                    ease: "power2.out"
                });

                // Ensure this card renders above others
                clickedCard.renderOrder = 1;
                (clickedCard.material as THREE.Material).depthTest = false;
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
        // Clear existing card meshes and their stored positions
        this.cardMeshes.forEach(mesh => this.uiScene.remove(mesh));
        this.cardMeshes = [];
        this.originalPositions.clear();

        // Calculate total width of all cards with spacing
        const cardWidth = 6;  // Increased from 4
        const spacing = 1.5;  // Increased from 1
        const totalWidth = (this.cards.length * cardWidth) + ((this.cards.length - 1) * spacing);
        const startX = -totalWidth / 2;

        this.cards.forEach((card, index) => {
            const cardGeometry = new THREE.PlaneGeometry(6, 9);
            const material = new THREE.MeshBasicMaterial({
                transparent: true,
                side: THREE.DoubleSide,
                color: 0xcccccc,
                toneMapped: false
            });

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

            const cardMesh = new THREE.Mesh(cardGeometry, material);
            
            const position = new THREE.Vector3(
                startX + (index * (cardWidth + spacing)),
                -10,  // Changed from -12 to -7 to move cards up ~40%
                0
            );
            
            cardMesh.position.copy(position);
            this.originalPositions.set(cardMesh, position.clone());
            
            this.uiScene.add(cardMesh);
            this.cardMeshes.push(cardMesh);
        });
    }

    public render(renderer: THREE.WebGLRenderer | WebGPURenderer) {
        renderer.autoClear = false;  // Don't clear the previous render
        renderer.render(this.uiScene, this.uiCamera);
    }

    public addCard(card: Card) {
        console.log("Adding card:", card);
        this.cards.push(card);
        this.updateHandDisplay();
    }

    public removeCard(index: number) {
        this.cards.splice(index, 1);
        this.updateHandDisplay();
    }

    public getCards(): Card[] {
        return this.cards;
    }

    public placeCardOnBoard(gridX: number, gridZ: number) {
        const selectedCards = this.getSelectedCards();
        if (selectedCards.length === 0) return null;

        const card = selectedCards[0];
        const cardGeometry = new THREE.PlaneGeometry(1.4, 2.1); // Adjusted size to fit board squares
        const material = new THREE.MeshBasicMaterial({
            transparent: true,
            side: THREE.DoubleSide
        });

        // Load card texture
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            `/assets/images/${card.texture}.png`,
            (cardTexture) => {
                material.map = this.createCompositeTexture(cardTexture);
                material.needsUpdate = true;
            }
        );

        const cardMesh = new THREE.Mesh(cardGeometry, material);
        
        // Position card on board
        const boardX = (gridX - 3.5) * BOARD_CONFIG.SQUARE_SIZE;
        const boardZ = (gridZ - 3.5) * BOARD_CONFIG.SQUARE_SIZE;
        
        cardMesh.position.set(
            boardX,
            0.01, // Slightly above board to prevent z-fighting
            boardZ
        );
        cardMesh.rotation.x = -Math.PI / 2; // Lay flat on board

        this.uiScene.add(cardMesh);
        return cardMesh;
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
}

// Or alternatively, export CardHand as CardSystem
// export { CardHand as CardSystem };

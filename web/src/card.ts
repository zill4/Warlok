import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import gsap from 'gsap';

export interface Card {
    pieceType: string;
    color: 'white' | 'black';
    texture: string;
    model?: THREE.Group;  // For 3D piece preview
}

// Rename CardHand to CardSystem for consistency with imports
export class CardSystem {
    private cards: Card[] = [];
    private cardMeshes: THREE.Mesh[] = [];
    // private scene: THREE.Scene;
    private uiScene: THREE.Scene;  // Separate scene for UI
    private uiCamera: THREE.OrthographicCamera;  // Orthographic camera for UI
    private frameTexture: THREE.Texture;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private hoveredCard: THREE.Mesh | null = null;
    private originalPositions: Map<THREE.Mesh, THREE.Vector3> = new Map();
    
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
            -10 * aspect, 10 * aspect,  // left, right
            10, -10,                    // top, bottom
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
            this.uiCamera.left = -10 * newAspect;
            this.uiCamera.right = 10 * newAspect;
            this.uiCamera.updateProjectionMatrix();
        });

        // Add mouse move listener
        window.addEventListener('mousemove', (event) => {
            this.onMouseMove(event);
        });
    }

    private createCompositeTexture(cardTexture: THREE.Texture): THREE.CanvasTexture {
        // Create a canvas with proper dimensions
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 768;
        const context = canvas.getContext('2d')!;

        // Draw the card art (dragon) first
        if (cardTexture.image) {
            context.drawImage(cardTexture.image,
                56, 112,   // Position inside frame
                400, 400   // Size of card art
            );
        } else {
            console.error('Card texture image not loaded');
        }

        // Draw the frame on top
        if (this.frameTexture.image) {
            context.drawImage(this.frameTexture.image,
                0, 0,      // Start at top left
                512, 768   // Full size
            );
        } else {
            console.error('Frame texture not loaded');
        }

        return new THREE.CanvasTexture(canvas);
    }

    private onMouseMove(event: MouseEvent) {
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

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
            if (this.hoveredCard !== newHoveredCard) {
                this.hoveredCard = newHoveredCard;
                this.animateCardUp(newHoveredCard);
            }
        }
    }

    private animateCardUp(card: THREE.Mesh) {
        if (!this.originalPositions.has(card)) {
            this.originalPositions.set(card, card.position.clone());
        }
        
        // Store original position if not already stored
        const originalPos = this.originalPositions.get(card)!;
        
        // Animate to raised position
        gsap.to(card.position, {
            y: originalPos.y + 1,  // Raise card
            z: originalPos.z - 0.5,  // Bring slightly forward
            duration: 0.3,
            ease: "power2.out"
        });
        
        // Scale up slightly
        gsap.to(card.scale, {
            x: 1.1,
            y: 1.1,
            duration: 0.3,
            ease: "power2.out"
        });
    }

    private animateCardDown(card: THREE.Mesh) {
        const originalPos = this.originalPositions.get(card);
        if (!originalPos) return;

        // Animate back to original position
        gsap.to(card.position, {
            y: originalPos.y,
            z: originalPos.z,
            duration: 0.3,
            ease: "power2.out"
        });
        
        // Scale back to normal
        gsap.to(card.scale, {
            x: 1,
            y: 1,
            duration: 0.3,
            ease: "power2.out"
        });
    }

    private updateHandDisplay() {
        // Clear existing card meshes and their stored positions
        this.cardMeshes.forEach(mesh => this.uiScene.remove(mesh));
        this.cardMeshes = [];
        this.originalPositions.clear();

        // Calculate total width of all cards with spacing
        const cardWidth = 2;
        const spacing = 0.5;
        const totalWidth = (this.cards.length * cardWidth) + ((this.cards.length - 1) * spacing);
        const startX = -totalWidth / 2;

        this.cards.forEach((card, index) => {
            const cardGeometry = new THREE.PlaneGeometry(2, 3);
            const material = new THREE.MeshBasicMaterial({
                transparent: true,
                side: THREE.DoubleSide
            });

            // Load card-specific texture with error handling
            const textureLoader = new THREE.TextureLoader();
            
            // Check if the texture exists before trying to load it
            if (card.texture === 'knight_card' || 
                card.texture === 'bishop_card' || 
                card.texture === 'rook_card' || 
                card.texture === 'queen_card' || 
                card.texture === 'king_card' || 
                card.texture === 'pawn_card') {
                // Use a default texture or skip loading
                console.log(`Using default texture for ${card.texture}`);
                card.texture = 'blue_eyes_w_dragon'; // Use the texture we know exists
            }

            textureLoader.load(
                `/assets/images/${card.texture}.png`,
                (cardTexture) => {
                    console.log(`Loading texture for card: ${card.texture}`);
                    if (this.frameTexture.image) {
                        material.map = this.createCompositeTexture(cardTexture);
                        material.needsUpdate = true;
                    } else {
                        console.error('Frame texture not loaded yet');
                    }
                },
                undefined,
                (error) => {
                    console.error(`Error loading texture for card ${card.texture}:`, error);
                }
            );

            const cardMesh = new THREE.Mesh(cardGeometry, material);
            
            const position = new THREE.Vector3(
                startX + (index * (cardWidth + spacing)),
                -8,
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
        console.log("Adding card:", card);  // Debug log
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
        const card: Card = {
            pieceType: 'dragon',
            color: 'white',
            texture: 'blue_eyes_w_dragon'
        };
        
        const cardGeometry = new THREE.PlaneGeometry(2, 3);
        const material = new THREE.MeshBasicMaterial({
            transparent: true,
            side: THREE.DoubleSide
        });

        // Load card texture with error handling
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            `/assets/images/${card.texture}.png`,
            (cardTexture) => {
                console.log('Loading board card texture');
                // Wait for both textures to be loaded
                if (this.frameTexture.image) {
                    material.map = this.createCompositeTexture(cardTexture);
                    material.needsUpdate = true;
                } else {
                    console.error('Frame texture not loaded yet');
                }
            },
            undefined,
            (error) => {
                console.error('Error loading board card texture:', error);
            }
        );

        const cardMesh = new THREE.Mesh(cardGeometry, material);
        
        cardMesh.position.set(
            gridX - 3.5,
            0.1,
            gridZ - 3.5
        );
        cardMesh.rotation.x = -Math.PI / 2;

        this.uiScene.add(cardMesh);
        this.cardMeshes.push(cardMesh);
        this.cards.push(card);

        return cardMesh;
    }
}

// Or alternatively, export CardHand as CardSystem
// export { CardHand as CardSystem };

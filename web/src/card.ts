import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';

export interface Card {
    pieceType: string;
    color: 'white' | 'black';
    texture: string;
    model?: THREE.Group;  // For 3D piece preview
}

export class CardHand {
    private cards: Card[] = [];
    private cardMeshes: THREE.Mesh[] = [];
    // private scene: THREE.Scene;
    private uiScene: THREE.Scene;  // Separate scene for UI
    private uiCamera: THREE.OrthographicCamera;  // Orthographic camera for UI
    
    constructor() {
        // this.scene = scene;
        
        // Create separate scene for UI elements
        this.uiScene = new THREE.Scene();
        
        // Create orthographic camera for UI
        const aspect = window.innerWidth / window.innerHeight;
        this.uiCamera = new THREE.OrthographicCamera(
            -10 * aspect, 10 * aspect,  // left, right
            10, -10,                    // top, bottom
            0.1, 1000                   // near, far
        );
        this.uiCamera.position.z = 10;

        // Handle window resize
        window.addEventListener('resize', () => {
            const newAspect = window.innerWidth / window.innerHeight;
            this.uiCamera.left = -10 * newAspect;
            this.uiCamera.right = 10 * newAspect;
            this.uiCamera.updateProjectionMatrix();
        });
    }

    private updateHandDisplay() {
        // Clear existing card meshes
        this.cardMeshes.forEach(mesh => this.uiScene.remove(mesh));
        this.cardMeshes = [];

        // Card layout parameters
        const cardWidth = 2;
        const cardHeight = 3;
        const spacing = 0.3;
        const bottomOffset = -8;  // Distance from bottom of screen
        
        // Calculate total width of all cards
        const totalWidth = (this.cards.length * cardWidth) + ((this.cards.length - 1) * spacing);
        const startX = -totalWidth / 2;  // Center the cards horizontally

        this.cards.forEach((card, index) => {
            const cardGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
            const material = new THREE.MeshBasicMaterial({
                color: 0xff0000,  // Debug color
                side: THREE.DoubleSide
            });

            // Load texture
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(
                `/assets/cards/${card.texture}.png`,
                (texture) => {
                    material.map = texture;
                    material.needsUpdate = true;
                }
            );

            const cardMesh = new THREE.Mesh(cardGeometry, material);
            
            // Position card
            cardMesh.position.set(
                startX + (index * (cardWidth + spacing)),
                bottomOffset + Math.sin(index * 0.2) * 0.5,  // Slight wave effect
                0
            );

            // Slight rotation for visual interest
            cardMesh.rotation.z = Math.sin(index * 0.5) * 0.1;

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
}

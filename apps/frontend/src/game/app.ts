import '../utils/debug';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BoardManager } from './board.js';
import { GameState } from './state.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { WebGPURenderer } from 'three/webgpu';
import { CardSystem } from './card.js';
import { InputManager } from './input.js';
import { Bot } from './bot.js';
import { LightManager } from './light-manager';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Configuration (from constants.py)
export const BOARD_CONFIG = {
  SIZE: 8,
  SQUARE_SIZE: 1.5,
  COLORS: {
    WHITE: 0xeeeeee,
    BLACK: 0x444444,
    HOVER: 0x00ff00
  },
  PIECE_SCALES: {
    PAWN: 0.003,
    ROOK: 0.003,
    KNIGHT: 0.003,
    BISHOP: 0.003,
    QUEEN: 0.003,
    KING: 0.003
  }
};

// Update the renderer type to include both possibilities
type Renderer = THREE.WebGLRenderer | WebGPURenderer;

export class ChessGame {
    private static instance: ChessGame | null = null;
    private container!: HTMLElement;
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: Renderer;
    private controls!: THREE.OrbitControls;
    private boardManager!: BoardManager;
    private state!: GameState;
    private pieceModels = new Map<string, THREE.Group>();
    private isInitialized = false;
    private stats: Stats | null = null;
    private cardHand!: CardSystem;
    private raycaster!: THREE.Raycaster;
    private mouse!: THREE.Vector2;
    private inputManager!: InputManager;
    private bot!: Bot;

    constructor(containerId: string) {
        if (ChessGame.instance) {
            return ChessGame.instance;
        }
        
        ChessGame.instance = this;
        this.initializeGame(containerId).catch(error => {
            console.error('Failed to initialize game:', error);
        });
    }

    private async initializeGame(containerId: string): Promise<void> {
        if (this.isInitialized) {
            console.warn('Game already initialized');
            return;
        }

        // Initialize Stats with custom styling
        this.stats = new Stats();
        const statsElement = this.stats.dom;
        statsElement.style.position = 'fixed';
        statsElement.style.bottom = '3px';
        statsElement.style.right = '3px';
        statsElement.style.transform = 'scale(0.04)';
        statsElement.style.transformOrigin = 'bottom right';
        document.body.appendChild(statsElement);

        // Get container element
        this.container = document.getElementById(containerId) as HTMLElement;1
        if (!this.container) {
            throw new Error(`Container with id '${containerId}' not found`);
        }
        
        // Initialize scene and components
        await this.setupScene();
        
        // Initialize input manager
        this.inputManager = new InputManager(this.container);

        // Initialize game state first
        this.state = new GameState(this.scene);
        
        // Initialize card system with game state
        this.cardHand = new CardSystem(this.state);
        
        // Initialize board manager
        this.boardManager = new BoardManager(
            this.scene, 
            this.state, 
            this.cardHand,
            this.camera
        );
        
        // Initialize bot after other systems are ready
        const botPlayer = this.state.getPlayer('black');
        this.bot = new Bot(
            this.state,
            this.boardManager,
            this.cardHand,
            botPlayer
        );
        
        // Set bot instance in game state
        this.state.setBotInstance(this.bot);
        
        // Draw initial hand
        this.cardHand.drawInitialHand(7);
        
        // Start animation loop
        this.animate();
        // Initialize game
        this.init().catch(error => {
            console.error('Failed to initialize game:', error);
        });

        this.isInitialized = true;

        // Add to your initialization code
        this.container.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.inputManager.onRightClick(event, this.mouse, this.raycaster, this.camera, this.cardHand);
        }, false);

    }

    private async setupScene(): Promise<void> {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        // Log all lights in scene for debugging
        this.scene.traverse((object) => {
            if (object instanceof THREE.Light) {
                console.log('Found light in scene:', object);
            }
        });
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspect = width / height;
        
        // Adjust camera to see the cards better
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 20, 20); // Adjusted for better view
        
        try {
            this.renderer = new WebGPURenderer({ 
                antialias: true,
                alpha: true 
            });
            console.log('Using WebGPU renderer');
        } catch (error) {
            console.log('WebGPU not available, falling back to WebGL');
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true,
                alpha: true 
            });
        }
        
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        
        // Adjust OrbitControls
        this.setupControls();
        
        // Update raycaster to be more precise
        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Line!.threshold = 0.1;
        
        // Improve mouse position calculation
        this.mouse = new THREE.Vector2();
        
        // Add event listeners for card interactions
        this.container.addEventListener('mousemove', (event) => this.inputManager.onMouseMove(event, this.cardHand, this.raycaster, this.camera, this.mouse));
        this.container.addEventListener('click', (event) => this.inputManager.onMouseClick(event, this.mouse, this.raycaster, this.camera, this.cardHand, this.boardManager));
        this.container.addEventListener('contextmenu', (event) => this.inputManager.onRightClick(event, this.mouse, this.raycaster, this.camera, this.cardHand));
        
        window.addEventListener('resize', () => this.onWindowResize());

        // Setup lighting using LightManager
        LightManager.getInstance().setupLights(this.scene, this.camera);
    }

    private onWindowResize(): void {
        const container = document.getElementById('game-container');
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Update main perspective camera
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        // Update renderer
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Update card system
        if (this.cardHand) {
            this.cardHand.onContainerResize();
        }
    }

    private async animate() { 
        requestAnimationFrame(() => this.animate());
        
        // Update board manager (for animations)
        this.boardManager.update(0);
        
        if (this.stats) {
            this.stats.begin();
        }
        
        if (this.controls) {
            this.controls.update();
        }

        // Render main scene
        if (this.renderer && this.scene && this.camera) {
            if (this.renderer instanceof WebGPURenderer) {
                await this.renderer.clearAsync();
                await this.renderer.renderAsync(this.scene, this.camera);
                // Render UI/cards on top
                if (this.cardHand) {
                    this.renderer.autoClear = false;  // Don't clear the previous render
                    await this.cardHand.renderAsync(this.renderer);
                }
            } else {
                // WebGL path
                this.renderer.clear();
                this.renderer.render(this.scene, this.camera);
                
                // Render UI/cards on top
                if (this.cardHand) {
                    this.renderer.autoClear = false;  // Don't clear the previous render
                    this.cardHand.render(this.renderer);
                }
            }
        }
        
        if (this.stats) {
            this.stats.end();
        }
    }

    public async init(): Promise<void> {
        if (this.isInitialized) {
            console.warn('Game already initialized');
            return;
        }

        try {
            console.log("Starting game initialization...");
            
            // Load models first
            await this.loadModels();
            console.log("Models loaded successfully");
            
            // Pass models to board manager
            this.boardManager.setPieceModels(this.pieceModels);
            console.log("Piece models set in board manager");
            
            // Create board and setup pieces
            this.boardManager.createBoard();
            console.log("Board created");
            
            this.boardManager.setupInitialPieces();
            console.log("Pieces set up");
            
            this.isInitialized = true;
            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Game initialization failed:', error);
            throw error;
        }
    }

    private async loadModels(): Promise<void> {
        if (this.pieceModels.size > 0) {
            console.log('Models already loaded, skipping...');
            return;
        }

        const loader = new FBXLoader();
        const types = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king'];
        
        const loadPromises = types.flatMap(type => {
            const scale = 0.005;
            
            return ['white', 'black'].map(async (color) => {
                const path = `/assets/models/${color}_${type}.fbx`;
                try {
                    const model = await loader.loadAsync(path);
                    model.scale.setScalar(scale);
                    
                    model.traverse((object) => {
                        if (object instanceof THREE.Light) {
                            object.intensity = 0;
                            object.visible = false;
                        }
                        if (object instanceof THREE.Mesh) {
                            if (color === 'black') {
                                object.material = new THREE.MeshPhongMaterial({
                                    color: 0x000000,
                                    specular: 0x444444,
                                    shininess: 100,
                                    transparent: false,
                                    side: THREE.FrontSide,
                                    depthWrite: true,
                                    depthTest: true
                                });
                            } else {
                                object.material = new THREE.MeshToonMaterial({
                                    color: 0xFFFFFF,
                                    gradientMap: null,
                                    transparent: false,
                                    side: THREE.FrontSide,
                                    depthWrite: true,
                                    depthTest: true
                                });
                            }
                            object.castShadow = true;
                            object.receiveShadow = true;
                        }
                    });

                    this.pieceModels.set(`${color}_${type}`, model);
                    console.log(`Successfully loaded: ${path}`);
                } catch (error) {
                    console.error(`Failed to load model ${path}:`, error);
                    throw error;
                }
            });
        });

        await Promise.all(loadPromises);
        console.log('All models loaded successfully');
    }

    private setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        
        // Only enable middle mouse button for camera control
        this.controls.mouseButtons = {
            LEFT: undefined,  // Disable left click
            MIDDLE: THREE.MOUSE.ROTATE,  // Middle mouse for rotation
            RIGHT: undefined   // Disable right click
        };

        // Enable zoom but limit it
        this.controls.enableZoom = true;
        this.controls.minDistance = 0;
        this.controls.maxDistance = 1000;

        // Disable pan movement
        this.controls.enablePan = false;

        // Optional: Add some damping for smoother rotation
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Optional: Limit vertical rotation if desired
        this.controls.minPolarAngle = Math.PI / 4; // 45 degrees
        this.controls.maxPolarAngle = Math.PI / 2.1; // ~85 degrees
    }
}

// Initialize game only once when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChessGame('game-container');
});
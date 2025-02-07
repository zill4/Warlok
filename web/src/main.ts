import * as THREE from 'three';
import { BoardManager } from './board';
import { GameState } from './state';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
    PAWN: 0.3,
    ROOK: 0.4,
    KNIGHT: 0.35,
    BISHOP: 0.4,
    QUEEN: 0.5,
    KING: 0.6
  }
};

class Game {
    private scene = new THREE.Scene();
    private camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    private renderer = new THREE.WebGLRenderer({ antialias: true });
    private state: GameState;
    private boardManager: BoardManager;
    private controls!: OrbitControls;
    private pieceModels = new Map<string, THREE.Group>();

    constructor() {
        this.state = new GameState(this.scene);
        this.boardManager = new BoardManager(this.scene, this.state);
        this.initScene();
        this.initLights();
        this.initControls();
        this.loadModels().then(() => {
            this.boardManager.setPieceModels(this.pieceModels);
            this.boardManager.setupInitialPieces();
            this.animate();
        });
    }

    private initScene() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        this.camera.position.set(0, 12, 12);
        this.camera.lookAt(0, 0, 0);
    }

    private initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
    }

    private initLights() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    private animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    private async loadModels() {
        const loader = new FBXLoader();
        const types = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king'];
        
        try {
            for (const type of types) {
                const scale = BOARD_CONFIG.PIECE_SCALES[type.toUpperCase() as keyof typeof BOARD_CONFIG.PIECE_SCALES];
                
                for (const color of ['white', 'black'] as const) {
                    const path = `/assets/models/${color}_${type}.fbx`;
                    console.log('Loading model:', path);
                    
                    const model = await loader.loadAsync(path);
                    console.log('Successfully loaded:', path);
                    
                    // Apply scaling to the model
                    model.scale.setScalar(scale);
                    this.pieceModels.set(`${color}_${type}`, model);
                }
            }
        } catch (error) {
            console.error('Model loading failed:', error);
            alert(`Failed to load 3D models: ${error}`);
            throw error; // Prevent further execution
        }
    }
}

new Game();
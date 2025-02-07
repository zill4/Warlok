import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

class ChessGame {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#chessCanvas'),
            antialias: true
        });
        
        this.setupScene();
        this.loadModels();
        this.animate();
    }

    setupScene() {
        // Setup similar to our Ursina configuration
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        
        // Camera setup
        this.camera.position.set(0, 10, 10);
        this.camera.lookAt(0, 0, 0);
        
        // Lighting
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.3);
        mainLight.position.set(0, 20, 10);
        mainLight.castShadow = true;
        this.scene.add(mainLight);
        
        const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
        this.scene.add(ambientLight);
        
        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    }

    loadModels() {
        const loader = new FBXLoader();
        
        // Load chess pieces
        const pieceTypes = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king'];
        const colors = ['white', 'black'];
        
        pieceTypes.forEach(type => {
            colors.forEach(color => {
                loader.load(
                    `assets/models/${color}_${type}.fbx`,
                    (object) => {
                        // Store loaded models for later use
                        this.models[`${color}_${type}`] = object;
                    }
                );
            });
        });
    }

    createBoard() {
        const boardGeometry = new THREE.BoxGeometry(8, 0.5, 8);
        const materials = [
            new THREE.MeshPhongMaterial({ color: 0xFFFFFF }),
            new THREE.MeshPhongMaterial({ color: 0x808080 })
        ];
        
        // Create chess board squares
        for(let x = 0; x < 8; x++) {
            for(let z = 0; z < 8; z++) {
                const square = new THREE.Mesh(
                    new THREE.BoxGeometry(1, 0.1, 1),
                    materials[(x + z) % 2]
                );
                square.position.set(x - 3.5, 0, z - 3.5);
                square.receiveShadow = true;
                this.scene.add(square);
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize game
const game = new ChessGame(); 
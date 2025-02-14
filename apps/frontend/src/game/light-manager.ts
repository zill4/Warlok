import * as THREE from 'three';

export class LightManager {
    private static instance: LightManager | null = null;
    private lights: THREE.Light[] = [];

    private constructor() {}

    public static getInstance(): LightManager {
        if (!LightManager.instance) {
            LightManager.instance = new LightManager();
        }
        return LightManager.instance;
    }

    public setupLights(scene: THREE.Scene, camera: THREE.Camera): void {
        // Clear any existing lights from the scene
        this.clearLights(scene);

        // Main overhead light
        const topLight = new THREE.DirectionalLight(0xffffff, 2);
        topLight.position.set(0, 15, 0);
        scene.add(topLight);
        this.lights.push(topLight);

        // Camera-following light (subtle)
        const cameraLight = new THREE.SpotLight(0xffffff, 0.3);
        cameraLight.position.copy(camera.position);
        cameraLight.target.position.set(0, 0, 0);
        scene.add(cameraLight);
        scene.add(cameraLight.target);
        this.lights.push(cameraLight);

        // Very subtle ambient light
        const ambient = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambient);
        this.lights.push(ambient);
            // Update camera light position when camera moves
        camera.addEventListener('change', () => {
            cameraLight.position.copy(camera.position);
        });
    }

    private clearLights(scene: THREE.Scene): void {
        // Remove all existing lights
        this.lights.forEach(light => scene.remove(light));
        this.lights = [];

        // Also remove any other lights that might exist in the scene
        scene.children
            .filter(child => child instanceof THREE.Light)
            .forEach(light => scene.remove(light));
    }
} 
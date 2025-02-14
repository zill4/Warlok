import * as THREE from 'three';
import gsap from 'gsap';
import { ChessPiece, type PieceColor } from './core';

export class EffectsManager {
    private scene: THREE.Scene;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public animatePieceDestruction(piece: ChessPiece) {
        if (!piece.model) return;

        const originalPosition = piece.position.clone();
        const fragments: THREE.Mesh[] = [];
        const fragmentCount = 20;

        // Create fragment geometries
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshPhongMaterial({
            color: this.getPieceColor(piece.color)
        });

        // Create and animate fragments
        for (let i = 0; i < fragmentCount; i++) {
            const fragment = new THREE.Mesh(geometry, material);
            fragment.position.copy(originalPosition);
            fragment.position.y += 0.1;
            
            fragment.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            this.scene.add(fragment);
            fragments.push(fragment);

            // Position animation
            gsap.to(fragment.position, {
                x: originalPosition.x + (Math.random() - 0.5) * 2,
                y: originalPosition.y + Math.random() * 1.5,
                z: originalPosition.z + (Math.random() - 0.5) * 2,
                duration: 0.5,
                ease: "power2.out"
            });

            // Scale animation
            gsap.to(fragment.scale, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1,
                delay: 0.5,
                ease: "power2.in",
                onComplete: () => {
                    this.scene.remove(fragment);
                    fragment.geometry.dispose();
                    if (Array.isArray(fragment.material)) {
                        fragment.material.forEach(m => m.dispose());
                    } else {
                        fragment.material.dispose();
                    }
                }
            });

            // Rotation animation
            gsap.to(fragment.rotation, {
                x: Math.random() * Math.PI * 2,
                y: Math.random() * Math.PI * 2,
                z: Math.random() * Math.PI * 2,
                duration: 1,
                ease: "none"
            });
        }

        // Remove original piece after animation starts
        setTimeout(() => {
            if (piece.model) {
                this.scene.remove(piece.model);
            }
        }, 100);
    }

    private getPieceColor(color: PieceColor): number {
        return color === 'white' ? 0xeeeeee : 0x333333;
    }
} 
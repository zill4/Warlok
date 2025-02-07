import * as THREE from 'three';

export interface Card {
    pieceType: string;
    color: 'white' | 'black';
    texture: string;
}

export class CardSystem {
    private scene: THREE.Scene;
    public cards: THREE.Mesh[] = [];
    public selectedCard: THREE.Mesh | null = null;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    createCard(type: string, position: THREE.Vector3) {
        const geometry = new THREE.PlaneGeometry(0.8, 0.8);
        const texture = new THREE.TextureLoader().load(`assets/cards/${type}.png`);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });

        const card = new THREE.Mesh(geometry, material);
        card.position.copy(position);
        this.scene.add(card);
        this.cards.push(card);
        return card;
    }
}

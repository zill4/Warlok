export class CardSystem {
    constructor(scene) {
        this.scene = scene;
        this.cards = [];
        this.selectedCard = null;
    }
    
    createCard(type, color, position) {
        const geometry = new THREE.PlaneGeometry(0.8, 0.8);
        const texture = new THREE.TextureLoader().load(`assets/cards/${type}.png`);
        const material = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true
        });
        
        const card = new THREE.Mesh(geometry, material);
        card.position.copy(position);
        card.rotation.x = -Math.PI / 2;
        
        this.scene.add(card);
        return card;
    }
}

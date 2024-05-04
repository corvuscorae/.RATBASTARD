class Townie extends Phaser.GameObjects.Sprite {

    // x,y - starting sprite location
    // spriteKey - key for the sprite image asset
    // leftKey - key for moving left
    // rightKey - key for moving right
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        this.spawnRate = 5;
        this.spawnTimer = 0;

        scene.add.existing(this);

        return this;
    }

    update() {
        let my = this.my;
    }
}
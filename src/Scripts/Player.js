class Player extends Phaser.GameObjects.Sprite {

    // x,y - starting sprite location
    // spriteKey - key for the sprite image asset
    // leftKey - key for moving left
    // rightKey - key for moving right
    constructor(scene, x, y, texture, frame, leftKey, rightKey, playerSpeed) {
        super(scene, x, y, texture, frame);

        this.left = leftKey;
        this.right = rightKey;
        this.playerSpeed = playerSpeed;

        scene.add.existing(this);

        return this;
    }

    update() {
        // left
        if (this.left.isDown) {
            if (this.x > (this.displayWidth/2)) {
                this.x -= this.playerSpeed;
            }
        }
        // right
        if (this.right.isDown) {
            if (this.x < (game.config.width - (this.displayWidth/2))) {
                this.x += this.playerSpeed;
            }
        }
    }
}
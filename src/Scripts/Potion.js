class Potion extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {        
        super(scene, x, y, texture, frame);
        this.visible = false;
        this.active = false;
        this.rx = this.displayWidth / 2;
        this.ry = this.displayHeight / 2;
        return this;
    }

    update() {
        if (this.active) {
            this.y += this.speed;
            if (this.y > (game.config.height)) { this.makeInactive(); }
        }
    }

    makeActive() {
        this.visible = true;
        this.active = true;
    }

    makeInactive() {
        this.visible = false;
        this.active = false;
    }

}
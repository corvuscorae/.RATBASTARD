class LVL_1 extends Phaser.Scene { 
    curve;
    path;
    constructor() {
        super("lvl_1");
        this.my = {sprite: {}};

        // player movement speeds (in pixels/tick)
        this.playerSpeed = 5;
        this.throwSpeed = 5;
        this.my.sprite.potion = [];
        this.maxPots = 10;

        // townie stuff
        this.my.sprite.townieMob = [];
        this.maxTownies = 10;
        this.townieCooldown = 10;
        this.townieCountdown = 0;
        this.delay = 100;
        this.towniesKilled = 0;
        this.i = -1;

        this.potionCooldown = 3;
        this.cooldownCounter = 0;

        // waves
        this.wave = 1;
    }

    preload() {
        this.load.setPath("./assets/");
        
        this.load.image("wizard", "wizard.png");            // player
        this.load.image("playerPotion", "potionGreen.png"); // player bullet
        this.load.image("ratA", "ratBrown.png");            // rats
        this.load.image("ratB", "ratGrey.png");             
        this.load.image("ghost", "ghost.png");
        // townies
        this.load.image("townieA", "townie_1_1.png");       // townies
        this.load.image("townieB", "townie_1_2.png");
        this.load.image("townieC", "townie_2_1.png");
        this.load.image("townieD", "townie_2_2.png");
        this.load.image("knife", "knife.png");              // townie bullets
        this.load.image("sword", "sword.png");
        // knights
        this.load.image("knightA", "knight_1.png");         // knights
        this.load.image("knightB", "knight_2.png");
        this.load.image("axeSingle", "axeSingle.png");      // knife bullets
        this.load.image("axeDouble", "axeDouble.png");
        // boss
        this.load.image("enemyWizard", "enemyWizard.png");  // boss
        this.load.image("enemyStaff", "enemyStaff.png");
        this.load.image("enemyBullet", "enemyBullet.png");  // boss bullet
    }

    create() {
        let my = this.my;

        // Create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // player
        my.sprite.wizard = new Player(
            this, game.config.width/2, 40, "wizard", null, this.left, this.right, 5);
        my.sprite.wizard.setScale(3);

        // townies
        this.points = [
            -100,-100,
            0, 200,
            600, 200,
            600, 300,
            0, 300,
            0, 400,
            600, 400,
            600, 500,
            0, 500,
            0, 600,
            600, 600,
            600, 700,
            300, 700,
            300, 900
        ];
        this.curve = new Phaser.Curves.Spline(this.points); //* Creation of the Spline curve
        while (my.sprite.townieMob.length < this.maxTownies) {
            my.sprite.townieMob.push(
                this.add.follower(this.curve, this.curve.points[0].x, this.curve.points[0].y, "townieA")
            );
            my.sprite.townieMob[my.sprite.townieMob.length-1].setScale(2);
            //my.sprite.townieMob[my.sprite.townieMob.length-1].setVisible(false);
            my.sprite.townieMob[my.sprite.townieMob.length-1].rx = 8;
            my.sprite.townieMob[my.sprite.townieMob.length-1].ry = 8;
        }

        // update HTML description
        //document.getElementById('description').innerHTML = '<h2>Class Bullet.js</h2><br>A: left // D: right // Space: fire/emit // S: Next Scene'

    }

    update() {
        let my = this.my;
        this.delay--;
        this.townieCountdown--;
        
        this.fireBullets();
        if(this.towniesKilled == 10 * this.wave){
            this.wave++;
            this.towniesKilled = 0;
            this.i = -1;
            for(let townie of my.sprite.townieMob){
                townie.x = -100;
                townie.y = -100;
                townie.setVisible(true);
            }
        }
        for(let townie of my.sprite.townieMob){
            if(townie.y > 800){ 
                this.towniesKilled++; 
                townie.x = -100;
                townie.y = -100;
                townie.stopFollow();
                //console.log("rip " + this.wave); 
            }
        }
        if(this.delay < 0 && this.i < this.maxTownies - 1){//} && this.i < this.maxTownies){
            this.i++;
            this.townieRunner(this.i);
            this.delay = 10;
        }
        my.sprite.wizard.update();

    }

    fireBullets(){
        let my = this.my;
        this.cooldownCounter--; 

        // Check for bullet being fired
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            if(my.sprite.potion.length < this.maxPots){
                my.sprite.potion.push(this.add.sprite(
                    my.sprite.wizard.x, my.sprite.wizard.y, "playerPotion")
                );
                my.sprite.potion[my.sprite.potion.length-1].setScale(2);
            }
        }

        my.sprite.potion = my.sprite.potion.filter((potion) => potion.y < game.config.height + 20);
        // COLLISION
        // Check for collision with townies
        for (let potion of my.sprite.potion) {
            for (let townie of my.sprite.townieMob) {
                if (townie.visible && this.collision(townie, potion)) {
                    // clear out bullet -- put y offscreen, will get reaped next update
                    console.log("hit!");
                    potion.y = 900;
                    townie.visible = false;
                    townie.stopFollow();
                    this.towniesKilled++;
                }
            }
        }

        // Make all of the bullets move
        for (let potion of my.sprite.potion) {
            potion.y += this.throwSpeed;
        }
        
    }

    townieRunner(curr){
        let my = this.my;
        
        if(this.townieCountdown < 0){
            //my.sprite.townieMob[curr].setVisible(true);
            my.sprite.townieMob[curr].startFollow({
                from: 0,
                to: 1,
                delay: 0,
                duration: 30000 - (10000 * (this.wave - 1)), // make faster with subsequent waves
                ease: 'Sine.easeInOut',
                repeat: 0,
                yoyo: false,
                rotateToPath: false,
                rotationOffset: -90
            });
        }
        this.townieCountdown = this.townieCooldown;
        
        return;
    }

    collision(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }
}
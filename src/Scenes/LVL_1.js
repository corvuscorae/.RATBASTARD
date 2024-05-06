class LVL_1 extends Phaser.Scene { 
    curve;
    path;
    constructor() {
        super("lvl_1");
        this.my = {sprite: {}};

        // player movement speeds (in pixels/tick)
        this.playerSpeed = 5;
        this.throwSpeed = 5;

        // townie stuff
        this.my.sprite.townie = [];
        this.maxTownies = 10;
        this.townieCooldown = 10;
        this.townieCountdown = 0;
        this.delay = 100;
        this.i = -1;

        this.potionCooldown = 3;
        this.cooldownCounter = 0;

        // waves
        this.wave_1 = true;
        this.wave_2 = false;
        this.wave_3 = false;
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

        // player potions
        my.sprite.potionGroup = this.add.group({
            active: true,
            defaultKey: "playerPotion",
            maxSize: 10,
            runChildUpdate: true
            }
        )
        my.sprite.potionGroup.createMultiple({
            classType: Potion,
            active: false,
            key: my.sprite.potionGroup.defaultKey,
            repeat: my.sprite.potionGroup.maxSize-1,
            setScale: { x:2, y:2 },
            setXY: { x:-10, y:-10 } // starting position set offscreen
        });
        my.sprite.potionGroup.propertyValueSet("speed", this.throwSpeed);

        // townies
        this.points = [
            20, 20,
            80, 400,
            300, 750
        ];
        this.curve = new Phaser.Curves.Spline(this.points); //* Creation of the Spline curve
        while (my.sprite.townie.length < this.maxTownies) {
            my.sprite.townie.push(
                this.add.follower(this.curve, this.curve.points[0].x, this.curve.points[0].y, "townieA")
            );
            my.sprite.townie[my.sprite.townie.length-1].setScale(2);
            my.sprite.townie[my.sprite.townie.length-1].setVisible(false);
            my.sprite.townie[my.sprite.townie.length-1].rx = 8;
            my.sprite.townie[my.sprite.townie.length-1].ry = 8;
        }
        //my.sprite.townie = this.add.follower(this.curve, 200, 200, "townieA");
        //my.sprite.townie.setScale(2);
        // update HTML description
        //document.getElementById('description').innerHTML = '<h2>Class Bullet.js</h2><br>A: left // D: right // Space: fire/emit // S: Next Scene'

    }

    update() {
        let my = this.my;
        this.delay--;
        this.townieCountdown--;
        
        this.fireBullets();
        if(this.delay < 0 && this.i < this.maxTownies - 1){//} && this.i < this.maxTownies){
            this.i++;
            this.townieRunner(this.i);
            this.delay = 10;
        }
        my.sprite.wizard.update();
        // figure out damn collisions
    }

    fireBullets(){
        let my = this.my;
        this.cooldownCounter--; 

        // Check for bullet being fired
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            if (this.cooldownCounter < 0) {
                // Get the first inactive bullet, and make it active
                let potion = my.sprite.potionGroup.getFirstDead();
                // bullet will be null if there are no inactive (available) bullets
                if (potion != null) {
                    this.cooldownCounter = this.potionCooldown;
                    potion.makeActive();
                    potion.x = my.sprite.wizard.x + (my.sprite.wizard.displayWidth/2.5);
                    potion.y = my.sprite.wizard.y + (my.sprite.wizard.displayHeight/2.5);
                }
            }
        }
        
    }

    townieRunner(curr){
        let my = this.my;
        
        if(this.townieCountdown < 0){
            my.sprite.townie[curr].setVisible(true);
            my.sprite.townie[curr].startFollow({
                from: 0,
                to: 1,
                delay: 0,
                duration: 5000,
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

    collision(a, b){
        if(Math.abs(a.x - b.x) > (a.rx + b.rx)){ return false; }
        if(Math.abs(a.y - b.y) > (a.ry + b.ry)){ return false; }
        return true;
    }
}
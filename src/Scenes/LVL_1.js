class LVL_1 extends Phaser.Scene {
    constructor() {
        super("lvl_1");
        this.my = {sprite: {}};

        // player movement speeds (in pixels/tick)
        this.playerSpeed = 5;
        this.throwSpeed = 5;

        // townie stuff
        this.townieNumber = 0;
        this.townieSpawnTimer = 5;
        this.townieSpawnCounter = 0;
        this.towniesKilled = 0;

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
        
        // make townie group
        my.sprite.townieGroup = this.add.group({
            active: true,
            defaultKey: ["townieA","townieB","townieC","townieD"],
            maxSize: 10,
            runChildUpdate: true
            }
        );

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

        


        // update HTML description
        //document.getElementById('description').innerHTML = '<h2>Class Bullet.js</h2><br>A: left // D: right // Space: fire/emit // S: Next Scene'

    }

    update() {
        let my = this.my;

        this.fireBullets();
        this.townieSpawner();
        my.sprite.wizard.update(); // update the player avatar
        
        //if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
        //    this.scene.start("arrayBoom");
        //}

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

    townieSpawner(){
        let my = this.my;
        // spawn townies
        this.townieSpawnCounter--;
        if(this.townieSpawnCounter < 0){
            let randomX = [50, game.config.width - 50];
            let rand = Math.floor(Math.random() * 2);
            let randomY = Math.floor(Math.random() * (game.config.height - 50)) + 50;
            let randomKey = Math.floor(Math.random() * 4);  // [0, 3)]

            my.sprite.townieGroup.createFromConfig({
                classType: Townie,
                active: true,
                key: my.sprite.townieGroup.defaultKey[randomKey],
                setScale: { x:2, y:2 },
                setXY: { x:randomX[rand], y:randomY}
            });
            
            this.townieSpawnCounter = this.townieSpawnTimer;
        
        }
        return;
    }
}
          
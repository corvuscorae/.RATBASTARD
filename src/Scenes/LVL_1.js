class LVL_1 extends Phaser.Scene { 
    curve;
    path;
    constructor() {
        super("lvl_1");
        this.my = {sprite: {}};

        // player stuff
        this.playerSpeed = 10;
        this.throwSpeed = 15;
        this.my.sprite.potion = [];
        this.maxPots = 10;
        //this.potionCooldown = 3;
        //this.cooldownCounter = 0;

        // townie stuff
        this.my.sprite.ratPack = [];
        this.my.sprite.townieMob = [];
        this.maxTownies = 30;
        this.townieCooldown = 10;
        this.townieCountdown = 0;
        this.delay = 100;
        this.towniesKilled = 0;
        this.i = 0;
        this.my.sprite.knife = [];
        this.maxKnives = 20;
        this.knifeSpawn = 10;
        this.minKnifeCooldown = 3;
        this.ratified = 0;
        
        // waves
        this.wave = 1;
    }

    preload() {
        this.load.setPath("./assets/");

        this.load.image("wall", "wall.png");
        
        this.load.image("wizard", "wizard.png");            // player
        this.load.image("playerPotion", "potionGreen.png"); // player bullet
        this.load.image("ratA", "ratBrown.png");            // rats
        this.load.image("ghost", "ghost.png");

        this.load.image("townieA", "townie_1_1.png");       // townies
        this.load.image("townieB", "townie_1_2.png");   
        this.load.image("townieC", "townie_2_1.png");   
        this.load.image("townieD", "townie_2_2.png");   
        this.load.image("knife", "knife.png");              // townie bullets
    }

    create() {
        let my = this.my;
        let townies = ["townieA", "townieB", "townieC", "townieD"];

        // Create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        /* walls */
        this.wall_topL = this.add.tileSprite(100, 100, 100, 16, "wall");
        this.wall_topR = this.add.tileSprite(game.config.width - 100, 100, 100, 16, "wall");
        this.wall_bttmL = this.add.tileSprite(0, game.config.height - 70, 500, 16, "wall");
        this.wall_bttmL = this.add.tileSprite(game.config.width, game.config.height - 70, 500, 16, "wall");

        /* townies */
        // set up curves
        this.pointsA = [
            -100,200,
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
        this.pointsB = [
            game.config.width + 100, 450,
            600, 450,
            0, 450,
            0, 250,
            600, 250,
            600, 650,
            0, 650,
            300, 650,
            300, 900
        ]
        this.curveA = new Phaser.Curves.Spline(this.pointsA);     // curveA
        this.curveB = new Phaser.Curves.Spline(this.pointsB);     // curveB

        // fill arrays with townies and rats
        for(let n = 0; n < this.maxTownies; n++){
            // push to ratPack
            my.sprite.ratPack[n] = this.physics.add.image(-100, -100, "ratA");
            my.sprite.ratPack[n].setScale(2);
            my.sprite.ratPack[n].setVisible(false);

            // push to townieMob
            let rand = Math.floor(Math.random() * 4);
            if(n % 2 == 0){
                my.sprite.townieMob.push(
                this.add.follower(this.curveA, this.curveA.points[0].x, this.curveA.points[0].y, townies[rand])
                );
                my.sprite.townieMob[n].spawnLocation = "A";
            } else{
                my.sprite.townieMob.push(
                this.add.follower(this.curveB, this.curveB.points[0].x, this.curveB.points[0].y, townies[rand])
                );
                my.sprite.townieMob[n].spawnLocation = "B";
            }
            my.sprite.townieMob[n].setScale(2);
            my.sprite.townieMob[n].rx = 8;
            my.sprite.townieMob[n].ry = 8;
        }

        /* player */
        my.sprite.wizard = new Player(
            this, game.config.width/2, 40, "wizard", null, this.left, this.right, 5);
        my.sprite.wizard.setScale(3);

        // update HTML description
        //document.getElementById('description').innerHTML = '<h2>Class Bullet.js</h2><br>A: left // D: right // Space: fire/emit // S: Next Scene'

    }

    update() {
        let my = this.my;
        this.delay--;
        this.townieCountdown--;
        this.knifeSpawn--;

        my.sprite.wizard.update();
        this.firePlayerBullets();
        this.fireEnemyBullets();
        this.waveControl();
        this.moveRats();

        for(let townie of my.sprite.townieMob){
            if(townie.y > 800){
                this.kill(townie);  // kill townies who make it past the bottom of the screen
            }
        }
    }

    waveControl(){
        let my = this.my;

        if(this.wave < 4){
            if(this.towniesKilled >= 10 * this.wave){
                if(this.wave == 1) { this.wave = 2; }
                else if(this.wave == 2) { this.wave = 3; }
                else { this.wave = 4; }
                // console.log(`wave = ${this.wave}`); 
                this.towniesKilled = 0;
                this.i = 0;
                for(let townie of my.sprite.townieMob){
                    this.toCurveStart(townie);
                    townie.setVisible(true);
                }
            }
            if(this.delay < 0){
                //console.log(`i = ${this.i}`);
                if(this.i <= (this.wave * 10 - 1)){
                    this.townieRunner(this.i);
                    this.i++;
                    this.delay = 30 / this.wave;
                }
            }
        }
    }

    firePlayerBullets(){
        let my = this.my;

        // Check for bullet being fired
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            if(my.sprite.potion.length < this.maxPots){
                my.sprite.potion.push(this.add.sprite(
                    my.sprite.wizard.x + (my.sprite.wizard.displayWidth/3), 
                    my.sprite.wizard.y + (my.sprite.wizard.displayHeight/4), 
                    "playerPotion")
                );
                my.sprite.potion[my.sprite.potion.length-1].setScale(2);
            }
        }

        my.sprite.potion = my.sprite.potion.filter((potion) => potion.y < game.config.height + 20);
        // COLLISION
        // Check for collision with townies
        for (let potion of my.sprite.potion) {
            for (let townie of my.sprite.townieMob) {
                if (townie.visible){
                    if(this.collision(townie, potion)) {
                        this.rat(townie);
                        this.kill(townie);
                        potion.y = 900;
                    }
                }
            }
        }

        // Make all of the bullets move
        for (let potion of my.sprite.potion) {
            potion.y += this.throwSpeed;
        }
        return;
    }

    fireEnemyBullets(){
        let my = this.my;

        let townie = my.sprite.townieMob[Math.floor(Math.random() * this.maxTownies)];

        if(this.knifeSpawn < 0){
            // Check for bullet being fired
            if (townie.visible == true) {
                    if(my.sprite.knife.length < this.maxKnives){
                        my.sprite.knife.push(this.add.sprite(
                            townie.x, townie.y, "knife")
                        );
                        my.sprite.knife[my.sprite.knife.length-1].setScale(2);
                    }
            }

            my.sprite.knife = my.sprite.knife.filter((knife) => knife.y > -20);
            // COLLISION
            // Check for collision with wizard
            for (let knife of my.sprite.knife) {
                if (this.collision(knife, my.sprite.wizard)) {
                    // clear out bullet -- put y offscreen, will get reaped next update
                    //console.log("ouch!");
                    knife.y = -30;
                    // health stuff
                }
            }
        }

        this.knifeSpawn = Math.floor(Math.random() * (6 / this.wave));  
        // Make all of the bullets move
        for (let knife of my.sprite.knife) {
            knife.y -= this.throwSpeed/2;
        }
        
        return;
    }

    kill(townie){
        if(townie.visible){
            townie.visible = false;
            townie.stopFollow();
            this.toCurveStart(townie);
            this.towniesKilled++;
            console.log(this.towniesKilled);
        }
    }

    rat(townie){
        let my = this.my;

        my.sprite.ratPack[this.towniesKilled].x = townie.x;
        my.sprite.ratPack[this.towniesKilled].y = townie.y;
        my.sprite.ratPack[this.towniesKilled].setVisible(true);
    }

    moveRats(){
        let my = this.my;

        for(let rat of my.sprite.ratPack){
            if(rat.visible){
                if(rat.y > my.sprite.wizard.y + 30){ 
                    this.physics.moveToObject(rat, my.sprite.wizard, 0, 500);
                } else if (rat.y > -10){
                    rat.y -= this.throwSpeed;
                } else{
                    rat.setVisible(false);
                    this.ratified++;
                    console.log(`rats = ${this.ratified}`)
                }
            }
        }
    }

    toCurveStart(townie){
        if(townie.spawnLocation == "A"){
            townie.x = this.curveA.points[0].x;
            townie.y = this.curveA.points[0].y;
        }
        if(townie.spawnLocation == "B"){
            townie.x = this.curveB.points[0].x;
            townie.y = this.curveB.points[0].y;
        }
    }

    townieRunner(curr){
        let my = this.my;
        
        if(my.sprite.townieMob[curr].visible == false){ return; }

        if(this.townieCountdown < 0){
            //my.sprite.townieMob[curr].setVisible(true);
            my.sprite.townieMob[curr].startFollow({
                from: 0,
                to: 1,
                delay: 0,
                duration: 30000 - (5000 * (this.wave - 1)), // make faster with subsequent waves
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
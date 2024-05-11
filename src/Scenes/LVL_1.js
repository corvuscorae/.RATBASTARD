class LVL_1 extends Phaser.Scene { 
    curve;
    path;
    constructor() {
        super("lvl_1");
        this.my = {sprite: {}};
    }

    preload() { 
        // loaded on start screen
    }

    create() {
        let my = this.my;        
        let w = game.config.width;
        let h = game.config.height;
        
        this.init_variables();
        this.init_townie();
        this.init_UI();

        /* key objects */
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        /* environment */
        this.walls = {
            topL  : this.add.tileSprite(100, 110, 64, 16, "wall"),
            topR  : this.add.tileSprite(w - 100, 110, 64, 16, "wall"),
            bttmL : this.add.tileSprite(0, h - 70, 256, 16, "wall"),
            bttmR : this.add.tileSprite(w, h - 70, 256, 16, "wall"),
            midL  : this.add.tileSprite(w/3, h/2.3, 96, 16, "square"),
            midR  : this.add.tileSprite(w - w/3, h - h/3.3, 96, 16, "square")
        };
        for(let x in this.walls)[
            this.walls[x].setScale(2)
        ]

        /* player */
        my.sprite.wizard = new Player(
            this, game.config.width/2, 65, "wizard", null, this.left, this.right, 5);
        my.sprite.wizard.setScale(3);
    }

    update() {
        let my = this.my;
        this.flashCountdown--;
        this.townieCountdown--;

        if(this.hp > 0){
            this.delay--;
            this.knifeSpawn--;

            my.sprite.wizard.update();
            this.firePlayerBullets();
            this.fireEnemyBullets();
            this.waveControl();
            this.moveRats();
            this.moveWallX(this.walls.midL, -1);
            this.moveWallX(this.walls.midR, 1);
            this.score.setText(`SCORE:${this.ratified}`);

            for(let townie of my.sprite.townieMob){
                if(townie.y > 800){
                    this.kill(townie);  // kill townies who make it past the bottom of the screen
                }
            }

            if(this.wave == 4){ this.endLevel(); }
        }
        else{ this.endLevel(); }
    }

    /////////////////////////////// HELPER FUNCTIONS ///////////////////////////////
    /* INITILIAZITION */
    init_variables(){ /* scene variables */
        // player stuff
        this.playerSpeed = 10;
        this.throwSpeed = 15;
        this.my.sprite.potion = [];
        this.maxPots = 10;
        this.hp = 3;

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
        this.wallspeed = 3;
        
        // waves
        this.wave = 1;
        this.onTime = 40;
        this.offTime = 20;
        this.flashCountdown = 0;

        // sounds
        this.endSound = true;
        this.bgMusic = 
            this.sound.add("sfx_bg",{
                volume: 0.7,
                rate: 1,
                detune: 0,
                loop: false
            });
        this.bgMusic.play();
        this.hitPlayer = 
            this.sound.add("sfx_playerHit",{
                volume: 0.7,
                rate: 1,
                detune: 0,
                loop: false
            });
        this.hitTownie = 
            this.sound.add("sfx_enemyHit",{
                volume: 0.7,
                rate: 1,
                detune: 0,
                loop: false
            });
        this.rip = 
            this.sound.add("sfx_rip",{
                volume: 0.7,
                rate: 1,
                detune: 0,
                loop: false
            });
        this.win = 
            this.sound.add("sfx_win",{
                volume: 0.7,
                rate: 1,
                detune: 0,
                loop: false
            });
    }

    init_townie(){/* townies */
        let my = this.my;
        
        let townies = ["townieA", "townieB", "townieC", "townieD"];
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
            //my.sprite.townieMob[n].rx = 8;
            //my.sprite.townieMob[n].ry = 8;
        }
    }

    init_UI(){ /* ui */
        let my = this.my;
        let w = game.config.width;
        let h = game.config.height;
        
        //score
        this.score = this.add.bitmapText(10, 10, "pixel_font", `SCORE:${this.ratified}`, 20);
        // health
        this.health = this.add.bitmapText(w - 250, 10, "pixel_font", `HEALTH:`, 20);
        this.hearts = [
            this.add.sprite(w - this.health.displayWidth + 50, 20, "heart"),
            this.add.sprite(w - this.health.displayWidth + 85, 20, "heart"),
            this.add.sprite(w - this.health.displayWidth + 120, 20, "heart")
        ];
        for(let h of this.hearts){ h.setScale(2.5); }
        // end
        this.end = this.add.bitmapText(w / 2, h / 3.5, 
                    "pixel_font", ``, 50).setOrigin(0.5); // will be set in endScene()
        this.end.setVisible(false);
        this.finalScore = this.add.bitmapText(w / 2, h / 2 + 50,     
                    "pixel_font", `\n\nFINAL:${this.ratified}`, 40).setOrigin(0.5);
        this.finalScore.setVisible(false);
        this.pointsC = [
             w / 2,         65,
            (w / 2) - 30,   85,
            (w / 2) - 60,   65,
            (w / 2) - 30,   45,
             w / 2,         65,
            (w / 2) + 30,   85,
            (w / 2) + 60,   65,
            (w / 2) + 30,   45,
             w / 2,         65
        ]
        this.curveC = new Phaser.Curves.Spline(this.pointsC);
        my.sprite.endSprite = this.add.follower(this.curveC, this.curveC.points[0].x, this.curveC.points[0].y, "ghost");
        my.sprite.endSprite.setScale(3);
        my.sprite.endSprite.visible = false;
        this.restart = this.add.bitmapText(w / 2, h / 1.5 - 25, 
                    "pixel_font", `press ENTER to start over`, 20).setOrigin(0.5);
        this.restart.setVisible(false);

        // update HTML description
        document.getElementById('description').innerHTML = 
            "<h2> > RAT BASTARD THE MAGE</h2><br>a game about a wizard who simply loves rats";

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

    collision(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    firePlayerBullets(){
        let my = this.my;

        // check for potion being fired
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            if(my.sprite.potion.length < this.maxPots){
                my.sprite.potion.push(this.add.sprite(  // put at wizard's right hand
                    my.sprite.wizard.x + (my.sprite.wizard.displayWidth/3), 
                    my.sprite.wizard.y + (my.sprite.wizard.displayHeight/4), 
                    "playerPotion")
                );
                my.sprite.potion[my.sprite.potion.length-1].setScale(2);
            }
        }
        // filter offscreen potions from potion array
        my.sprite.potion = my.sprite.potion.filter((potion) => potion.y < game.config.height + 20);

        // COLLISION
        for (let potion of my.sprite.potion) {
            //check for collision with walls
            for(let location in this.walls){
                if(this.collision(potion, this.walls[location])){
                    potion.y = 900; // put offscreen (to be filtered)
                }
            }
            // check for collision with townies
            for (let townie of my.sprite.townieMob) {
                if(townie.visible){
                    if(this.collision(townie, potion)) {
                        this.hitTownie.play();
                        this.makeRat(townie);
                        this.kill(townie);
                        potion.y = 900;
                    }
                }
            }
        }

        // make all of the potions move
        for (let potion of my.sprite.potion) {
            potion.y += this.throwSpeed;
        }
        return;
    }

    fireEnemyBullets(){
        let my = this.my;

        let townie = my.sprite.townieMob[Math.floor(Math.random() * this.maxTownies)];
        
        // fire bullets after knifeSpawn timers is depleted
        if(this.knifeSpawn < 0){
            if (townie.visible == true) {   // only fire from visible townies
                    if(my.sprite.knife.length < this.maxKnives){
                        my.sprite.knife.push(this.add.sprite( townie.x, townie.y, "knife"));
                        my.sprite.knife[my.sprite.knife.length-1].setScale(2);
                    }
            }
            // filter offscreen knives from knife array
            my.sprite.knife = my.sprite.knife.filter((knife) => knife.y > -20);

            // COLLISION
            for (let knife of my.sprite.knife) {
                // check for collision with walls
                for(let location in this.walls){
                    if(this.collision(knife, this.walls[location])){
                        knife.y = -30;
                    }
                }
                // check for collision with wizard
                if (this.collision(knife, my.sprite.wizard)) {
                    //console.log("ouch!");
                    this.hitPlayer.play();
                    knife.y = -30;
                    // health
                    this.hp--;
                    if(this.hp >= 0){ 
                        this.hearts[this.hp].setVisible(false); 
                        // if(this.hp == 0){ console.log("u ded"); }
                    }

                }
            }
        }

        this.knifeSpawn = Math.floor(Math.random() * (6 / this.wave));  
        // Make all of the knives move
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
            // console.log(this.towniesKilled);
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

    makeRat(townie){
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
                    //console.log(`rats = ${this.ratified}`)
                }
            }
        }
    }

    moveWallX(wall, direction){
        wall.x += this.wallspeed * direction;
        if(wall.x < -wall.displayWidth){ 
            wall.x = game.config.width + wall.displayWidth; 
        }
        if(wall.x > game.config.width + wall.displayWidth){//} + wall.displayWidth){ 
            wall.x = -wall.displayWidth; 
        }
    }

    endLevel(){
        let my = this. my;

        for(let potion of my.sprite.potion){ potion.y = -20; }
        for(let knife of my.sprite.knife){ knife.y = -20; }
        for(let townie of my.sprite.townieMob){ townie.setVisible(false); }

        // text
        this.score.setVisible(false);
        this.health.setVisible(false);

        this.finalScore.setText(`SCORE:${this.ratified}`);
        this.finalScore.setVisible(true);
        this.end.setVisible(true);

        if(this.hp > 0){
            if(this.endSound == true){ this.win.play(); this.endSound = false; }
            this.bgMusic.setDetune(500);
            if(this.ratified == 0){
                this.end.setText("ok then!");
            } else if(this.ratified < 5){
                this.end.setText("u tried!");
            } else if(this.ratified < 10){
                this.end.setText("good effort!");
            } else if(this.ratified < 20){
                this.end.setText("nice job!");
            } else if(this.ratified < 40){
                this.end.setText("great job!");
            } else {
                this.end.setText("excellent job!");
            }
            my.sprite.endSprite.setTexture("wizard");
        }
        else{ 
            if(this.endSound == true){ this.rip.play(); this.endSound = false; }
            this.bgMusic.setDetune(-1000);
            this.end.setText("u died :(");
            my.sprite.endSprite.setTexture("ghost");
        }

        // end dance
        my.sprite.wizard.setVisible(false);
        my.sprite.endSprite.visible = true;
        if(this.townieCountdown < 0){   // using a random countdown here bc that's what worked *shrug*
            my.sprite.endSprite.startFollow({
                from: 0,
                to: 1,
                delay: 0,
                duration: 1000,
                ease: '',
                repeat: -1,
                yoyo: false,
                rotateToPath: false,
                rotationOffset: -90
            });
        }
        this.townieCountdown = this.townieCooldown;
        
        // prompth to restart
        this.restart.setVisible(true);
        if(this.flashCountdown < 0){ // funky lil text effect
            this.restart.fontSize = 20;
            if(this.flashCountdown < -(this.offTime)){
                this.restart.fontSize = 23;
                this.flashCountdown = this.onTime;
            }
        }
        if (Phaser.Input.Keyboard.JustDown(this.enter)) {
                this.bgMusic.stop();
                this.scene.start("start");
        }
        
    }
}
// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    fps: { forceSetTimeOut: true, target: 60 },   // ensure consistent timing across machines
    width: 600,
    height: 800,
    scene: [LVL_1]
}


const game = new Phaser.Game(config);
var gameSpace = document.getElementById("game");
//game objects
var player, platforms;
var playerControlKeys;
//game values
var jumpVelocity = -200, playerMovementVelocity = 200;

var config = {
    type: Phaser.AUTO,
    width: 800, height: 400,
    parent: gameSpace,
    physics: { 
        default: 'arcade', 
        arcade: {
            gravity: {
                y: 500
            },
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};       
var game = new Phaser.Game(config);

function preload()
{
    this.load.crossOrigin = "anonymous";
    this.load.baseURL = "https://examples.phaser.io/assets/";
    this.load.spritesheet("player", "games/starstruck/dude.png", {
        frameWidth: 32,
        frameHeight: 48,
    })
    this.load.image("background", "games/gofish/background.png")
    this.load.image("platform", "games/breakout/brick1.png")
}

function create()
{
    //loading player and background image
    let image = this.add.image(0, 0, "background").setOrigin(0,0);
    player = this.physics.add.sprite(50, 100, 'player');
    player.body.setCollideWorldBounds(true);
    player.body.setVelocityY(200);
    //creating platforms
    platforms = this.physics.add.staticGroup();
    for(let i = 0; i < 20; i++)
    {
        platforms.create(200 - 100 *(i + 1)/2, 200 - 25*(i+1), "platform");
    }
    platforms.create(200, 375, "platform");
    this.physics.add.collider(player, platforms);
    //creating keyboard that gives information what keys are pressed
    playerControlKeys = this.input.keyboard.createCursorKeys();
    
    //creating player animation
    this.anims.create({
            key: "leftMovement",
            frames: this.anims.generateFrameNumbers('player', {
                start: 0,
                end: 3,
            }),
            frameRate: 5,
            repeat: -1
        }
    );

    this.anims.create({
            key: "idle",
            frames: [{key: "player", frame: 4 }],
            frameRate: 5,
            repeat: -1
        }
    );

    this.anims.create({
            key: "rightMovement",
            frames: this.anims.generateFrameNumbers('player', {
                start: 5,
                end: 8,
            }),
            frameRate: 5,
            repeat: -1
        }
    );
}

function update()
{
    if(playerControlKeys.left.isDown)
    {
        player.anims.play("leftMovement", true);
        player.setVelocityX(-playerMovementVelocity)
    }
    else if(playerControlKeys.right.isDown)
    {
        player.anims.play("rightMovement", true);
        player.setVelocityX(playerMovementVelocity)
    }
    else
    {
        player.anims.play("idle", true);
        player.setVelocityX(0)
    }
        

    if((playerControlKeys.up.isDown || playerControlKeys.space.isDown) && player.body.onFloor())
    {
        player.setVelocityY(jumpVelocity)
        //to do: try this with platforms
    }
}

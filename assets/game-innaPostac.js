var gameSpace = document.getElementById("game");
//game objects
var player, platforms;
var playerControlKeys;
//game values
var jumpVelocity = -200, playerMovementVelocity = 200, playerFacingLeft = false;

var config = {
    type: Phaser.AUTO,
    width: 1100, height: 600,
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
    this.load.baseURL = "./assets/";
    this.load.spritesheet("playerMovementRight", "rightPlayerMovement.png", {
        frameWidth: 44,
        frameHeight: 65,
    })
    this.load.spritesheet("playerMovementLeft", "leftPlayerMovement.png", {
        frameWidth: 44,
        frameHeight: 65,
    })
    this.load.spritesheet("playerIdle", "idle.png", {
        frameWidth: 39,
        frameHeight: 65,
    })
    this.load.spritesheet("playerShootingLeft", "shootingLeft.png", {
        frameWidth: 82,
        frameHeight: 65,
    })
    this.load.spritesheet("playerShootingRight", "shootingRight.png", {
        frameWidth: 82,
        frameHeight: 65,
    })
    this.load.image("background", "background.png")
    this.load.image("platform", "platform.png")
}

function create()
{
    //loading player and background image
    let image = this.add.image(0, 0, "background").setOrigin(0,0);
    image.setScale(0.6);
    player = this.physics.add.sprite(50, 100, 'playerIdle');
    player.body.setCollideWorldBounds(true);
    player.body.setVelocityY(200);
    player.body.setSize(45, 65)

    //creating platforms
    platforms = this.physics.add.staticGroup();
    for(let i = 0; i < 20; i++)
    {
        platforms.create(50 + 32*i, 550, "platform");
    }
    platforms.create(725, 575, "platform");
    this.physics.add.collider(player, platforms);
    
    //creating keyboard that gives information what keys are pressed
    playerControlKeys = this.input.keyboard.createCursorKeys();
    
    //creating player animation
    this.anims.create({
            key: "leftMovement",
            frames: this.anims.generateFrameNumbers('playerMovementLeft', {
                start: 0,
                end: 7,
            }),
            frameRate: 10,
            repeat: -1
        }
    );

    this.anims.create({
            key: "idleLeft",
            frames: [{key: "playerIdle", frame: 0 }],
            frameRate: 5,
            repeat: -1
        }
    );

    this.anims.create({
        key: "idleRight",
        frames: [{key: "playerIdle", frame: 1 }],
        frameRate: 5,
        repeat: -1
    }
);

    this.anims.create({
            key: "rightMovement",
            frames: this.anims.generateFrameNumbers('playerMovementRight', {
                start: 0,
                end: 7,
            }),
            frameRate: 10,
            repeat: -1
        }
    );
    this.anims.create({
            key: "shootingLeft",
            frames: this.anims.generateFrameNumbers('playerShootingLeft', {
                start: 0,
                end: 2,
            }),
            frameRate: 20,
            repeat: -1
        }
    );
    this.anims.create({
        key: "shootingRight",
        frames: this.anims.generateFrameNumbers('playerShootingRight', {
            start: 0,
            end: 2,
        }),
        frameRate: 20,
        repeat: 0
    }
);
}

function update()
{
    if(playerControlKeys.left.isDown)
    {
        player.anims.play("leftMovement", true);
        player.setVelocityX(-playerMovementVelocity)
        playerFacingLeft = true;
    }
    else if(playerControlKeys.right.isDown)
    {
        player.anims.play("rightMovement", true);
        player.setVelocityX(playerMovementVelocity)
        playerFacingLeft = false;
    }
    else
    {
        if(playerFacingLeft)
            player.anims.play("idleLeft", true);
        else
            player.anims.play("idleRight", true);
        player.setVelocityX(0)
    }
        

    if((playerControlKeys.up.isDown) && player.body.onFloor())
    {
        player.setVelocityY(jumpVelocity)
    }

    if(playerControlKeys.space.isDown)
    {
        if(playerFacingLeft)
            player.anims.play("shootingLeft", true);
        else
            player.anims.play("shootingRight", true);
    }
}

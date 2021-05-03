var gameSpace = document.getElementById("game");
//game objects
var player, platforms;
var playerControlKeys;
var sizeOfSingleBlock = 32;
var minBreakBetweenLevels = 110; //dla swobodnego skoku i chodzenia
var widthOfSingleBlock = 16;
var spawnPoint = { x:50, y:520 }
//var spawnPoint = { x:50, y:100 }
//game values
var jumpVelocity = -200, playerMovementVelocity = 200, playerFacingLeft = false;
var currentLevel = 1;

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
    //setting up a world
    let image = this.add.image(0, 0, "background").setOrigin(0,0);
    image.setScale(0.6);
    //loading player
    player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'playerIdle');
    player.body.setCollideWorldBounds(true);
    player.body.setVelocityY(200);
    //creating platforms
    platforms = this.physics.add.staticGroup();
    drawPlatforms(platforms);
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
                end: 1,
            }),
            frameRate: 10,
            repeat: -1
        }
    );
    this.anims.create({
            key: "shootingRight",
            frames: this.anims.generateFrameNumbers('playerShootingRight', {
                start: 0,
                end: 1,
            }),
            frameRate: 10,
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
        if(playerControlKeys.space.isDown)
            playShootingAnimation();
        else
        if(playerFacingLeft)
            player.anims.play("idleLeft", true);
        else
            player.anims.play("idleRight", true);
        player.setVelocityX(0)
    }
        

    if((playerControlKeys.up.isDown) && player.body.onFloor())
    {
        //this.scene.restart(); -> ponownie rysuje scene
        player.setVelocityY(jumpVelocity)
    }
    playShootingAnimation();

}

function playShootingAnimation()
{
    if(playerControlKeys.space.isDown)
    {
        if(playerFacingLeft)
        {
            player.anims.play("shootingLeft", true);
        }
        else
            player.anims.play("shootingRight", true);

    }
}

function drawPlatforms(platforms)
{
    let startHeight = config.height, startWidth = 0;
    //0 floor
    for(let i = 0; i < config.width/sizeOfSingleBlock + 1; i++)
    {
        platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
    }
    
    // first floor
    startHeight = startHeight - minBreakBetweenLevels;
    for(let i = 2; i < config.width/sizeOfSingleBlock/2 + 1; i++)
    {
        platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
    }

    for(let i = 3*(config.width/sizeOfSingleBlock/4) + 1;  i < config.width/sizeOfSingleBlock - 3; i++)
    {
        platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
    }

    // second floor
    startHeight = startHeight - minBreakBetweenLevels;
    for(let i = config.width/sizeOfSingleBlock/4 + 1; i < config.width/sizeOfSingleBlock - 3; i++)
    {
        platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
    }

    //third floor
    startHeight = startHeight - minBreakBetweenLevels;
    for(let i = 2; i < 3*config.width/sizeOfSingleBlock/4 + 1; i++)
    {
        platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
    }

    //stairs between 3rd and 4th floor
    for(let i = 3*config.width/sizeOfSingleBlock/4 + 2; i < config.width/sizeOfSingleBlock - 3 ; i++)
    {
        platforms.create(
            startWidth + i*sizeOfSingleBlock,
            startHeight - widthOfSingleBlock/2 - 25 * (i - 3*config.width/sizeOfSingleBlock/4 - 1),
            "platform"
        );
    }

    //fourth floor
    startHeight = startHeight - minBreakBetweenLevels;
    for(let i = config.width/sizeOfSingleBlock/4 + 1; i < 3*config.width/sizeOfSingleBlock/4 + 1; i++)
    {
        platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
    }

    for(let i = 2;  i < config.width/sizeOfSingleBlock/6; i++)
    {
        platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2 ,"platform");
    }
}
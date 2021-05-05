var gameSpace = document.getElementById("game");
//game objects
var player, platforms;
var door, ladders, coins, bullets;
var playerControlKeys;
var sizeOfSingleBlock = 32;
var minBreakBetweenLevels = 110; //dla swobodnego skoku i chodzenia
var widthOfSingleBlock = 16;
var heightOfSingleLadder = 170;
var spawnPoint = { x:50, y:520 }
var spawnPointStartScene = { x:50, y:100 }
//game values
var jumpVelocity = -200, playerMovementVelocity = 200, playerFacingLeft = false, gameWon = false, gameFinished = false;
var minNumberOfCoins = 15;
var currentLevel = 1;

//----------------------------------------------------------------------------------------------------------> First Level
class FirstLevel extends Phaser.Scene{
    constructor (name = null)
    {
        if(name == null)
            super("FirstLevel");
        else
            super(name);
    }
    preload()
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
        
        this.load.image("coin", "coin.png", {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.image("bullet", "bullet.png")
        this.load.image("ladder", "ladder.png")
        /*mogą się później przydać
        this.load.image("diamond", "sprites/diamond.png")
        this.load.coin("explode", "games/invaders/explode.png", {
            frameWidth: 32,
            frameHeight: 48,
        })*/
        
        //nie moglam znalezc drzwi - na razie jest cokolwiek XD
        this.load.image("door", "mushroom.png")

    }

    create()
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
        this.drawPlatforms(platforms);
        this.physics.add.collider(player, platforms);

        //creating door
        //door = this.physics.add.sprite(100,200, 'door');
        this.drawDoor(door, this);
        //this.physics.add.collider(door,platforms);
        //creating ladder
        ladders = this.physics.add.staticGroup();
        this.drawLadders(ladders);
        //creating coins
        coins = this.physics.add.staticGroup();
        this.drawCoins(coins);
        //creating bullets
        bullets = this.physics.add.staticGroup();
        
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

        this.anims.create({
                key: "flipingCoin",
                frames: this.anims.generateFrameNumbers('coin', {
                    start: 0,
                    end: 5
            }),
            frameRate: 1,
            repeat: -1
        });
        //coins.anims.play("flipingCoin", true);

    }

    update()
    {
        //coins.anims.play("flipingCoin", true);
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
                this.playShootingAnimation();
            else
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
        this.playShootingAnimation();
        //this.playCoinAnimation();

        if(gameFinished)//level finsihed or sth like that
        {
            this.nextScene();
        }

        if(false)//lost level
        {
            this.gameOver();
        }
    }

    playCoinAnimation()
    {
        coins.anims.play("flipingCoin", true);
    }

    playShootingAnimation()
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

    drawPlatforms(platforms)
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

    drawDoor(door, game)
    {
        door = this.physics.add.sprite(100,225, 'door');
        game.physics.add.collider(door,platforms);
    }

    drawCoins(coins)
    {
        let startHeight = config.height- minBreakBetweenLevels/2, startWidth = 400;
        //0 floor
        for(let i=0; i<1; i++)
        {
            coins.create(startWidth+i*50, startHeight, "coin");
        }

    }

    drawLadders(ladders)
    {
        let startHeight = config.height - heightOfSingleLadder/2 -  widthOfSingleBlock, startWidth = 300;
        //floor 0 to 1
        ladders.create(startWidth, startHeight,"ladder");
        startWidth=900;
        ladders.create(startWidth, startHeight,"ladder");

        //floor 1 to 2
        startHeight = startHeight - minBreakBetweenLevels;
        startWidth=500;
        ladders.create(startWidth, startHeight,"ladder");

        //floor 2 to 3
        startHeight = startHeight - minBreakBetweenLevels;
        startWidth=350;
        ladders.create(startWidth, startHeight,"ladder");

        //floor 3 to 4 
        startHeight = startHeight - minBreakBetweenLevels;
        startWidth=150;
        ladders.create(startWidth, startHeight,"ladder");
        
    }

    nextScene()
    {
        this.scene.stop("FirstLevel");
        this.scene.start("SecondLevel");
    }

    gameOver()
    {
        this.scene.stop("FirstLevel");
        this.scene.start("EndWindow");
    }
    
}

//----------------------------------------------------------------------------------------------------------> Start Window
class StartWindow extends Phaser.Scene{
    constructor (name = null)
    {
        if(name == null)
            super("StartWindow");
        else
            super(name);
    }

    preload()
    {
        this.load.crossOrigin = "anonymous";
        this.load.baseURL = "./assets/";
        this.load.spritesheet("playerIdle", "idle.png", {
            frameWidth: 39,
            frameHeight: 65,
        })
        this.load.image("background", "background.png")
        this.load.image("platform", "platform.png")
    }

    create()
    {
        //setting up a world
        let image = this.add.image(0, 0, "background").setOrigin(0,0);
        image.setScale(0.6);
        //loading player
        playerControlKeys = this.input.keyboard.createCursorKeys();
        player = this.physics.add.sprite(this.physics.world.bounds.centerX, this.physics.world.bounds.centerY, 'playerIdle');
        player.body.setCollideWorldBounds(true);
        player.body.setVelocityY(200);
        //creating platforms
        platforms = this.physics.add.staticGroup();
        this.drawPlatforms(platforms);
        this.physics.add.collider(player, platforms);
        //play button
        let startGameText = this.add.text(
            this.physics.world.bounds.centerX/2 - 100,
            this.physics.world.bounds.centerY - 100,
            'To start a game press SPACE',
            {
                font: "60px Georgia",
                fill: "#ffffff",
                align: "center"
            }
        );
        startGameText.visible = true;
           
    }

    drawPlatforms(platforms)
    {
        let startHeight = config.height, startWidth = 0;
        //0 floor
        for(let i = 0; i < config.width/sizeOfSingleBlock + 1; i++)
        {
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
        }
    }

    update()
    {
        if(playerControlKeys.space.isDown)
        {
            this.scene.stop("StartWindow");
            this.scene.start("FirstLevel");
        }
        
    }
}


//----------------------------------------------------------------------------------------------------------> End Window
class EndWindow extends Phaser.Scene{
    constructor ()
    {
        super("EndWindow");
    }

    preload()
    {
        this.load.crossOrigin = "anonymous";
        this.load.baseURL = "./assets/";
        this.load.spritesheet("playerIdle", "idle.png", {
            frameWidth: 39,
            frameHeight: 65,
        })
        this.load.image("background", "background.png")
        this.load.image("platform", "platform.png")
    }

    create()
    {
        //setting up a world
        let image = this.add.image(0, 0, "background").setOrigin(0,0);
        image.setScale(0.6);
        //loading player
        playerControlKeys = this.input.keyboard.createCursorKeys();
        player = this.physics.add.sprite(1000, 0, 'playerIdle');
        player.body.setCollideWorldBounds(true);
        player.body.setVelocityY(200);
        //creating platforms
        platforms = this.physics.add.staticGroup();
        this.drawPlatforms(platforms);
        this.physics.add.collider(player, platforms);
        //play button
        let endgameMessage = this.add.text(
            this.physics.world.bounds.centerX/2 - 100,
            this.physics.world.bounds.centerY - 100,
            gameWon ? "Congratutaltions!" : "Refresh and start again!",
            {
                font: "60px Georgia",
                fill: "#ffffff",
                align: "center"
            }
        );
        endgameMessage.visible = true;
           
    }

    drawPlatforms(platforms)
    {
        let startHeight = config.height/2, startWidth = 0;
        //0 floor
        for(let i = 0; i < config.width/sizeOfSingleBlock + 1; i++)
        {
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
        }
    }

}

class SecondLevel extends FirstLevel
{
    constructor()
    {
        super("SecondLevel")
    }

    drawPlatforms(platforms)
    {
        let startHeight = config.height, startWidth = 0;
        //0 floor
        for(let i = 0; i < config.width/sizeOfSingleBlock + 1; i++)
        {
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
        }
        
        // first floor
        startHeight = startHeight - minBreakBetweenLevels;
        for(let i = 2; i < config.width/sizeOfSingleBlock/4 + 1; i++)
        {
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
        }

        for(let i = 3*(config.width/sizeOfSingleBlock/4) + 1;  i < config.width/sizeOfSingleBlock - 3; i++)
        {
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
        }

        // second floor
        startHeight = startHeight - minBreakBetweenLevels;
        for(let k = 0; k < 6; k++)
            for(let i = k*config.width/sizeOfSingleBlock/6 + 1; i < (k+1)*config.width/sizeOfSingleBlock/6 - 2; i++)
            {
                platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
            }

        //third floor
        startHeight = startHeight - minBreakBetweenLevels;
        for(let i = 2; i < 2*config.width/sizeOfSingleBlock/5 + 1; i++)
        {
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
        }

        for(let i =  4*config.width/sizeOfSingleBlock/5; i < config.width/sizeOfSingleBlock; i++)
        {
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
        }

        //fourth floor
        startHeight = startHeight - minBreakBetweenLevels;
        for(let i = config.width/sizeOfSingleBlock/2 + 1; i < 4*config.width/sizeOfSingleBlock/5 + 1; i++)
        {
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
        }

        for(let i = 2;  i < config.width/sizeOfSingleBlock/6; i++)
        {
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2 ,"platform");
        }
    }
    
    drawDoor(door, game)
    {
        door = this.physics.add.sprite(650,115, 'door');
        game.physics.add.collider(door,platforms);
    }
    
    drawCoins(coins)
    {
        let startHeight = config.height- minBreakBetweenLevels/2, startWidth = 400;
        //0 floor
        for(let i=0; i<1; i++)
        {
            coins.create(startWidth+i*50, startHeight, "coin");
        }

    }

    drawLadders(ladders)
    {
        let startHeight = config.height - heightOfSingleLadder/2 -  widthOfSingleBlock, startWidth = 280;
        //floor 0 to 1
        ladders.create(startWidth, startHeight,"ladder");
        startWidth=880;
        ladders.create(startWidth, startHeight,"ladder");

        //floor 1 to 2
        startHeight = startHeight - minBreakBetweenLevels;
        startWidth=100;
        ladders.create(startWidth, startHeight,"ladder");
        startWidth=940;
        ladders.create(startWidth, startHeight,"ladder");

        //floor 2 to 3
        startHeight = startHeight - minBreakBetweenLevels;
        startWidth=400;
        ladders.create(startWidth, startHeight,"ladder");
        startWidth=990;
        ladders.create(startWidth, startHeight,"ladder");

        //floor 3 to 4 
        startHeight = startHeight - minBreakBetweenLevels;
        startWidth=150;
        ladders.create(startWidth, startHeight,"ladder");
        startWidth=900;
        ladders.create(startWidth, startHeight,"ladder");
        
    }

    nextScene()
    {
        this.scene.stop("SecondLevel");
        this.scene.start("ThirdLevel");
    }

    gameOver()
    {
        this.scene.stop("SecondLevel");
        this.scene.start("EndWindow");
    }
}


class ThirdLevel extends FirstLevel
{
    constructor()
    {
        super("ThirdLevel")
    }

    drawPlatforms(platforms)
    {
        let startHeight = config.height, startWidth = 0;
        //0 floor
        for(let i = 0; i < config.width/sizeOfSingleBlock + 1; i++)
        {
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
        }
        
        // first floor
        startHeight = startHeight - minBreakBetweenLevels;
        for(let k = 0; k < 6; k++)
            for(let i = k*config.width/sizeOfSingleBlock/6 + 1; i < (k+1)*config.width/sizeOfSingleBlock/6 - 2; i++)
            {
                platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
            }

        // second floor
        startHeight = startHeight - minBreakBetweenLevels;
        for(let i = 1; i < config.width/sizeOfSingleBlock/2 - 2; i++)
        {
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
        }
        for(let i = config.width/sizeOfSingleBlock/2 + 1; i < config.width/sizeOfSingleBlock - 2; i++)
        {
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
        }
        //third floor
        startHeight = startHeight - minBreakBetweenLevels;
        for(let i = 2*config.width/sizeOfSingleBlock/5; i < 3*config.width/sizeOfSingleBlock/5 + 1; i++)
        {
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
        }
        
        //stairs between third and fourth floor
        let spaceBetweenStairsHorizontally = 40;
        let spaceBetweenStairsVertically = 25;
        let additionalStart = config.width/6;
        console.log(startWidth)
        for(let i = 4; i > 1 ; i--)
        {
            platforms.create(
                startWidth + 2*(5-i)*spaceBetweenStairsHorizontally + additionalStart,
                startHeight -  i*spaceBetweenStairsVertically,
                "platform"
            );
        }

        //fourth floor
        startHeight = startHeight - minBreakBetweenLevels;
        for(let i = config.width/sizeOfSingleBlock/2 + 1; i < 4*config.width/sizeOfSingleBlock/5 + 1; i++)
        {
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
        }

        for(let i = 2;  i < config.width/sizeOfSingleBlock/6; i++)
        {
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2 ,"platform");
        }
    }

    drawDoor(door, game)
    {
        door = this.physics.add.sprite(950,335, 'door');
        game.physics.add.collider(door,platforms);
    }

    drawCoins(coins)
    {
        let startHeight = config.height- minBreakBetweenLevels/2, startWidth = 400;
        //0 floor
        for(let i=0; i<1; i++)
        {
            coins.create(startWidth+i*50, startHeight, "coin");
        }

    }

    drawLadders(ladders)
    {
        let startHeight = config.height - heightOfSingleLadder/2 -  widthOfSingleBlock, startWidth = 290;
        //floor 0 to 1
        ladders.create(startWidth, startHeight,"ladder");
        startWidth=750;
        ladders.create(startWidth, startHeight,"ladder");

        //floor 1 to 2
        startHeight = startHeight - minBreakBetweenLevels;
        startWidth=450;
        ladders.create(startWidth, startHeight,"ladder");

        //floor 2 to 3
        startHeight = startHeight - minBreakBetweenLevels;
        startWidth=680;
        ladders.create(startWidth, startHeight,"ladder");

        //floor 3 to 4 
        startHeight = startHeight - minBreakBetweenLevels;
        startWidth=580;
        ladders.create(startWidth, startHeight,"ladder");
        
    }

    nextScene()
    {
        this.scene.stop("ThirdLevel");
        this.scene.start("EndWindow");
    }

    gameOver()
    {
        this.scene.stop("ThirdLevel");
        this.scene.start("EndWindow");
    }
}

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
    scene: [StartWindow, FirstLevel, SecondLevel, ThirdLevel, EndWindow]
};       
var game = new Phaser.Game(config);

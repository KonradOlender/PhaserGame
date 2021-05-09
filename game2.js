var gameSpace = document.getElementById("game");
//game objects
var player, platforms;
var enemies;
var door, ladders, coins, bullets, bounds;
var playerControlKeys;
var sizeOfSingleBlock = 32;
var minBreakBetweenLevels = 110; //dla swobodnego skoku i chodzenia
var widthOfSingleBlock = 16;
var heightOfSingleLadder = 170;
var spawnPoint = { x:50, y:520 }
var spawnPointStartScene = { x:50, y:100 }
//game values
var jumpVelocity = -200, playerMovementVelocity = 200, playerFacingLeft = false, gameWon = false, gameFinished = false;
var minNumberOfCoins = 15, currentNumberOfCoins = 0;
var currentLevel = 1;
var numberOfCoinsText;
var enemievelocity = 80;
var playerCollideLadder= false;

class Bullet extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y)
    {
        super(scene, x, y, 'bullet');
    }

    fire(x, y, side)
    {
        this.body.reset(x,y);
        this.setActive(true);
        this.setVisible(true);
        
        if(side)
            this.setVelocityX(-600);
        else this.setVelocityX(600);
    }
}

class BulletsGroup extends Phaser.Physics.Arcade.Group
{
    constructor(scene) 
    {
        super(scene.physics.world, scene);

        this.createMultiple({
            classType: Bullet,
            frameQuantity: 1000,
            active: false,
            visible: false,
            key: 'bullet'
        })
    }

    fireBullet(x, y, side)
    {
        const bullet = this.getFirstDead(false);
        if(bullet)
        {
            bullet.fire(x, y, side);
        }
    }
}


//----------------------------------------------------------------------------------------------------------> First Level
class FirstLevel extends Phaser.Scene{
    constructor (name = null)
    {
        if(name == null)
            super("FirstLevel");
        else
            super(name);

        this.currentNumberOfCoins = 0;
        this.bulletsGroup;
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
        this.load.image("wall", "wall.png")
        this.load.image("platform", "platform.png")
        
        this.load.spritesheet("coin", "coin.png", {
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
        this.load.image("door", "door.png")

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
        player.body.gravity.y = 500;
        //player always in front
        player.depth = 100;
        //this.body.gravity.y = 0;
        //loading enemies
        enemies = this.physics.add.group()
        this.placeEnemies();
        //enemie = this.physics.add.sprite(100, 300, 'playerIdle');
        

        //creating platforms
        bounds = this.physics.add.staticGroup();
        platforms = this.physics.add.staticGroup();
        this.drawPlatforms(platforms);
        this.physics.add.collider(player, platforms);
        this.physics.add.collider(enemies, platforms);
        

        //creating door
        door = this.physics.add.sprite(1060, spawnPoint.y, 'door');
        door.body.gravity.y = 500;
        this.physics.add.collider(door,platforms);
        //creating ladder
        ladders = this.physics.add.staticGroup();
        this.drawLadders(ladders);
        //creating coins
        coins = this.physics.add.staticGroup();
        this.drawCoins(coins);
        //creating bullets
        bullets = this.physics.add.staticGroup();
        this.bulletsGroup = new BulletsGroup(this);
        
        //this.physics.add.collider(player, ladders, playerIsOnLadder);
        //
        numberOfCoinsText = this.add.text(
            0,
            0,
            `Coins needed to open the door: ${currentNumberOfCoins} / ${minNumberOfCoins}` ,
            {
                font: "20px Georgia",
                fill: "#ffd700",
                align: "center"
            }
        );
        numberOfCoinsText.visible = true;
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
            frameRate: 5,
            repeat: -1
        });

    }

    update()
    {
        Phaser.Actions.Call(coins.getChildren(), child => {
            child.anims.play('flipingCoin', true);
        });
        
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

        if(playerControlKeys.up.isDown)
        {
            if(playerCollideLadder) this.climb(); 
            else if(player.body.onFloor()) player.setVelocityY(jumpVelocity);
        }
        if(playerControlKeys.down.isDown && playerCollideLadder)
        {
            this.climbDown();
        }
        this.playShootingAnimation();

        if(playerControlKeys.shift.isDown)
        {
            //zmienic pozniej na if((playerControlKeys.up.isDown) && this.currentNumberOfCoins == this.minNumberOfConis)
            if(currentNumberOfCoins >=0) this.physics.overlap(player, door, this.playerOpenDoor);
        }


        if(gameFinished)//level finsihed or sth like that
        {
            this.nextScene();
        }

        if(false)//lost level
        {
            this.gameOver();
        }

        
        if(this.physics.overlap(player, ladders)) this.physics.overlap(player, ladders, this.playerIsOnLadder)
            else 
            {
                playerCollideLadder = false;
                this.noClimb();
            }
        this.physics.collide(player, coins, this.playerGetCoin);
        this.physics.collide(enemies, bounds, this.changeEnemieDirection);
        this.physics.collide(bullets, enemies, this.killEnemie);
    }

    shoot(side)
    {
        if(side) this.bulletsGroup.fireBullet(player.x - 25, player.y - 16, side);
        else this.bulletsGroup.fireBullet(player.x + 25, player.y - 16, side);
    }

    killEnemie(bullet, enemie)
    {
        bullet.disableBody(true, true);
        enemie.disableBody(true, true);
    }

    changeEnemieDirection(enemie){
        enemievelocity = enemievelocity * (-1)
        enemie.setVelocityX(enemievelocity);
    }

    placeEnemies()
    {
        for(let i = 1; i<3; i++){
            let enemie = enemies.create(i * 100, 300, 'playerIdle')
            enemie.setCollideWorldBounds = true;
            enemie.body.setVelocityX(enemievelocity);
            enemie.body.gravity.y = 500;
        }
        
    }

    playerIsOnLadder(player, ladder)
    {
        playerCollideLadder = true;
    }

    climb()
    {
        player.body.gravity.y = 0;
        player.y--;
    }

    climbDown()
    {
        player.body.gravity.y = 0;
        player.y++;
    }

    noClimb()
    {
        player.body.gravity.y = 500;
    }

    playerGetCoin(player, coin)
    {
        //addCoin();
        coin.disableBody(true, true);
        currentNumberOfCoins++;
        if(currentNumberOfCoins <= minNumberOfCoins)
            numberOfCoinsText.setText(`Coins needed to open the door: ${currentNumberOfCoins} / ${minNumberOfCoins}`)
    }
    
    playerOpenDoor(player, door)
    { 
        gameFinished = true;
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
                this.shoot(true);
                player.anims.play("shootingLeft", true);
            }
            else
            {
                this.shoot(false);
                player.anims.play("shootingRight", true);
            }

        }
    }

    drawPlatforms(platforms)
    {
        let startHeight = config.height, startWidth = 0;
        //0 floor
        for(let i = 0; i < config.width/sizeOfSingleBlock + 1; i++)
        {
            if(i==0||i==config.width/sizeOfSingleBlock){
                bounds.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2, "wall")
            }
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
        }
        
        // first floor
        startHeight = startHeight - minBreakBetweenLevels;
        for(let i = 2; i < config.width/sizeOfSingleBlock/2 + 1; i++)
        {
            if(i==2|| i== 18){
                bounds.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2, "wall");
            }
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
        }

        for(let i = 3*(config.width/sizeOfSingleBlock/4) + 1;  i < config.width/sizeOfSingleBlock - 3; i++)
        {
            if(i== 3*(config.width/sizeOfSingleBlock/4) + 1|| i== 3*(config.width/sizeOfSingleBlock/4) + 5){
                bounds.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2, "wall")
            }
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
        }

        // second floor
        startHeight = startHeight - minBreakBetweenLevels;
        for(let i = config.width/sizeOfSingleBlock/4 + 1; i < config.width/sizeOfSingleBlock - 3; i++)
        {
            if(i == config.width/sizeOfSingleBlock/4 + 1 || i == config.width/sizeOfSingleBlock/4 + 22){
                bounds.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2, "wall")
            }
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
        }

        //third floor
        startHeight = startHeight - minBreakBetweenLevels;
        for(let i = 2; i < 3*config.width/sizeOfSingleBlock/4 + 1; i++)
        {
            if(i == 2 || i == 26){
                bounds.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2, "wall")
            }
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
            if(i == config.width/sizeOfSingleBlock/4 + 1 || i == config.width/sizeOfSingleBlock/4 + 18){
                bounds.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2, "wall")
            }
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2,"platform");
        }

        for(let i = 2;  i < config.width/sizeOfSingleBlock/6; i++)
        {
            if(i == 2 || i == 5){
                bounds.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2, "wall")
            }
            platforms.create(startWidth + i*sizeOfSingleBlock, startHeight - widthOfSingleBlock/2 ,"platform");
        }
    }

    drawCoins(coins)
    {
        let startHeight = config.height- minBreakBetweenLevels/2, startWidth = 400;
        //0 floor
        for(let i=0; i<4; i++)
            coins.create(startWidth+i*50, startHeight, "coin");
        //1 floor
        startHeight-=minBreakBetweenLevels;
        startWidth = 90;
        for(let i=0; i<2; i++)
            coins.create(startWidth+i*50, startHeight, "coin");
        //2 floor
        startHeight-=minBreakBetweenLevels;
        startWidth = 700;
        for(let i=0; i<3; i++)
            coins.create(startWidth+i*50, startHeight, "coin");
        //3 floor
        startHeight-=minBreakBetweenLevels;
        startWidth = 600;
        for(let i=0; i<2; i++)
            coins.create(startWidth+i*50, startHeight, "coin");
        //4 floor
        startHeight-=minBreakBetweenLevels;
        startWidth = 100;
        coins.create(startWidth, startHeight, "coin");
        startWidth = 500
        for(let i=0; i<3; i++)
            coins.create(startWidth+i*50, startHeight, "coin");

    }

    drawLadders(ladders)
    {
        let startHeight = config.height - heightOfSingleLadder/2 -  widthOfSingleBlock, startWidth = 605;
        //floor 0 to 1
        ladders.create(startWidth, startHeight,"ladder");
        startWidth=830;
        ladders.create(startWidth, startHeight,"ladder");

        //floor 1 to 2
        startHeight = startHeight - minBreakBetweenLevels;
        startWidth=280;
        ladders.create(startWidth, startHeight,"ladder");

        //floor 2 to 3
        startHeight = startHeight - minBreakBetweenLevels;
        startWidth=860;
        ladders.create(startWidth, startHeight,"ladder");

        //floor 3 to 4 
        startHeight = startHeight - minBreakBetweenLevels;
        startWidth=190;
        ladders.create(startWidth, startHeight,"ladder");
        
    }

    nextScene()
    {
        gameFinished = false;
        currentNumberOfCoins = 0;
        this.scene.stop("FirstLevel");
        this.scene.start("SecondLevel");
    }

    gameOver()
    {
        this.scene.stop("FirstLevel");
        this.scene.start("EndWindow");
    }
    
    addCoin()
    {
        this.currentNumberOfCoins++;
        if(this.currentNumberOfCoins <= minNumberOfCoins)
            numberOfCoinsText.setText(`Coins needed to open the door: ${this.currentNumberOfCoins} / ${minNumberOfCoins}`)
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
        this.load.image("bubble", "bubble.png")
    }

    create()
    {
        //setting up a world
        let image = this.add.image(0, 0, "background").setOrigin(0,0);
        image.setScale(0.6);
        //loading player
        playerControlKeys = this.input.keyboard.createCursorKeys();
        player = this.physics.add.sprite(this.physics.world.bounds.centerX/2, this.physics.world.bounds.centerY/2, 'playerIdle');
        player.body.setCollideWorldBounds(true);
        player.body.setVelocityY(200);
        //creating platforms
        platforms = this.physics.add.staticGroup();
        this.drawPlatforms(platforms);
        this.physics.add.collider(player, platforms);
        //play button
        let currentIndex = 0;
        let dialogMessages =[
            "Click ENTER through whole tutorial",
            "Hi! Now you will learn how to control the player",
            "To move to the sides press arrows left or right",
            "To jump press up arrow",
            "To climb a ladder you shoud use up and down arrows",
            "To shoot you should press space",
            "To advance to another level you sholud collect all the coins",
            "When you collect enough coins the doors will open, then press shift to enter",
            "Remember to avoid contact with enemies, if they touch you, you will die",
            "GOooOoOoOOoD LUCK!",
            "When you are ready to start a game press SPACE"
        ];
        let bubble = this.add.image(500, 250, "bubble");
        let startGameText = this.add.text(
            280,
            130,
            dialogMessages[0],
            {
                font: "40px Georgia",
                fill: "#ffffff",
                align: "center"
            }
        );
        startGameText.visible = true;
        startGameText.setWordWrapWidth(480);

        this.input.keyboard.on('keydown-ENTER', function () {
            currentIndex ++
            currentIndex = currentIndex % dialogMessages.length;
            startGameText.setText(dialogMessages[currentIndex]);
        });
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
        let dialogMessages =[
            "Hi!",
            gameWon ? "Congrats you won!" : "Unfortuantely you lost",
            "Hope you had fun playing it!",
            "Do you want to play again? Reload the page!"
        ];
        let currentIndex = 0;
        //setting up a world
        let image = this.add.image(0, 0, "background").setOrigin(0,0);
        image.setScale(0.6);
        //loading player
        playerControlKeys = this.input.keyboard.createCursorKeys();
        player = this.physics.add.sprite(1000, 0, 'playerIdle');
        player.body.setCollideWorldBounds(true);
        player.body.setVelocityY(200);
        player.body.gravity.y = 500;
        //creating platforms
        platforms = this.physics.add.staticGroup();
        this.drawPlatforms(platforms);
        this.physics.add.collider(player, platforms);
    
        let bubble = this.add.image(875, 125, "bubble");
        bubble.setScale(0.4);
        bubble.flipX = !bubble.flipX;
        let endgameMessage = this.add.text(
            790,
            75,
            dialogMessages[currentIndex],
            {
                font: "20px Georgia",
                fill: "#ffffff",
                align: "center"
            }
        );
        endgameMessage.visible = true;
        endgameMessage.setWordWrapWidth(180);

        this.input.keyboard.on('keydown-ENTER', function () {
            currentIndex ++
            currentIndex = currentIndex % dialogMessages.length;
            endgameMessage.setText(dialogMessages[currentIndex]);
        });
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
        gameFinished=false;
        this.bulletsGroup;
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
    
    drawCoins(coins)
    {
        let startHeight = config.height- minBreakBetweenLevels/2, startWidth = 500;
        //0 floor
        for(let i=0; i<3; i++)
            coins.create(startWidth+i*50, startHeight, "coin");
        //1 floor
        startHeight-=minBreakBetweenLevels;
        coins.create(90, startHeight, "coin");
        //2 floor
        startHeight-=minBreakBetweenLevels;
        startWidth = 65;
        for(let i=0; i<6; i++)
            coins.create(startWidth+i*185, startHeight, "coin");
        //3 floor
        startHeight-=minBreakBetweenLevels;
        startWidth = 400;
        for(let i=0; i<2; i++)
            coins.create(startWidth+i*50, startHeight, "coin");
        //4 floor
        startHeight-=minBreakBetweenLevels;
        coins.create(100, startHeight, "coin");
        startWidth = 800
        for(let i=0; i<2; i++)
            coins.create(startWidth+i*50, startHeight, "coin");

    }

    drawLadders(ladders)
    {
        let startHeight = config.height - heightOfSingleLadder/2 -  widthOfSingleBlock, startWidth = 320;
        //floor 0 to 1
        ladders.create(startWidth, startHeight,"ladder");
        startWidth=1010;
        ladders.create(startWidth, startHeight,"ladder");

        //floor 1 to 2
        startHeight = startHeight - minBreakBetweenLevels;
        startWidth=125;
        ladders.create(startWidth, startHeight,"ladder");
        startWidth=920;
        ladders.create(startWidth, startHeight,"ladder");

        //floor 2 to 3
        startHeight = startHeight - minBreakBetweenLevels;
        startWidth=840;
        ladders.create(startWidth, startHeight,"ladder");

        //floor 3 to 4 
        startHeight = startHeight - minBreakBetweenLevels;
        startWidth=190;
        ladders.create(startWidth, startHeight,"ladder");
        startWidth=930;
        ladders.create(startWidth, startHeight,"ladder");
        
    }

    nextScene()
    {
        gameFinished=false;
        currentNumberOfCoins = 0;
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
        gameFinished=false;
        this.bulletsGroup;
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

    drawCoins(coins)
    {
        let startHeight = config.height- minBreakBetweenLevels/2, startWidth = 865;
        //0 floor
        for(let i=0; i<2; i++)
            coins.create(startWidth+i*50, startHeight, "coin");
        //1 floor
        startHeight-=minBreakBetweenLevels;
        startWidth = 65
        for(let i=0; i<6; i++)
            coins.create(startWidth+i*184, startHeight, "coin");
        //2 floor
        startHeight-=minBreakBetweenLevels;
        startWidth = 65;
        for(let i=0; i<3; i++)
            coins.create(startWidth+i*50, startHeight, "coin");
        //3 floor
        startHeight-=minBreakBetweenLevels;
        //4 floor
        startHeight-=minBreakBetweenLevels;
        startWidth = 80
        for(let i=0; i<2; i++)
            coins.create(startWidth+i*50, startHeight, "coin");
        startWidth = 800
        for(let i=0; i<2; i++)
            coins.create(startWidth+i*50, startHeight, "coin");

    }

    drawLadders(ladders)
    {
        let startHeight = config.height - heightOfSingleLadder/2 -  widthOfSingleBlock, startWidth = 310;
        //floor 0 to 1
        ladders.create(startWidth, startHeight,"ladder");
        startWidth=735;
        ladders.create(startWidth, startHeight,"ladder");

        //floor 1 to 2
        startHeight = startHeight - minBreakBetweenLevels;
        startWidth=550;
        ladders.create(startWidth, startHeight,"ladder");

        //floor 2 to 3
        startHeight = startHeight - minBreakBetweenLevels;
        startWidth=690;
        ladders.create(startWidth, startHeight,"ladder");

        //floor 3 to 4 
        startHeight = startHeight - minBreakBetweenLevels;
        startWidth=550;
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
                y: 0
            },
        }
    },
    scene: [StartWindow, FirstLevel, SecondLevel, ThirdLevel, EndWindow]
};       
var game = new Phaser.Game(config);
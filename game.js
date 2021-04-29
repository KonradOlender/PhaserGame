var gameSpace = document.getElementById("game");
var player;
console.log("jestem tu");
var config = {
    type: Phaser.AUTO,
    width: 600, height: 500,
    parent: gameSpace,
    physics: { 
        default: 'arcade', 
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
    this.load.image("player", "games/starstruck/dude.png")
}

function create()
{
    player = this.physics.add.sprite('100', '100', 'player');
    player.setOrigin(10);
    console.log("jestem tu");
}

function update()
{

}
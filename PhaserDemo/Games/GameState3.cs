using static Retyped.phaser.Phaser;

namespace PhaserDemo.Games
{
    /// <summary>
    /// Original Demo is available here: https://phaser.io/examples/v2/basics/03-move-an-image
    /// </summary>
    public class GameState3 : AbstractGameState
    {
        public override void Preload()
        {
            game.load.crossOrigin = true;
            game.load.image("einstein", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/pics/ra_einstein.png");
        }

        public override void Create()
        {
            //  This creates a simple sprite that is using our loaded image and
            //  displays it on-screen
            //  and assign it to a variable
            var image = game.add.sprite(0, 0, "einstein");

            game.physics.enable(image, Physics.ARCADE);

            var imageBody = (Physics.Arcade.Body)image.body;
            imageBody.velocity.x = 150;
        }
    }
}

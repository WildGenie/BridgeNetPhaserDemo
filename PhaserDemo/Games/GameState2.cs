using System;
using Retyped;
using static Retyped.phaser.Phaser;

namespace PhaserDemo.Games
{
    /// <summary>
    /// Original Demo is available here: https://phaser.io/examples/v2/p2-physics/accelerate-to-object
    /// </summary>
    public class GameState2 : AbstractGameState
    {
        private Group _bullets;
        private CursorKeys _cursors;
        private Sprite _ship;

        public override void Preload()
        {
            game.load.crossOrigin = true;
            game.load.image("car", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/sprites/car.png");
            game.load.image("tinycar", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/sprites/tinycar.png");
        }

        public override void Create()
        {
            game.physics.startSystem(Physics.P2JS);

            _bullets = game.add.group();

            for (var i = 0; i < 10; i++)
            {
                var bullet = _bullets.create(game.rnd.integerInRange(200, 1700), game.rnd.integerInRange(-200, 400), "tinycar");

                game.physics.p2.enable(bullet, false);
            }

            _cursors = game.input.keyboard.createCursorKeys();
            _ship = game.add.sprite(32, game.world.height - 150, "car");

            game.physics.p2.enable(_ship);
        }

        public override void Update()
        {
            var shipBody = (Physics.P2.Body) _ship.body;

            _bullets.forEachAlive((Action<Sprite>) MoveBullets, this); //make bullets accelerate to ship

            if (_cursors.left.isDown)
            {
                shipBody.rotateLeft(100);
            }
            else if (_cursors.right.isDown)
            {
                shipBody.rotateRight(100);
            }
            else
            {
                shipBody.setZeroRotation();
            }
            
            if (_cursors.up.isDown)
            {
                shipBody.thrust(400);
            }
            else if (_cursors.down.isDown)
            {
                shipBody.reverse(400);
            }
        }

        private void MoveBullets(Sprite bullet)
        {
            AccelerateToObject(bullet, _ship, 30); //start accelerateToObject on every bullet
        }

        private void AccelerateToObject(Sprite obj1, Sprite obj2, double speed)
        {
            if (double.IsNaN(speed))
            {
                speed = 60;
            }

            var obj1Body = (Physics.P2.Body) obj1.body;

            var angle = es5.Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);

            obj1Body.rotation = angle + es5.Math.PI / 2; // correct angle of angry bullets (depends on the sprite used)
            obj1Body.force.x = es5.Math.cos(angle) * speed; // accelerateToObject 
            obj1Body.force.y = es5.Math.sin(angle) * speed;
        }
    }
}
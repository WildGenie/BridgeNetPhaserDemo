using Bridge;
using Retyped;
using System;
using static Retyped.phaser;
using static Retyped.phaser.Phaser;
using Math = System.Math;

namespace PhaserDemo.Games
{
    class GameState4 : AbstractGameState
    {
        private Sprite ship;
        private Rectangle view;
        private TileSprite space;
        private Text debugText;
        private Keyboard keyboard;
        private CursorKeys cursors;
        private int motor;
        private int lastSetMotor;
        private double lastMotorRotation;

        public override void Create()
        {
            world = game.world;
            view = game.camera.view;
            space = game.add.tileSprite(0, 0, view.width, view.height, "space");
            space.fixedToCamera = true;

            ship = game.add.sprite(world.centerX, world.centerY, "ship");
            ship.anchor.set(0.5);
            game.physics.enable(ship, Physics.ARCADE);
            game.physics.arcade.gravity.y = 371;

            var shipBody = (Physics.Arcade.Body)ship.body;
            shipBody.angularDrag = 100;
            shipBody.bounce.setTo(1);
            //shipBody.drag.set(10);
            shipBody.friction.setTo(0);
            shipBody.maxVelocity.set(100);

            debugText = game.add.text(10, 10, "" , new { font = "34px Arial", fill = "#fff" });

            motor = 300;

            keyboard = game.input.keyboard;
            cursors = keyboard.createCursorKeys();
        }

        public override void Init()
        {
            base.Init();
        }

        public override void Preload()
        {
            game.load.path = "https://samme.github.io/phaser-plugin-debug-arcade-physics/example/assets/";
            game.load.image("space", "deep-space.jpg");
            game.load.image("asteroid1", "asteroid1.png");
            game.load.image("asteroid2", "asteroid2.png");
            game.load.image("asteroid3", "asteroid3.png");
            game.load.image("bullet", "bullets.png");
            game.load.image("ship", "ship.png");
        }

        public override void Render()
        {
            base.Render();
        }

        public override void Shutdown()
        {
            base.Shutdown();
        }

        public override void Update()
        {
            Physics.Arcade arcade = game.physics.arcade;
            Physics.Arcade.Body body = (Physics.Arcade.Body)ship.body;

            if (cursors.left.isDown)
            {
                if (body.rotation >= -1)
                {
                    body.rotation = 0;
                }
                else
                {
                    body.rotation += 1;
                }
            }
            else if (cursors.right.isDown)
            {
                if (body.rotation <= -179)
                {
                    body.rotation = -180;
                }
                else
                {
                    body.rotation -= 1;
                }
            }

            if (cursors.up.isDown)
            {
                motor++;
            }
            else if (cursors.down.isDown)
            {
                motor--;
            }

            if (motor > 400)
            {
                motor = 400;
            }
            else if (motor < 0)
            {
                motor = 0;
            }
            if ((motor /100)*100 != lastSetMotor || lastMotorRotation != ship.rotation)
            {
                lastSetMotor = (motor / 100) * 100;
                lastMotorRotation = ship.rotation;
                arcade.accelerationFromRotation(ship.rotation, lastSetMotor, body.acceleration);
            }


            //else
            //{
            //    body.angularAcceleration = 0;
            //}
            debugText.text = body.rotation.ToString();
            ScreenWrap(ship);

        }

        private void ScreenWrap(Sprite sprite)
        {
            if (sprite.x < 0)
            {
                sprite.x = game.width;
            }
            else if (sprite.x > game.width)
            {
                sprite.x = 0;
            }

            if (sprite.y < 0)
            {
                sprite.y = game.height;
            }
            else if (sprite.y > game.height)
            {
                sprite.y = 0;
            }
        }
    }
}

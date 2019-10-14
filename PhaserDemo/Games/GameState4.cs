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
        private Polygon ground;

        Text konumText;
        Text aciText;
        Text hizText;
        Text ivmeText;

        private Keyboard keyboard;
        private CursorKeys cursors;
        private int motor;
        private int lastSetMotor;
        private double lastMotorRotation;

        private double startingVelocityX = 0;
        private double startingVelocityY = 0;
        private int startingX = 0;
        private int startingY = 0;
        private double startingAngle = -68;

        public override void Create()
        {
            world = game.world;
            game.time.slowMotion = 2.0;
            view = game.camera.view;
            space = game.add.tileSprite(0, 0, view.width, view.height, "space");
            space.fixedToCamera = true;

            ship = game.add.sprite(250, game.height - 270, "ship");
            ship.angle = -68;
            ship.anchor.set(0.5);
            game.physics.enable(ship, Physics.ARCADE);
            game.physics.arcade.gravity.y = 37.1;

            var shipBody = (Physics.Arcade.Body)ship.body;
            //shipBody.angularDrag = 100;
            //shipBody.bounce.setTo(1);
            //shipBody.drag.set(10);
            shipBody.friction.setTo(0);
            shipBody.maxVelocity.set(150);

            //debugText = game.add.text(10, 10, "" , new { font = "34px Arial", fill = "#fff" });
            konumText = game.add.text(10, 10, "", new { font = "18px Arial", fill = "#fff" });
            aciText = game.add.text(10, 40, "", new { font = "18px Arial", fill = "#fff" });
            hizText = game.add.text(10, 70, "", new { font = "18px Arial", fill = "#fff" });
            ivmeText = game.add.text(10, 100, "", new { font = "18px Arial", fill = "#fff" });



            ground = new Phaser.Polygon(new Phaser.Point(0, 300),
                                        new Phaser.Point(0, 290),
                                        new Phaser.Point(100, 250),
                                        new Phaser.Point(150, 150),
                                        new Phaser.Point(300, 200),
                                        new Phaser.Point(400, 285),
                                        new Phaser.Point(550, 285),
                                        new Phaser.Point(699, 220),
                                        new Phaser.Point(699, 300)
                                        );
            var graphics = game.add.graphics(0, 0);
            graphics.beginFill(0xFF33ff);
            graphics.drawPolygon(ground.points);
            graphics.endFill();

            motor = 40;

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

            if (motor > 40)
            {
                motor = 40;
            }
            else if (motor < 0)
            {
                motor = 0;
            }
            if ((motor /10)*10 != lastSetMotor || lastMotorRotation != ship.rotation)
            {
                lastSetMotor = (motor / 10) * 10;
                lastMotorRotation = ship.rotation;
                arcade.accelerationFromRotation(ship.rotation, lastSetMotor, body.acceleration);
            }


            //else
            //{
            //    body.angularAcceleration = 0;
            //}
            aciText.text = $"Açı: {body.rotation:000}°";
            konumText.text = $"Konum x: {body.x:0000}, y: {body.y:0000}";
            hizText.text = $"Hız Yatay: {body.velocity.x:00}, Dikey: {body.velocity.y:00}";
            ivmeText.text = $"İvme Yatay: {body.acceleration.x:00}, Dikey: {body.acceleration.y:00}";

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

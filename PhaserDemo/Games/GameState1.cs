using System;
using Retyped;
using static Retyped.phaser.Phaser;

namespace PhaserDemo.Games
{
    /// <summary>
    /// Original Demo is available here: https://phaser.io/examples/v2/games/invaders
    /// </summary>
    public class GameState1 : AbstractGameState
    {
        private Sprite _player;
        private Group _aliens;
        private Group _bullets;
        private double _bulletTime;
        private CursorKeys _cursors;
        private Key _fireButton;
        private Group _explosions;
        private TileSprite _starfield;
        private double _score;
        private string _scoreString = "";
        private Text _scoreText;
        private Group _lives;
        private Group _enemyBullets;
        private double _firingTimer;
        private Text _stateText;
        private readonly es5.Array<Sprite> _livingEnemies = new es5.Array<Sprite>(0);

        public override void Preload()
        {
            game.load.crossOrigin = true;
            game.load.image("bullet", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/games/invaders/bullet.png");
            game.load.image("enemyBullet", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/games/invaders/enemy-bullet.png");
            game.load.spritesheet("invader", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/games/invaders/invader32x32x4.png", 32, 32);
            game.load.image("ship", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/games/invaders/player.png");
            game.load.spritesheet("kaboom", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/games/invaders/explode.png", 128, 128);
            game.load.image("starfield", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/games/invaders/starfield.png");
            game.load.image("background", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/games/starstruck/background2.png");
        }

        public override void Create()
        {
            game.physics.startSystem(Physics.ARCADE);

            //  The scrolling starfield background
            _starfield = game.add.tileSprite(0, 0, 800, 600, "starfield");

            //  Our bullet group
            _bullets = game.add.group();
            _bullets.enableBody = true;
            _bullets.physicsBodyType = Physics.ARCADE;
            _bullets.createMultiple(30, "bullet");
            _bullets.setAll("anchor.x", 0.5);
            _bullets.setAll("anchor.y", 1);
            _bullets.setAll("outOfBoundsKill", true);
            _bullets.setAll("checkWorldBounds", true);

            // The enemy"s bullets
            _enemyBullets = game.add.group();
            _enemyBullets.enableBody = true;
            _enemyBullets.physicsBodyType = Physics.ARCADE;
            _enemyBullets.createMultiple(30, "enemyBullet");
            _enemyBullets.setAll("anchor.x", 0.5);
            _enemyBullets.setAll("anchor.y", 1);
            _enemyBullets.setAll("outOfBoundsKill", true);
            _enemyBullets.setAll("checkWorldBounds", true);

            //  The hero!
            _player = game.add.sprite(400, 500, "ship");
            _player.anchor.setTo(0.5, 0.5);
            game.physics.enable(_player, Physics.ARCADE);

            //  The baddies!
            _aliens = game.add.group();
            _aliens.enableBody = true;
            _aliens.physicsBodyType = Physics.ARCADE;

            CreateAliens();

            //  The score
            _scoreString = "Score : ";
            _scoreText = game.add.text(10, 10, _scoreString + _score, new {font = "34px Arial", fill = "#fff"});

            //  Lives
            _lives = game.add.group();
            game.add.text(game.world.width - 100, 10, "Lives : ", new {font = "34px Arial", fill = "#fff"});

            //  Text
            _stateText = game.add.text(game.world.centerX, game.world.centerY, " ", new {font = "84px Arial", fill = "#fff"});
            _stateText.anchor.setTo(0.5, 0.5);
            _stateText.visible = false;

            for (var i = 0; i < 3; i++)
            {
                var ship = (Sprite) _lives.create(game.world.width - 100 + (30 * i), 60, "ship");

                ship.anchor.setTo(0.5, 0.5);
                ship.angle = 90;
                ship.alpha = 0.4;
            }

            //  An explosion pool
            _explosions = game.add.group();
            _explosions.createMultiple(30, "kaboom");
            _explosions.forEach((Action<Sprite>) SetupInvader, this);

            //  And some controls to play the game with
            _cursors = game.input.keyboard.createCursorKeys();
            _fireButton = game.input.keyboard.addKey(Keyboard.SPACEBAR);
        }

        private void CreateAliens()
        {
            for (var y = 0; y < 4; y++)
            {
                for (var x = 0; x < 10; x++)
                {
                    var alien = (Sprite) _aliens.create(x * 48, y * 50, "invader");

                    alien.anchor.setTo(0.5, 0.5);
                    alien.animations.add("fly", new double[] {0, 1, 2, 3}, 20, true);
                    alien.play("fly");

                    ((Physics.Arcade.Body) alien.body).moves = false;
                }
            }

            _aliens.x = 100;
            _aliens.y = 50;

            //  All this does is basically start the invaders moving. Notice we"re moving the Group they belong to, rather than the invaders directly.
            var tween = game.add.tween(_aliens).to(new {x = 200}, 2000, (Func<double, double>) Easing.Linear.None, true, 0, 1000, true);

            //  When the tween loops it calls descend
            tween.onLoop.add((Action) Descend, this);
        }

        private void SetupInvader(Sprite invader)
        {
            invader.anchor.x = 0.5;
            invader.anchor.y = 0.5;
            invader.animations.add("kaboom");
        }

        public void Descend()
        {
            _aliens.y += 10;
        }

        public override void Update()
        {
            //  Scroll the background
            _starfield.tilePosition.y += 2;

            if (_player.alive)
            {
                //  Reset the player, then check for movement keys
                var playerBody = (Physics.Arcade.Body) _player.body;

                playerBody.velocity.setTo(0, 0);

                if (_cursors.left.isDown)
                {
                    playerBody.velocity.x = -200;
                }
                else if (_cursors.right.isDown)
                {
                    playerBody.velocity.x = 200;
                }

                //  Firing?
                if (_fireButton.isDown)
                {
                    FireBullet();
                }

                if (game.time.now > _firingTimer)
                {
                    EnemyFires();
                }

                //  Run collision
                game.physics.arcade.overlap(_bullets, _aliens, (Action<Sprite, Sprite>) collisionHandler, null, this);
                game.physics.arcade.overlap(_enemyBullets, _player, (Action<Sprite, Sprite>) EnemyHitsPlayer, null, this);
            }
        }

        public override void Render()
        {
            //for (var i = 0; i < _aliens.length; i++)
            //{
            //    game.debug.body((Sprite)_aliens.children[i]);
            //}
        }

        private void collisionHandler(Sprite bullet, Sprite alien)
        {
            var alienBody = (Physics.Arcade.Body) alien.body;

            //  When a bullet hits an alien we kill them both
            bullet.kill();
            alien.kill();

            //  Increase the score
            _score += 20;
            _scoreText.text = _scoreString + _score;

            //  And create an explosion :)
            var explosion = (Sprite) _explosions.getFirstExists(false);

            explosion.reset(alienBody.x, alienBody.y);
            explosion.play("kaboom", 30, false, true);

            if (_aliens.countLiving() == 0)
            {
                _score += 1000;
                _scoreText.text = _scoreString + _score;

                _enemyBullets.callAll("kill", this);
                _stateText.text = " You Won, \n Click to restart";
                _stateText.visible = true;

                //the "click to restart" handler
                game.input.onTap.addOnce((Action) Restart, this);
            }

        }

        private void EnemyHitsPlayer(Sprite player, Sprite bullet)
        {
            var playerBody = (Physics.Arcade.Body) player.body;

            bullet.kill();

            var live = (Sprite) _lives.getFirstAlive();

            if (live != null)
            {
                live.kill();
            }

            //  And create an explosion :)
            var explosion = (Sprite) _explosions.getFirstExists(false);
            explosion.reset(playerBody.x, playerBody.y);
            explosion.play("kaboom", 30, false, true);

            // When the player dies
            if (_lives.countLiving() < 1)
            {
                player.kill();
                _enemyBullets.callAll("kill", null);

                _stateText.text = " GAME OVER \n Click to restart";
                _stateText.visible = true;

                //the "click to restart" handler
                game.input.onTap.addOnce((Action) Restart, this);
            }
        }

        private void EnemyFires()
        {
            //  Grab the first bullet we can from the pool
            var enemyBullet = (Sprite) _enemyBullets.getFirstExists(false);

            _livingEnemies.length = 0;

            _aliens.forEachAlive(new Action<Sprite>(alien =>
            {
                // put every living enemy in an array
                _livingEnemies.push(alien);
            }), null);

            if (enemyBullet != null && _livingEnemies.length > 0)
            {

                var random = game.rnd.integerInRange(0, _livingEnemies.length - 1);

                // randomly select one of them
                var shooter = _livingEnemies[random];

                // And fire the bullet from this enemy
                var shooterBody = (Physics.Arcade.Body) shooter.body;
                enemyBullet.reset(shooterBody.x, shooterBody.y);

                game.physics.arcade.moveToObject(enemyBullet, _player, 120);
                _firingTimer = game.time.now + 2000;
            }
        }

        private void FireBullet()
        {
            //  To avoid them being allowed to fire too fast we set a time limit
            if (game.time.now > _bulletTime)
            {
                //  Grab the first bullet we can from the pool
                var bullet = (Sprite) _bullets.getFirstExists(false);
                
                if (bullet != null)
                {
                    var bulletBody = (Physics.Arcade.Body) bullet.body;

                    //  And fire it
                    bullet.reset(_player.x, _player.y + 8);
                    bulletBody.velocity.y = -400;
                    _bulletTime = game.time.now + 200;
                }
            }

        }

        private void ResetBullet(Sprite bullet)
        {
            //  Called if the bullet goes out of the screen
            bullet.kill();
        }

        private void Restart()
        {
            //  A new level starts

            //resets the life count
            _lives.callAll("revive", null);

            // And brings the aliens back from the dead :)
            _aliens.removeAll();

            CreateAliens();

            //revives the player
            _player.revive();

            //hides the text
            _stateText.visible = false;
        }
    }
}
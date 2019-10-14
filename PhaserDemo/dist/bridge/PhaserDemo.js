/**
 * @version 1.0.0.0
 * @copyright Copyright ©  2017
 * @compiler Bridge.NET 17.9.0
 */
Bridge.assembly("PhaserDemo", function ($asm, globals) {
    "use strict";

    Bridge.define("PhaserDemo.App", {
        main: function Main () {
            PhaserDemo.App.InitEventHandlers();

            PhaserDemo.App.SwitchGameTo(4);
        },
        statics: {
            fields: {
                _game: null,
                _isRun: false
            },
            methods: {
                InitEventHandlers: function () {
                    var btns = System.Array.init([document.getElementById("sample1Btn"), document.getElementById("sample2Btn"), document.getElementById("sample3Btn"), document.getElementById("sample4Btn")], HTMLElement);

                    for (var i = 0; i < btns.length; i = (i + 1) | 0) {
                        var index = { v : i };

                        btns[System.Array.index(i, btns)].onclick = (function ($me, index) {
                            return function (e) {
                                PhaserDemo.App.SwitchGameTo(((index.v + 1) | 0));
                            };
                        })(this, index);
                    }
                },
                SwitchGameTo: function (number) {
                    if (PhaserDemo.App._isRun) {
                        PhaserDemo.App._game.destroy();
                        PhaserDemo.App._game = null;
                        PhaserDemo.App._isRun = false;
                    }

                    PhaserDemo.App._game = PhaserDemo.App.RunGame(number);
                    PhaserDemo.App._isRun = true;
                },
                RunGame: function (number) {
                    switch (number) {
                        case 1: 
                            var state1 = new PhaserDemo.Games.GameState1();
                            return new Phaser.Game(800, 600, Phaser.AUTO, "phaserRoot", state1);
                        case 2: 
                            var state2 = new PhaserDemo.Games.GameState2();
                            return new Phaser.Game(800, 600, Phaser.AUTO, "phaserRoot", state2);
                        case 3: 
                            var state3 = new PhaserDemo.Games.GameState3();
                            return new Phaser.Game(800, 600, Phaser.AUTO, "phaserRoot", state3);
                        case 4: 
                            var state4 = new PhaserDemo.Games.GameState4();
                            return new Phaser.Game(700, 300, Phaser.CANVAS, "phaserRoot", state4);
                        default: 
                            throw new System.ArgumentOutOfRangeException.$ctor1("number");
                    }
                }
            }
        }
    });

    Bridge.define("PhaserDemo.Games.AbstractGameState", {
        inherits: [Phaser.State],
        methods: {
            preload: function () { },
            create: function () { },
            update: function () { },
            render: function () { },
            init: function () { },
            shutdown: function () { }
        }
    });

    /** @namespace PhaserDemo.Games */

    /**
     * Original Demo is available here: https://phaser.io/examples/v2/games/invaders
     *
     * @public
     * @class PhaserDemo.Games.GameState1
     * @augments PhaserDemo.Games.AbstractGameState
     */
    Bridge.define("PhaserDemo.Games.GameState1", {
        inherits: [PhaserDemo.Games.AbstractGameState],
        fields: {
            _player: null,
            _aliens: null,
            _bullets: null,
            _bulletTime: 0,
            _cursors: null,
            _fireButton: null,
            _explosions: null,
            _starfield: null,
            _score: 0,
            _scoreString: null,
            _scoreText: null,
            _lives: null,
            _enemyBullets: null,
            _firingTimer: 0,
            _stateText: null,
            _livingEnemies: null
        },
        ctors: {
            init: function () {
                this._scoreString = "";
                this._livingEnemies = new Array(0);
            }
        },
        methods: {
            preload: function () {
                this.game.load.crossOrigin = true;
                this.game.load.image("bullet", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/games/invaders/bullet.png");
                this.game.load.image("enemyBullet", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/games/invaders/enemy-bullet.png");
                this.game.load.spritesheet("invader", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/games/invaders/invader32x32x4.png", 32, 32);
                this.game.load.image("ship", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/games/invaders/player.png");
                this.game.load.spritesheet("kaboom", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/games/invaders/explode.png", 128, 128);
                this.game.load.image("starfield", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/games/invaders/starfield.png");
                this.game.load.image("background", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/games/starstruck/background2.png");
            },
            create: function () {
                this.game.physics.startSystem(Phaser.Physics.ARCADE);

                this._starfield = this.game.add.tileSprite(0, 0, 800, 600, "starfield");

                this._bullets = this.game.add.group();
                this._bullets.enableBody = true;
                this._bullets.physicsBodyType = Phaser.Physics.ARCADE;
                this._bullets.createMultiple(30, "bullet");
                this._bullets.setAll("anchor.x", 0.5);
                this._bullets.setAll("anchor.y", 1);
                this._bullets.setAll("outOfBoundsKill", true);
                this._bullets.setAll("checkWorldBounds", true);

                this._enemyBullets = this.game.add.group();
                this._enemyBullets.enableBody = true;
                this._enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
                this._enemyBullets.createMultiple(30, "enemyBullet");
                this._enemyBullets.setAll("anchor.x", 0.5);
                this._enemyBullets.setAll("anchor.y", 1);
                this._enemyBullets.setAll("outOfBoundsKill", true);
                this._enemyBullets.setAll("checkWorldBounds", true);

                this._player = this.game.add.sprite(400, 500, "ship");
                this._player.anchor.setTo(0.5, 0.5);
                this.game.physics.enable(this._player, Phaser.Physics.ARCADE);

                this._aliens = this.game.add.group();
                this._aliens.enableBody = true;
                this._aliens.physicsBodyType = Phaser.Physics.ARCADE;

                this.CreateAliens();

                this._scoreString = "Score : ";
                this._scoreText = this.game.add.text(10, 10, (this._scoreString || "") + System.Double.format(this._score), { font: "34px Arial", fill: "#fff" });

                this._lives = this.game.add.group();
                this.game.add.text(this.game.world.width - 100, 10, "Lives : ", { font: "34px Arial", fill: "#fff" });

                this._stateText = this.game.add.text(this.game.world.centerX, this.game.world.centerY, " ", { font: "84px Arial", fill: "#fff" });
                this._stateText.anchor.setTo(0.5, 0.5);
                this._stateText.visible = false;

                for (var i = 0; i < 3; i = (i + 1) | 0) {
                    var ship = this._lives.create(this.game.world.width - 100 + (Bridge.Int.mul(30, i)), 60, "ship");

                    ship.anchor.setTo(0.5, 0.5);
                    ship.angle = 90;
                    ship.alpha = 0.4;
                }

                this._explosions = this.game.add.group();
                this._explosions.createMultiple(30, "kaboom");
                this._explosions.forEach(Bridge.fn.cacheBind(this, this.SetupInvader), this);

                this._cursors = this.game.input.keyboard.createCursorKeys();
                this._fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            },
            CreateAliens: function () {
                for (var y = 0; y < 4; y = (y + 1) | 0) {
                    for (var x = 0; x < 10; x = (x + 1) | 0) {
                        var alien = this._aliens.create(Bridge.Int.mul(x, 48), Bridge.Int.mul(y, 50), "invader");

                        alien.anchor.setTo(0.5, 0.5);
                        alien.animations.add("fly", System.Array.init([0, 1, 2, 3], System.Double), 20, true);
                        alien.play("fly");

                        alien.body.moves = false;
                    }
                }

                this._aliens.x = 100;
                this._aliens.y = 50;

                var tween = this.game.add.tween(this._aliens).to({ x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

                tween.onLoop.add(Bridge.fn.cacheBind(this, this.Descend), this);
            },
            SetupInvader: function (invader) {
                invader.anchor.x = 0.5;
                invader.anchor.y = 0.5;
                invader.animations.add("kaboom");
            },
            Descend: function () {
                this._aliens.y += 10;
            },
            update: function () {
                var $t;
                $t = this._starfield.tilePosition;
                $t.y += 2;

                if (this._player.alive) {
                    var playerBody = this._player.body;

                    playerBody.velocity.setTo(0, 0);

                    if (this._cursors.left.isDown) {
                        playerBody.velocity.x = -200;
                    } else if (this._cursors.right.isDown) {
                        playerBody.velocity.x = 200;
                    }

                    if (this._fireButton.isDown) {
                        this.FireBullet();
                    }

                    if (this.game.time.now > this._firingTimer) {
                        this.EnemyFires();
                    }

                    this.game.physics.arcade.overlap(this._bullets, this._aliens, Bridge.fn.cacheBind(this, this.collisionHandler), null, this);
                    this.game.physics.arcade.overlap(this._enemyBullets, this._player, Bridge.fn.cacheBind(this, this.EnemyHitsPlayer), null, this);
                }
            },
            render: function () { },
            collisionHandler: function (bullet, alien) {
                var alienBody = alien.body;

                bullet.kill();
                alien.kill();

                this._score += 20;
                this._scoreText.text = (this._scoreString || "") + System.Double.format(this._score);

                var explosion = this._explosions.getFirstExists(false);

                explosion.reset(alienBody.x, alienBody.y);
                explosion.play("kaboom", 30, false, true);

                if (this._aliens.countLiving() === 0) {
                    this._score += 1000;
                    this._scoreText.text = (this._scoreString || "") + System.Double.format(this._score);

                    this._enemyBullets.callAll("kill", this);
                    this._stateText.text = " You Won, \n Click to restart";
                    this._stateText.visible = true;

                    this.game.input.onTap.addOnce(Bridge.fn.cacheBind(this, this.Restart), this);
                }

            },
            EnemyHitsPlayer: function (player, bullet) {
                var playerBody = player.body;

                bullet.kill();

                var live = this._lives.getFirstAlive();

                if (live != null) {
                    live.kill();
                }

                var explosion = this._explosions.getFirstExists(false);
                explosion.reset(playerBody.x, playerBody.y);
                explosion.play("kaboom", 30, false, true);

                if (this._lives.countLiving() < 1) {
                    player.kill();
                    this._enemyBullets.callAll("kill", null);

                    this._stateText.text = " GAME OVER \n Click to restart";
                    this._stateText.visible = true;

                    this.game.input.onTap.addOnce(Bridge.fn.cacheBind(this, this.Restart), this);
                }
            },
            EnemyFires: function () {
                var enemyBullet = this._enemyBullets.getFirstExists(false);

                this._livingEnemies.length = 0;

                this._aliens.forEachAlive(Bridge.fn.bind(this, function (alien) {
                    this._livingEnemies.push(alien);
                }), null);

                if (enemyBullet != null && this._livingEnemies.length > 0) {

                    var random = this.game.rnd.integerInRange(0, this._livingEnemies.length - 1);

                    var shooter = this._livingEnemies[random];

                    var shooterBody = shooter.body;
                    enemyBullet.reset(shooterBody.x, shooterBody.y);

                    this.game.physics.arcade.moveToObject(enemyBullet, this._player, 120);
                    this._firingTimer = this.game.time.now + 2000;
                }
            },
            FireBullet: function () {
                if (this.game.time.now > this._bulletTime) {
                    var bullet = this._bullets.getFirstExists(false);

                    if (bullet != null) {
                        var bulletBody = bullet.body;

                        bullet.reset(this._player.x, this._player.y + 8);
                        bulletBody.velocity.y = -400;
                        this._bulletTime = this.game.time.now + 200;
                    }
                }

            },
            ResetBullet: function (bullet) {
                bullet.kill();
            },
            Restart: function () {

                this._lives.callAll("revive", null);

                this._aliens.removeAll();

                this.CreateAliens();

                this._player.revive();

                this._stateText.visible = false;
            }
        }
    });

    /**
     * Original Demo is available here: https://phaser.io/examples/v2/p2-physics/accelerate-to-object
     *
     * @public
     * @class PhaserDemo.Games.GameState2
     * @augments PhaserDemo.Games.AbstractGameState
     */
    Bridge.define("PhaserDemo.Games.GameState2", {
        inherits: [PhaserDemo.Games.AbstractGameState],
        fields: {
            _bullets: null,
            _cursors: null,
            _ship: null
        },
        methods: {
            preload: function () {
                this.game.load.crossOrigin = true;
                this.game.load.image("car", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/sprites/car.png");
                this.game.load.image("tinycar", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/sprites/tinycar.png");
            },
            create: function () {
                this.game.physics.startSystem(Phaser.Physics.P2JS);

                this._bullets = this.game.add.group();

                for (var i = 0; i < 10; i = (i + 1) | 0) {
                    var bullet = this._bullets.create(this.game.rnd.integerInRange(200, 1700), this.game.rnd.integerInRange(-200, 400), "tinycar");

                    this.game.physics.p2.enable(bullet, false);
                }

                this._cursors = this.game.input.keyboard.createCursorKeys();
                this._ship = this.game.add.sprite(32, this.game.world.height - 150, "car");

                this.game.physics.p2.enable(this._ship);
            },
            update: function () {
                var shipBody = this._ship.body;

                this._bullets.forEachAlive(Bridge.fn.cacheBind(this, this.MoveBullets), this);

                if (this._cursors.left.isDown) {
                    shipBody.rotateLeft(100);
                } else if (this._cursors.right.isDown) {
                    shipBody.rotateRight(100);
                } else {
                    shipBody.setZeroRotation();
                }

                if (this._cursors.up.isDown) {
                    shipBody.thrust(400);
                } else if (this._cursors.down.isDown) {
                    shipBody.reverse(400);
                }
            },
            MoveBullets: function (bullet) {
                this.AccelerateToObject(bullet, this._ship, 30);
            },
            AccelerateToObject: function (obj1, obj2, speed) {
                if (isNaN(speed)) {
                    speed = 60;
                }

                var obj1Body = obj1.body;

                var angle = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);

                obj1Body.rotation = angle + Math["PI"] / 2;
                obj1Body.force.x = Math.cos(angle) * speed;
                obj1Body.force.y = Math.sin(angle) * speed;
            }
        }
    });

    /**
     * Original Demo is available here: https://phaser.io/examples/v2/basics/03-move-an-image
     *
     * @public
     * @class PhaserDemo.Games.GameState3
     * @augments PhaserDemo.Games.AbstractGameState
     */
    Bridge.define("PhaserDemo.Games.GameState3", {
        inherits: [PhaserDemo.Games.AbstractGameState],
        methods: {
            preload: function () {
                this.game.load.crossOrigin = true;
                this.game.load.image("einstein", "https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/pics/ra_einstein.png");
            },
            create: function () {
                var image = this.game.add.sprite(0, 0, "einstein");

                this.game.physics.enable(image, Phaser.Physics.ARCADE);

                var imageBody = image.body;
                imageBody.velocity.x = 150;
            }
        }
    });

    Bridge.define("PhaserDemo.Games.GameState4", {
        inherits: [PhaserDemo.Games.AbstractGameState],
        fields: {
            ship: null,
            view: null,
            space: null,
            ground: null,
            konumText: null,
            aciText: null,
            hizText: null,
            ivmeText: null,
            keyboard: null,
            cursors: null,
            motor: 0,
            lastSetMotor: 0,
            lastMotorRotation: 0,
            startingVelocityX: 0,
            startingVelocityY: 0,
            startingX: 0,
            startingY: 0,
            startingAngle: 0
        },
        ctors: {
            init: function () {
                this.startingVelocityX = 0;
                this.startingVelocityY = 0;
                this.startingX = 0;
                this.startingY = 0;
                this.startingAngle = -68;
            }
        },
        methods: {
            create: function () {
                this.world = this.game.world;
                this.game.time.slowMotion = 2.0;
                this.view = this.game.camera.view;
                this.space = this.game.add.tileSprite(0, 0, this.view.width, this.view.height, "space");
                this.space.fixedToCamera = true;

                this.ship = this.game.add.sprite(250, this.game.height - 270, "ship");
                this.ship.angle = -68;
                this.ship.anchor.set(0.5);
                this.game.physics.enable(this.ship, Phaser.Physics.ARCADE);
                this.game.physics.arcade.gravity.y = 37.1;

                var shipBody = this.ship.body;
                shipBody.friction.setTo(0);
                shipBody.maxVelocity.set(150);

                this.konumText = this.game.add.text(10, 10, "", { font: "18px Arial", fill: "#fff" });
                this.aciText = this.game.add.text(10, 40, "", { font: "18px Arial", fill: "#fff" });
                this.hizText = this.game.add.text(10, 70, "", { font: "18px Arial", fill: "#fff" });
                this.ivmeText = this.game.add.text(10, 100, "", { font: "18px Arial", fill: "#fff" });



                this.ground = new Phaser.Polygon(new Phaser.Point(0, 300), new Phaser.Point(0, 290), new Phaser.Point(100, 250), new Phaser.Point(150, 150), new Phaser.Point(300, 200), new Phaser.Point(400, 285), new Phaser.Point(550, 285), new Phaser.Point(699, 220), new Phaser.Point(699, 300));
                var graphics = this.game.add.graphics(0, 0);
                graphics.beginFill(16724991);
                graphics.drawPolygon(this.ground.points);
                graphics.endFill();

                this.motor = 40;

                this.keyboard = this.game.input.keyboard;
                this.cursors = this.keyboard.createCursorKeys();
            },
            init: function () {
                PhaserDemo.Games.AbstractGameState.prototype.init.call(this);
            },
            preload: function () {
                this.game.load.path = "https://samme.github.io/phaser-plugin-debug-arcade-physics/example/assets/";
                this.game.load.image("space", "deep-space.jpg");
                this.game.load.image("asteroid1", "asteroid1.png");
                this.game.load.image("asteroid2", "asteroid2.png");
                this.game.load.image("asteroid3", "asteroid3.png");
                this.game.load.image("bullet", "bullets.png");
                this.game.load.image("ship", "ship.png");
            },
            render: function () {
                PhaserDemo.Games.AbstractGameState.prototype.render.call(this);
            },
            shutdown: function () {
                PhaserDemo.Games.AbstractGameState.prototype.shutdown.call(this);
            },
            update: function () {
                var arcade = this.game.physics.arcade;
                var body = this.ship.body;

                if (this.cursors.left.isDown) {
                    if (body.rotation >= -1) {
                        body.rotation = 0;
                    } else {
                        body.rotation += 1;
                    }
                } else if (this.cursors.right.isDown) {
                    if (body.rotation <= -179) {
                        body.rotation = -180;
                    } else {
                        body.rotation -= 1;
                    }
                }

                if (this.cursors.up.isDown) {
                    this.motor = (this.motor + 1) | 0;
                } else if (this.cursors.down.isDown) {
                    this.motor = (this.motor - 1) | 0;
                }

                if (this.motor > 40) {
                    this.motor = 40;
                } else if (this.motor < 0) {
                    this.motor = 0;
                }
                if (Bridge.Int.mul((((Bridge.Int.div(this.motor, 10)) | 0)), 10) !== this.lastSetMotor || this.lastMotorRotation !== this.ship.rotation) {
                    this.lastSetMotor = Bridge.Int.mul((((Bridge.Int.div(this.motor, 10)) | 0)), 10);
                    this.lastMotorRotation = this.ship.rotation;
                    arcade.accelerationFromRotation(this.ship.rotation, this.lastSetMotor, body.acceleration);
                }


                this.aciText.text = System.String.format("A\u00e7\u0131: {0:000}\u00b0", [body.rotation]);
                this.konumText.text = System.String.format("Konum x: {0:0000}, y: {1:0000}", body.x, body.y);
                this.hizText.text = System.String.format("H\u0131z Yatay: {0:00}, Dikey: {1:00}", body.velocity.x, body.velocity.y);
                this.ivmeText.text = System.String.format("\u0130vme Yatay: {0:00}, Dikey: {1:00}", body.acceleration.x, body.acceleration.y);

                this.ScreenWrap(this.ship);
            },
            ScreenWrap: function (sprite) {
                if (sprite.x < 0) {
                    sprite.x = this.game.width;
                } else if (sprite.x > this.game.width) {
                    sprite.x = 0;
                }

                if (sprite.y < 0) {
                    sprite.y = this.game.height;
                } else if (sprite.y > this.game.height) {
                    sprite.y = 0;
                }
            }
        }
    });
});

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJQaGFzZXJEZW1vLmpzIiwKICAic291cmNlUm9vdCI6ICIiLAogICJzb3VyY2VzIjogWyJBcHAuY3MiLCJHYW1lcy9HYW1lU3RhdGUxLmNzIiwiR2FtZXMvR2FtZVN0YXRlMi5jcyIsIkdhbWVzL0dhbWVTdGF0ZTMuY3MiLCJHYW1lcy9HYW1lU3RhdGU0LmNzIl0sCiAgIm5hbWVzIjogWyIiXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7O1lBY1lBOztZQUdBQTs7Ozs7Ozs7O29CQU1BQSxXQUFXQSxtQkFFUEEsdUNBQ0FBLHVDQUNBQSx1Q0FDQUE7O29CQUlKQSxLQUFLQSxXQUFXQSxJQUFJQSxhQUFhQTt3QkFFN0JBLGtCQUFZQTs7d0JBRVpBLHdCQUFLQSxHQUFMQSxpQkFBa0JBOztnQ0FFZEEsNEJBQWFBOzs7Ozt3Q0FLT0E7b0JBRTVCQSxJQUFJQTt3QkFFQUE7d0JBQ0FBLHVCQUFRQTt3QkFDUkE7OztvQkFHSkEsdUJBQVFBLHVCQUFRQTtvQkFDaEJBOzttQ0FHNkNBO29CQUU3Q0EsUUFBUUE7d0JBRUpBOzRCQUNJQSxhQUFhQSxJQUFJQTs0QkFFakJBLE9BQU9BLElBQUlBLHNCQUFxQ0EsMkJBQTBDQTt3QkFFOUZBOzRCQUNJQSxhQUFhQSxJQUFJQTs0QkFFakJBLE9BQU9BLElBQUlBLHNCQUFxQ0EsMkJBQTBDQTt3QkFFOUZBOzRCQUNJQSxhQUFhQSxJQUFJQTs0QkFFakJBLE9BQU9BLElBQUlBLHNCQUFxQ0EsMkJBQTBDQTt3QkFDOUZBOzRCQUNJQSxhQUFhQSxJQUFJQTs0QkFDakJBLE9BQU9BLElBQUlBLHNCQUFxQ0EsNkJBQTRDQTt3QkFDcEdBOzRCQUNRQSxNQUFNQSxJQUFJQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NDQ3JEb0RBLElBQUlBOzs7OztnQkFJMUVBO2dCQUNBQTtnQkFDQUE7Z0JBQ0FBO2dCQUNBQTtnQkFDQUE7Z0JBQ0FBO2dCQUNBQTs7O2dCQUtBQSw4QkFBeUJB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QXFCQTtvQkFFdkRBLG9CQUFlQSxnQkFBQ0E7b0JBQ2hCQSx5QkFBb0JBO29CQUNwQkEsZ0NBQWdDQSxvQkFBZUEsbUJBQWNBOzs7O2dCQVFqRUEsb0JBQWVBLHNEQUE4QkE7Z0JBQzdDQSxzQkFBaUJBLHVEQUErQ0EsUUFBT0E7Z0JBQ3ZFQSxvQkFBZUEsOERBQWlEQSxpQkFBZ0JBO2dCQUNoRkEscUJBQWdCQSwrREFBa0RBLHFCQUFvQkE7O2dCQUV0RkEsZ0JBQVdBOztrQ0FHU0E7Z0JBRXBCQSxJQUFJQTtvQkFFQUEsV0FBV0E7dUJBRVZBLElBQUlBLFdBQVdBO29CQUVoQkE7OztnQkFHSkEsSUFBSUE7b0JBRUFBLFdBQVdBO3VCQUVWQSxJQUFJQSxXQUFXQTtvQkFFaEJBIiwKICAic291cmNlc0NvbnRlbnQiOiBbInVzaW5nIFN5c3RlbTtcclxudXNpbmcgUGhhc2VyRGVtby5HYW1lcztcclxudXNpbmcgUmV0eXBlZDtcclxuXHJcbm5hbWVzcGFjZSBQaGFzZXJEZW1vXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBBcHBcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBSZXR5cGVkLnBoYXNlci5QaGFzZXIuR2FtZSBfZ2FtZTtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBib29sIF9pc1J1bjtcclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIE1haW4oKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gSW5pdCBFdmVudCBoYW5kbGVyczpcclxuICAgICAgICAgICAgSW5pdEV2ZW50SGFuZGxlcnMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJ1biBHYW1lMSBvbiBzdGFydDpcclxuICAgICAgICAgICAgU3dpdGNoR2FtZVRvKDQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBJbml0RXZlbnRIYW5kbGVycygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBJbml0IGV2ZW50IGhhbmRsZXIgZm9yIGJ1dHRvbnMgc3dpdGNoaW5nIHNjZW5lc1xyXG4gICAgICAgICAgICB2YXIgYnRucyA9IG5ld1tdXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGRvbS5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNhbXBsZTFCdG5cIiksXHJcbiAgICAgICAgICAgICAgICBkb20uZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzYW1wbGUyQnRuXCIpLFxyXG4gICAgICAgICAgICAgICAgZG9tLmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2FtcGxlM0J0blwiKSxcclxuICAgICAgICAgICAgICAgIGRvbS5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNhbXBsZTRCdG5cIilcclxuXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ0bnMuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGJ0bnNbaV0ub25jbGljayA9IGUgPT5cclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBTd2l0Y2hHYW1lVG8oaW5kZXggKyAxKTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBTd2l0Y2hHYW1lVG8oaW50IG51bWJlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChfaXNSdW4pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIF9nYW1lLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIF9nYW1lID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIF9pc1J1biA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBfZ2FtZSA9IFJ1bkdhbWUobnVtYmVyKTtcclxuICAgICAgICAgICAgX2lzUnVuID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkdhbWUgUnVuR2FtZShpbnQgbnVtYmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3dpdGNoIChudW1iZXIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGUxID0gbmV3IEdhbWVTdGF0ZTEoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBSZXR5cGVkLnBoYXNlci5QaGFzZXIuR2FtZSg4MDAsIDYwMCwgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkFVVE8sIFwicGhhc2VyUm9vdFwiLCBzdGF0ZTEpO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0ZTIgPSBuZXcgR2FtZVN0YXRlMigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFJldHlwZWQucGhhc2VyLlBoYXNlci5HYW1lKDgwMCwgNjAwLCBSZXR5cGVkLnBoYXNlci5QaGFzZXIuQVVUTywgXCJwaGFzZXJSb290XCIsIHN0YXRlMik7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0ZTMgPSBuZXcgR2FtZVN0YXRlMygpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFJldHlwZWQucGhhc2VyLlBoYXNlci5HYW1lKDgwMCwgNjAwLCBSZXR5cGVkLnBoYXNlci5QaGFzZXIuQVVUTywgXCJwaGFzZXJSb290XCIsIHN0YXRlMyk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlNCA9IG5ldyBHYW1lU3RhdGU0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBSZXR5cGVkLnBoYXNlci5QaGFzZXIuR2FtZSg3MDAsIDMwMCwgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkNBTlZBUywgXCJwaGFzZXJSb290XCIsIHN0YXRlNCk7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50T3V0T2ZSYW5nZUV4Y2VwdGlvbihcIm51bWJlclwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgUmV0eXBlZDtcclxuXHJcbm5hbWVzcGFjZSBQaGFzZXJEZW1vLkdhbWVzXHJcbntcclxuICAgIC8vLyA8c3VtbWFyeT5cclxuICAgIC8vLyBPcmlnaW5hbCBEZW1vIGlzIGF2YWlsYWJsZSBoZXJlOiBodHRwczovL3BoYXNlci5pby9leGFtcGxlcy92Mi9nYW1lcy9pbnZhZGVyc1xyXG4gICAgLy8vIDwvc3VtbWFyeT5cclxuICAgIHB1YmxpYyBjbGFzcyBHYW1lU3RhdGUxIDogQWJzdHJhY3RHYW1lU3RhdGVcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUgX3BsYXllcjtcclxuICAgICAgICBwcml2YXRlIFJldHlwZWQucGhhc2VyLlBoYXNlci5Hcm91cCBfYWxpZW5zO1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkdyb3VwIF9idWxsZXRzO1xyXG4gICAgICAgIHByaXZhdGUgZG91YmxlIF9idWxsZXRUaW1lO1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkN1cnNvcktleXMgX2N1cnNvcnM7XHJcbiAgICAgICAgcHJpdmF0ZSBSZXR5cGVkLnBoYXNlci5QaGFzZXIuS2V5IF9maXJlQnV0dG9uO1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkdyb3VwIF9leHBsb3Npb25zO1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlRpbGVTcHJpdGUgX3N0YXJmaWVsZDtcclxuICAgICAgICBwcml2YXRlIGRvdWJsZSBfc2NvcmU7XHJcbiAgICAgICAgcHJpdmF0ZSBzdHJpbmcgX3Njb3JlU3RyaW5nID0gXCJcIjtcclxuICAgICAgICBwcml2YXRlIFJldHlwZWQucGhhc2VyLlBoYXNlci5UZXh0IF9zY29yZVRleHQ7XHJcbiAgICAgICAgcHJpdmF0ZSBSZXR5cGVkLnBoYXNlci5QaGFzZXIuR3JvdXAgX2xpdmVzO1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkdyb3VwIF9lbmVteUJ1bGxldHM7XHJcbiAgICAgICAgcHJpdmF0ZSBkb3VibGUgX2ZpcmluZ1RpbWVyO1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlRleHQgX3N0YXRlVGV4dDtcclxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGVzNS5BcnJheTxSZXR5cGVkLnBoYXNlci5QaGFzZXIuU3ByaXRlPiBfbGl2aW5nRW5lbWllcyA9IG5ldyBlczUuQXJyYXk8UmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZT4oMCk7XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIFByZWxvYWQoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2FtZS5sb2FkLmNyb3NzT3JpZ2luID0gdHJ1ZTtcclxuICAgICAgICAgICAgZ2FtZS5sb2FkLmltYWdlKFwiYnVsbGV0XCIsIFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3Bob3RvbnN0b3JtL3BoYXNlci1leGFtcGxlcy9tYXN0ZXIvZXhhbXBsZXMvYXNzZXRzL2dhbWVzL2ludmFkZXJzL2J1bGxldC5wbmdcIik7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5pbWFnZShcImVuZW15QnVsbGV0XCIsIFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3Bob3RvbnN0b3JtL3BoYXNlci1leGFtcGxlcy9tYXN0ZXIvZXhhbXBsZXMvYXNzZXRzL2dhbWVzL2ludmFkZXJzL2VuZW15LWJ1bGxldC5wbmdcIik7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldChcImludmFkZXJcIiwgXCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vcGhvdG9uc3Rvcm0vcGhhc2VyLWV4YW1wbGVzL21hc3Rlci9leGFtcGxlcy9hc3NldHMvZ2FtZXMvaW52YWRlcnMvaW52YWRlcjMyeDMyeDQucG5nXCIsIDMyLCAzMik7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5pbWFnZShcInNoaXBcIiwgXCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vcGhvdG9uc3Rvcm0vcGhhc2VyLWV4YW1wbGVzL21hc3Rlci9leGFtcGxlcy9hc3NldHMvZ2FtZXMvaW52YWRlcnMvcGxheWVyLnBuZ1wiKTtcclxuICAgICAgICAgICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KFwia2Fib29tXCIsIFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3Bob3RvbnN0b3JtL3BoYXNlci1leGFtcGxlcy9tYXN0ZXIvZXhhbXBsZXMvYXNzZXRzL2dhbWVzL2ludmFkZXJzL2V4cGxvZGUucG5nXCIsIDEyOCwgMTI4KTtcclxuICAgICAgICAgICAgZ2FtZS5sb2FkLmltYWdlKFwic3RhcmZpZWxkXCIsIFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3Bob3RvbnN0b3JtL3BoYXNlci1leGFtcGxlcy9tYXN0ZXIvZXhhbXBsZXMvYXNzZXRzL2dhbWVzL2ludmFkZXJzL3N0YXJmaWVsZC5wbmdcIik7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5pbWFnZShcImJhY2tncm91bmRcIiwgXCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vcGhvdG9uc3Rvcm0vcGhhc2VyLWV4YW1wbGVzL21hc3Rlci9leGFtcGxlcy9hc3NldHMvZ2FtZXMvc3RhcnN0cnVjay9iYWNrZ3JvdW5kMi5wbmdcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBDcmVhdGUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFJldHlwZWQucGhhc2VyLlBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcblxyXG4gICAgICAgICAgICAvLyAgVGhlIHNjcm9sbGluZyBzdGFyZmllbGQgYmFja2dyb3VuZFxyXG4gICAgICAgICAgICBfc3RhcmZpZWxkID0gZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCA4MDAsIDYwMCwgXCJzdGFyZmllbGRcIik7XHJcblxyXG4gICAgICAgICAgICAvLyAgT3VyIGJ1bGxldCBncm91cFxyXG4gICAgICAgICAgICBfYnVsbGV0cyA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgICAgIF9idWxsZXRzLmVuYWJsZUJvZHkgPSB0cnVlO1xyXG4gICAgICAgICAgICBfYnVsbGV0cy5waHlzaWNzQm9keVR5cGUgPSBSZXR5cGVkLnBoYXNlci5QaGFzZXIuUGh5c2ljcy5BUkNBREU7XHJcbiAgICAgICAgICAgIF9idWxsZXRzLmNyZWF0ZU11bHRpcGxlKDMwLCBcImJ1bGxldFwiKTtcclxuICAgICAgICAgICAgX2J1bGxldHMuc2V0QWxsKFwiYW5jaG9yLnhcIiwgMC41KTtcclxuICAgICAgICAgICAgX2J1bGxldHMuc2V0QWxsKFwiYW5jaG9yLnlcIiwgMSk7XHJcbiAgICAgICAgICAgIF9idWxsZXRzLnNldEFsbChcIm91dE9mQm91bmRzS2lsbFwiLCB0cnVlKTtcclxuICAgICAgICAgICAgX2J1bGxldHMuc2V0QWxsKFwiY2hlY2tXb3JsZEJvdW5kc1wiLCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBlbmVteVwicyBidWxsZXRzXHJcbiAgICAgICAgICAgIF9lbmVteUJ1bGxldHMgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgICAgICBfZW5lbXlCdWxsZXRzLmVuYWJsZUJvZHkgPSB0cnVlO1xyXG4gICAgICAgICAgICBfZW5lbXlCdWxsZXRzLnBoeXNpY3NCb2R5VHlwZSA9IFJldHlwZWQucGhhc2VyLlBoYXNlci5QaHlzaWNzLkFSQ0FERTtcclxuICAgICAgICAgICAgX2VuZW15QnVsbGV0cy5jcmVhdGVNdWx0aXBsZSgzMCwgXCJlbmVteUJ1bGxldFwiKTtcclxuICAgICAgICAgICAgX2VuZW15QnVsbGV0cy5zZXRBbGwoXCJhbmNob3IueFwiLCAwLjUpO1xyXG4gICAgICAgICAgICBfZW5lbXlCdWxsZXRzLnNldEFsbChcImFuY2hvci55XCIsIDEpO1xyXG4gICAgICAgICAgICBfZW5lbXlCdWxsZXRzLnNldEFsbChcIm91dE9mQm91bmRzS2lsbFwiLCB0cnVlKTtcclxuICAgICAgICAgICAgX2VuZW15QnVsbGV0cy5zZXRBbGwoXCJjaGVja1dvcmxkQm91bmRzXCIsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgLy8gIFRoZSBoZXJvIVxyXG4gICAgICAgICAgICBfcGxheWVyID0gZ2FtZS5hZGQuc3ByaXRlKDQwMCwgNTAwLCBcInNoaXBcIik7XHJcbiAgICAgICAgICAgIF9wbGF5ZXIuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcclxuICAgICAgICAgICAgZ2FtZS5waHlzaWNzLmVuYWJsZShfcGxheWVyLCBSZXR5cGVkLnBoYXNlci5QaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG5cclxuICAgICAgICAgICAgLy8gIFRoZSBiYWRkaWVzIVxyXG4gICAgICAgICAgICBfYWxpZW5zID0gZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICAgICAgX2FsaWVucy5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgX2FsaWVucy5waHlzaWNzQm9keVR5cGUgPSBSZXR5cGVkLnBoYXNlci5QaGFzZXIuUGh5c2ljcy5BUkNBREU7XHJcblxyXG4gICAgICAgICAgICBDcmVhdGVBbGllbnMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vICBUaGUgc2NvcmVcclxuICAgICAgICAgICAgX3Njb3JlU3RyaW5nID0gXCJTY29yZSA6IFwiO1xyXG4gICAgICAgICAgICBfc2NvcmVUZXh0ID0gZ2FtZS5hZGQudGV4dCgxMCwgMTAsIF9zY29yZVN0cmluZyArIF9zY29yZSwgbmV3IHtmb250ID0gXCIzNHB4IEFyaWFsXCIsIGZpbGwgPSBcIiNmZmZcIn0pO1xyXG5cclxuICAgICAgICAgICAgLy8gIExpdmVzXHJcbiAgICAgICAgICAgIF9saXZlcyA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgICAgIGdhbWUuYWRkLnRleHQoZ2FtZS53b3JsZC53aWR0aCAtIDEwMCwgMTAsIFwiTGl2ZXMgOiBcIiwgbmV3IHtmb250ID0gXCIzNHB4IEFyaWFsXCIsIGZpbGwgPSBcIiNmZmZcIn0pO1xyXG5cclxuICAgICAgICAgICAgLy8gIFRleHRcclxuICAgICAgICAgICAgX3N0YXRlVGV4dCA9IGdhbWUuYWRkLnRleHQoZ2FtZS53b3JsZC5jZW50ZXJYLCBnYW1lLndvcmxkLmNlbnRlclksIFwiIFwiLCBuZXcge2ZvbnQgPSBcIjg0cHggQXJpYWxcIiwgZmlsbCA9IFwiI2ZmZlwifSk7XHJcbiAgICAgICAgICAgIF9zdGF0ZVRleHQuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcclxuICAgICAgICAgICAgX3N0YXRlVGV4dC52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNoaXAgPSAoUmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZSkgX2xpdmVzLmNyZWF0ZShnYW1lLndvcmxkLndpZHRoIC0gMTAwICsgKDMwICogaSksIDYwLCBcInNoaXBcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgc2hpcC5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xyXG4gICAgICAgICAgICAgICAgc2hpcC5hbmdsZSA9IDkwO1xyXG4gICAgICAgICAgICAgICAgc2hpcC5hbHBoYSA9IDAuNDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gIEFuIGV4cGxvc2lvbiBwb29sXHJcbiAgICAgICAgICAgIF9leHBsb3Npb25zID0gZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICAgICAgX2V4cGxvc2lvbnMuY3JlYXRlTXVsdGlwbGUoMzAsIFwia2Fib29tXCIpO1xyXG4gICAgICAgICAgICBfZXhwbG9zaW9ucy5mb3JFYWNoKChBY3Rpb248UmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZT4pIFNldHVwSW52YWRlciwgdGhpcyk7XHJcblxyXG4gICAgICAgICAgICAvLyAgQW5kIHNvbWUgY29udHJvbHMgdG8gcGxheSB0aGUgZ2FtZSB3aXRoXHJcbiAgICAgICAgICAgIF9jdXJzb3JzID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XHJcbiAgICAgICAgICAgIF9maXJlQnV0dG9uID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUmV0eXBlZC5waGFzZXIuUGhhc2VyLktleWJvYXJkLlNQQUNFQkFSKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBDcmVhdGVBbGllbnMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCA0OyB5KyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgMTA7IHgrKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYWxpZW4gPSAoUmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZSkgX2FsaWVucy5jcmVhdGUoeCAqIDQ4LCB5ICogNTAsIFwiaW52YWRlclwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYWxpZW4uYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcclxuICAgICAgICAgICAgICAgICAgICBhbGllbi5hbmltYXRpb25zLmFkZChcImZseVwiLCBuZXcgZG91YmxlW10gezAsIDEsIDIsIDN9LCAyMCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxpZW4ucGxheShcImZseVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgKChSZXR5cGVkLnBoYXNlci5QaGFzZXIuUGh5c2ljcy5BcmNhZGUuQm9keSkgYWxpZW4uYm9keSkubW92ZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgX2FsaWVucy54ID0gMTAwO1xyXG4gICAgICAgICAgICBfYWxpZW5zLnkgPSA1MDtcclxuXHJcbiAgICAgICAgICAgIC8vICBBbGwgdGhpcyBkb2VzIGlzIGJhc2ljYWxseSBzdGFydCB0aGUgaW52YWRlcnMgbW92aW5nLiBOb3RpY2Ugd2VcInJlIG1vdmluZyB0aGUgR3JvdXAgdGhleSBiZWxvbmcgdG8sIHJhdGhlciB0aGFuIHRoZSBpbnZhZGVycyBkaXJlY3RseS5cclxuICAgICAgICAgICAgdmFyIHR3ZWVuID0gZ2FtZS5hZGQudHdlZW4oX2FsaWVucykudG8obmV3IHt4ID0gMjAwfSwgMjAwMCwgKEZ1bmM8ZG91YmxlLCBkb3VibGU+KSBSZXR5cGVkLnBoYXNlci5QaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lLCB0cnVlLCAwLCAxMDAwLCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIC8vICBXaGVuIHRoZSB0d2VlbiBsb29wcyBpdCBjYWxscyBkZXNjZW5kXHJcbiAgICAgICAgICAgIHR3ZWVuLm9uTG9vcC5hZGQoKEFjdGlvbikgRGVzY2VuZCwgdGhpcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgU2V0dXBJbnZhZGVyKFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUgaW52YWRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludmFkZXIuYW5jaG9yLnggPSAwLjU7XHJcbiAgICAgICAgICAgIGludmFkZXIuYW5jaG9yLnkgPSAwLjU7XHJcbiAgICAgICAgICAgIGludmFkZXIuYW5pbWF0aW9ucy5hZGQoXCJrYWJvb21cIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBEZXNjZW5kKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIF9hbGllbnMueSArPSAxMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIFVwZGF0ZSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyAgU2Nyb2xsIHRoZSBiYWNrZ3JvdW5kXHJcbiAgICAgICAgICAgIF9zdGFyZmllbGQudGlsZVBvc2l0aW9uLnkgKz0gMjtcclxuXHJcbiAgICAgICAgICAgIGlmIChfcGxheWVyLmFsaXZlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyAgUmVzZXQgdGhlIHBsYXllciwgdGhlbiBjaGVjayBmb3IgbW92ZW1lbnQga2V5c1xyXG4gICAgICAgICAgICAgICAgdmFyIHBsYXllckJvZHkgPSAoUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBoeXNpY3MuQXJjYWRlLkJvZHkpIF9wbGF5ZXIuYm9keTtcclxuXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJCb2R5LnZlbG9jaXR5LnNldFRvKDAsIDApO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChfY3Vyc29ycy5sZWZ0LmlzRG93bilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJCb2R5LnZlbG9jaXR5LnggPSAtMjAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoX2N1cnNvcnMucmlnaHQuaXNEb3duKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllckJvZHkudmVsb2NpdHkueCA9IDIwMDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyAgRmlyaW5nP1xyXG4gICAgICAgICAgICAgICAgaWYgKF9maXJlQnV0dG9uLmlzRG93bilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBGaXJlQnVsbGV0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGdhbWUudGltZS5ub3cgPiBfZmlyaW5nVGltZXIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgRW5lbXlGaXJlcygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vICBSdW4gY29sbGlzaW9uXHJcbiAgICAgICAgICAgICAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAoX2J1bGxldHMsIF9hbGllbnMsIChBY3Rpb248UmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZSwgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZT4pIGNvbGxpc2lvbkhhbmRsZXIsIG51bGwsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKF9lbmVteUJ1bGxldHMsIF9wbGF5ZXIsIChBY3Rpb248UmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZSwgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZT4pIEVuZW15SGl0c1BsYXllciwgbnVsbCwgdGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIFJlbmRlcigpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvL2ZvciAodmFyIGkgPSAwOyBpIDwgX2FsaWVucy5sZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgLy97XHJcbiAgICAgICAgICAgIC8vICAgIGdhbWUuZGVidWcuYm9keSgoU3ByaXRlKV9hbGllbnMuY2hpbGRyZW5baV0pO1xyXG4gICAgICAgICAgICAvL31cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBjb2xsaXNpb25IYW5kbGVyKFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUgYnVsbGV0LCBSZXR5cGVkLnBoYXNlci5QaGFzZXIuU3ByaXRlIGFsaWVuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGFsaWVuQm9keSA9IChSZXR5cGVkLnBoYXNlci5QaGFzZXIuUGh5c2ljcy5BcmNhZGUuQm9keSkgYWxpZW4uYm9keTtcclxuXHJcbiAgICAgICAgICAgIC8vICBXaGVuIGEgYnVsbGV0IGhpdHMgYW4gYWxpZW4gd2Uga2lsbCB0aGVtIGJvdGhcclxuICAgICAgICAgICAgYnVsbGV0LmtpbGwoKTtcclxuICAgICAgICAgICAgYWxpZW4ua2lsbCgpO1xyXG5cclxuICAgICAgICAgICAgLy8gIEluY3JlYXNlIHRoZSBzY29yZVxyXG4gICAgICAgICAgICBfc2NvcmUgKz0gMjA7XHJcbiAgICAgICAgICAgIF9zY29yZVRleHQudGV4dCA9IF9zY29yZVN0cmluZyArIF9zY29yZTtcclxuXHJcbiAgICAgICAgICAgIC8vICBBbmQgY3JlYXRlIGFuIGV4cGxvc2lvbiA6KVxyXG4gICAgICAgICAgICB2YXIgZXhwbG9zaW9uID0gKFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUpIF9leHBsb3Npb25zLmdldEZpcnN0RXhpc3RzKGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgIGV4cGxvc2lvbi5yZXNldChhbGllbkJvZHkueCwgYWxpZW5Cb2R5LnkpO1xyXG4gICAgICAgICAgICBleHBsb3Npb24ucGxheShcImthYm9vbVwiLCAzMCwgZmFsc2UsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKF9hbGllbnMuY291bnRMaXZpbmcoKSA9PSAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBfc2NvcmUgKz0gMTAwMDtcclxuICAgICAgICAgICAgICAgIF9zY29yZVRleHQudGV4dCA9IF9zY29yZVN0cmluZyArIF9zY29yZTtcclxuXHJcbiAgICAgICAgICAgICAgICBfZW5lbXlCdWxsZXRzLmNhbGxBbGwoXCJraWxsXCIsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgX3N0YXRlVGV4dC50ZXh0ID0gXCIgWW91IFdvbiwgXFxuIENsaWNrIHRvIHJlc3RhcnRcIjtcclxuICAgICAgICAgICAgICAgIF9zdGF0ZVRleHQudmlzaWJsZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgLy90aGUgXCJjbGljayB0byByZXN0YXJ0XCIgaGFuZGxlclxyXG4gICAgICAgICAgICAgICAgZ2FtZS5pbnB1dC5vblRhcC5hZGRPbmNlKChBY3Rpb24pIFJlc3RhcnQsIHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIEVuZW15SGl0c1BsYXllcihSZXR5cGVkLnBoYXNlci5QaGFzZXIuU3ByaXRlIHBsYXllciwgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZSBidWxsZXQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgcGxheWVyQm9keSA9IChSZXR5cGVkLnBoYXNlci5QaGFzZXIuUGh5c2ljcy5BcmNhZGUuQm9keSkgcGxheWVyLmJvZHk7XHJcblxyXG4gICAgICAgICAgICBidWxsZXQua2lsbCgpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGxpdmUgPSAoUmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZSkgX2xpdmVzLmdldEZpcnN0QWxpdmUoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChsaXZlICE9IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxpdmUua2lsbCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAgQW5kIGNyZWF0ZSBhbiBleHBsb3Npb24gOilcclxuICAgICAgICAgICAgdmFyIGV4cGxvc2lvbiA9IChSZXR5cGVkLnBoYXNlci5QaGFzZXIuU3ByaXRlKSBfZXhwbG9zaW9ucy5nZXRGaXJzdEV4aXN0cyhmYWxzZSk7XHJcbiAgICAgICAgICAgIGV4cGxvc2lvbi5yZXNldChwbGF5ZXJCb2R5LngsIHBsYXllckJvZHkueSk7XHJcbiAgICAgICAgICAgIGV4cGxvc2lvbi5wbGF5KFwia2Fib29tXCIsIDMwLCBmYWxzZSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBXaGVuIHRoZSBwbGF5ZXIgZGllc1xyXG4gICAgICAgICAgICBpZiAoX2xpdmVzLmNvdW50TGl2aW5nKCkgPCAxKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIua2lsbCgpO1xyXG4gICAgICAgICAgICAgICAgX2VuZW15QnVsbGV0cy5jYWxsQWxsKFwia2lsbFwiLCBudWxsKTtcclxuXHJcbiAgICAgICAgICAgICAgICBfc3RhdGVUZXh0LnRleHQgPSBcIiBHQU1FIE9WRVIgXFxuIENsaWNrIHRvIHJlc3RhcnRcIjtcclxuICAgICAgICAgICAgICAgIF9zdGF0ZVRleHQudmlzaWJsZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgLy90aGUgXCJjbGljayB0byByZXN0YXJ0XCIgaGFuZGxlclxyXG4gICAgICAgICAgICAgICAgZ2FtZS5pbnB1dC5vblRhcC5hZGRPbmNlKChBY3Rpb24pIFJlc3RhcnQsIHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgRW5lbXlGaXJlcygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyAgR3JhYiB0aGUgZmlyc3QgYnVsbGV0IHdlIGNhbiBmcm9tIHRoZSBwb29sXHJcbiAgICAgICAgICAgIHZhciBlbmVteUJ1bGxldCA9IChSZXR5cGVkLnBoYXNlci5QaGFzZXIuU3ByaXRlKSBfZW5lbXlCdWxsZXRzLmdldEZpcnN0RXhpc3RzKGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgIF9saXZpbmdFbmVtaWVzLmxlbmd0aCA9IDA7XHJcblxyXG4gICAgICAgICAgICBfYWxpZW5zLmZvckVhY2hBbGl2ZShuZXcgQWN0aW9uPFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGU+KGFsaWVuID0+XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8vIHB1dCBldmVyeSBsaXZpbmcgZW5lbXkgaW4gYW4gYXJyYXlcclxuICAgICAgICAgICAgICAgIF9saXZpbmdFbmVtaWVzLnB1c2goYWxpZW4pO1xyXG4gICAgICAgICAgICB9KSwgbnVsbCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZW5lbXlCdWxsZXQgIT0gbnVsbCAmJiBfbGl2aW5nRW5lbWllcy5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHJhbmRvbSA9IGdhbWUucm5kLmludGVnZXJJblJhbmdlKDAsIF9saXZpbmdFbmVtaWVzLmxlbmd0aCAtIDEpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHJhbmRvbWx5IHNlbGVjdCBvbmUgb2YgdGhlbVxyXG4gICAgICAgICAgICAgICAgdmFyIHNob290ZXIgPSBfbGl2aW5nRW5lbWllc1tyYW5kb21dO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFuZCBmaXJlIHRoZSBidWxsZXQgZnJvbSB0aGlzIGVuZW15XHJcbiAgICAgICAgICAgICAgICB2YXIgc2hvb3RlckJvZHkgPSAoUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBoeXNpY3MuQXJjYWRlLkJvZHkpIHNob290ZXIuYm9keTtcclxuICAgICAgICAgICAgICAgIGVuZW15QnVsbGV0LnJlc2V0KHNob290ZXJCb2R5LngsIHNob290ZXJCb2R5LnkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGdhbWUucGh5c2ljcy5hcmNhZGUubW92ZVRvT2JqZWN0KGVuZW15QnVsbGV0LCBfcGxheWVyLCAxMjApO1xyXG4gICAgICAgICAgICAgICAgX2ZpcmluZ1RpbWVyID0gZ2FtZS50aW1lLm5vdyArIDIwMDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBGaXJlQnVsbGV0KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vICBUbyBhdm9pZCB0aGVtIGJlaW5nIGFsbG93ZWQgdG8gZmlyZSB0b28gZmFzdCB3ZSBzZXQgYSB0aW1lIGxpbWl0XHJcbiAgICAgICAgICAgIGlmIChnYW1lLnRpbWUubm93ID4gX2J1bGxldFRpbWUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8vICBHcmFiIHRoZSBmaXJzdCBidWxsZXQgd2UgY2FuIGZyb20gdGhlIHBvb2xcclxuICAgICAgICAgICAgICAgIHZhciBidWxsZXQgPSAoUmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZSkgX2J1bGxldHMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoYnVsbGV0ICE9IG51bGwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJ1bGxldEJvZHkgPSAoUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBoeXNpY3MuQXJjYWRlLkJvZHkpIGJ1bGxldC5ib2R5O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyAgQW5kIGZpcmUgaXRcclxuICAgICAgICAgICAgICAgICAgICBidWxsZXQucmVzZXQoX3BsYXllci54LCBfcGxheWVyLnkgKyA4KTtcclxuICAgICAgICAgICAgICAgICAgICBidWxsZXRCb2R5LnZlbG9jaXR5LnkgPSAtNDAwO1xyXG4gICAgICAgICAgICAgICAgICAgIF9idWxsZXRUaW1lID0gZ2FtZS50aW1lLm5vdyArIDIwMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBSZXNldEJ1bGxldChSZXR5cGVkLnBoYXNlci5QaGFzZXIuU3ByaXRlIGJ1bGxldClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vICBDYWxsZWQgaWYgdGhlIGJ1bGxldCBnb2VzIG91dCBvZiB0aGUgc2NyZWVuXHJcbiAgICAgICAgICAgIGJ1bGxldC5raWxsKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgUmVzdGFydCgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyAgQSBuZXcgbGV2ZWwgc3RhcnRzXHJcblxyXG4gICAgICAgICAgICAvL3Jlc2V0cyB0aGUgbGlmZSBjb3VudFxyXG4gICAgICAgICAgICBfbGl2ZXMuY2FsbEFsbChcInJldml2ZVwiLCBudWxsKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFuZCBicmluZ3MgdGhlIGFsaWVucyBiYWNrIGZyb20gdGhlIGRlYWQgOilcclxuICAgICAgICAgICAgX2FsaWVucy5yZW1vdmVBbGwoKTtcclxuXHJcbiAgICAgICAgICAgIENyZWF0ZUFsaWVucygpO1xyXG5cclxuICAgICAgICAgICAgLy9yZXZpdmVzIHRoZSBwbGF5ZXJcclxuICAgICAgICAgICAgX3BsYXllci5yZXZpdmUoKTtcclxuXHJcbiAgICAgICAgICAgIC8vaGlkZXMgdGhlIHRleHRcclxuICAgICAgICAgICAgX3N0YXRlVGV4dC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBSZXR5cGVkO1xyXG5cclxubmFtZXNwYWNlIFBoYXNlckRlbW8uR2FtZXNcclxue1xyXG4gICAgLy8vIDxzdW1tYXJ5PlxyXG4gICAgLy8vIE9yaWdpbmFsIERlbW8gaXMgYXZhaWxhYmxlIGhlcmU6IGh0dHBzOi8vcGhhc2VyLmlvL2V4YW1wbGVzL3YyL3AyLXBoeXNpY3MvYWNjZWxlcmF0ZS10by1vYmplY3RcclxuICAgIC8vLyA8L3N1bW1hcnk+XHJcbiAgICBwdWJsaWMgY2xhc3MgR2FtZVN0YXRlMiA6IEFic3RyYWN0R2FtZVN0YXRlXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBSZXR5cGVkLnBoYXNlci5QaGFzZXIuR3JvdXAgX2J1bGxldHM7XHJcbiAgICAgICAgcHJpdmF0ZSBSZXR5cGVkLnBoYXNlci5QaGFzZXIuQ3Vyc29yS2V5cyBfY3Vyc29ycztcclxuICAgICAgICBwcml2YXRlIFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUgX3NoaXA7XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIFByZWxvYWQoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2FtZS5sb2FkLmNyb3NzT3JpZ2luID0gdHJ1ZTtcclxuICAgICAgICAgICAgZ2FtZS5sb2FkLmltYWdlKFwiY2FyXCIsIFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3Bob3RvbnN0b3JtL3BoYXNlci1leGFtcGxlcy9tYXN0ZXIvZXhhbXBsZXMvYXNzZXRzL3Nwcml0ZXMvY2FyLnBuZ1wiKTtcclxuICAgICAgICAgICAgZ2FtZS5sb2FkLmltYWdlKFwidGlueWNhclwiLCBcImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9waG90b25zdG9ybS9waGFzZXItZXhhbXBsZXMvbWFzdGVyL2V4YW1wbGVzL2Fzc2V0cy9zcHJpdGVzL3RpbnljYXIucG5nXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgQ3JlYXRlKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShSZXR5cGVkLnBoYXNlci5QaGFzZXIuUGh5c2ljcy5QMkpTKTtcclxuXHJcbiAgICAgICAgICAgIF9idWxsZXRzID0gZ2FtZS5hZGQuZ3JvdXAoKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTA7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdmFyIGJ1bGxldCA9IF9idWxsZXRzLmNyZWF0ZShnYW1lLnJuZC5pbnRlZ2VySW5SYW5nZSgyMDAsIDE3MDApLCBnYW1lLnJuZC5pbnRlZ2VySW5SYW5nZSgtMjAwLCA0MDApLCBcInRpbnljYXJcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShidWxsZXQsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgX2N1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcclxuICAgICAgICAgICAgX3NoaXAgPSBnYW1lLmFkZC5zcHJpdGUoMzIsIGdhbWUud29ybGQuaGVpZ2h0IC0gMTUwLCBcImNhclwiKTtcclxuXHJcbiAgICAgICAgICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoX3NoaXApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgVXBkYXRlKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBzaGlwQm9keSA9IChSZXR5cGVkLnBoYXNlci5QaGFzZXIuUGh5c2ljcy5QMi5Cb2R5KSBfc2hpcC5ib2R5O1xyXG5cclxuICAgICAgICAgICAgX2J1bGxldHMuZm9yRWFjaEFsaXZlKChBY3Rpb248UmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZT4pIE1vdmVCdWxsZXRzLCB0aGlzKTsgLy9tYWtlIGJ1bGxldHMgYWNjZWxlcmF0ZSB0byBzaGlwXHJcblxyXG4gICAgICAgICAgICBpZiAoX2N1cnNvcnMubGVmdC5pc0Rvd24pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNoaXBCb2R5LnJvdGF0ZUxlZnQoMTAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChfY3Vyc29ycy5yaWdodC5pc0Rvd24pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNoaXBCb2R5LnJvdGF0ZVJpZ2h0KDEwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzaGlwQm9keS5zZXRaZXJvUm90YXRpb24oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKF9jdXJzb3JzLnVwLmlzRG93bilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc2hpcEJvZHkudGhydXN0KDQwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoX2N1cnNvcnMuZG93bi5pc0Rvd24pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNoaXBCb2R5LnJldmVyc2UoNDAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIE1vdmVCdWxsZXRzKFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUgYnVsbGV0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQWNjZWxlcmF0ZVRvT2JqZWN0KGJ1bGxldCwgX3NoaXAsIDMwKTsgLy9zdGFydCBhY2NlbGVyYXRlVG9PYmplY3Qgb24gZXZlcnkgYnVsbGV0XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgQWNjZWxlcmF0ZVRvT2JqZWN0KFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUgb2JqMSwgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZSBvYmoyLCBkb3VibGUgc3BlZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoZG91YmxlLklzTmFOKHNwZWVkKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3BlZWQgPSA2MDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIG9iajFCb2R5ID0gKFJldHlwZWQucGhhc2VyLlBoYXNlci5QaHlzaWNzLlAyLkJvZHkpIG9iajEuYm9keTtcclxuXHJcbiAgICAgICAgICAgIHZhciBhbmdsZSA9IGVzNS5NYXRoLmF0YW4yKG9iajIueSAtIG9iajEueSwgb2JqMi54IC0gb2JqMS54KTtcclxuXHJcbiAgICAgICAgICAgIG9iajFCb2R5LnJvdGF0aW9uID0gYW5nbGUgKyBlczUuTWF0aC5QSSAvIDI7IC8vIGNvcnJlY3QgYW5nbGUgb2YgYW5ncnkgYnVsbGV0cyAoZGVwZW5kcyBvbiB0aGUgc3ByaXRlIHVzZWQpXHJcbiAgICAgICAgICAgIG9iajFCb2R5LmZvcmNlLnggPSBlczUuTWF0aC5jb3MoYW5nbGUpICogc3BlZWQ7IC8vIGFjY2VsZXJhdGVUb09iamVjdCBcclxuICAgICAgICAgICAgb2JqMUJvZHkuZm9yY2UueSA9IGVzNS5NYXRoLnNpbihhbmdsZSkgKiBzcGVlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJcclxubmFtZXNwYWNlIFBoYXNlckRlbW8uR2FtZXNcclxue1xyXG4gICAgLy8vIDxzdW1tYXJ5PlxyXG4gICAgLy8vIE9yaWdpbmFsIERlbW8gaXMgYXZhaWxhYmxlIGhlcmU6IGh0dHBzOi8vcGhhc2VyLmlvL2V4YW1wbGVzL3YyL2Jhc2ljcy8wMy1tb3ZlLWFuLWltYWdlXHJcbiAgICAvLy8gPC9zdW1tYXJ5PlxyXG4gICAgcHVibGljIGNsYXNzIEdhbWVTdGF0ZTMgOiBBYnN0cmFjdEdhbWVTdGF0ZVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIFByZWxvYWQoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2FtZS5sb2FkLmNyb3NzT3JpZ2luID0gdHJ1ZTtcclxuICAgICAgICAgICAgZ2FtZS5sb2FkLmltYWdlKFwiZWluc3RlaW5cIiwgXCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vcGhvdG9uc3Rvcm0vcGhhc2VyLWV4YW1wbGVzL21hc3Rlci9leGFtcGxlcy9hc3NldHMvcGljcy9yYV9laW5zdGVpbi5wbmdcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBDcmVhdGUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gIFRoaXMgY3JlYXRlcyBhIHNpbXBsZSBzcHJpdGUgdGhhdCBpcyB1c2luZyBvdXIgbG9hZGVkIGltYWdlIGFuZFxyXG4gICAgICAgICAgICAvLyAgZGlzcGxheXMgaXQgb24tc2NyZWVuXHJcbiAgICAgICAgICAgIC8vICBhbmQgYXNzaWduIGl0IHRvIGEgdmFyaWFibGVcclxuICAgICAgICAgICAgdmFyIGltYWdlID0gZ2FtZS5hZGQuc3ByaXRlKDAsIDAsIFwiZWluc3RlaW5cIik7XHJcblxyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MuZW5hYmxlKGltYWdlLCBSZXR5cGVkLnBoYXNlci5QaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGltYWdlQm9keSA9IChSZXR5cGVkLnBoYXNlci5QaGFzZXIuUGh5c2ljcy5BcmNhZGUuQm9keSlpbWFnZS5ib2R5O1xyXG4gICAgICAgICAgICBpbWFnZUJvZHkudmVsb2NpdHkueCA9IDE1MDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgQnJpZGdlO1xyXG51c2luZyBSZXR5cGVkO1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIE1hdGggPSBTeXN0ZW0uTWF0aDtcclxuXHJcbm5hbWVzcGFjZSBQaGFzZXJEZW1vLkdhbWVzXHJcbntcclxuICAgIGNsYXNzIEdhbWVTdGF0ZTQgOiBBYnN0cmFjdEdhbWVTdGF0ZVxyXG4gICAge1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZSBzaGlwO1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlJlY3RhbmdsZSB2aWV3O1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlRpbGVTcHJpdGUgc3BhY2U7XHJcbiAgICAgICAgcHJpdmF0ZSBSZXR5cGVkLnBoYXNlci5QaGFzZXIuUG9seWdvbiBncm91bmQ7XHJcblxyXG4gICAgICAgIFJldHlwZWQucGhhc2VyLlBoYXNlci5UZXh0IGtvbnVtVGV4dDtcclxuICAgICAgICBSZXR5cGVkLnBoYXNlci5QaGFzZXIuVGV4dCBhY2lUZXh0O1xyXG4gICAgICAgIFJldHlwZWQucGhhc2VyLlBoYXNlci5UZXh0IGhpelRleHQ7XHJcbiAgICAgICAgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlRleHQgaXZtZVRleHQ7XHJcblxyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLktleWJvYXJkIGtleWJvYXJkO1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkN1cnNvcktleXMgY3Vyc29ycztcclxuICAgICAgICBwcml2YXRlIGludCBtb3RvcjtcclxuICAgICAgICBwcml2YXRlIGludCBsYXN0U2V0TW90b3I7XHJcbiAgICAgICAgcHJpdmF0ZSBkb3VibGUgbGFzdE1vdG9yUm90YXRpb247XHJcblxyXG4gICAgICAgIHByaXZhdGUgZG91YmxlIHN0YXJ0aW5nVmVsb2NpdHlYID0gMDtcclxuICAgICAgICBwcml2YXRlIGRvdWJsZSBzdGFydGluZ1ZlbG9jaXR5WSA9IDA7XHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgc3RhcnRpbmdYID0gMDtcclxuICAgICAgICBwcml2YXRlIGludCBzdGFydGluZ1kgPSAwO1xyXG4gICAgICAgIHByaXZhdGUgZG91YmxlIHN0YXJ0aW5nQW5nbGUgPSAtNjg7XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIENyZWF0ZSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB3b3JsZCA9IGdhbWUud29ybGQ7XHJcbiAgICAgICAgICAgIGdhbWUudGltZS5zbG93TW90aW9uID0gMi4wO1xyXG4gICAgICAgICAgICB2aWV3ID0gZ2FtZS5jYW1lcmEudmlldztcclxuICAgICAgICAgICAgc3BhY2UgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIHZpZXcud2lkdGgsIHZpZXcuaGVpZ2h0LCBcInNwYWNlXCIpO1xyXG4gICAgICAgICAgICBzcGFjZS5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIHNoaXAgPSBnYW1lLmFkZC5zcHJpdGUoMjUwLCBnYW1lLmhlaWdodCAtIDI3MCwgXCJzaGlwXCIpO1xyXG4gICAgICAgICAgICBzaGlwLmFuZ2xlID0gLTY4O1xyXG4gICAgICAgICAgICBzaGlwLmFuY2hvci5zZXQoMC41KTtcclxuICAgICAgICAgICAgZ2FtZS5waHlzaWNzLmVuYWJsZShzaGlwLCBSZXR5cGVkLnBoYXNlci5QaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSA9IDM3LjE7XHJcblxyXG4gICAgICAgICAgICB2YXIgc2hpcEJvZHkgPSAoUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBoeXNpY3MuQXJjYWRlLkJvZHkpc2hpcC5ib2R5O1xyXG4gICAgICAgICAgICAvL3NoaXBCb2R5LmFuZ3VsYXJEcmFnID0gMTAwO1xyXG4gICAgICAgICAgICAvL3NoaXBCb2R5LmJvdW5jZS5zZXRUbygxKTtcclxuICAgICAgICAgICAgLy9zaGlwQm9keS5kcmFnLnNldCgxMCk7XHJcbiAgICAgICAgICAgIHNoaXBCb2R5LmZyaWN0aW9uLnNldFRvKDApO1xyXG4gICAgICAgICAgICBzaGlwQm9keS5tYXhWZWxvY2l0eS5zZXQoMTUwKTtcclxuXHJcbiAgICAgICAgICAgIC8vZGVidWdUZXh0ID0gZ2FtZS5hZGQudGV4dCgxMCwgMTAsIFwiXCIgLCBuZXcgeyBmb250ID0gXCIzNHB4IEFyaWFsXCIsIGZpbGwgPSBcIiNmZmZcIiB9KTtcclxuICAgICAgICAgICAga29udW1UZXh0ID0gZ2FtZS5hZGQudGV4dCgxMCwgMTAsIFwiXCIsIG5ldyB7IGZvbnQgPSBcIjE4cHggQXJpYWxcIiwgZmlsbCA9IFwiI2ZmZlwiIH0pO1xyXG4gICAgICAgICAgICBhY2lUZXh0ID0gZ2FtZS5hZGQudGV4dCgxMCwgNDAsIFwiXCIsIG5ldyB7IGZvbnQgPSBcIjE4cHggQXJpYWxcIiwgZmlsbCA9IFwiI2ZmZlwiIH0pO1xyXG4gICAgICAgICAgICBoaXpUZXh0ID0gZ2FtZS5hZGQudGV4dCgxMCwgNzAsIFwiXCIsIG5ldyB7IGZvbnQgPSBcIjE4cHggQXJpYWxcIiwgZmlsbCA9IFwiI2ZmZlwiIH0pO1xyXG4gICAgICAgICAgICBpdm1lVGV4dCA9IGdhbWUuYWRkLnRleHQoMTAsIDEwMCwgXCJcIiwgbmV3IHsgZm9udCA9IFwiMThweCBBcmlhbFwiLCBmaWxsID0gXCIjZmZmXCIgfSk7XHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIGdyb3VuZCA9IG5ldyBSZXR5cGVkLnBoYXNlci5QaGFzZXIuUG9seWdvbihuZXcgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBvaW50KDAsIDMwMCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBvaW50KDAsIDI5MCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBvaW50KDEwMCwgMjUwKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBSZXR5cGVkLnBoYXNlci5QaGFzZXIuUG9pbnQoMTUwLCAxNTApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFJldHlwZWQucGhhc2VyLlBoYXNlci5Qb2ludCgzMDAsIDIwMCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBvaW50KDQwMCwgMjg1KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBSZXR5cGVkLnBoYXNlci5QaGFzZXIuUG9pbnQoNTUwLCAyODUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFJldHlwZWQucGhhc2VyLlBoYXNlci5Qb2ludCg2OTksIDIyMCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBvaW50KDY5OSwgMzAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgdmFyIGdyYXBoaWNzID0gZ2FtZS5hZGQuZ3JhcGhpY3MoMCwgMCk7XHJcbiAgICAgICAgICAgIGdyYXBoaWNzLmJlZ2luRmlsbCgweEZGMzNmZik7XHJcbiAgICAgICAgICAgIGdyYXBoaWNzLmRyYXdQb2x5Z29uKGdyb3VuZC5wb2ludHMpO1xyXG4gICAgICAgICAgICBncmFwaGljcy5lbmRGaWxsKCk7XHJcblxyXG4gICAgICAgICAgICBtb3RvciA9IDQwO1xyXG5cclxuICAgICAgICAgICAga2V5Ym9hcmQgPSBnYW1lLmlucHV0LmtleWJvYXJkO1xyXG4gICAgICAgICAgICBjdXJzb3JzID0ga2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgSW5pdCgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBiYXNlLkluaXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIFByZWxvYWQoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2FtZS5sb2FkLnBhdGggPSBcImh0dHBzOi8vc2FtbWUuZ2l0aHViLmlvL3BoYXNlci1wbHVnaW4tZGVidWctYXJjYWRlLXBoeXNpY3MvZXhhbXBsZS9hc3NldHMvXCI7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5pbWFnZShcInNwYWNlXCIsIFwiZGVlcC1zcGFjZS5qcGdcIik7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5pbWFnZShcImFzdGVyb2lkMVwiLCBcImFzdGVyb2lkMS5wbmdcIik7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5pbWFnZShcImFzdGVyb2lkMlwiLCBcImFzdGVyb2lkMi5wbmdcIik7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5pbWFnZShcImFzdGVyb2lkM1wiLCBcImFzdGVyb2lkMy5wbmdcIik7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5pbWFnZShcImJ1bGxldFwiLCBcImJ1bGxldHMucG5nXCIpO1xyXG4gICAgICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoXCJzaGlwXCIsIFwic2hpcC5wbmdcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBSZW5kZXIoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgYmFzZS5SZW5kZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIFNodXRkb3duKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGJhc2UuU2h1dGRvd24oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIFVwZGF0ZSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBSZXR5cGVkLnBoYXNlci5QaGFzZXIuUGh5c2ljcy5BcmNhZGUgYXJjYWRlID0gZ2FtZS5waHlzaWNzLmFyY2FkZTtcclxuICAgICAgICAgICAgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBoeXNpY3MuQXJjYWRlLkJvZHkgYm9keSA9IChSZXR5cGVkLnBoYXNlci5QaGFzZXIuUGh5c2ljcy5BcmNhZGUuQm9keSlzaGlwLmJvZHk7XHJcblxyXG4gICAgICAgICAgICBpZiAoY3Vyc29ycy5sZWZ0LmlzRG93bilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGJvZHkucm90YXRpb24gPj0gLTEpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYm9keS5yb3RhdGlvbiA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYm9keS5yb3RhdGlvbiArPSAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGN1cnNvcnMucmlnaHQuaXNEb3duKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYm9keS5yb3RhdGlvbiA8PSAtMTc5KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJvZHkucm90YXRpb24gPSAtMTgwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJvZHkucm90YXRpb24gLT0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGN1cnNvcnMudXAuaXNEb3duKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtb3RvcisrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGN1cnNvcnMuZG93bi5pc0Rvd24pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1vdG9yLS07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChtb3RvciA+IDQwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtb3RvciA9IDQwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG1vdG9yIDwgMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbW90b3IgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgobW90b3IgLzEwKSoxMCAhPSBsYXN0U2V0TW90b3IgfHwgbGFzdE1vdG9yUm90YXRpb24gIT0gc2hpcC5yb3RhdGlvbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGFzdFNldE1vdG9yID0gKG1vdG9yIC8gMTApICogMTA7XHJcbiAgICAgICAgICAgICAgICBsYXN0TW90b3JSb3RhdGlvbiA9IHNoaXAucm90YXRpb247XHJcbiAgICAgICAgICAgICAgICBhcmNhZGUuYWNjZWxlcmF0aW9uRnJvbVJvdGF0aW9uKHNoaXAucm90YXRpb24sIGxhc3RTZXRNb3RvciwgYm9keS5hY2NlbGVyYXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgLy9lbHNlXHJcbiAgICAgICAgICAgIC8ve1xyXG4gICAgICAgICAgICAvLyAgICBib2R5LmFuZ3VsYXJBY2NlbGVyYXRpb24gPSAwO1xyXG4gICAgICAgICAgICAvL31cclxuICAgICAgICAgICAgYWNpVGV4dC50ZXh0ID0gc3RyaW5nLkZvcm1hdChcIkHDp8SxOiB7MDowMDB9wrBcIixib2R5LnJvdGF0aW9uKTtcclxuICAgICAgICAgICAga29udW1UZXh0LnRleHQgPSBzdHJpbmcuRm9ybWF0KFwiS29udW0geDogezA6MDAwMH0sIHk6IHsxOjAwMDB9XCIsYm9keS54LGJvZHkueSk7XHJcbiAgICAgICAgICAgIGhpelRleHQudGV4dCA9IHN0cmluZy5Gb3JtYXQoXCJIxLF6IFlhdGF5OiB7MDowMH0sIERpa2V5OiB7MTowMH1cIixib2R5LnZlbG9jaXR5LngsYm9keS52ZWxvY2l0eS55KTtcclxuICAgICAgICAgICAgaXZtZVRleHQudGV4dCA9IHN0cmluZy5Gb3JtYXQoXCLEsHZtZSBZYXRheTogezA6MDB9LCBEaWtleTogezE6MDB9XCIsYm9keS5hY2NlbGVyYXRpb24ueCxib2R5LmFjY2VsZXJhdGlvbi55KTtcclxuXHJcbiAgICAgICAgICAgIFNjcmVlbldyYXAoc2hpcCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgU2NyZWVuV3JhcChSZXR5cGVkLnBoYXNlci5QaGFzZXIuU3ByaXRlIHNwcml0ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChzcHJpdGUueCA8IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNwcml0ZS54ID0gZ2FtZS53aWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChzcHJpdGUueCA+IGdhbWUud2lkdGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNwcml0ZS54ID0gMDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHNwcml0ZS55IDwgMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3ByaXRlLnkgPSBnYW1lLmhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChzcHJpdGUueSA+IGdhbWUuaGVpZ2h0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzcHJpdGUueSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl0KfQo=

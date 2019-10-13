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
                            return new Phaser.Game(800, 600, Phaser.CANVAS, "phaserRoot", state4);
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
            debugText: null,
            keyboard: null,
            cursors: null,
            motor: 0,
            lastSetMotor: 0,
            lastMotorRotation: 0
        },
        methods: {
            create: function () {
                this.world = this.game.world;
                this.view = this.game.camera.view;
                this.space = this.game.add.tileSprite(0, 0, this.view.width, this.view.height, "space");
                this.space.fixedToCamera = true;

                this.ship = this.game.add.sprite(this.world.centerX, this.world.centerY, "ship");
                this.ship.anchor.set(0.5);
                this.game.physics.enable(this.ship, Phaser.Physics.ARCADE);
                this.game.physics.arcade.gravity.y = 371;

                var shipBody = this.ship.body;
                shipBody.angularDrag = 100;
                shipBody.bounce.setTo(1);
                shipBody.friction.setTo(0);
                shipBody.maxVelocity.set(100);

                this.debugText = this.game.add.text(10, 10, "", { font: "34px Arial", fill: "#fff" });

                this.motor = 300;

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

                if (this.motor > 400) {
                    this.motor = 400;
                } else if (this.motor < 0) {
                    this.motor = 0;
                }
                if (Bridge.Int.mul((((Bridge.Int.div(this.motor, 100)) | 0)), 100) !== this.lastSetMotor || this.lastMotorRotation !== this.ship.rotation) {
                    this.lastSetMotor = Bridge.Int.mul((((Bridge.Int.div(this.motor, 100)) | 0)), 100);
                    this.lastMotorRotation = this.ship.rotation;
                    arcade.accelerationFromRotation(this.ship.rotation, this.lastSetMotor, body.acceleration);
                }


                this.debugText.text = System.Double.format(body.rotation);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJQaGFzZXJEZW1vLmpzIiwKICAic291cmNlUm9vdCI6ICIiLAogICJzb3VyY2VzIjogWyJBcHAuY3MiLCJHYW1lcy9HYW1lU3RhdGUxLmNzIiwiR2FtZXMvR2FtZVN0YXRlMi5jcyIsIkdhbWVzL0dhbWVTdGF0ZTMuY3MiLCJHYW1lcy9HYW1lU3RhdGU0LmNzIl0sCiAgIm5hbWVzIjogWyIiXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7O1lBY1lBOztZQUdBQTs7Ozs7Ozs7O29CQU1BQSxXQUFXQSxtQkFFUEEsdUNBQ0FBLHVDQUNBQSx1Q0FDQUE7O29CQUlKQSxLQUFLQSxXQUFXQSxJQUFJQSxhQUFhQTt3QkFFN0JBLGtCQUFZQTs7d0JBRVpBLHdCQUFLQSxHQUFMQSxpQkFBa0JBOztnQ0FFZEEsNEJBQWFBOzs7Ozt3Q0FLT0E7b0JBRTVCQSxJQUFJQTt3QkFFQUE7d0JBQ0FBLHVCQUFRQTt3QkFDUkE7OztvQkFHSkEsdUJBQVFBLHVCQUFRQTtvQkFDaEJBOzttQ0FHNkNBO29CQUU3Q0EsUUFBUUE7d0JBRUpBOzRCQUNJQSxhQUFhQSxJQUFJQTs0QkFFakJBLE9BQU9BLElBQUlBLHNCQUFxQ0EsMkJBQTBDQTt3QkFFOUZBOzRCQUNJQSxhQUFhQSxJQUFJQTs0QkFFakJBLE9BQU9BLElBQUlBLHNCQUFxQ0EsMkJBQTBDQTt3QkFFOUZBOzRCQUNJQSxhQUFhQSxJQUFJQTs0QkFFakJBLE9BQU9BLElBQUlBLHNCQUFxQ0EsMkJBQTBDQTt3QkFDOUZBOzRCQUNJQSxhQUFhQSxJQUFJQTs0QkFDakJBLE9BQU9BLElBQUlBLHNCQUFxQ0EsNkJBQTRDQTt3QkFDcEdBOzRCQUNRQSxNQUFNQSxJQUFJQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NDQ3JEb0RBLElBQUlBOzs7OztnQkFJMUVBO2dCQUNBQTtnQkFDQUE7Z0JBQ0FBO2dCQUNBQTtnQkFDQUE7Z0JBQ0FBO2dCQUNBQTs7O2dCQUtBQSw4QkFBeUJB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ckRlbW8uR2FtZXM7XHJcbnVzaW5nIFJldHlwZWQ7XHJcblxyXG5uYW1lc3BhY2UgUGhhc2VyRGVtb1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgQXBwXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkdhbWUgX2dhbWU7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgYm9vbCBfaXNSdW47XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBNYWluKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIEluaXQgRXZlbnQgaGFuZGxlcnM6XHJcbiAgICAgICAgICAgIEluaXRFdmVudEhhbmRsZXJzKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBSdW4gR2FtZTEgb24gc3RhcnQ6XHJcbiAgICAgICAgICAgIFN3aXRjaEdhbWVUbyg0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgSW5pdEV2ZW50SGFuZGxlcnMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gSW5pdCBldmVudCBoYW5kbGVyIGZvciBidXR0b25zIHN3aXRjaGluZyBzY2VuZXNcclxuICAgICAgICAgICAgdmFyIGJ0bnMgPSBuZXdbXVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkb20uZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzYW1wbGUxQnRuXCIpLFxyXG4gICAgICAgICAgICAgICAgZG9tLmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2FtcGxlMkJ0blwiKSxcclxuICAgICAgICAgICAgICAgIGRvbS5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNhbXBsZTNCdG5cIiksXHJcbiAgICAgICAgICAgICAgICBkb20uZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzYW1wbGU0QnRuXCIpXHJcblxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBidG5zLkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBidG5zW2ldLm9uY2xpY2sgPSBlID0+XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgU3dpdGNoR2FtZVRvKGluZGV4ICsgMSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWQgU3dpdGNoR2FtZVRvKGludCBudW1iZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoX2lzUnVuKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBfZ2FtZS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICBfZ2FtZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBfaXNSdW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgX2dhbWUgPSBSdW5HYW1lKG51bWJlcik7XHJcbiAgICAgICAgICAgIF9pc1J1biA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIFJldHlwZWQucGhhc2VyLlBoYXNlci5HYW1lIFJ1bkdhbWUoaW50IG51bWJlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAobnVtYmVyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlMSA9IG5ldyBHYW1lU3RhdGUxKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkdhbWUoODAwLCA2MDAsIFJldHlwZWQucGhhc2VyLlBoYXNlci5BVVRPLCBcInBoYXNlclJvb3RcIiwgc3RhdGUxKTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGUyID0gbmV3IEdhbWVTdGF0ZTIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBSZXR5cGVkLnBoYXNlci5QaGFzZXIuR2FtZSg4MDAsIDYwMCwgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkFVVE8sIFwicGhhc2VyUm9vdFwiLCBzdGF0ZTIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGUzID0gbmV3IEdhbWVTdGF0ZTMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBSZXR5cGVkLnBoYXNlci5QaGFzZXIuR2FtZSg4MDAsIDYwMCwgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkFVVE8sIFwicGhhc2VyUm9vdFwiLCBzdGF0ZTMpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0ZTQgPSBuZXcgR2FtZVN0YXRlNCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkdhbWUoODAwLCA2MDAsIFJldHlwZWQucGhhc2VyLlBoYXNlci5DQU5WQVMsIFwicGhhc2VyUm9vdFwiLCBzdGF0ZTQpO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBBcmd1bWVudE91dE9mUmFuZ2VFeGNlcHRpb24oXCJudW1iZXJcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFJldHlwZWQ7XHJcblxyXG5uYW1lc3BhY2UgUGhhc2VyRGVtby5HYW1lc1xyXG57XHJcbiAgICAvLy8gPHN1bW1hcnk+XHJcbiAgICAvLy8gT3JpZ2luYWwgRGVtbyBpcyBhdmFpbGFibGUgaGVyZTogaHR0cHM6Ly9waGFzZXIuaW8vZXhhbXBsZXMvdjIvZ2FtZXMvaW52YWRlcnNcclxuICAgIC8vLyA8L3N1bW1hcnk+XHJcbiAgICBwdWJsaWMgY2xhc3MgR2FtZVN0YXRlMSA6IEFic3RyYWN0R2FtZVN0YXRlXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBSZXR5cGVkLnBoYXNlci5QaGFzZXIuU3ByaXRlIF9wbGF5ZXI7XHJcbiAgICAgICAgcHJpdmF0ZSBSZXR5cGVkLnBoYXNlci5QaGFzZXIuR3JvdXAgX2FsaWVucztcclxuICAgICAgICBwcml2YXRlIFJldHlwZWQucGhhc2VyLlBoYXNlci5Hcm91cCBfYnVsbGV0cztcclxuICAgICAgICBwcml2YXRlIGRvdWJsZSBfYnVsbGV0VGltZTtcclxuICAgICAgICBwcml2YXRlIFJldHlwZWQucGhhc2VyLlBoYXNlci5DdXJzb3JLZXlzIF9jdXJzb3JzO1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLktleSBfZmlyZUJ1dHRvbjtcclxuICAgICAgICBwcml2YXRlIFJldHlwZWQucGhhc2VyLlBoYXNlci5Hcm91cCBfZXhwbG9zaW9ucztcclxuICAgICAgICBwcml2YXRlIFJldHlwZWQucGhhc2VyLlBoYXNlci5UaWxlU3ByaXRlIF9zdGFyZmllbGQ7XHJcbiAgICAgICAgcHJpdmF0ZSBkb3VibGUgX3Njb3JlO1xyXG4gICAgICAgIHByaXZhdGUgc3RyaW5nIF9zY29yZVN0cmluZyA9IFwiXCI7XHJcbiAgICAgICAgcHJpdmF0ZSBSZXR5cGVkLnBoYXNlci5QaGFzZXIuVGV4dCBfc2NvcmVUZXh0O1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkdyb3VwIF9saXZlcztcclxuICAgICAgICBwcml2YXRlIFJldHlwZWQucGhhc2VyLlBoYXNlci5Hcm91cCBfZW5lbXlCdWxsZXRzO1xyXG4gICAgICAgIHByaXZhdGUgZG91YmxlIF9maXJpbmdUaW1lcjtcclxuICAgICAgICBwcml2YXRlIFJldHlwZWQucGhhc2VyLlBoYXNlci5UZXh0IF9zdGF0ZVRleHQ7XHJcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBlczUuQXJyYXk8UmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZT4gX2xpdmluZ0VuZW1pZXMgPSBuZXcgZXM1LkFycmF5PFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGU+KDApO1xyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBQcmVsb2FkKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5jcm9zc09yaWdpbiA9IHRydWU7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5pbWFnZShcImJ1bGxldFwiLCBcImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9waG90b25zdG9ybS9waGFzZXItZXhhbXBsZXMvbWFzdGVyL2V4YW1wbGVzL2Fzc2V0cy9nYW1lcy9pbnZhZGVycy9idWxsZXQucG5nXCIpO1xyXG4gICAgICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoXCJlbmVteUJ1bGxldFwiLCBcImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9waG90b25zdG9ybS9waGFzZXItZXhhbXBsZXMvbWFzdGVyL2V4YW1wbGVzL2Fzc2V0cy9nYW1lcy9pbnZhZGVycy9lbmVteS1idWxsZXQucG5nXCIpO1xyXG4gICAgICAgICAgICBnYW1lLmxvYWQuc3ByaXRlc2hlZXQoXCJpbnZhZGVyXCIsIFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3Bob3RvbnN0b3JtL3BoYXNlci1leGFtcGxlcy9tYXN0ZXIvZXhhbXBsZXMvYXNzZXRzL2dhbWVzL2ludmFkZXJzL2ludmFkZXIzMngzMng0LnBuZ1wiLCAzMiwgMzIpO1xyXG4gICAgICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoXCJzaGlwXCIsIFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3Bob3RvbnN0b3JtL3BoYXNlci1leGFtcGxlcy9tYXN0ZXIvZXhhbXBsZXMvYXNzZXRzL2dhbWVzL2ludmFkZXJzL3BsYXllci5wbmdcIik7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldChcImthYm9vbVwiLCBcImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9waG90b25zdG9ybS9waGFzZXItZXhhbXBsZXMvbWFzdGVyL2V4YW1wbGVzL2Fzc2V0cy9nYW1lcy9pbnZhZGVycy9leHBsb2RlLnBuZ1wiLCAxMjgsIDEyOCk7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5pbWFnZShcInN0YXJmaWVsZFwiLCBcImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9waG90b25zdG9ybS9waGFzZXItZXhhbXBsZXMvbWFzdGVyL2V4YW1wbGVzL2Fzc2V0cy9nYW1lcy9pbnZhZGVycy9zdGFyZmllbGQucG5nXCIpO1xyXG4gICAgICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoXCJiYWNrZ3JvdW5kXCIsIFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3Bob3RvbnN0b3JtL3BoYXNlci1leGFtcGxlcy9tYXN0ZXIvZXhhbXBsZXMvYXNzZXRzL2dhbWVzL3N0YXJzdHJ1Y2svYmFja2dyb3VuZDIucG5nXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgQ3JlYXRlKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShSZXR5cGVkLnBoYXNlci5QaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG5cclxuICAgICAgICAgICAgLy8gIFRoZSBzY3JvbGxpbmcgc3RhcmZpZWxkIGJhY2tncm91bmRcclxuICAgICAgICAgICAgX3N0YXJmaWVsZCA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgODAwLCA2MDAsIFwic3RhcmZpZWxkXCIpO1xyXG5cclxuICAgICAgICAgICAgLy8gIE91ciBidWxsZXQgZ3JvdXBcclxuICAgICAgICAgICAgX2J1bGxldHMgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgICAgICBfYnVsbGV0cy5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgX2J1bGxldHMucGh5c2ljc0JvZHlUeXBlID0gUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBoeXNpY3MuQVJDQURFO1xyXG4gICAgICAgICAgICBfYnVsbGV0cy5jcmVhdGVNdWx0aXBsZSgzMCwgXCJidWxsZXRcIik7XHJcbiAgICAgICAgICAgIF9idWxsZXRzLnNldEFsbChcImFuY2hvci54XCIsIDAuNSk7XHJcbiAgICAgICAgICAgIF9idWxsZXRzLnNldEFsbChcImFuY2hvci55XCIsIDEpO1xyXG4gICAgICAgICAgICBfYnVsbGV0cy5zZXRBbGwoXCJvdXRPZkJvdW5kc0tpbGxcIiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIF9idWxsZXRzLnNldEFsbChcImNoZWNrV29ybGRCb3VuZHNcIiwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgZW5lbXlcInMgYnVsbGV0c1xyXG4gICAgICAgICAgICBfZW5lbXlCdWxsZXRzID0gZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICAgICAgX2VuZW15QnVsbGV0cy5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgX2VuZW15QnVsbGV0cy5waHlzaWNzQm9keVR5cGUgPSBSZXR5cGVkLnBoYXNlci5QaGFzZXIuUGh5c2ljcy5BUkNBREU7XHJcbiAgICAgICAgICAgIF9lbmVteUJ1bGxldHMuY3JlYXRlTXVsdGlwbGUoMzAsIFwiZW5lbXlCdWxsZXRcIik7XHJcbiAgICAgICAgICAgIF9lbmVteUJ1bGxldHMuc2V0QWxsKFwiYW5jaG9yLnhcIiwgMC41KTtcclxuICAgICAgICAgICAgX2VuZW15QnVsbGV0cy5zZXRBbGwoXCJhbmNob3IueVwiLCAxKTtcclxuICAgICAgICAgICAgX2VuZW15QnVsbGV0cy5zZXRBbGwoXCJvdXRPZkJvdW5kc0tpbGxcIiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIF9lbmVteUJ1bGxldHMuc2V0QWxsKFwiY2hlY2tXb3JsZEJvdW5kc1wiLCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIC8vICBUaGUgaGVybyFcclxuICAgICAgICAgICAgX3BsYXllciA9IGdhbWUuYWRkLnNwcml0ZSg0MDAsIDUwMCwgXCJzaGlwXCIpO1xyXG4gICAgICAgICAgICBfcGxheWVyLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XHJcbiAgICAgICAgICAgIGdhbWUucGh5c2ljcy5lbmFibGUoX3BsYXllciwgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuXHJcbiAgICAgICAgICAgIC8vICBUaGUgYmFkZGllcyFcclxuICAgICAgICAgICAgX2FsaWVucyA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgICAgIF9hbGllbnMuZW5hYmxlQm9keSA9IHRydWU7XHJcbiAgICAgICAgICAgIF9hbGllbnMucGh5c2ljc0JvZHlUeXBlID0gUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBoeXNpY3MuQVJDQURFO1xyXG5cclxuICAgICAgICAgICAgQ3JlYXRlQWxpZW5zKCk7XHJcblxyXG4gICAgICAgICAgICAvLyAgVGhlIHNjb3JlXHJcbiAgICAgICAgICAgIF9zY29yZVN0cmluZyA9IFwiU2NvcmUgOiBcIjtcclxuICAgICAgICAgICAgX3Njb3JlVGV4dCA9IGdhbWUuYWRkLnRleHQoMTAsIDEwLCBfc2NvcmVTdHJpbmcgKyBfc2NvcmUsIG5ldyB7Zm9udCA9IFwiMzRweCBBcmlhbFwiLCBmaWxsID0gXCIjZmZmXCJ9KTtcclxuXHJcbiAgICAgICAgICAgIC8vICBMaXZlc1xyXG4gICAgICAgICAgICBfbGl2ZXMgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgICAgICBnYW1lLmFkZC50ZXh0KGdhbWUud29ybGQud2lkdGggLSAxMDAsIDEwLCBcIkxpdmVzIDogXCIsIG5ldyB7Zm9udCA9IFwiMzRweCBBcmlhbFwiLCBmaWxsID0gXCIjZmZmXCJ9KTtcclxuXHJcbiAgICAgICAgICAgIC8vICBUZXh0XHJcbiAgICAgICAgICAgIF9zdGF0ZVRleHQgPSBnYW1lLmFkZC50ZXh0KGdhbWUud29ybGQuY2VudGVyWCwgZ2FtZS53b3JsZC5jZW50ZXJZLCBcIiBcIiwgbmV3IHtmb250ID0gXCI4NHB4IEFyaWFsXCIsIGZpbGwgPSBcIiNmZmZcIn0pO1xyXG4gICAgICAgICAgICBfc3RhdGVUZXh0LmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XHJcbiAgICAgICAgICAgIF9zdGF0ZVRleHQudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhciBzaGlwID0gKFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUpIF9saXZlcy5jcmVhdGUoZ2FtZS53b3JsZC53aWR0aCAtIDEwMCArICgzMCAqIGkpLCA2MCwgXCJzaGlwXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNoaXAuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcclxuICAgICAgICAgICAgICAgIHNoaXAuYW5nbGUgPSA5MDtcclxuICAgICAgICAgICAgICAgIHNoaXAuYWxwaGEgPSAwLjQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vICBBbiBleHBsb3Npb24gcG9vbFxyXG4gICAgICAgICAgICBfZXhwbG9zaW9ucyA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgICAgIF9leHBsb3Npb25zLmNyZWF0ZU11bHRpcGxlKDMwLCBcImthYm9vbVwiKTtcclxuICAgICAgICAgICAgX2V4cGxvc2lvbnMuZm9yRWFjaCgoQWN0aW9uPFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGU+KSBTZXR1cEludmFkZXIsIHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgLy8gIEFuZCBzb21lIGNvbnRyb2xzIHRvIHBsYXkgdGhlIGdhbWUgd2l0aFxyXG4gICAgICAgICAgICBfY3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xyXG4gICAgICAgICAgICBfZmlyZUJ1dHRvbiA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFJldHlwZWQucGhhc2VyLlBoYXNlci5LZXlib2FyZC5TUEFDRUJBUik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgQ3JlYXRlQWxpZW5zKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgNDsgeSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IDEwOyB4KyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFsaWVuID0gKFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUpIF9hbGllbnMuY3JlYXRlKHggKiA0OCwgeSAqIDUwLCBcImludmFkZXJcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGFsaWVuLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxpZW4uYW5pbWF0aW9ucy5hZGQoXCJmbHlcIiwgbmV3IGRvdWJsZVtdIHswLCAxLCAyLCAzfSwgMjAsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFsaWVuLnBsYXkoXCJmbHlcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICgoUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBoeXNpY3MuQXJjYWRlLkJvZHkpIGFsaWVuLmJvZHkpLm1vdmVzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIF9hbGllbnMueCA9IDEwMDtcclxuICAgICAgICAgICAgX2FsaWVucy55ID0gNTA7XHJcblxyXG4gICAgICAgICAgICAvLyAgQWxsIHRoaXMgZG9lcyBpcyBiYXNpY2FsbHkgc3RhcnQgdGhlIGludmFkZXJzIG1vdmluZy4gTm90aWNlIHdlXCJyZSBtb3ZpbmcgdGhlIEdyb3VwIHRoZXkgYmVsb25nIHRvLCByYXRoZXIgdGhhbiB0aGUgaW52YWRlcnMgZGlyZWN0bHkuXHJcbiAgICAgICAgICAgIHZhciB0d2VlbiA9IGdhbWUuYWRkLnR3ZWVuKF9hbGllbnMpLnRvKG5ldyB7eCA9IDIwMH0sIDIwMDAsIChGdW5jPGRvdWJsZSwgZG91YmxlPikgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSwgdHJ1ZSwgMCwgMTAwMCwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAvLyAgV2hlbiB0aGUgdHdlZW4gbG9vcHMgaXQgY2FsbHMgZGVzY2VuZFxyXG4gICAgICAgICAgICB0d2Vlbi5vbkxvb3AuYWRkKChBY3Rpb24pIERlc2NlbmQsIHRoaXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFNldHVwSW52YWRlcihSZXR5cGVkLnBoYXNlci5QaGFzZXIuU3ByaXRlIGludmFkZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnZhZGVyLmFuY2hvci54ID0gMC41O1xyXG4gICAgICAgICAgICBpbnZhZGVyLmFuY2hvci55ID0gMC41O1xyXG4gICAgICAgICAgICBpbnZhZGVyLmFuaW1hdGlvbnMuYWRkKFwia2Fib29tXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRGVzY2VuZCgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBfYWxpZW5zLnkgKz0gMTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBVcGRhdGUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gIFNjcm9sbCB0aGUgYmFja2dyb3VuZFxyXG4gICAgICAgICAgICBfc3RhcmZpZWxkLnRpbGVQb3NpdGlvbi55ICs9IDI7XHJcblxyXG4gICAgICAgICAgICBpZiAoX3BsYXllci5hbGl2ZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy8gIFJlc2V0IHRoZSBwbGF5ZXIsIHRoZW4gY2hlY2sgZm9yIG1vdmVtZW50IGtleXNcclxuICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJCb2R5ID0gKFJldHlwZWQucGhhc2VyLlBoYXNlci5QaHlzaWNzLkFyY2FkZS5Cb2R5KSBfcGxheWVyLmJvZHk7XHJcblxyXG4gICAgICAgICAgICAgICAgcGxheWVyQm9keS52ZWxvY2l0eS5zZXRUbygwLCAwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoX2N1cnNvcnMubGVmdC5pc0Rvd24pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyQm9keS52ZWxvY2l0eS54ID0gLTIwMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKF9jdXJzb3JzLnJpZ2h0LmlzRG93bilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJCb2R5LnZlbG9jaXR5LnggPSAyMDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gIEZpcmluZz9cclxuICAgICAgICAgICAgICAgIGlmIChfZmlyZUJ1dHRvbi5pc0Rvd24pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgRmlyZUJ1bGxldCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChnYW1lLnRpbWUubm93ID4gX2ZpcmluZ1RpbWVyKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIEVuZW15RmlyZXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyAgUnVuIGNvbGxpc2lvblxyXG4gICAgICAgICAgICAgICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKF9idWxsZXRzLCBfYWxpZW5zLCAoQWN0aW9uPFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUsIFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGU+KSBjb2xsaXNpb25IYW5kbGVyLCBudWxsLCB0aGlzKTtcclxuICAgICAgICAgICAgICAgIGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcChfZW5lbXlCdWxsZXRzLCBfcGxheWVyLCAoQWN0aW9uPFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUsIFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGU+KSBFbmVteUhpdHNQbGF5ZXIsIG51bGwsIHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBSZW5kZXIoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy9mb3IgKHZhciBpID0gMDsgaSA8IF9hbGllbnMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIC8ve1xyXG4gICAgICAgICAgICAvLyAgICBnYW1lLmRlYnVnLmJvZHkoKFNwcml0ZSlfYWxpZW5zLmNoaWxkcmVuW2ldKTtcclxuICAgICAgICAgICAgLy99XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgY29sbGlzaW9uSGFuZGxlcihSZXR5cGVkLnBoYXNlci5QaGFzZXIuU3ByaXRlIGJ1bGxldCwgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZSBhbGllbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBhbGllbkJvZHkgPSAoUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBoeXNpY3MuQXJjYWRlLkJvZHkpIGFsaWVuLmJvZHk7XHJcblxyXG4gICAgICAgICAgICAvLyAgV2hlbiBhIGJ1bGxldCBoaXRzIGFuIGFsaWVuIHdlIGtpbGwgdGhlbSBib3RoXHJcbiAgICAgICAgICAgIGJ1bGxldC5raWxsKCk7XHJcbiAgICAgICAgICAgIGFsaWVuLmtpbGwoKTtcclxuXHJcbiAgICAgICAgICAgIC8vICBJbmNyZWFzZSB0aGUgc2NvcmVcclxuICAgICAgICAgICAgX3Njb3JlICs9IDIwO1xyXG4gICAgICAgICAgICBfc2NvcmVUZXh0LnRleHQgPSBfc2NvcmVTdHJpbmcgKyBfc2NvcmU7XHJcblxyXG4gICAgICAgICAgICAvLyAgQW5kIGNyZWF0ZSBhbiBleHBsb3Npb24gOilcclxuICAgICAgICAgICAgdmFyIGV4cGxvc2lvbiA9IChSZXR5cGVkLnBoYXNlci5QaGFzZXIuU3ByaXRlKSBfZXhwbG9zaW9ucy5nZXRGaXJzdEV4aXN0cyhmYWxzZSk7XHJcblxyXG4gICAgICAgICAgICBleHBsb3Npb24ucmVzZXQoYWxpZW5Cb2R5LngsIGFsaWVuQm9keS55KTtcclxuICAgICAgICAgICAgZXhwbG9zaW9uLnBsYXkoXCJrYWJvb21cIiwgMzAsIGZhbHNlLCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChfYWxpZW5zLmNvdW50TGl2aW5nKCkgPT0gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgX3Njb3JlICs9IDEwMDA7XHJcbiAgICAgICAgICAgICAgICBfc2NvcmVUZXh0LnRleHQgPSBfc2NvcmVTdHJpbmcgKyBfc2NvcmU7XHJcblxyXG4gICAgICAgICAgICAgICAgX2VuZW15QnVsbGV0cy5jYWxsQWxsKFwia2lsbFwiLCB0aGlzKTtcclxuICAgICAgICAgICAgICAgIF9zdGF0ZVRleHQudGV4dCA9IFwiIFlvdSBXb24sIFxcbiBDbGljayB0byByZXN0YXJ0XCI7XHJcbiAgICAgICAgICAgICAgICBfc3RhdGVUZXh0LnZpc2libGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vdGhlIFwiY2xpY2sgdG8gcmVzdGFydFwiIGhhbmRsZXJcclxuICAgICAgICAgICAgICAgIGdhbWUuaW5wdXQub25UYXAuYWRkT25jZSgoQWN0aW9uKSBSZXN0YXJ0LCB0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBFbmVteUhpdHNQbGF5ZXIoUmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZSBwbGF5ZXIsIFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUgYnVsbGV0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIHBsYXllckJvZHkgPSAoUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBoeXNpY3MuQXJjYWRlLkJvZHkpIHBsYXllci5ib2R5O1xyXG5cclxuICAgICAgICAgICAgYnVsbGV0LmtpbGwoKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBsaXZlID0gKFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUpIF9saXZlcy5nZXRGaXJzdEFsaXZlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAobGl2ZSAhPSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsaXZlLmtpbGwoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gIEFuZCBjcmVhdGUgYW4gZXhwbG9zaW9uIDopXHJcbiAgICAgICAgICAgIHZhciBleHBsb3Npb24gPSAoUmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZSkgX2V4cGxvc2lvbnMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpO1xyXG4gICAgICAgICAgICBleHBsb3Npb24ucmVzZXQocGxheWVyQm9keS54LCBwbGF5ZXJCb2R5LnkpO1xyXG4gICAgICAgICAgICBleHBsb3Npb24ucGxheShcImthYm9vbVwiLCAzMCwgZmFsc2UsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgLy8gV2hlbiB0aGUgcGxheWVyIGRpZXNcclxuICAgICAgICAgICAgaWYgKF9saXZlcy5jb3VudExpdmluZygpIDwgMSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLmtpbGwoKTtcclxuICAgICAgICAgICAgICAgIF9lbmVteUJ1bGxldHMuY2FsbEFsbChcImtpbGxcIiwgbnVsbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgX3N0YXRlVGV4dC50ZXh0ID0gXCIgR0FNRSBPVkVSIFxcbiBDbGljayB0byByZXN0YXJ0XCI7XHJcbiAgICAgICAgICAgICAgICBfc3RhdGVUZXh0LnZpc2libGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vdGhlIFwiY2xpY2sgdG8gcmVzdGFydFwiIGhhbmRsZXJcclxuICAgICAgICAgICAgICAgIGdhbWUuaW5wdXQub25UYXAuYWRkT25jZSgoQWN0aW9uKSBSZXN0YXJ0LCB0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIEVuZW15RmlyZXMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gIEdyYWIgdGhlIGZpcnN0IGJ1bGxldCB3ZSBjYW4gZnJvbSB0aGUgcG9vbFxyXG4gICAgICAgICAgICB2YXIgZW5lbXlCdWxsZXQgPSAoUmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZSkgX2VuZW15QnVsbGV0cy5nZXRGaXJzdEV4aXN0cyhmYWxzZSk7XHJcblxyXG4gICAgICAgICAgICBfbGl2aW5nRW5lbWllcy5sZW5ndGggPSAwO1xyXG5cclxuICAgICAgICAgICAgX2FsaWVucy5mb3JFYWNoQWxpdmUobmV3IEFjdGlvbjxSZXR5cGVkLnBoYXNlci5QaGFzZXIuU3ByaXRlPihhbGllbiA9PlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyBwdXQgZXZlcnkgbGl2aW5nIGVuZW15IGluIGFuIGFycmF5XHJcbiAgICAgICAgICAgICAgICBfbGl2aW5nRW5lbWllcy5wdXNoKGFsaWVuKTtcclxuICAgICAgICAgICAgfSksIG51bGwpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGVuZW15QnVsbGV0ICE9IG51bGwgJiYgX2xpdmluZ0VuZW1pZXMubGVuZ3RoID4gMClcclxuICAgICAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciByYW5kb20gPSBnYW1lLnJuZC5pbnRlZ2VySW5SYW5nZSgwLCBfbGl2aW5nRW5lbWllcy5sZW5ndGggLSAxKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyByYW5kb21seSBzZWxlY3Qgb25lIG9mIHRoZW1cclxuICAgICAgICAgICAgICAgIHZhciBzaG9vdGVyID0gX2xpdmluZ0VuZW1pZXNbcmFuZG9tXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBbmQgZmlyZSB0aGUgYnVsbGV0IGZyb20gdGhpcyBlbmVteVxyXG4gICAgICAgICAgICAgICAgdmFyIHNob290ZXJCb2R5ID0gKFJldHlwZWQucGhhc2VyLlBoYXNlci5QaHlzaWNzLkFyY2FkZS5Cb2R5KSBzaG9vdGVyLmJvZHk7XHJcbiAgICAgICAgICAgICAgICBlbmVteUJ1bGxldC5yZXNldChzaG9vdGVyQm9keS54LCBzaG9vdGVyQm9keS55KTtcclxuXHJcbiAgICAgICAgICAgICAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb09iamVjdChlbmVteUJ1bGxldCwgX3BsYXllciwgMTIwKTtcclxuICAgICAgICAgICAgICAgIF9maXJpbmdUaW1lciA9IGdhbWUudGltZS5ub3cgKyAyMDAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgRmlyZUJ1bGxldCgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyAgVG8gYXZvaWQgdGhlbSBiZWluZyBhbGxvd2VkIHRvIGZpcmUgdG9vIGZhc3Qgd2Ugc2V0IGEgdGltZSBsaW1pdFxyXG4gICAgICAgICAgICBpZiAoZ2FtZS50aW1lLm5vdyA+IF9idWxsZXRUaW1lKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyAgR3JhYiB0aGUgZmlyc3QgYnVsbGV0IHdlIGNhbiBmcm9tIHRoZSBwb29sXHJcbiAgICAgICAgICAgICAgICB2YXIgYnVsbGV0ID0gKFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUpIF9idWxsZXRzLmdldEZpcnN0RXhpc3RzKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKGJ1bGxldCAhPSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBidWxsZXRCb2R5ID0gKFJldHlwZWQucGhhc2VyLlBoYXNlci5QaHlzaWNzLkFyY2FkZS5Cb2R5KSBidWxsZXQuYm9keTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gIEFuZCBmaXJlIGl0XHJcbiAgICAgICAgICAgICAgICAgICAgYnVsbGV0LnJlc2V0KF9wbGF5ZXIueCwgX3BsYXllci55ICsgOCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnVsbGV0Qm9keS52ZWxvY2l0eS55ID0gLTQwMDtcclxuICAgICAgICAgICAgICAgICAgICBfYnVsbGV0VGltZSA9IGdhbWUudGltZS5ub3cgKyAyMDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgUmVzZXRCdWxsZXQoUmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZSBidWxsZXQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyAgQ2FsbGVkIGlmIHRoZSBidWxsZXQgZ29lcyBvdXQgb2YgdGhlIHNjcmVlblxyXG4gICAgICAgICAgICBidWxsZXQua2lsbCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFJlc3RhcnQoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gIEEgbmV3IGxldmVsIHN0YXJ0c1xyXG5cclxuICAgICAgICAgICAgLy9yZXNldHMgdGhlIGxpZmUgY291bnRcclxuICAgICAgICAgICAgX2xpdmVzLmNhbGxBbGwoXCJyZXZpdmVcIiwgbnVsbCk7XHJcblxyXG4gICAgICAgICAgICAvLyBBbmQgYnJpbmdzIHRoZSBhbGllbnMgYmFjayBmcm9tIHRoZSBkZWFkIDopXHJcbiAgICAgICAgICAgIF9hbGllbnMucmVtb3ZlQWxsKCk7XHJcblxyXG4gICAgICAgICAgICBDcmVhdGVBbGllbnMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vcmV2aXZlcyB0aGUgcGxheWVyXHJcbiAgICAgICAgICAgIF9wbGF5ZXIucmV2aXZlKCk7XHJcblxyXG4gICAgICAgICAgICAvL2hpZGVzIHRoZSB0ZXh0XHJcbiAgICAgICAgICAgIF9zdGF0ZVRleHQudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgUmV0eXBlZDtcclxuXHJcbm5hbWVzcGFjZSBQaGFzZXJEZW1vLkdhbWVzXHJcbntcclxuICAgIC8vLyA8c3VtbWFyeT5cclxuICAgIC8vLyBPcmlnaW5hbCBEZW1vIGlzIGF2YWlsYWJsZSBoZXJlOiBodHRwczovL3BoYXNlci5pby9leGFtcGxlcy92Mi9wMi1waHlzaWNzL2FjY2VsZXJhdGUtdG8tb2JqZWN0XHJcbiAgICAvLy8gPC9zdW1tYXJ5PlxyXG4gICAgcHVibGljIGNsYXNzIEdhbWVTdGF0ZTIgOiBBYnN0cmFjdEdhbWVTdGF0ZVxyXG4gICAge1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkdyb3VwIF9idWxsZXRzO1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkN1cnNvcktleXMgX2N1cnNvcnM7XHJcbiAgICAgICAgcHJpdmF0ZSBSZXR5cGVkLnBoYXNlci5QaGFzZXIuU3ByaXRlIF9zaGlwO1xyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBQcmVsb2FkKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5jcm9zc09yaWdpbiA9IHRydWU7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5pbWFnZShcImNhclwiLCBcImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9waG90b25zdG9ybS9waGFzZXItZXhhbXBsZXMvbWFzdGVyL2V4YW1wbGVzL2Fzc2V0cy9zcHJpdGVzL2Nhci5wbmdcIik7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5pbWFnZShcInRpbnljYXJcIiwgXCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vcGhvdG9uc3Rvcm0vcGhhc2VyLWV4YW1wbGVzL21hc3Rlci9leGFtcGxlcy9hc3NldHMvc3ByaXRlcy90aW55Y2FyLnBuZ1wiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIENyZWF0ZSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBoeXNpY3MuUDJKUyk7XHJcblxyXG4gICAgICAgICAgICBfYnVsbGV0cyA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEwOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhciBidWxsZXQgPSBfYnVsbGV0cy5jcmVhdGUoZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoMjAwLCAxNzAwKSwgZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoLTIwMCwgNDAwKSwgXCJ0aW55Y2FyXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoYnVsbGV0LCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIF9jdXJzb3JzID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XHJcbiAgICAgICAgICAgIF9zaGlwID0gZ2FtZS5hZGQuc3ByaXRlKDMyLCBnYW1lLndvcmxkLmhlaWdodCAtIDE1MCwgXCJjYXJcIik7XHJcblxyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKF9zaGlwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIFVwZGF0ZSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgc2hpcEJvZHkgPSAoUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBoeXNpY3MuUDIuQm9keSkgX3NoaXAuYm9keTtcclxuXHJcbiAgICAgICAgICAgIF9idWxsZXRzLmZvckVhY2hBbGl2ZSgoQWN0aW9uPFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGU+KSBNb3ZlQnVsbGV0cywgdGhpcyk7IC8vbWFrZSBidWxsZXRzIGFjY2VsZXJhdGUgdG8gc2hpcFxyXG5cclxuICAgICAgICAgICAgaWYgKF9jdXJzb3JzLmxlZnQuaXNEb3duKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzaGlwQm9keS5yb3RhdGVMZWZ0KDEwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoX2N1cnNvcnMucmlnaHQuaXNEb3duKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzaGlwQm9keS5yb3RhdGVSaWdodCgxMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc2hpcEJvZHkuc2V0WmVyb1JvdGF0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChfY3Vyc29ycy51cC5pc0Rvd24pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNoaXBCb2R5LnRocnVzdCg0MDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKF9jdXJzb3JzLmRvd24uaXNEb3duKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzaGlwQm9keS5yZXZlcnNlKDQwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBNb3ZlQnVsbGV0cyhSZXR5cGVkLnBoYXNlci5QaGFzZXIuU3ByaXRlIGJ1bGxldClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIEFjY2VsZXJhdGVUb09iamVjdChidWxsZXQsIF9zaGlwLCAzMCk7IC8vc3RhcnQgYWNjZWxlcmF0ZVRvT2JqZWN0IG9uIGV2ZXJ5IGJ1bGxldFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIEFjY2VsZXJhdGVUb09iamVjdChSZXR5cGVkLnBoYXNlci5QaGFzZXIuU3ByaXRlIG9iajEsIFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUgb2JqMiwgZG91YmxlIHNwZWVkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGRvdWJsZS5Jc05hTihzcGVlZCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNwZWVkID0gNjA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBvYmoxQm9keSA9IChSZXR5cGVkLnBoYXNlci5QaGFzZXIuUGh5c2ljcy5QMi5Cb2R5KSBvYmoxLmJvZHk7XHJcblxyXG4gICAgICAgICAgICB2YXIgYW5nbGUgPSBlczUuTWF0aC5hdGFuMihvYmoyLnkgLSBvYmoxLnksIG9iajIueCAtIG9iajEueCk7XHJcblxyXG4gICAgICAgICAgICBvYmoxQm9keS5yb3RhdGlvbiA9IGFuZ2xlICsgZXM1Lk1hdGguUEkgLyAyOyAvLyBjb3JyZWN0IGFuZ2xlIG9mIGFuZ3J5IGJ1bGxldHMgKGRlcGVuZHMgb24gdGhlIHNwcml0ZSB1c2VkKVxyXG4gICAgICAgICAgICBvYmoxQm9keS5mb3JjZS54ID0gZXM1Lk1hdGguY29zKGFuZ2xlKSAqIHNwZWVkOyAvLyBhY2NlbGVyYXRlVG9PYmplY3QgXHJcbiAgICAgICAgICAgIG9iajFCb2R5LmZvcmNlLnkgPSBlczUuTWF0aC5zaW4oYW5nbGUpICogc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiXHJcbm5hbWVzcGFjZSBQaGFzZXJEZW1vLkdhbWVzXHJcbntcclxuICAgIC8vLyA8c3VtbWFyeT5cclxuICAgIC8vLyBPcmlnaW5hbCBEZW1vIGlzIGF2YWlsYWJsZSBoZXJlOiBodHRwczovL3BoYXNlci5pby9leGFtcGxlcy92Mi9iYXNpY3MvMDMtbW92ZS1hbi1pbWFnZVxyXG4gICAgLy8vIDwvc3VtbWFyeT5cclxuICAgIHB1YmxpYyBjbGFzcyBHYW1lU3RhdGUzIDogQWJzdHJhY3RHYW1lU3RhdGVcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBQcmVsb2FkKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5jcm9zc09yaWdpbiA9IHRydWU7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5pbWFnZShcImVpbnN0ZWluXCIsIFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3Bob3RvbnN0b3JtL3BoYXNlci1leGFtcGxlcy9tYXN0ZXIvZXhhbXBsZXMvYXNzZXRzL3BpY3MvcmFfZWluc3RlaW4ucG5nXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgQ3JlYXRlKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vICBUaGlzIGNyZWF0ZXMgYSBzaW1wbGUgc3ByaXRlIHRoYXQgaXMgdXNpbmcgb3VyIGxvYWRlZCBpbWFnZSBhbmRcclxuICAgICAgICAgICAgLy8gIGRpc3BsYXlzIGl0IG9uLXNjcmVlblxyXG4gICAgICAgICAgICAvLyAgYW5kIGFzc2lnbiBpdCB0byBhIHZhcmlhYmxlXHJcbiAgICAgICAgICAgIHZhciBpbWFnZSA9IGdhbWUuYWRkLnNwcml0ZSgwLCAwLCBcImVpbnN0ZWluXCIpO1xyXG5cclxuICAgICAgICAgICAgZ2FtZS5waHlzaWNzLmVuYWJsZShpbWFnZSwgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBpbWFnZUJvZHkgPSAoUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBoeXNpY3MuQXJjYWRlLkJvZHkpaW1hZ2UuYm9keTtcclxuICAgICAgICAgICAgaW1hZ2VCb2R5LnZlbG9jaXR5LnggPSAxNTA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIEJyaWRnZTtcclxudXNpbmcgUmV0eXBlZDtcclxudXNpbmcgU3lzdGVtO1xyXG51c2luZyBNYXRoID0gU3lzdGVtLk1hdGg7XHJcblxyXG5uYW1lc3BhY2UgUGhhc2VyRGVtby5HYW1lc1xyXG57XHJcbiAgICBjbGFzcyBHYW1lU3RhdGU0IDogQWJzdHJhY3RHYW1lU3RhdGVcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUgc2hpcDtcclxuICAgICAgICBwcml2YXRlIFJldHlwZWQucGhhc2VyLlBoYXNlci5SZWN0YW5nbGUgdmlldztcclxuICAgICAgICBwcml2YXRlIFJldHlwZWQucGhhc2VyLlBoYXNlci5UaWxlU3ByaXRlIHNwYWNlO1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlRleHQgZGVidWdUZXh0O1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLktleWJvYXJkIGtleWJvYXJkO1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkN1cnNvcktleXMgY3Vyc29ycztcclxuICAgICAgICBwcml2YXRlIGludCBtb3RvcjtcclxuICAgICAgICBwcml2YXRlIGludCBsYXN0U2V0TW90b3I7XHJcbiAgICAgICAgcHJpdmF0ZSBkb3VibGUgbGFzdE1vdG9yUm90YXRpb247XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIENyZWF0ZSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB3b3JsZCA9IGdhbWUud29ybGQ7XHJcbiAgICAgICAgICAgIHZpZXcgPSBnYW1lLmNhbWVyYS52aWV3O1xyXG4gICAgICAgICAgICBzcGFjZSA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgdmlldy53aWR0aCwgdmlldy5oZWlnaHQsIFwic3BhY2VcIik7XHJcbiAgICAgICAgICAgIHNwYWNlLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgc2hpcCA9IGdhbWUuYWRkLnNwcml0ZSh3b3JsZC5jZW50ZXJYLCB3b3JsZC5jZW50ZXJZLCBcInNoaXBcIik7XHJcbiAgICAgICAgICAgIHNoaXAuYW5jaG9yLnNldCgwLjUpO1xyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MuZW5hYmxlKHNoaXAsIFJldHlwZWQucGhhc2VyLlBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcbiAgICAgICAgICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ID0gMzcxO1xyXG5cclxuICAgICAgICAgICAgdmFyIHNoaXBCb2R5ID0gKFJldHlwZWQucGhhc2VyLlBoYXNlci5QaHlzaWNzLkFyY2FkZS5Cb2R5KXNoaXAuYm9keTtcclxuICAgICAgICAgICAgc2hpcEJvZHkuYW5ndWxhckRyYWcgPSAxMDA7XHJcbiAgICAgICAgICAgIHNoaXBCb2R5LmJvdW5jZS5zZXRUbygxKTtcclxuICAgICAgICAgICAgLy9zaGlwQm9keS5kcmFnLnNldCgxMCk7XHJcbiAgICAgICAgICAgIHNoaXBCb2R5LmZyaWN0aW9uLnNldFRvKDApO1xyXG4gICAgICAgICAgICBzaGlwQm9keS5tYXhWZWxvY2l0eS5zZXQoMTAwKTtcclxuXHJcbiAgICAgICAgICAgIGRlYnVnVGV4dCA9IGdhbWUuYWRkLnRleHQoMTAsIDEwLCBcIlwiICwgbmV3IHsgZm9udCA9IFwiMzRweCBBcmlhbFwiLCBmaWxsID0gXCIjZmZmXCIgfSk7XHJcblxyXG4gICAgICAgICAgICBtb3RvciA9IDMwMDtcclxuXHJcbiAgICAgICAgICAgIGtleWJvYXJkID0gZ2FtZS5pbnB1dC5rZXlib2FyZDtcclxuICAgICAgICAgICAgY3Vyc29ycyA9IGtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIEluaXQoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgYmFzZS5Jbml0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBQcmVsb2FkKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5wYXRoID0gXCJodHRwczovL3NhbW1lLmdpdGh1Yi5pby9waGFzZXItcGx1Z2luLWRlYnVnLWFyY2FkZS1waHlzaWNzL2V4YW1wbGUvYXNzZXRzL1wiO1xyXG4gICAgICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoXCJzcGFjZVwiLCBcImRlZXAtc3BhY2UuanBnXCIpO1xyXG4gICAgICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoXCJhc3Rlcm9pZDFcIiwgXCJhc3Rlcm9pZDEucG5nXCIpO1xyXG4gICAgICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoXCJhc3Rlcm9pZDJcIiwgXCJhc3Rlcm9pZDIucG5nXCIpO1xyXG4gICAgICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoXCJhc3Rlcm9pZDNcIiwgXCJhc3Rlcm9pZDMucG5nXCIpO1xyXG4gICAgICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoXCJidWxsZXRcIiwgXCJidWxsZXRzLnBuZ1wiKTtcclxuICAgICAgICAgICAgZ2FtZS5sb2FkLmltYWdlKFwic2hpcFwiLCBcInNoaXAucG5nXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgUmVuZGVyKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGJhc2UuUmVuZGVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBTaHV0ZG93bigpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBiYXNlLlNodXRkb3duKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBVcGRhdGUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBoeXNpY3MuQXJjYWRlIGFyY2FkZSA9IGdhbWUucGh5c2ljcy5hcmNhZGU7XHJcbiAgICAgICAgICAgIFJldHlwZWQucGhhc2VyLlBoYXNlci5QaHlzaWNzLkFyY2FkZS5Cb2R5IGJvZHkgPSAoUmV0eXBlZC5waGFzZXIuUGhhc2VyLlBoeXNpY3MuQXJjYWRlLkJvZHkpc2hpcC5ib2R5O1xyXG5cclxuICAgICAgICAgICAgaWYgKGN1cnNvcnMubGVmdC5pc0Rvd24pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChib2R5LnJvdGF0aW9uID49IC0xKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJvZHkucm90YXRpb24gPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJvZHkucm90YXRpb24gKz0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChjdXJzb3JzLnJpZ2h0LmlzRG93bilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGJvZHkucm90YXRpb24gPD0gLTE3OSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBib2R5LnJvdGF0aW9uID0gLTE4MDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBib2R5LnJvdGF0aW9uIC09IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJzb3JzLnVwLmlzRG93bilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbW90b3IrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChjdXJzb3JzLmRvd24uaXNEb3duKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtb3Rvci0tO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobW90b3IgPiA0MDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1vdG9yID0gNDAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG1vdG9yIDwgMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbW90b3IgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgobW90b3IgLzEwMCkqMTAwICE9IGxhc3RTZXRNb3RvciB8fCBsYXN0TW90b3JSb3RhdGlvbiAhPSBzaGlwLnJvdGF0aW9uKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsYXN0U2V0TW90b3IgPSAobW90b3IgLyAxMDApICogMTAwO1xyXG4gICAgICAgICAgICAgICAgbGFzdE1vdG9yUm90YXRpb24gPSBzaGlwLnJvdGF0aW9uO1xyXG4gICAgICAgICAgICAgICAgYXJjYWRlLmFjY2VsZXJhdGlvbkZyb21Sb3RhdGlvbihzaGlwLnJvdGF0aW9uLCBsYXN0U2V0TW90b3IsIGJvZHkuYWNjZWxlcmF0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgIC8vZWxzZVxyXG4gICAgICAgICAgICAvL3tcclxuICAgICAgICAgICAgLy8gICAgYm9keS5hbmd1bGFyQWNjZWxlcmF0aW9uID0gMDtcclxuICAgICAgICAgICAgLy99XHJcbiAgICAgICAgICAgIGRlYnVnVGV4dC50ZXh0ID0gYm9keS5yb3RhdGlvbi5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICBTY3JlZW5XcmFwKHNoaXApO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBTY3JlZW5XcmFwKFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUgc3ByaXRlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHNwcml0ZS54IDwgMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3ByaXRlLnggPSBnYW1lLndpZHRoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHNwcml0ZS54ID4gZ2FtZS53aWR0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3ByaXRlLnggPSAwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoc3ByaXRlLnkgPCAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzcHJpdGUueSA9IGdhbWUuaGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHNwcml0ZS55ID4gZ2FtZS5oZWlnaHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNwcml0ZS55ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXQp9Cg==

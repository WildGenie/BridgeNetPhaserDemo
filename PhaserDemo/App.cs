using System;
using PhaserDemo.Games;
using Retyped;
using static Retyped.phaser;
using static Retyped.phaser.Phaser;

namespace PhaserDemo
{
    public class App
    {
        private static Game _game;
        private static bool _isRun;

        public static void Main()
        {
            // Init Event handlers:
            InitEventHandlers();

            // Run Game1 on start:
            SwitchGameTo(4);
        }

        private static void InitEventHandlers()
        {
            // Init event handler for buttons switching scenes
            var btns = new[]
            {
                dom.document.getElementById("sample1Btn"),
                dom.document.getElementById("sample2Btn"),
                dom.document.getElementById("sample3Btn"),
                dom.document.getElementById("sample4Btn")

            };

            for (var i = 0; i < btns.Length; i++)
            {
                var index = i;
                
                btns[i].onclick = e =>
                {
                    SwitchGameTo(index + 1);
                };
            }
        }

        public static void SwitchGameTo(int number)
        {
            if (_isRun)
            {
                _game.destroy();
                _game = null;
                _isRun = false;
            }

            _game = RunGame(number);
            _isRun = true;
        }

        public static Game RunGame(int number)
        {
            switch (number)
            {
                case 1:
                    var state1 = new GameState1();

                    return new Game(800, 600, Phaser.AUTO, "phaserRoot", state1);
                    
                case 2:
                    var state2 = new GameState2();

                    return new Game(800, 600, Phaser.AUTO, "phaserRoot", state2);

                case 3:
                    var state3 = new GameState3();

                    return new Game(800, 600, Phaser.AUTO, "phaserRoot", state3);
                case 4:
                    var state4 = new GameState4();
                    return new Game(700, 300, Phaser.CANVAS, "phaserRoot", state4);
            default:
                    throw new ArgumentOutOfRangeException(nameof(number));
            }
        }
    }
}
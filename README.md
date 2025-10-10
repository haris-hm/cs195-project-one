# SnakeSweeper

_SnakeSweeper_ is a combination of two classic games: Snake and Minesweeper. The player controls a snake using either WASD, the arrow keys, or buttons on the page (if on mobile), navigating around a board whose size depends on the difficulty the player chose on the landing page. The main goal is to collect all the apples that are hidden on the board.

At the start of the game, the location of one of these apples is flagged for the player. Once the player's snake collects that apple, more of the board is revealed and it's up to the player to deduce which tiles contain apples, flag them, and eat them. If the player crashes their snake into itself, or if the player flags and tries to collect an incorrect tile, they lose. Once they collect all the hidden apples on the board, they win!

You can play SnakeSweeper [here](https://cs195.harismehuljic.com/). Have fun!

## New Concepts Learned

I ended up inadvertently learning two concepts. I had planned to implement audio into my game from the start, but I also ended up learning how to use local storage when implementing the difficulty system. Both were relatively simple to implement. Audio is implemented in [utils.js](static/js/utils.js), where I just pick a random sound file from my sounds folder, create a new Audio HTML element, and immediately play the sound through it.

As for local storage, I needed to use it when the player clicks the start game button on the home page. Since the game and the home page are two different HTML pages, I needed a way to pass the user's selected difficulty from the home page to the game. Thus, I ended up storing a "selectedDifficulty" variable in local storage and retrieving it when the game page is constructing the board, as the difficulty defines the dimensions of the game board.

## Challenges

The most challenging part of this project was definitely the tile reveal algorithm in [board.js](static/js/board.js), which reveals tiles and calculates the amount of tiles surrounding that tile which contain an apple. The algorithm ended up being quite simple, although it definitely could me more efficient, as the game sometimes lags whenever there is a large amount of tiles to reveal after collecting an apple.

The other challenge was figuring out how to make the game work on mobile. I ended up landing on just having hidden buttons in the game page which only show up on mobile and allow the player to emulate using the arrow/WASD keys. Despite that, there wasn't really any way I could think of to make the tiles on the hard ($24\times 24$) board easier to click on mobile screens.

## AI Reflection

The only AI tool I used was occasionally letting Copilot autocomplete some tedious tasks. For instance, in [game.js](static/js/game.js), I let it autocomplete the cases for the mobile and keyboard controls. The autocomplete feature is great for tedious and repetitive tasks like these. Where that feature doesn't shine is for more complex tasks, where I end up actually fighting it more than it helps me, so I usually snooze it whenever I am doing something more complex like the tile reveal algorithm.

## Attributions

- Most sound effects obtained from [8 Bit Sound SFX Pack by Maskedsound](https://maskedsound.itch.io/8-bit-sfx-pack)

import {
  Direction,
  WinState,
  playRandomSoundEffect,
  ADJACENT_TILE_COORDINATES,
} from "./utils.js";
import { Snake } from "./snake.js";

/**
 * Class representing a single tile on the game board.
 */
class BoardTile {
  /**
   * Constructs a new BoardTile instance.
   *
   * @param {HTMLElement} element The div element representing this tile
   * @param {number} positionX The x position of this tile in the board grid
   * @param {number} positionY The y position of this tile in the board grid
   * @param {boolean} hasApple Whether this tile contains an apple
   */
  constructor(element, positionX, positionY, hasApple = false) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.element = element;

    this.hasApple = hasApple;
    this.flagged = false;

    this.surroundingApples = null;
  }

  /**
   * Removes the apple from this tile and updates its state.
   */
  removeApple() {
    this.hasApple = false;
  }

  /**
   * Places the snake segment on this tile and updates its state.
   */
  placeSnake() {
    this.element.classList.add("snake-body");

    this.element.classList.remove("flagged-apple", "revealed-tile");
    this.element.textContent = "";
  }

  /**
   * Removes the snake segment from this tile and updates its state.
   */
  removeSnake() {
    this.element.classList.remove("snake-body");

    if (this.flagged) {
      this.element.classList.add("flagged-apple");
    }

    if (this.revealed) {
      this.element.classList.add("revealed-tile");
      this.element.textContent =
        this.surroundingApples > 0 ? String(this.surroundingApples) : "";
    }
  }

  /**
   * Places a flag on this tile and updates its state.
   */
  placeFlag() {
    this.element.classList.add("flagged-apple");
    this.element.classList.remove("debug-apple");
    this.flagged = true;
  }

  /**
   * Removes the flag from this tile and updates its state.
   */
  removeFlag() {
    this.element.classList.remove("flagged-apple");
    this.flagged = false;
  }

  /**
   * Sets the number of surrounding apples and reveals this tile.
   * @param {number} count The amount of tiles surrounding this tile that contain apples
   */
  setSurroundingApples(count) {
    this.surroundingApples = count;
    this.revealed = true;
    this.element.classList.add("revealed-tile");
    this.element.textContent = count > 0 ? String(count) : "";
  }

  /**
   * Generates a unique key for this tile based on its position on the board.
   * @returns {string} A unique key representing this tile's position on the board
   */
  getUniqueKey() {
    return `${this.positionX},${this.positionY}`;
  }
}

/**
 * Finds an apple tile that has the fewest surrounding apples, usually an "orphaned" apple.
 *
 * @param {BoardTile[]} appleTiles The tiles in the current board that have apples
 * @param {BoardTile[][]} allTiles A 2D array of all the tiles in the current board
 * @returns {BoardTile} A random apple tile with the fewest surrounding apples
 */
function findOrphanedApple(appleTiles, allTiles) {
  let bestApples = [];
  let bestAppleScore = Infinity;

  appleTiles.forEach((appleTile) => {
    const appleX = appleTile.positionX;
    const appleY = appleTile.positionY;

    let surroundingAppleCount = 0;

    for (const coord of ADJACENT_TILE_COORDINATES) {
      const checkX = appleX + coord[0];
      const checkY = appleY + coord[1];

      if (checkX < 0 || checkY < 0) {
        continue;
      } else if (checkY >= allTiles.length || checkX >= allTiles[0].length) {
        continue;
      }

      const checkTile = allTiles[checkY][checkX];
      if (checkTile.hasApple) {
        surroundingAppleCount += 1;
      }
    }

    if (surroundingAppleCount < bestAppleScore) {
      bestApples = [appleTile];
      bestAppleScore = surroundingAppleCount;
    } else if (surroundingAppleCount === bestAppleScore) {
      bestApples.push(appleTile);
    }
  });

  const randomIndex = Math.floor(Math.random() * bestApples.length);
  return bestApples[randomIndex];
}

/**
 * Class representing the game board, including tiles, snake, and game state.
 */
export class Board {
  /**
   * Creates a new game board with the specified number of rows and columns.
   *
   * @param {number} rows Number of rows in the board
   * @param {number} columns Number of columns in the board
   */
  constructor(size) {
    const { tiles, startingApple, appleCount } = this.buildBoardElements(size);

    this.boardTiles = tiles;
    this.flaggedTiles = new Map();
    this.revealedTiles = new Set();
    this.currentDirection = Direction.RIGHT;

    this.startingAppleCount = appleCount;
    this.currentAppleCount = appleCount;
    this.score = 0;

    this.winState = WinState.ONGOING;
    this.inputLocked = false;

    const headPosition = Math.ceil(size / 2);
    const startingSnakeLength = Math.max(3, Math.floor(size / 4));

    this.snake = new Snake(
      headPosition,
      headPosition,
      size,
      startingSnakeLength
    );

    document.getElementById("apple-count").textContent = String(
      this.currentAppleCount
    );

    this.placeFlag(startingApple);
    this.renderSnake();
    this.renderFlags();
  }

  /**
   * Defines all the board elements in the DOM and initializes the board state.
   *
   * @param {number} size The number of rows and columns in the board
   * @returns {{tiles: BoardTile[][], startingApple: BoardTile, appleCount: number}} An object containing the board initialization data
   * @returns {BoardTile[][]} tiles: A 2D array of all the tiles in the current board
   * @returns {BoardTile} startingApple: The apple tile that should be flagged at game start
   * @returns {number} appleCount: The total number of apples placed on the board
   */
  buildBoardElements(size) {
    const boardContainer = document.getElementById("board");

    const tiles = [];
    const appleTiles = [];

    const baseChance = 0.125;
    const scaleFactor = 0.001;
    const chanceAdjustment = scaleFactor * size * 2;
    const appleChance = Math.min(baseChance + chanceAdjustment, 0.25);

    const sizeClass = size <= 15 ? "large" : size <= 16 ? "medium" : "small";

    let appleCount = 0;

    for (let y = 0; y < size; y++) {
      const rowElement = document.createElement("div");
      rowElement.className = "board-row";
      rowElement.dataset.posY = y;
      boardContainer.appendChild(rowElement);

      for (let x = 0; x < size; x++) {
        const tileElement = document.createElement("div");

        tileElement.classList.add("board-tile", sizeClass);
        tileElement.dataset.posX = x;
        rowElement.appendChild(tileElement);

        if (tiles[y] === undefined) {
          tiles[y] = [];
        }

        const hasApple = Math.random() < appleChance;
        const boardTile = new BoardTile(tileElement, x, y, hasApple);

        if (hasApple) {
          appleCount += 1;
          appleTiles.push(boardTile);
        }

        tiles[y].push(boardTile);

        tileElement.addEventListener("click", () => {
          if (this.winState !== WinState.ONGOING) {
            return;
          }

          if (
            this.snake.isOccupyingTile(
              boardTile.positionX,
              boardTile.positionY
            ) ||
            boardTile.revealed
          ) {
            return;
          }

          if (boardTile.flagged) {
            this.removeFlag(boardTile, true);
          } else {
            this.placeFlag(boardTile, true);
          }
        });
      }
    }

    const startingApple = findOrphanedApple(appleTiles, tiles);
    startingApple.placeFlag();

    return {
      tiles: tiles,
      startingApple: startingApple,
      appleCount: appleCount,
    };
  }

  /**
   * Helper function for flood reveal algorithm.
   * Counts the number of surrounding apples and identifies new tiles to visit.
   *
   * @param {BoardTile} tile The current tile whose surrounding tiles are being checked
   * @param {Set} visited The set of all tiles which have already been visited
   * @returns {{surroundingApples: number, newQueue: BoardTile[]}} An object containing the count of surrounding apples and a list of new tiles to visit
   * @returns {number} surroundingApples: The number of surrounding tiles that contain apples
   * @returns {BoardTile[]} newQueue: A list of new tiles to visit that do not contain apples and have not been visited yet
   */
  getAppleCounts(tile, visited) {
    const tileX = tile.positionX;
    const tileY = tile.positionY;

    let surroundingApples = 0;
    let newQueue = [];

    for (const coord of ADJACENT_TILE_COORDINATES) {
      const checkX = tileX + coord[0];
      const checkY = tileY + coord[1];

      if (checkX < 0 || checkY < 0) {
        continue;
      }

      if (
        checkY >= this.boardTiles.length ||
        checkX >= this.boardTiles[0].length
      ) {
        continue;
      }

      const checkTile = this.boardTiles[checkY][checkX];
      const checkKey = checkTile.getUniqueKey();

      if (checkTile.hasApple) {
        surroundingApples++;
      } else {
        this.removeFlag(checkTile);
      }

      if (!visited.has(checkKey) && !checkTile.hasApple) {
        newQueue.push(checkTile);
      }
    }

    return { surroundingApples, newQueue };
  }

  /**
   * Flood reveal algorithm to reveal tiles starting from the given apple tile.
   * @param {BoardTile} appleTile The tile from which to start the flood reveal
   */
  startFloodReveal(appleTile) {
    const queue = [];
    const visited = new Set();
    const newlyRevealed = new Set();

    queue.push(appleTile);
    visited.add(appleTile.getUniqueKey());

    while (queue.length > 0) {
      const currentTile = queue.shift();
      const currentKey = currentTile.getUniqueKey();
      visited.add(currentKey);

      const { surroundingApples, newQueue } = this.getAppleCounts(
        currentTile,
        visited
      );

      currentTile.setSurroundingApples(surroundingApples);
      if (
        (surroundingApples === 0 && !this.revealedTiles.has(currentKey)) ||
        visited.size === 1
      ) {
        queue.push(...newQueue);
        newlyRevealed.add(currentKey);
      }
    }

    this.revealedTiles = new Set([...this.revealedTiles, ...newlyRevealed]);
  }

  /**
   * Attempts to collect the apple on the specified tile.
   * Updates the game state accordingly.
   * @param {BoardTile} tile The tile that the snake is attempting to eat
   * @returns {boolean} Whether the attempt was successful
   */
  eatApple(tile) {
    if (!tile.hasApple) {
      this.winState = WinState.LOST_FLAG_MISMATCH;
      return false;
    }

    tile.removeApple();
    this.currentAppleCount--;
    this.score++;

    if (this.score % 5 === 0) {
      playRandomSoundEffect("score-indicator", 2);
    } else {
      playRandomSoundEffect("eat", 6);
    }

    document.getElementById("apple-count").textContent = String(
      this.currentAppleCount
    );
    document.getElementById("score").textContent = String(this.score);

    this.removeFlag(tile);
    this.startFloodReveal(tile);
    this.growSnake();

    if (this.currentAppleCount === 0) {
      this.winState = WinState.WIN_ALL_APPLES;
    }

    return true;
  }

  /**
   * Checks for collisions between the snake and flagged tiles or itself.
   * Updates the game state accordingly.
   */
  checkSnakeCollision() {
    const head = this.snake.getHead();
    const headX = head.positionX;
    const headY = head.positionY;
    const headTile = this.boardTiles[headY][headX];

    const intersectingFlaggedTile = this.flaggedTiles.get(
      headTile.getUniqueKey()
    );

    if (intersectingFlaggedTile) {
      const ateApple = this.eatApple(headTile);
      if (!ateApple) {
        return;
      }
    }

    const crossedSnake = this.snake.isSnakeCrossed();

    if (crossedSnake) {
      this.winState = WinState.LOST_SELF_COLLISION;
    }
  }

  /**
   * Renders the snake on the board by updating the relevant tiles.
   */
  renderSnake() {
    for (const snakeSegment of this.snake.getSegments()) {
      const y = snakeSegment.positionY;
      const x = snakeSegment.positionX;

      const tileElement = this.boardTiles[y][x];

      tileElement.placeSnake();
    }
  }

  /**
   * Renders all flagged tiles on the board.
   */
  renderFlags() {
    for (const key of this.flaggedTiles.keys()) {
      const flagTile = this.flaggedTiles.get(key);
      flagTile.placeFlag();
    }
  }

  /**
   * Places a flag on the specified tile and rerenders all flags.
   * @param {BoardTile} tile The tile on which to place the flag
   * @param {boolean} userClicked Whether the flag placement was initiated by a user click
   */
  placeFlag(tile, userClicked = true) {
    if (userClicked) playRandomSoundEffect("flag", 5, 0.05);
    tile.placeFlag();
    this.flaggedTiles.set(tile.getUniqueKey(), tile);
    this.renderFlags();
  }

  /**
   * Removes a flag from the specified tile and rerenders all flags.
   * @param {BoardTile} tile The tile from which to remove the flag
   * @param {boolean} userClicked Whether the flag removal was initiated by a user click
   */
  removeFlag(tile, userClicked = false) {
    if (userClicked) playRandomSoundEffect("flag", 5, 0.05);
    tile.removeFlag();
    this.flaggedTiles.delete(tile.getUniqueKey());
    this.renderFlags();
  }

  /**
   * Sets the new direction for the snake if it is a valid change.
   * @param {Direction} newDirection The new direction to set for the snake
   */
  changeDirection(newDirection) {
    if (this.inputLocked) return;
    if (
      newDirection !== this.currentDirection.getOpposite() &&
      newDirection !== this.currentDirection
    ) {
      this.currentDirection = newDirection;
      this.inputLocked = true;
    }
  }

  /**
   * Increases the length of the snake by one segment.
   */
  growSnake() {
    this.snake.grow();
  }

  /**
   * Updates the snake's position on the board, checks for collisions, and rerenders the snake.
   */
  updateSnake() {
    const oldTail = this.snake.move(this.currentDirection);

    const tailY = oldTail.positionY;
    const tailX = oldTail.positionX;

    this.checkSnakeCollision();

    if (this.winState !== WinState.ONGOING) {
      return;
    }

    const tailTileElement = this.boardTiles[tailY][tailX];
    tailTileElement.removeSnake();

    this.renderSnake();
  }

  /**
   * Retrieves the current game state including win state, score, and remaining apples.
   * @returns {{winState: WinState, score: number, totalApples: number}} The current game state including win state, score, and remaining apples
   * @returns {WinState} winState: The current win state of the game
   * @returns {number} score: The current score of the player
   * @returns {number} totalApples: The number of apples remaining on the board
   */
  getCurrentGameState() {
    return {
      winState: this.winState,
      score: this.score,
      totalApples: this.startingAppleCount,
    };
  }

  /**
   * Ticks the game state forward by one step.
   * @returns {WinState} The current win state of the game after the tick
   */
  tick() {
    this.updateSnake();
    this.inputLocked = false;
    return this.getCurrentGameState();
  }
}

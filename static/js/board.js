import { Direction, RELATIVE_COORDS_SURROUNDING_TILE } from "./utils.js";
import { Snake } from "./snake.js";

class BoardTile {
  constructor(element, positionX, positionY, hasApple = false) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.element = element;

    this.hasApple = hasApple;
    this.flagged = false;

    this.surroundingApples = null;

    // TODO: Remove this debug class
    // if (this.hasApple) {
    //   this.element.classList.add("debug-apple");
    // }
  }

  removeApple() {
    this.hasApple = false;
    // this.element.classList.remove("debug-apple");
  }

  placeSnake() {
    this.element.classList.add("snake-body");

    this.element.classList.remove(
      "flagged-apple",
      "debug-apple",
      "revealed-tile"
    );
    this.element.textContent = "";
  }

  removeSnake() {
    this.element.classList.remove("snake-body");

    if (this.hasApple) {
      // this.element.classList.add("debug-apple");
    }
    if (this.flagged) {
      this.element.classList.add("flagged-apple");
    }

    if (this.surroundingApples === 0) {
      this.element.classList.add("revealed-tile");
    } else if (this.surroundingApples > 0) {
      this.element.textContent = String(this.surroundingApples);
    } else {
      this.element.textContent = "";
    }
  }

  placeFlag() {
    this.element.classList.add("flagged-apple");
    this.element.classList.remove("debug-apple");
    this.flagged = true;
  }

  removeFlag() {
    this.element.classList.remove("flagged-apple");
    if (this.hasApple) {
      // this.element.classList.add("debug-apple");
    }
    this.flagged = false;
  }

  setSurroundingApples(count) {
    this.surroundingApples = count;
    this.revealed = true;

    if (count > 0) {
      this.element.textContent = String(count);
    } else if (count === 0) {
      this.element.classList.add("revealed-tile");
      this.element.textContent = "";
    }
  }

  getUniqueKey() {
    return `${this.positionX},${this.positionY}`;
  }
}

function findOrphanedApple(appleTiles, allTiles) {
  let bestApples = [];
  let bestAppleScore = Infinity;

  appleTiles.forEach((appleTile) => {
    const appleX = appleTile.positionX;
    const appleY = appleTile.positionY;

    let surroundingAppleCount = 0;

    for (const coord of RELATIVE_COORDS_SURROUNDING_TILE) {
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

  console.log(`Orphaned apples found: ${bestApples.length}`);
  const randomIndex = Math.floor(Math.random() * bestApples.length);
  return bestApples[randomIndex];
}

function defineBoardTiles() {
  const tiles = [];
  const appleTiles = [];

  const appleChance = 0.15;
  let appleCount = 0;

  document.querySelectorAll(".board-row").forEach((rowElement, y) => {
    rowElement.querySelectorAll(".board-tile").forEach((tileElement, x) => {
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
    });
  });

  const startingApple = findOrphanedApple(appleTiles, tiles);
  startingApple.placeFlag();

  return { tiles: tiles, startingApple: startingApple };
}

export class Board {
  constructor() {
    const { tiles, startingApple } = defineBoardTiles();

    this.boardTiles = tiles;
    this.flaggedTiles = new Map();
    this.revealedTiles = new Set();
    this.currentDirection = Direction.RIGHT;

    this.gameOver = false;
    this.gameOverReason = "";

    this.inputLocked = false;

    const headPositionX = Math.ceil(this.boardTiles.length / 2);
    const headPositionY = Math.ceil(this.boardTiles[0].length / 2);

    this.snake = new Snake(
      headPositionX,
      headPositionY,
      this.boardTiles.length,
      6
    );

    this.placeFlag(startingApple);
    this.defineTileClickEvents();
    this.renderSnake();
    this.renderFlags();
  }

  defineTileClickEvents() {
    this.boardTiles.forEach((row) => {
      row.forEach((tile) => {
        tile.element.addEventListener("click", () => {
          if (this.snake.isOccupyingTile(tile.positionX, tile.positionY)) {
            return;
          }

          if (tile.flagged) {
            this.removeFlag(tile);
          } else {
            this.placeFlag(tile);
          }
        });
      });
    });
  }

  getAppleCounts(tile, visited) {
    const tileX = tile.positionX;
    const tileY = tile.positionY;

    let surroundingApples = 0;
    let newQueue = [];

    for (const coord of RELATIVE_COORDS_SURROUNDING_TILE) {
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
      } else if (!visited.has(checkKey) && !checkTile.hasApple) {
        newQueue.push(checkTile);
      }
    }

    return { surroundingApples, newQueue };
  }

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

  checkSnakeCollision() {
    const head = this.snake.getHead();
    const headX = head.positionX;
    const headY = head.positionY;
    const headTile = this.boardTiles[headY][headX];

    const intersectingFlaggedTile = this.flaggedTiles.get(
      headTile.getUniqueKey()
    );

    if (intersectingFlaggedTile) {
      if (!intersectingFlaggedTile.hasApple) {
        this.gameOver = true;
        this.gameOverReason = "Flagged empty tile";
        return true;
      }

      intersectingFlaggedTile.removeApple();

      this.removeFlag(intersectingFlaggedTile);
      this.startFloodReveal(intersectingFlaggedTile);
      this.growSnake();
    }

    return this.snake.isIntersectingSegment(headX, headY);
  }

  renderSnake() {
    for (const snakeSegment of this.snake.getSegments()) {
      const y = snakeSegment.positionY;
      const x = snakeSegment.positionX;

      const tileElement = this.boardTiles[y][x];

      tileElement.placeSnake();
    }
  }

  renderFlags() {
    for (const key of this.flaggedTiles.keys()) {
      const flagTile = this.flaggedTiles.get(key);
      flagTile.placeFlag();
    }
  }

  placeFlag(tile) {
    tile.placeFlag();
    this.flaggedTiles.set(tile.getUniqueKey(), tile);
    this.renderFlags();
  }

  removeFlag(tile) {
    tile.removeFlag();
    this.flaggedTiles.delete(tile.getUniqueKey());
    this.renderFlags();
  }

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

  growSnake() {
    this.snake.grow();
  }

  updateSnake() {
    const { newHead, oldTail } = this.snake.move(this.currentDirection);

    const tailY = oldTail.positionY;
    const tailX = oldTail.positionX;

    this.gameOver = this.checkSnakeCollision();
    if (this.gameOver) {
      return;
    }

    const tailTileElement = this.boardTiles[tailY][tailX];
    tailTileElement.removeSnake();

    this.renderSnake();
  }

  randomTestDirection() {
    const directions = [
      Direction.UP,
      Direction.DOWN,
      Direction.LEFT,
      Direction.RIGHT,
    ].filter((dir) => dir !== this.currentDirection.getOpposite());

    const randomIndex = Math.floor(Math.random() * directions.length);
    return directions[randomIndex];
  }

  tick() {
    this.updateSnake();
    this.inputLocked = false;
    return this.gameOver;
  }
}

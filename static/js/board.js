import {
  Direction,
  WinState,
  RELATIVE_COORDS_SURROUNDING_TILE,
} from "./utils.js";
import { Snake } from "./snake.js";

class BoardTile {
  constructor(element, positionX, positionY, hasApple = false) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.element = element;

    this.hasApple = hasApple;
    this.flagged = false;

    this.surroundingApples = null;
  }

  removeApple() {
    this.hasApple = false;
  }

  placeSnake() {
    this.element.classList.add("snake-body");

    this.element.classList.remove("flagged-apple", "revealed-tile");
    this.element.textContent = "";
  }

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

  placeFlag() {
    this.element.classList.add("flagged-apple");
    this.element.classList.remove("debug-apple");
    this.flagged = true;
  }

  removeFlag() {
    this.element.classList.remove("flagged-apple");
    this.flagged = false;
  }

  setSurroundingApples(count) {
    this.surroundingApples = count;
    this.revealed = true;
    this.element.classList.add("revealed-tile");
    this.element.textContent = count > 0 ? String(count) : "";
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

  const randomIndex = Math.floor(Math.random() * bestApples.length);
  return bestApples[randomIndex];
}

export class Board {
  constructor(rows, columns) {
    const { tiles, startingApple, appleCount } = this.buildBoardElements(
      rows,
      columns
    );

    this.boardTiles = tiles;
    this.flaggedTiles = new Map();
    this.revealedTiles = new Set();
    this.currentDirection = Direction.RIGHT;

    this.winState = WinState.ONGOING;
    this.inputLocked = false;

    const headPositionX = Math.ceil(this.boardTiles.length / 2);
    const headPositionY = Math.ceil(this.boardTiles[0].length / 2);

    this.snake = new Snake(
      headPositionX,
      headPositionY,
      this.boardTiles.length,
      6
    );

    document.getElementById("apple-count").textContent = String(appleCount);

    this.placeFlag(startingApple);
    this.renderSnake();
    this.renderFlags();
  }

  buildBoardElements(rows, cols) {
    const boardContainer = document.getElementById("board");

    const tiles = [];
    const appleTiles = [];

    const baseChance = 0.125;
    const scaleFactor = 0.001;
    const appleChance = Math.min(
      baseChance + (rows + cols) * scaleFactor,
      0.25
    );
    console.log("Apple chance:", appleChance);

    let appleCount = 0;

    for (let y = 0; y < cols; y++) {
      const rowElement = document.createElement("div");
      rowElement.className = "board-row";
      rowElement.dataset.posY = y;
      boardContainer.appendChild(rowElement);

      for (let x = 0; x < rows; x++) {
        const tileElement = document.createElement("div");

        tileElement.className = "board-tile";
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
          if (
            this.snake.isOccupyingTile(boardTile.positionX, boardTile.positionY)
          ) {
            return;
          }

          if (boardTile.flagged) {
            this.removeFlag(boardTile);
          } else {
            this.placeFlag(boardTile);
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
        this.winState = WinState.LOST_FLAG_MISMATCH;
        return;
      }

      intersectingFlaggedTile.removeApple();

      this.removeFlag(intersectingFlaggedTile);
      this.startFloodReveal(intersectingFlaggedTile);
      this.growSnake();
    }

    const crossedSnake = this.snake.isIntersectingSegment(headX, headY);

    if (crossedSnake) {
      this.winState = WinState.LOST_SELF_COLLISION;
    }

    return;
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
    const { oldTail } = this.snake.move(this.currentDirection);

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
    return this.winState;
  }
}

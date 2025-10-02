import { Direction } from "./utils.js";
import { Snake } from "./snake.js";

class BoardTile {
  constructor(element, positionX, positionY, hasApple = false) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.element = element;
    this.hasApple = hasApple;
    this.flagged = false;

    // TODO: Remove this debug class
    if (this.hasApple) {
      this.element.classList.add("debug-apple");
    }
  }

  removeApple() {
    this.hasApple = false;
  }

  placeSnake() {
    this.element.classList.add("snake-body");
  }

  removeSnake() {
    this.element.classList.remove("snake-body");
  }

  placeFlag() {
    this.element.classList.add("flagged-apple");
    this.element.classList.remove("debug-apple");
    this.flagged = true;
  }

  removeFlag() {
    this.element.classList.remove("flagged-apple");
    if (this.hasApple) {
      this.element.classList.add("debug-apple");
    }
    this.flagged = false;
  }
}

function findOrphanedApple(appleTiles, allTiles) {
  let bestApples = [];
  let bestAppleScore = Infinity;

  appleTiles.forEach((appleTile) => {
    const appleX = appleTile.positionX;
    const appleY = appleTile.positionY;

    const relativeCoordinates = [
      [-1, -1],
      [0, -1],
      [1, -1],
      [-1, 0],
      [1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
    ];

    let surroundingAppleCount = 0;

    for (const coord of relativeCoordinates) {
      const checkX = appleX + coord[0];
      const checkY = appleY + coord[1];

      if (checkX < 0 || checkY < 0) {
        continue;
      }
      if (checkY >= allTiles.length || checkX >= allTiles[0].length) {
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
    this.flaggedTiles = [];
    this.currentDirection = Direction.UP;
    this.gameOver = false;

    const headPositionX = Math.ceil(this.boardTiles.length / 2);
    const headPositionY = Math.ceil(this.boardTiles[0].length / 2);

    this.snake = new Snake(
      headPositionX,
      headPositionY,
      this.boardTiles.length,
      6
    );

    this.placeFlag(startingApple);
    this.renderSnake();
    this.renderFlags();
  }

  checkSnakeCollision() {
    const head = this.snake.getHead();
    const headX = head.positionX;
    const headY = head.positionY;

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
    for (const flagTile of this.flaggedTiles) {
      flagTile.placeFlag();
    }
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

  placeFlag(tile) {
    this.flaggedTiles.push(tile);
    this.renderFlags();
  }

  changeDirection(newDirection) {
    if (
      newDirection !== this.currentDirection.getOpposite() &&
      newDirection !== this.currentDirection
    ) {
      this.currentDirection = newDirection;
    }
  }

  growSnake() {
    this.snake.grow();
    this.updateSnake();
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
    return this.gameOver;
  }
}

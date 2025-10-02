import { Direction } from "./utils.js";
import { Snake } from "./snake.js";

export class Board {
  constructor() {
    this.boardTiles = this.selectBoardElements();
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
    this.renderSnake();
  }

  selectBoardElements() {
    const elements = [];

    document.querySelectorAll(".board-row").forEach((rowElement, y) => {
      rowElement.querySelectorAll(".board-tile").forEach((tileElement) => {
        if (elements[y] === undefined) {
          elements[y] = [];
        }

        elements[y].push(tileElement);
      });
    });

    return elements;
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

      tileElement.classList.add("snake-body");
    }
  }

  updateSnake() {
    const { newHead, oldTail } = this.snake.move(this.currentDirection);

    const tailY = oldTail.positionY;
    const tailX = oldTail.positionX;

    this.gameOver = this.checkSnakeCollision();
    console.log("Game Over:", this.gameOver);
    if (this.gameOver) {
      return;
    }

    const tailTileElement = this.boardTiles[tailY][tailX];
    tailTileElement.classList.remove("snake-body");

    this.renderSnake();
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

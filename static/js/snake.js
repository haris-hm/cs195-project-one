import { Direction } from "./utils.js";

/**
 * Represents a segment of the snake, either the head or a body segment.
 */
export class SnakeSegment {
  /**
   * Constructs a new instance of SnakeSegment.
   *
   * @param {number} positionX The x position of this segment on the board
   * @param {number} positionY The y position of this segment on the board
   * @param {boolean} head Indicates if this segment is the head of the snake
   */
  constructor(positionX, positionY, head = false) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.head = head;
  }

  /**
   * Updates this segment to no longer be the head of the snake.
   * Used when the snake moves and a new head segment is created.
   */
  updateHeadToBody() {
    this.head = false;
  }
}

/**
 * Represents the snake in the game, consisting of multiple segments.
 */
export class Snake {
  /**
   * Constructs a new instance of the Snake.
   *
   * @param {number} headPositionX The x position of the snake's head on the board
   * @param {number} headPositionY The y position of the snake's head on the board
   * @param {number} boardSize The size of the board (assumed square)
   * @param {number} startingLength The initial length of the snake
   */
  constructor(headPositionX, headPositionY, boardSize, startingLength) {
    this.snakeSegments = this.defineSnakeSegments(
      headPositionX,
      headPositionY,
      startingLength
    );
    this.boardSize = boardSize;
  }

  /**
   * Defines the initial segments of the snake based on the head position and starting length.
   *
   * @param {number} headPositionX The x position of the snake's head on the board
   * @param {number} headPositionY The y position of the snake's head on the board
   * @param {number} startingLength The initial length of the snake
   * @returns {SnakeSegment[]} An array of SnakeSegment instances representing the snake
   */
  defineSnakeSegments(headPositionX, headPositionY, startingLength) {
    const segments = [];
    segments.push(new SnakeSegment(headPositionX, headPositionY, true));

    for (let i = 1; i < startingLength; i++) {
      segments.push(new SnakeSegment(headPositionX - i, headPositionY));
    }

    return segments;
  }

  /**
   * Gets the head segment of the snake.
   * @returns {SnakeSegment} The head segment of the snake
   */
  getHead() {
    return this.snakeSegments[0];
  }

  /**
   * Gets the tail segment of the snake.
   * @returns {SnakeSegment} The tail segment of the snake
   */
  getTail() {
    return this.snakeSegments[this.snakeSegments.length - 1];
  }

  /**
   * Gets all segments of the snake.
   * @returns {SnakeSegment[]} All segments of the snake
   */
  getSegments() {
    return this.snakeSegments;
  }

  /**
   * Checks if the snake's head intersects with any of its other body segments.
   * @returns {boolean} True if the head intersects with any body segment of the snake (excluding the head), false otherwise
   */
  isSnakeCrossed() {
    const { positionX, positionY } = this.getHead();
    const segmentsWithoutHead = this.snakeSegments.slice(1);
    return segmentsWithoutHead.some(
      (segment) =>
        segment.positionX === positionX && segment.positionY === positionY
    );
  }

  /**
   * Grows the snake by adding a new segment at the tail's position.
   */
  grow() {
    const tail = this.getTail();
    this.snakeSegments.push(new SnakeSegment(tail.positionX, tail.positionY));
  }

  /**
   * Checks whether the snake is occupying the tile.
   * @param {number} positionX The x position of the tile to check
   * @param {number} positionY The y position of the tile to check
   * @returns {boolean} True if any segment of the snake occupies the given tile, false otherwise
   */
  isOccupyingTile(positionX, positionY) {
    return this.snakeSegments.some(
      (segment) =>
        segment.positionX === positionX && segment.positionY === positionY
    );
  }

  /**
   * Moves the snake in the specified direction.
   * The head moves in the given direction, and each body segment follows the segment in front of it.
   * The tail segment is removed to maintain the snake's length.
   *
   * @param {Direction} direction The direction to move the snake
   * @returns {SnakeSegment} The tail segment that was removed during the move
   */
  move(direction) {
    const head = this.getHead();
    let newHeadX = head.positionX;
    let newHeadY = head.positionY;

    if (direction === Direction.UP || direction === Direction.DOWN) {
      newHeadY =
        (head.positionY + direction.value + this.boardSize) % this.boardSize;
    } else if (direction === Direction.LEFT || direction === Direction.RIGHT) {
      newHeadX =
        (head.positionX + direction.value + this.boardSize) % this.boardSize;
    }

    head.updateHeadToBody();
    const newHead = new SnakeSegment(newHeadX, newHeadY, true);
    this.snakeSegments.unshift(newHead);

    const oldTail = this.snakeSegments.pop();

    return oldTail;
  }
}

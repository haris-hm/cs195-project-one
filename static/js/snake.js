import { Direction } from "./utils.js";

export class SnakeSegment {
  constructor(positionX, positionY, head = false) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.head = head;
  }

  setHead(isHead) {
    this.head = isHead;
  }
}

export class Snake {
  constructor(
    headPositionX,
    headPositionY,
    boardSize = 15,
    startingLength = 3
  ) {
    this.snakeSegments = this.defineSnakeSegments(
      headPositionX,
      headPositionY,
      startingLength
    );
    this.boardSize = boardSize;
  }

  defineSnakeSegments(headPositionX, headPositionY, startingLength) {
    const segments = [];
    segments.push(new SnakeSegment(headPositionX, headPositionY, true));

    for (let i = 1; i < startingLength; i++) {
      segments.push(new SnakeSegment(headPositionX - i, headPositionY));
    }

    return segments;
  }

  getHead() {
    return this.snakeSegments[0];
  }

  getTail() {
    return this.snakeSegments[this.snakeSegments.length - 1];
  }

  getSegments() {
    return this.snakeSegments;
  }

  isIntersectingSegment(positionX, positionY) {
    const segmentsWithoutHead = this.snakeSegments.slice(1);
    return segmentsWithoutHead.some(
      (segment) =>
        segment.positionX === positionX && segment.positionY === positionY
    );
  }

  grow() {
    const tail = this.getTail();
    this.snakeSegments.push(new SnakeSegment(tail.positionX, tail.positionY));
  }

  isOccupyingTile(positionX, positionY) {
    return this.snakeSegments.some(
      (segment) =>
        segment.positionX === positionX && segment.positionY === positionY
    );
  }

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

    head.setHead(false);
    const newHead = new SnakeSegment(newHeadX, newHeadY, true);
    this.snakeSegments.unshift(newHead);

    const oldTail = this.snakeSegments.pop();

    return {
      newHead: this.getHead(),
      oldTail: oldTail,
    };
  }
}

/**
 * Represents a direction in which the snake can move.
 */
export class Direction {
  static UP = new Direction(-1);
  static DOWN = new Direction(1);
  static LEFT = new Direction(-1);
  static RIGHT = new Direction(1);

  constructor(value) {
    this.value = value;
  }

  /**
   * Gets the opposite direction.
   * @returns {Direction} The opposite direction
   */
  getOpposite() {
    if (this === Direction.UP) return Direction.DOWN;
    if (this === Direction.DOWN) return Direction.UP;
    if (this === Direction.LEFT) return Direction.RIGHT;
    if (this === Direction.RIGHT) return Direction.LEFT;
  }
}

/**
 * Represents the state of the game in terms of winning or losing.
 */
export class WinState {
  static ONGOING = new WinState("");

  static LOST_SELF_COLLISION = new WinState("Oh no! You ran into yourself!");
  static LOST_FLAG_MISMATCH = new WinState(
    "Oops! Looks like you flagged the wrong tile! That tile didn't have an apple."
  );

  static WON_ALL_APPLES = new WinState(
    "Congratulations! You collected all the hidden apples! Nice Job!"
  );

  constructor(reason) {
    this.reason = reason;
  }
}

/**
 * Relative coordinates for the 8 tiles surrounding a given tile.
 * Each pair represents the (dx, dy) offset from the center tile.
 */
export const ADJACENT_TILE_COORDINATES = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

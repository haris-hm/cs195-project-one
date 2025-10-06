export class Direction {
  static UP = new Direction(-1);
  static DOWN = new Direction(1);
  static LEFT = new Direction(-1);
  static RIGHT = new Direction(1);

  constructor(value) {
    this.value = value;
  }

  getOpposite() {
    if (this === Direction.UP) return Direction.DOWN;
    if (this === Direction.DOWN) return Direction.UP;
    if (this === Direction.LEFT) return Direction.RIGHT;
    if (this === Direction.RIGHT) return Direction.LEFT;
  }
}

export const RELATIVE_COORDS_SURROUNDING_TILE = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

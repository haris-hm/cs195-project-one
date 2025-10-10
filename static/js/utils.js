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

  static WIN_ALL_APPLES = new WinState(
    "Congratulations! You collected all the hidden apples! Nice Job!"
  );

  constructor(reason) {
    this.reason = reason;
  }
}

/**
 * Plays a random sound effect from a specified folder.
 * @param {string} soundType The name of the folder the sound is in
 * @param {number} variationAmount How many different variations of that sound are in the folder (Defaults to 3)
 * @param {number} volume The volume to play the sound at (Defaults to 0.2)
 */
export function playRandomSoundEffect(
  soundType,
  variationAmount = 3,
  volume = 0.2
) {
  const variationSelected = Math.floor(Math.random() * variationAmount) + 1;
  const filePath = `static/sounds/${soundType}/${variationSelected}.ogg`;
  const audio = new Audio(filePath);

  audio.volume = volume;
  audio.play();
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

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

export class SoundRegistry {
  static GAME_START = new SoundRegistry("game-start", 12, 0.25);
  static WIN = new SoundRegistry("win", 2, 0.25);
  static LOSE = new SoundRegistry("lose", 16, 0.25);

  static FLAG = new SoundRegistry("flag", 4, 0.15);
  static TURN = new SoundRegistry("turn", 4, 0.15);

  static EAT = new SoundRegistry("eat", 6, 0.3);
  static SCORE_INDICATOR = new SoundRegistry("score-indicator", 2, 0.2);

  /**
   * Constructs a SoundRegistry instance.
   * @param {string} soundType The name of the folder the sound is in
   * @param {number} variationAmount How many different variations of that sound are in the folder
   * @param {number} volume The volume to play the sound at (0.0 to 1.0)
   */
  constructor(soundType, variationAmount, volume) {
    this.soundType = soundType;
    this.variationAmount = variationAmount;
    this.volume = volume;
  }

  /**
   * Plays a random variation of the sound effect.
   */
  playSound() {
    const variationSelected =
      Math.floor(Math.random() * this.variationAmount) + 1;
    const filePath = `static/sounds/${this.soundType}/${variationSelected}.ogg`;
    const audio = new Audio(filePath);

    audio.volume = this.volume;
    audio.play();
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

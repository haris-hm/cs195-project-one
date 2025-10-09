import { Board } from "./board.js";
import { Direction, WinState } from "./utils.js";

/**
 * Adds keyboard and button listeners to control the snake.
 * @param {Board} gameBoard The game board to add listeners for
 */
function addKeyListeners(gameBoard) {
  document.addEventListener("keydown", (event) => {
    let keyPressed = event.key.toUpperCase();

    switch (keyPressed) {
      case "W":
      case "ARROWUP":
        gameBoard.changeDirection(Direction.UP);
        break;
      case "A":
      case "ARROWLEFT":
        gameBoard.changeDirection(Direction.LEFT);
        break;
      case "S":
      case "ARROWDOWN":
        gameBoard.changeDirection(Direction.DOWN);
        break;
      case "D":
      case "ARROWRIGHT":
        gameBoard.changeDirection(Direction.RIGHT);
        break;
      case "G":
        gameBoard.growSnake();
        break;
    }
  });

  // Mobile controls
  const upButton = document.getElementById("up-button");
  const downButton = document.getElementById("down-button");
  const leftButton = document.getElementById("left-button");
  const rightButton = document.getElementById("right-button");

  if (upButton && downButton && leftButton && rightButton) {
    upButton.addEventListener("click", () => {
      gameBoard.changeDirection(Direction.UP);
    });

    downButton.addEventListener("click", () => {
      gameBoard.changeDirection(Direction.DOWN);
    });

    leftButton.addEventListener("click", () => {
      gameBoard.changeDirection(Direction.LEFT);
    });

    rightButton.addEventListener("click", () => {
      gameBoard.changeDirection(Direction.RIGHT);
    });
  }
}

function getGameDifficulty() {
  const selectedDifficulty = window.localStorage.getItem("selectedDifficulty");
  console.log("Selected Difficulty:", selectedDifficulty);
  switch (selectedDifficulty) {
    case "easy":
      return 10;
    case "normal":
      return 16;
    case "hard":
      return 24;
    default:
      return 16;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const boardSize = getGameDifficulty();
  const gameBoard = new Board(boardSize);
  addKeyListeners(gameBoard);

  const gameLoop = setInterval(() => {
    const winState = gameBoard.tick();

    if (winState !== WinState.ONGOING) {
      clearInterval(gameLoop);
      alert(`Game Over!\n${winState.reason}`);
    }
  }, 200);
});

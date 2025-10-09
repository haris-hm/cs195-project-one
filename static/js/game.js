import { Board } from "./board.js";
import { Direction, WinState, playRandomSoundEffect } from "./utils.js";

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

function showGameOverOverlay(title, message) {
  const overlay = document.getElementById("game-over-overlay");
  const overlayTitle = document.getElementById("game-over-title");
  const overlayMessage = document.getElementById("game-over-message");
  const boardElement = document.getElementById("board");

  if (overlay && overlayTitle && overlayMessage) {
    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
  }

  overlay.classList.remove("hidden");
  overlay.classList.add("game-over-overlay");
  boardElement.classList.add("board-game-over");
}

document.addEventListener("DOMContentLoaded", function () {
  const boardSize = getGameDifficulty();
  const gameBoard = new Board(boardSize);
  addKeyListeners(gameBoard);

  const gameLoop = setInterval(() => {
    const winState = gameBoard.tick();

    if (winState !== WinState.ONGOING) {
      clearInterval(gameLoop);

      if (winState === WinState.WIN_ALL_APPLES) {
        playRandomSoundEffect("win", 2);
      } else {
        playRandomSoundEffect("lose", 16);
      }

      const title =
        winState === WinState.WIN_ALL_APPLES ? "You Win!" : "Game Over";
      showGameOverOverlay(title, winState.reason);
    }
  }, 200);
});

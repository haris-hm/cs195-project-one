import { Board } from "./board.js";
import { Direction } from "./utils.js";

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

document.addEventListener("DOMContentLoaded", function () {
  const gameBoard = new Board(10, 10);
  addKeyListeners(gameBoard);

  const gameLoop = setInterval(() => {
    const gameOver = gameBoard.tick();
    if (gameOver) {
      clearInterval(gameLoop);
      alert("Game Over!");
    }
  }, 200);
});

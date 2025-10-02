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
}

document.addEventListener("DOMContentLoaded", function () {
  const gameBoard = new Board();

  addKeyListeners(gameBoard);

  const gameLoop = setInterval(() => {
    const gameOver = gameBoard.tick();
    if (gameOver) {
      clearInterval(gameLoop);
      alert("Game Over!");
    }
  }, 200);
});

document.addEventListener("DOMContentLoaded", () => {
  const gameSettingsForm = document.getElementById("game-settings");
  gameSettingsForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const difficultySelect = document.getElementById("difficulty");
    const selectedDifficulty = difficultySelect.value;

    window.localStorage.setItem("selectedDifficulty", selectedDifficulty);
    window.location.href = "/game.html";
  });
});

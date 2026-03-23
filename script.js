// Game configuration and state variables
const GOAL_CANS = 20;        // Total items needed to collect
const GAME_DURATION = 30;    // Total seconds for each game
const TIMER_WARNING_THRESHOLD = 10;
let currentCans = 0;         // Current number of items collected
let timeLeft = GAME_DURATION; // Remaining time in seconds
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;          // Holds the interval for spawning items
let timerInterval;          // Holds the interval for countdown timer
let scoreFeedbackTimeout;
var winningMessages = [
  "Great job! You collected all the water cans!",
  "Well done! You've completed the quest!",
  "Congratulations! You're a water can master!",
  "Fantastic! You've achieved your goal!",
  "Awesome work! You've won the game!"
];
var losingMessages = [
  "Oh no! Time's up! Better luck next time!",
  "Don't worry, you can try again!",
  "So close! Give it another shot!",
  "Keep practicing and you'll get there!",
  "Almost had it! Try again!"
];
function updateTimerDisplay() {
  const timerElement = document.getElementById('timer');
  timerElement.textContent = `${timeLeft}s`;
  timerElement.classList.toggle('timer-warning', gameActive && timeLeft <= TIMER_WARNING_THRESHOLD);
}

function updateScoreDisplay(feedbackType) {
  const scoreElement = document.getElementById('current-cans');
  scoreElement.textContent = currentCans;
  scoreElement.classList.remove('score-positive', 'score-negative');

  if (!feedbackType) return;

  scoreElement.classList.add(feedbackType === 'positive' ? 'score-positive' : 'score-negative');

  clearTimeout(scoreFeedbackTimeout);
  scoreFeedbackTimeout = setTimeout(() => {
    scoreElement.classList.remove('score-positive', 'score-negative');
  }, 250);
}

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  if (!gameActive) return; // Stop if the game is not active
  const cells = document.querySelectorAll('.grid-cell');
  
  // Clear all cells before spawning a new water can
  cells.forEach(cell => (cell.innerHTML = ''));

  // Select a random cell from the grid to place the water can
  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  // Use a template literal to create the wrapper and water-can element
  randomCell.innerHTML = `
    <div class="water-can-wrapper">
      <div class="water-can"></div>
    </div>
  `;
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return; // Prevent starting a new game if one is already active
  gameActive = true;
  currentCans = 0;
  timeLeft = GAME_DURATION;
  updateScoreDisplay();
  updateTimerDisplay();
  createGrid(); // Set up the game grid
  spawnWaterCan(); // Spawn one item right away
  spawnInterval = setInterval(spawnWaterCan, 1000); // Spawn water cans every second

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0 && currentCans < GOAL_CANS) {
      endGame();
      const randomMessage = losingMessages[Math.floor(Math.random() * losingMessages.length)];
      alert(randomMessage);
    }
  }, 1000);
}

// Tracks clicks on the game grid to collect items
document.querySelector('.game-grid').addEventListener('click', (event) => {
  if (!gameActive) return; // Ignore clicks if the game is not active
  if (event.target.classList.contains('water-can')) {
    currentCans++; // Increment the count of collected items
    updateScoreDisplay('positive'); // Update the display of collected items
    event.target.parentElement.remove(); // Remove the collected item from the grid
    if (currentCans >= GOAL_CANS) {
      endGame(); // End the game if the goal is reached
      const randomMessage = winningMessages[Math.floor(Math.random() * winningMessages.length)]; // Select a random winning message from the array
      alert(randomMessage); // Show a random winning message
    }
  } else {
    currentCans = Math.max(0, currentCans - 1); // Penalty for wrong clicks
    updateScoreDisplay('negative'); // Update the display after penalty
  }
});

function endGame() {
  if (!gameActive) return;
  gameActive = false; // Mark the game as inactive
  clearInterval(spawnInterval); // Stop spawning water cans
  clearInterval(timerInterval); // Stop countdown timer
}

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);

updateTimerDisplay();

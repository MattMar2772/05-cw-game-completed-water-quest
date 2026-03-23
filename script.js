// Game configuration and state variables
const DIFFICULTY_SETTINGS = {
  easy: {
    goalCans: 20,
    gameDuration: 30,
    spawnInterval: 1000,
    hasObstacles: false
  },
  medium: {
    goalCans: 50,
    gameDuration: 30,
    spawnInterval: 600,
    hasObstacles: false
  },
  hard: {
    goalCans: 50,
    gameDuration: 30,
    spawnInterval: 550,
    hasObstacles: true
  }
};

let GOAL_CANS = 20;        // Total items needed to collect
let GAME_DURATION = 30;    // Total seconds for each game
let SPAWN_INTERVAL = 1000; // Milliseconds between spawns
let HAS_OBSTACLES = false; // Whether obstacles are active
const TIMER_WARNING_THRESHOLD = 10;
let currentCans = 0;         // Current number of items collected
let timeLeft = GAME_DURATION; // Remaining time in seconds
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;          // Holds the interval for spawning items
let timerInterval;          // Holds the interval for countdown timer
let scoreFeedbackTimeout;
let selectedDifficulty = null; // Track selected difficulty
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

// Set up difficulty selection
function setupDifficultySelection() {
  const difficultyBtns = document.querySelectorAll('.difficulty-btn');
  difficultyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const difficulty = e.target.getAttribute('data-difficulty');
      selectDifficulty(difficulty);
    });
  });
}

// Handle difficulty selection
function selectDifficulty(difficulty) {
  selectedDifficulty = difficulty;
  const settings = DIFFICULTY_SETTINGS[difficulty];
  
  // Update game variables
  GOAL_CANS = settings.goalCans;
  GAME_DURATION = settings.gameDuration;
  SPAWN_INTERVAL = settings.spawnInterval;
  HAS_OBSTACLES = settings.hasObstacles;
  
  // Update UI
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('selected');
  
  // Show game container
  document.getElementById('difficulty-selection').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
  
  // Update instructions based on difficulty
  const difficultyText = {
    easy: `Collect ${GOAL_CANS} items to complete the game!`,
    medium: `Collect ${GOAL_CANS} items in ${GAME_DURATION} seconds. Cans spawn faster!`,
    hard: `Collect ${GOAL_CANS} items in ${GAME_DURATION} seconds. Watch out for obstacles!`
  };
  document.getElementById('game-instructions').textContent = difficultyText[difficulty];
  
  // Reset timer display
  timeLeft = GAME_DURATION;
  updateTimerDisplay();
}

// Go back to difficulty selection
function backToDifficultySelection() {
  selectedDifficulty = null;
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('difficulty-selection').style.display = 'block';
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
}

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
  
  // Spawn an obstacle on hard mode (in a different cell)
  if (HAS_OBSTACLES) {
    const availableCells = Array.from(cells).filter(cell => cell !== randomCell);
    if (availableCells.length > 0 && Math.random() < 0.6) { // 60% chance to spawn obstacle
      const obstacleCell = availableCells[Math.floor(Math.random() * availableCells.length)];
      obstacleCell.innerHTML = `<div class="obstacle"></div>`;
    }
  }
}

// Initializes and starts a new game
function startGame() {
  if (!selectedDifficulty) {
    alert('Please select a difficulty first!');
    return;
  }
  if (gameActive) return; // Prevent starting a new game if one is already active
  gameActive = true;
  currentCans = 0;
  timeLeft = GAME_DURATION;
  updateScoreDisplay();
  updateTimerDisplay();
  createGrid(); // Set up the game grid
  spawnWaterCan(); // Spawn one item right away
  spawnInterval = setInterval(spawnWaterCan, SPAWN_INTERVAL); // Spawn water cans at difficulty-based interval

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

// Stops current game
function stopGame() {
  if (gameActive != true) return; // Prevent stopping a game if there is no game running
  gameActive = false; // Mark game as inactive
  currentCans = 0; // Reset score
  updateScoreDisplay(); // Update score display
  clearInterval(spawnInterval); // Stop spawning water cans
  clearInterval(timerInterval); // Stop countdown timer
  timeLeft = GAME_DURATION; // Reset timer
  updateTimerDisplay(); // Update timer display
  createGrid(); // Create new blank grid
  backToDifficultySelection(); // Go back to difficulty selection
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
  } else if (event.target.classList.contains('obstacle')) {
    currentCans = Math.max(0, currentCans - 1); // Penalty for clicking obstacle
    updateScoreDisplay('negative'); // Update the display after penalty
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
  backToDifficultySelection(); // Go back to difficulty selection
}

// Set up click handler for the start and stop buttons
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('stop-game').addEventListener('click', stopGame);

// Set up difficulty selection
setupDifficultySelection();

updateTimerDisplay();

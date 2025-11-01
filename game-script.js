// Organism data (same as main game)
const organisms = [
  {
    id: "strawberry",
    name: "Strawberry",
    role: "Producer",
    emoji: "🌱",
    description: "A sweet fruit plant that photosynthesizes.",
    img: "organisms/Cartoon_strawberry_plant_eb02f891.png",
    traits: ["Photosynthesis", "Fruit-bearing", "Ground cover"]
  },
  {
    id: "potato",
    name: "Potato",
    role: "Producer",
    emoji: "🌱",
    description: "A root vegetable that grows underground.",
    img: "organisms/Cartoon_potato_plant_e58e9460.png",
    traits: ["Tuber storage", "Cool climate", "Soil-rich"]
  },
  {
    id: "pumpkin-seeds",
    name: "Pumpkin Seeds",
    role: "Producer",
    emoji: "🌱",
    description: "Seeds that grow into pumpkin vines.",
    img: "organisms/Cartoon_pumpkin_seeds_576b5ec3.png",
    traits: ["Vining growth", "Large leaves", "Seasonal"]
  },
  {
    id: "corn",
    name: "Corn",
    role: "Producer",
    emoji: "🌱",
    description: "A tall grass crop that loves sunlight.",
    img: "organisms/Cartoon_corn_plant_58a724ab.png",
    traits: ["Wind-pollinated", "High sunlight", "Nitrogen hungry"]
  },
  {
    id: "goat",
    name: "Goat",
    role: "Consumer",
    emoji: "🐐",
    description: "A herbivore that eats plants.",
    img: "organisms/Cartoon_goat_character_0191fba2.png",
    traits: ["Grazing", "Agile", "Ruminant"]
  },
  {
    id: "duck",
    name: "Duck",
    role: "Consumer",
    emoji: "🦆",
    description: "An omnivore that eats plants and insects.",
    img: "organisms/Cartoon_duck_character_e6efd23f.png",
    traits: ["Aquatic", "Omnivorous", "Migratory"]
  },
  {
    id: "chicken",
    name: "Chicken",
    role: "Consumer",
    emoji: "🐔",
    description: "A bird that pecks for seeds and bugs.",
    img: "organisms/Cartoon_chicken_character_78ddbb39.png",
    traits: ["Pecking", "Ground forager", "Social"]
  },
  {
    id: "wolf",
    name: "Wolf",
    role: "Consumer",
    emoji: "🐺",
    description: "A carnivore that hunts other animals.",
    img: "organisms/Cartoon_wolf_character_6ecadd03.png",
    traits: ["Pack hunter", "Territorial", "Apex predator"]
  },
  {
    id: "bee",
    name: "Bee",
    role: "Consumer",
    emoji: "🐝",
    description: "A pollinator that feeds on nectar.",
    img: "organisms/Cartoon_bee_character_cd9dafe6.png",
    traits: ["Pollination", "Social", "Nectar-feeding"]
  },
  {
    id: "yeast",
    name: "Yeast",
    role: "Decomposer",
    emoji: "🍄",
    description: "A fungus that breaks down organic matter.",
    img: "organisms/Cartoon_yeast_cells_8e9a2b32.png",
    traits: ["Fermentation", "Microscopic", "Rapid growth"]
  }
];

// Role colors
const roleColors = {
  Producer: "#22c55e",
  Consumer: "#f59e0b",
  Decomposer: "#3b82f6"
};

// Game titles by role
const gameTitles = {
  Producer: "🌱 Plant Life Cycle",
  Consumer: "🦊 Hunt & Survive",
  Decomposer: "🍄 Decompose & Recycle"
};

// Game state
const gameState = {
  organism: null,
  energy: 100,
  score: 0,
  survivalTime: 0,
  sunEnergy: 0,
  waterEnergy: 0,
  sliderPosition: 0,
  sliderDirection: 1, // 1 = right, -1 = left
  sliderSpeed: 0.8,
  hitZonePosition: 45, // percentage
  hitZoneWidth: 10, // percentage
  difficulty: "MEDIUM",
  currentAction: "sun", // "sun" or "water"
  gameRunning: false,
  gameLoop: null,
  startTime: null,
  lastFrameTime: 0
};

// DOM elements
let elements = {};

// Get query parameter
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Initialize game
function init() {
  // Get DOM elements
  elements = {
    organismName: document.getElementById("organismName"),
    organismImage: document.getElementById("organismImage"),
    roleColor: document.getElementById("roleColor"),
    roleLabel: document.getElementById("roleLabel"),
    energyValue: document.getElementById("energyValue"),
    energyBar: document.getElementById("energyBar"),
    scoreValue: document.getElementById("scoreValue"),
    timeValue: document.getElementById("timeValue"),
    sunBar: document.getElementById("sunBar"),
    waterBar: document.getElementById("waterBar"),
    gameTitle: document.getElementById("gameTitle"),
    instruction: document.getElementById("instruction"),
    currentAction: document.getElementById("currentAction"),
    difficultyLabel: document.getElementById("difficultyLabel"),
    slider: document.getElementById("slider"),
    hitZone: document.getElementById("hitZone"),
    rhythmTrack: document.querySelector(".rhythm-track"),
    quitBtn: document.getElementById("quitBtn"),
    restartBtn: document.getElementById("restartBtn"),
    backToMenuBtn: document.getElementById("backToMenuBtn"),
    gameOverScreen: document.getElementById("gameOverScreen"),
    finalScore: document.getElementById("finalScore"),
    finalTime: document.getElementById("finalTime"),
    finalMessage: document.getElementById("finalMessage")
  };

  // Get organism from URL
  const organismId = getQueryParam("organism") || "strawberry";
  gameState.organism = organisms.find(o => o.id === organismId) || organisms[0];

  // Setup UI
  setupUI();

  // Set initial difficulty based on role
  setDifficulty();

  // Event listeners
  document.addEventListener("keydown", handleKeyPress);
  elements.quitBtn.addEventListener("click", quitGame);
  elements.restartBtn.addEventListener("click", restartGame);
  elements.backToMenuBtn.addEventListener("click", backToMenu);

  // Start game
  startGame();
}

// Setup UI based on organism
function setupUI() {
  const org = gameState.organism;
  
  elements.organismName.textContent = org.name;
  elements.organismImage.src = org.img;
  elements.organismImage.alt = org.name;
  elements.roleLabel.textContent = org.role.toUpperCase();
  elements.roleColor.style.backgroundColor = roleColors[org.role];
  elements.gameTitle.textContent = gameTitles[org.role];
  
  // Set initial hit zone position
  elements.hitZone.style.left = `${gameState.hitZonePosition}%`;
}

// Set difficulty based on organism role
function setDifficulty() {
  const role = gameState.organism.role;
  
  if (role === "Producer") {
    gameState.difficulty = "EASY";
    gameState.sliderSpeed = 0.6;
    gameState.hitZoneWidth = 12;
  } else if (role === "Consumer") {
    gameState.difficulty = "MEDIUM";
    gameState.sliderSpeed = 0.8;
    gameState.hitZoneWidth = 10;
  } else {
    gameState.difficulty = "HARD";
    gameState.sliderSpeed = 1.0;
    gameState.hitZoneWidth = 8;
  }
  
  elements.difficultyLabel.textContent = gameState.difficulty;
  elements.hitZone.style.width = `${gameState.hitZoneWidth}%`;
}

// Start game
function startGame() {
  gameState.gameRunning = true;
  gameState.startTime = Date.now();
  gameState.lastFrameTime = performance.now();
  
  updateAction();
  gameState.gameLoop = requestAnimationFrame(gameLoop);
}

// Main game loop
function gameLoop(currentTime) {
  if (!gameState.gameRunning) return;
  
  const deltaTime = currentTime - gameState.lastFrameTime;
  gameState.lastFrameTime = currentTime;
  
  // Update slider position
  gameState.sliderPosition += gameState.sliderDirection * gameState.sliderSpeed;
  
  // Bounce slider at edges
  if (gameState.sliderPosition >= 100) {
    gameState.sliderPosition = 100;
    gameState.sliderDirection = -1;
  } else if (gameState.sliderPosition <= 0) {
    gameState.sliderPosition = 0;
    gameState.sliderDirection = 1;
  }
  
  // Update slider UI
  elements.slider.style.left = `${gameState.sliderPosition}%`;
  
  // Drain energy over time (0.5% per second)
  gameState.energy -= 0.0008 * deltaTime;
  
  // Drain resources slightly (0.2% per second)
  gameState.sunEnergy = Math.max(0, gameState.sunEnergy - 0.0003 * deltaTime);
  gameState.waterEnergy = Math.max(0, gameState.waterEnergy - 0.0003 * deltaTime);
  
  // Check if both resources are low and drain energy faster
  if (gameState.sunEnergy < 20 && gameState.waterEnergy < 20) {
    gameState.energy -= 0.001 * deltaTime; // Extra penalty
  }
  
  // Update survival time
  gameState.survivalTime = Math.floor((Date.now() - gameState.startTime) / 1000);
  
  // Update UI
  updateUI();
  
  // Check game over
  if (gameState.energy <= 0) {
    endGame();
    return;
  }
  
  // Continue loop
  gameState.gameLoop = requestAnimationFrame(gameLoop);
}

// Update action (sun or water)
function updateAction() {
  const needsSun = gameState.sunEnergy < gameState.waterEnergy;
  const needsWater = gameState.waterEnergy < gameState.sunEnergy;
  
  // Alternate based on needs, or random if equal
  if (needsSun) {
    gameState.currentAction = "sun";
  } else if (needsWater) {
    gameState.currentAction = "water";
  } else {
    gameState.currentAction = Math.random() > 0.5 ? "sun" : "water";
  }
  
  // Update UI
  if (gameState.currentAction === "sun") {
    elements.currentAction.textContent = "☀️ Collect Sunlight!";
  } else {
    elements.currentAction.textContent = "💧 Collect Water!";
  }
  
  // Randomize hit zone position
  gameState.hitZonePosition = 20 + Math.random() * 60;
  elements.hitZone.style.left = `${gameState.hitZonePosition}%`;
}

// Handle key press
function handleKeyPress(e) {
  if (!gameState.gameRunning) return;
  
  if (e.code === "Space") {
    e.preventDefault();
    checkHit();
  }
}

// Check if slider is in hit zone
function checkHit() {
  const hitStart = gameState.hitZonePosition;
  const hitEnd = gameState.hitZonePosition + gameState.hitZoneWidth;
  const sliderPos = gameState.sliderPosition;
  
  const isHit = sliderPos >= hitStart && sliderPos <= hitEnd;
  
  if (isHit) {
    // Success!
    handleSuccess();
  } else {
    // Miss!
    handleMiss();
  }
}

// Handle successful hit
function handleSuccess() {
  // Add visual feedback
  elements.hitZone.classList.add("hit-success");
  setTimeout(() => elements.hitZone.classList.remove("hit-success"), 300);
  
  // Add resources
  const resourceGain = 15 + Math.random() * 10; // 15-25%
  
  if (gameState.currentAction === "sun") {
    gameState.sunEnergy = Math.min(100, gameState.sunEnergy + resourceGain);
  } else {
    gameState.waterEnergy = Math.min(100, gameState.waterEnergy + resourceGain);
  }
  
  // Add energy
  gameState.energy = Math.min(100, gameState.energy + 5);
  
  // Add score
  const points = Math.floor(10 + gameState.difficulty === "HARD" ? 20 : gameState.difficulty === "MEDIUM" ? 15 : 10);
  gameState.score += points;
  
  // Change action
  updateAction();
}

// Handle missed hit
function handleMiss() {
  // Add visual feedback
  elements.rhythmTrack.classList.add("hit-fail");
  setTimeout(() => elements.rhythmTrack.classList.remove("hit-fail"), 300);
  
  // Lose energy
  gameState.energy = Math.max(0, gameState.energy - 3);
}

// Update UI
function updateUI() {
  // Energy
  const energyPercent = Math.max(0, Math.min(100, gameState.energy));
  elements.energyValue.textContent = `${Math.round(energyPercent)}%`;
  elements.energyBar.style.width = `${energyPercent}%`;
  
  // Energy bar color
  elements.energyBar.classList.remove("low", "medium");
  if (energyPercent < 25) {
    elements.energyBar.classList.add("low");
  } else if (energyPercent < 50) {
    elements.energyBar.classList.add("medium");
  }
  
  // Score
  elements.scoreValue.textContent = gameState.score;
  
  // Time
  const minutes = Math.floor(gameState.survivalTime / 60);
  const seconds = gameState.survivalTime % 60;
  elements.timeValue.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  
  // Resources
  elements.sunBar.style.width = `${Math.max(0, Math.min(100, gameState.sunEnergy))}%`;
  elements.waterBar.style.width = `${Math.max(0, Math.min(100, gameState.waterEnergy))}%`;
}

// End game
function endGame() {
  gameState.gameRunning = false;
  if (gameState.gameLoop) {
    cancelAnimationFrame(gameState.gameLoop);
  }
  
  // Show game over screen
  elements.finalScore.textContent = gameState.score;
  
  const minutes = Math.floor(gameState.survivalTime / 60);
  const seconds = gameState.survivalTime % 60;
  elements.finalTime.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  
  // Message based on score
  let message = "You tried your best!";
  if (gameState.score > 500) {
    message = "Outstanding survival skills! 🏆";
  } else if (gameState.score > 300) {
    message = "Great job surviving! 🌟";
  } else if (gameState.score > 150) {
    message = "Not bad! Keep practicing! 💪";
  }
  elements.finalMessage.textContent = message;
  
  elements.gameOverScreen.classList.remove("hidden");
}

// Quit game
function quitGame() {
  if (confirm("Are you sure you want to quit?")) {
    window.location.href = "index.html";
  }
}

// Restart game
function restartGame() {
  // Reset game state
  gameState.energy = 100;
  gameState.score = 0;
  gameState.survivalTime = 0;
  gameState.sunEnergy = 0;
  gameState.waterEnergy = 0;
  gameState.sliderPosition = 0;
  gameState.sliderDirection = 1;
  
  // Hide game over screen
  elements.gameOverScreen.classList.add("hidden");
  
  // Restart game
  startGame();
}

// Back to menu
function backToMenu() {
  window.location.href = "index.html";
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", init);

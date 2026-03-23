const BASE_GAME_LENGTH = 30;
const BASE_WIN_THRESHOLD = 20;
const BASE_POLLUTED_DROP_CHANCE = 0.2;
const BASE_MIN_FALL_DURATION = 2.8;
const BASE_FALL_DURATION_VARIANCE = 1.5;
const CONFETTI_COUNT = 70;

const gameModes = {
  easy: {
    gameLength: 45,
    winThreshold: BASE_WIN_THRESHOLD / 2,
    pollutedDropChance: 0.1,
    minFallDuration: 3.6,
    fallDurationVariance: 1.6
  },
  normal: {
    gameLength: BASE_GAME_LENGTH,
    winThreshold: BASE_WIN_THRESHOLD,
    pollutedDropChance: BASE_POLLUTED_DROP_CHANCE,
    minFallDuration: BASE_MIN_FALL_DURATION,
    fallDurationVariance: BASE_FALL_DURATION_VARIANCE
  },
  hard: {
    gameLength: 20,
    winThreshold: BASE_WIN_THRESHOLD * 1.5,
    pollutedDropChance: 0.35,
    minFallDuration: 1.8,
    fallDurationVariance: 1.2
  }
};

let gameRunning = false;
let score = 0;
let timeLeft = BASE_GAME_LENGTH;
let currentGameLength = BASE_GAME_LENGTH;
let currentWinThreshold = BASE_WIN_THRESHOLD;
let currentPollutedDropChance = BASE_POLLUTED_DROP_CHANCE;
let currentMinFallDuration = BASE_MIN_FALL_DURATION;
let currentFallDurationVariance = BASE_FALL_DURATION_VARIANCE;
let dropMaker;
let timerTick;

const scoreEl = document.getElementById("score");
const goalEl = document.getElementById("goal");
const timeEl = document.getElementById("time");
const modeSelectEl = document.getElementById("mode-select");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const gameContainer = document.getElementById("game-container");
const endMessageEl = document.getElementById("end-message");

const winningMessages = [
  "Amazing work! You delivered clean water to more families!",
  "You crushed it! Your quick clicks made a real splash.",
  "Victory! That was a world-class hydration mission.",
  "Incredible round! You turned every drop into impact."
];

const losingMessages = [
  "Good try! Play again and see if you can hit the goal.",
  "So close. Keep going, you are getting faster!",
  "Nice effort! Another round could be your winning one.",
  "Keep practicing. Those drops will not escape next time!"
];

const confettiColors = ["#FFC907", "#2E9DF7", "#8BD1CB", "#4FCB53", "#FF902A"];

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);
modeSelectEl.addEventListener("change", handleModeChange);

syncModeSettings();

function startGame() {
  if (gameRunning) return;

  syncModeSettings();
  resetGame();
  gameRunning = true;
  modeSelectEl.disabled = true;
  startBtn.textContent = "Game Running...";

  dropMaker = setInterval(createDrop, 450);
  timerTick = setInterval(updateTimer, 1000);
}

function resetGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerTick);
  modeSelectEl.disabled = false;

  score = 0;
  timeLeft = currentGameLength;
  scoreEl.textContent = score;
  goalEl.textContent = currentWinThreshold;
  timeEl.textContent = timeLeft;
  endMessageEl.textContent = "";
  endMessageEl.className = "end-message";
  startBtn.textContent = "Start Game";

  gameContainer.querySelectorAll(".water-drop").forEach((drop) => drop.remove());
  clearConfetti();
}

function updateTimer() {
  timeLeft -= 1;
  timeEl.textContent = timeLeft;

  if (timeLeft <= 0) {
    endGame();
  }
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerTick);
  modeSelectEl.disabled = false;

  const wonGame = score >= currentWinThreshold;
  const messages = wonGame ? winningMessages : losingMessages;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  endMessageEl.textContent = wonGame ? randomMessage : `${randomMessage} Target: ${currentWinThreshold}.`;
  endMessageEl.className = `end-message ${wonGame ? "win" : "lose"}`;
  startBtn.textContent = "Play Again";

  gameContainer.querySelectorAll(".water-drop").forEach((drop) => drop.remove());

  if (wonGame) {
    launchConfetti();
  }
}

function handleModeChange() {
  if (gameRunning) return;
  syncModeSettings();
  resetGame();
}

function syncModeSettings() {
  const selectedMode = gameModes[modeSelectEl.value] ? modeSelectEl.value : "normal";
  const modeSettings = gameModes[selectedMode];
  currentGameLength = modeSettings.gameLength;
  currentWinThreshold = modeSettings.winThreshold;
  currentPollutedDropChance = modeSettings.pollutedDropChance;
  currentMinFallDuration = modeSettings.minFallDuration;
  currentFallDurationVariance = modeSettings.fallDurationVariance;
}

function createDrop() {
  if (!gameRunning) return;

  const drop = document.createElement("div");
  drop.classList.add("water-drop");
  const isPollutedDrop = Math.random() < currentPollutedDropChance;

  if (isPollutedDrop) {
    drop.classList.add("bad-drop");
  }

  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = `${size}px`;
  drop.style.height = `${size}px`;

  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - size);
  drop.style.left = `${xPosition}px`;

  const gameHeight = gameContainer.offsetHeight;
  drop.style.setProperty("--fall-distance", `${gameHeight + size + 30}px`);
  drop.style.animationDuration = `${Math.random() * currentFallDurationVariance + currentMinFallDuration}s`;

  drop.addEventListener("click", () => {
    if (!gameRunning) return;

    if (isPollutedDrop) {
      score = Math.max(0, score - 1);
    } else {
      score += 1;
    }

    scoreEl.textContent = score;
    removeDropFromDom(drop);
  });

  drop.addEventListener("animationend", () => {
    removeDropFromDom(drop);
  });

  gameContainer.appendChild(drop);
}

function removeDropFromDom(dropEl) {
  if (dropEl && dropEl.parentNode) {
    dropEl.parentNode.removeChild(dropEl);
  }
}

function clearConfetti() {
  gameContainer.querySelectorAll(".confetti-piece").forEach((piece) => piece.remove());
}

function launchConfetti() {
  clearConfetti();

  for (let i = 0; i < CONFETTI_COUNT; i += 1) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    piece.style.setProperty("--drift", `${(Math.random() * 140) - 70}px`);
    piece.style.setProperty("--spin", `${(Math.random() * 780) - 390}deg`);
    piece.style.animationDuration = `${Math.random() * 1.6 + 2.2}s`;
    piece.style.animationDelay = `${Math.random() * 0.55}s`;
    gameContainer.appendChild(piece);

    piece.addEventListener("animationend", () => {
      piece.remove();
    });
  }
}

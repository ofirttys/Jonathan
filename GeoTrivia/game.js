/* ============================================================
   GeoTrivia — Game Logic
   ============================================================ */

// ---- Constants ----
const HINT_SEQUENCE  = ['hard','medium','medium','easy','easy'];
const HINT_LABELS    = ['Hard','Medium','Medium','Easy','Easy'];
const BASE_SCORE     = 1000;
const HINT_PENALTY   = 200;
const TIMER_SECONDS  = 180; // 3 minutes
const DIFF_MULT      = { easy:1, medium:1.5, hard:2, impossible:2.5 };
const STREAK_BONUS   = 50;
const TIMER_BONUSES  = [
  { minSeconds: 150, bonus: 300 },
  { minSeconds: 120, bonus: 200 },
  { minSeconds:  60, bonus: 100 },
  { minSeconds:   0, bonus:   0 },
];

// ---- State ----
let allCountries     = [];
let currentCountry   = null;
let currentDifficulty= 'easy';
let hintsRevealed    = 0;
let wrongGuesses     = 0;
let selectedCountry  = null;
let timerInterval    = null;
let timerSecondsLeft = TIMER_SECONDS;
let gameActive       = false;
let soundEnabled     = true;
let sessionScore     = 0;
let currentStreak    = 0;
let bestStreak       = 0;
let gamesPlayed      = 0;
let pickedHints      = [];

// ---- DOM refs ----
const screens = {
  splash: document.getElementById('splash-screen'),
  game:   document.getElementById('game-screen'),
  result: document.getElementById('result-screen'),
};

// ---- localStorage helpers ----
function loadStorage() {
  try {
    sessionScore  = parseInt(localStorage.getItem('gt_score')  || '0');
    currentStreak = parseInt(localStorage.getItem('gt_streak') || '0');
    bestStreak    = parseInt(localStorage.getItem('gt_best')   || '0');
    gamesPlayed   = parseInt(localStorage.getItem('gt_games')  || '0');
  } catch(e) {}
}
function saveStorage() {
  try {
    localStorage.setItem('gt_score',  sessionScore);
    localStorage.setItem('gt_streak', currentStreak);
    localStorage.setItem('gt_best',   bestStreak);
    localStorage.setItem('gt_games',  gamesPlayed);
  } catch(e) {}
}

// ---- Screen router ----
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// ---- Load JSON ----
async function loadCountries() {
  const res  = await fetch('countries.json');
  const data = await res.json();
  allCountries = data.countries;
}

// ---- Splash screen ----
function initSplash() {
  document.getElementById('splash-total-score').textContent = sessionScore.toLocaleString();
  document.getElementById('splash-streak').textContent = bestStreak;
  document.getElementById('splash-games').textContent  = gamesPlayed;

  document.querySelectorAll('.diff-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.diff-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      currentDifficulty = card.dataset.difficulty;
      playSound('snd-correct');
      setTimeout(() => startGame(), 300);
    });
  });
}

// ---- Start game ----
function startGame() {
  const pool = allCountries.filter(c => c.difficulty === currentDifficulty);
  if (!pool.length) return;
  currentCountry = pool[Math.floor(Math.random() * pool.length)];

  // Pick one hint per slot from the pool
  pickedHints = HINT_SEQUENCE.map(level => {
    const bucket = currentCountry.hints[level];
    return bucket[Math.floor(Math.random() * bucket.length)];
  });

  hintsRevealed = 0;
  wrongGuesses  = 0;
  selectedCountry = null;
  gameActive    = true;

  buildGameUI();
  populateCountryList();
  updateWrongIndicators();
  updateStreakScore();
  startTimer();
  revealHint(); // reveal hint 1

  showScreen('game');
}

// ---- Build hint cards ----
function buildGameUI() {
  const badge = document.getElementById('difficulty-badge');
  badge.textContent = capitalize(currentDifficulty);
  badge.className   = 'diff-badge ' + currentDifficulty;

  const container = document.getElementById('hints-container');
  container.innerHTML = '';

  HINT_SEQUENCE.forEach((level, i) => {
    const card = document.createElement('div');
    card.className = 'hint-card locked';
    card.id = `hint-card-${i}`;
    card.innerHTML = `
      <div class="hint-inner">
        <div class="hint-num-badge">${i + 1}</div>
        <div class="hint-body">
          <span class="hint-type-label">${HINT_LABELS[i]}</span>
          <span class="hint-text">${i === 0 ? '' : '🔒 Unlocks after wrong guess'}</span>
        </div>
      </div>`;
    container.appendChild(card);
  });

  document.getElementById('btn-guess').disabled = false;
  resetSelect();
}

// ---- Reveal a hint ----
function revealHint() {
  if (hintsRevealed >= HINT_SEQUENCE.length) return;
  const i     = hintsRevealed;
  const level = HINT_SEQUENCE[i];
  const card  = document.getElementById(`hint-card-${i}`);

  card.className = `hint-card revealed ${level}-hint hint-reveal-anim`;
  card.innerHTML = `
    <div class="hint-inner">
      <div class="hint-num-badge">${i + 1}</div>
      <div class="hint-body">
        <span class="hint-type-label">${HINT_LABELS[i]}</span>
        <span class="hint-text">${pickedHints[i]}</span>
      </div>
    </div>`;

  hintsRevealed++;
  updateRoundLabel();
}

function updateRoundLabel() {
  const i = Math.min(hintsRevealed, HINT_SEQUENCE.length);
  document.getElementById('round-label').textContent =
    `Hint ${i} of ${HINT_SEQUENCE.length} — ${HINT_LABELS[i - 1]}`;
}

// ---- Country dropdown ----
function populateCountryList() {
  const list = document.getElementById('cs-list');
  list.innerHTML = '';

  const sorted = [...allCountries].sort((a,b) => a.name.localeCompare(b.name));
  sorted.forEach(c => {
    const li = document.createElement('li');
    li.dataset.id   = c.id;
    li.dataset.name = c.name.toLowerCase();
    li.innerHTML    = `<span>${c.emoji}</span> ${c.name}`;
    li.addEventListener('click', () => selectCountry(c));
    list.appendChild(li);
  });
}

function selectCountry(c) {
  selectedCountry = c;
  const display = document.getElementById('cs-display');
  document.getElementById('cs-text').textContent = `${c.emoji} ${c.name}`;
  display.classList.add('has-value');
  closeDropdown();
  document.getElementById('btn-guess').focus();
}

function resetSelect() {
  selectedCountry = null;
  document.getElementById('cs-text').textContent = 'Select a country…';
  document.getElementById('cs-display').classList.remove('has-value');
  closeDropdown();
}

// Custom select logic
const csDisplay  = document.getElementById('cs-display');
const csDropdown = document.getElementById('cs-dropdown');
const csSearch   = document.getElementById('cs-search');
const csList     = document.getElementById('cs-list');
const csEl       = document.getElementById('custom-select');

function openDropdown() {
  csEl.classList.add('open');
  csSearch.value = '';
  filterList('');
  csSearch.focus();
}
function closeDropdown() { csEl.classList.remove('open'); }

csDisplay.addEventListener('click', () => csEl.classList.contains('open') ? closeDropdown() : openDropdown());
csDisplay.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDropdown(); }});

csSearch.addEventListener('input', () => filterList(csSearch.value.toLowerCase()));

function filterList(q) {
  const items = csList.querySelectorAll('li');
  items.forEach(li => {
    li.classList.toggle('hidden', q.length > 0 && !li.dataset.name.includes(q));
  });
}

document.addEventListener('click', e => {
  if (!csEl.contains(e.target)) closeDropdown();
});

// ---- Wrong guess indicators ----
function updateWrongIndicators() {
  for (let i = 0; i < 5; i++) {
    const dot = document.getElementById(`wi-${i}`);
    if (i < wrongGuesses) { dot.textContent = '✗'; dot.className = 'wi-dot wrong'; }
    else { dot.textContent = '○'; dot.className = 'wi-dot'; }
  }
}

// ---- Timer ----
function startTimer() {
  timerSecondsLeft = TIMER_SECONDS;
  updateTimerUI(timerSecondsLeft);
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timerSecondsLeft--;
    updateTimerUI(timerSecondsLeft);
    if (timerSecondsLeft <= 30 && timerSecondsLeft > 0) playSound('snd-tick');
    if (timerSecondsLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function stopTimer() { clearInterval(timerInterval); }

function updateTimerUI(s) {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  const display = document.getElementById('timer-display');
  const circle  = document.getElementById('timer-circle');

  display.textContent = `${mins}:${secs.toString().padStart(2,'0')}`;
  const fraction = s / TIMER_SECONDS;
  const circumference = 113;
  circle.style.strokeDashoffset = circumference * (1 - fraction);

  const isWarning = s <= 60 && s > 30;
  const isDanger  = s <= 30;
  circle.className  = 'timer-progress' + (isDanger ? ' danger' : isWarning ? ' warning' : '');
  display.className = 'timer-text'     + (isDanger ? ' danger' : isWarning ? ' warning' : '');
}

function handleTimeout() {
  gameActive = false;
  endRound(false, true);
}

// ---- Streak / score display ----
function updateStreakScore() {
  document.getElementById('current-streak').textContent = currentStreak;
  document.getElementById('current-score').textContent  = sessionScore.toLocaleString();
}

// ---- Guess logic ----
document.getElementById('btn-guess').addEventListener('click', handleGuess);
document.getElementById('btn-giveup').addEventListener('click', () => {
  stopTimer();
  gameActive = false;
  endRound(false, false, true);
});
document.getElementById('btn-home').addEventListener('click', goHome);
document.getElementById('btn-home-result').addEventListener('click', goHome);
document.getElementById('btn-next').addEventListener('click', () => startGame());

function handleGuess() {
  if (!gameActive || !selectedCountry) return;

  if (selectedCountry.id === currentCountry.id) {
    // CORRECT
    stopTimer();
    gameActive = false;
    playSound('snd-correct');
    markWrongDot('correct', wrongGuesses); // mark current slot green
    setTimeout(() => endRound(true), 600);
  } else {
    // WRONG
    playSound('snd-wrong');
    const dot = document.getElementById(`wi-${wrongGuesses}`);
    dot.textContent = '✗'; dot.className = 'wi-dot wrong';
    wrongGuesses++;
    resetSelect();

    if (wrongGuesses >= 5) {
      stopTimer();
      gameActive = false;
      setTimeout(() => endRound(false), 400);
    } else {
      revealHint();
    }
  }
}

function markWrongDot(type, idx) {
  const dot = document.getElementById(`wi-${idx}`);
  if (!dot) return;
  dot.textContent = type === 'correct' ? '✓' : '✗';
  dot.className   = 'wi-dot ' + type;
}

// ---- End round ----
function endRound(won, timeout = false, gaveUp = false) {
  gamesPlayed++;

  let baseScore = 0;
  let timerBonus = 0;
  let streakBonus = 0;
  let roundTotal = 0;

  if (won) {
    baseScore  = Math.max(0, BASE_SCORE - (hintsRevealed - 1) * HINT_PENALTY);
    const mult = DIFF_MULT[currentDifficulty];
    const afterMult = Math.round(baseScore * mult);

    // Timer bonus
    for (const tb of TIMER_BONUSES) {
      if (timerSecondsLeft >= tb.minSeconds) { timerBonus = tb.bonus; break; }
    }

    // Streak
    currentStreak++;
    if (currentStreak > bestStreak) bestStreak = currentStreak;
    streakBonus = (currentStreak - 1) * STREAK_BONUS;

    roundTotal   = afterMult + timerBonus + streakBonus;
    sessionScore += roundTotal;

    playSound('snd-win');
    fireConfetti();
  } else {
    // Lost or gave up
    if (currentStreak > 0) {
      // streak already stored in bestStreak
    }
    currentStreak = 0;
    playSound('snd-lose');
  }

  saveStorage();
  updateStreakScore();

  // Build result screen
  const card = document.getElementById('result-card');
  card.className = won ? 'result-card win-card' : 'result-card lose-card';

  document.getElementById('result-emoji').textContent = won ? '🎉' : (gaveUp ? '🏳️' : timeout ? '⏰' : '😞');
  document.getElementById('result-title').textContent = won ? 'You got it!' : (gaveUp ? 'You gave up!' : timeout ? "Time's up!" : 'Out of guesses!');
  document.getElementById('result-subtitle').textContent = won
    ? `Solved in ${hintsRevealed} hint${hintsRevealed > 1 ? 's' : ''}`
    : `The answer was:`;

  document.getElementById('result-flag').textContent         = currentCountry.emoji;
  document.getElementById('result-country-name').textContent = currentCountry.name;

  const img = document.getElementById('country-image');
  img.src = currentCountry.image;
  img.alt = `Photo of ${currentCountry.name}`;

  document.getElementById('dyk-text').textContent = currentCountry.didYouKnow;

  if (won) {
    const mult = DIFF_MULT[currentDifficulty];
    const afterMult = Math.round(Math.max(0, BASE_SCORE - (hintsRevealed - 1) * HINT_PENALTY) * mult);
    document.getElementById('sb-base').textContent        = (BASE_SCORE - (hintsRevealed-1)*HINT_PENALTY).toLocaleString();
    document.getElementById('sb-mult').textContent        = mult;
    document.getElementById('sb-after-mult').textContent  = afterMult.toLocaleString();
    document.getElementById('sb-timer').textContent       = `+${timerBonus}`;
    document.getElementById('sb-streak').textContent      = `+${streakBonus}`;
    document.getElementById('sb-total').textContent       = roundTotal.toLocaleString();
    document.getElementById('sb-timer-row').style.display  = timerBonus > 0 ? '' : 'none';
    document.getElementById('sb-streak-row').style.display = streakBonus > 0 ? '' : 'none';
    document.getElementById('score-breakdown').style.display = '';
    document.getElementById('streak-lost').style.display    = 'none';
  } else {
    document.getElementById('score-breakdown').style.display = 'none';
    const lost = document.getElementById('streak-lost');
    if (currentStreak === 0 && parseInt(localStorage.getItem('gt_streak')||'0') > 0) {
      // already reset — show nothing
    }
    const prevStreak = parseInt(localStorage.getItem('gt_streak')||'0');
    if (!won && prevStreak > 0) {
      lost.style.display = '';
      document.getElementById('streak-lost-num').textContent = prevStreak + currentStreak; // before reset
    } else {
      lost.style.display = 'none';
    }
  }

  showScreen('result');
}

function goHome() {
  stopTimer();
  gameActive = false;
  initSplash();
  showScreen('splash');
}

// ---- Confetti ----
function fireConfetti() {
  const colors = ['#4fc3f7','#43e97b','#ffd93d','#a29bfe','#ff6b6b','#fd79a8'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left  = Math.random() * 100 + 'vw';
    piece.style.top   = '-10px';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = (Math.random() * 0.8) + 's';
    piece.style.animationDuration = (0.8 + Math.random() * 0.8) + 's';
    piece.style.transform = `rotate(${Math.random()*360}deg)`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2000);
  }
}

// ---- Sound ----
function playSound(id) {
  if (!soundEnabled) return;
  const el = document.getElementById(id);
  if (!el) return;
  el.currentTime = 0;
  el.play().catch(() => {});
}

document.getElementById('sound-toggle').addEventListener('click', function() {
  soundEnabled = !soundEnabled;
  this.textContent = soundEnabled ? '🔊' : '🔇';
  this.classList.toggle('muted', !soundEnabled);
});

// ---- Utils ----
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ---- Boot ----
(async function init() {
  loadStorage();
  await loadCountries();
  initSplash();
  showScreen('splash');
})();

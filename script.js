/* ═══════════════════════════════════════════════════
   ¿QUÉ HORA ES? — Lógica principal
   ═══════════════════════════════════════════════════ */

// ── CONSTANTS ────────────────────────────────────────────────────────
const CLOCK_COLORS = [
  '#FF6B6B','#4ECDC4','#FFD93D','#6BCB77',
  '#A78BFA','#74B9FF','#FF8E53','#FC5C7D'
];

const HOUR_WORDS = [
  '','la una','las dos','las tres','las cuatro','las cinco','las seis',
  'las siete','las ocho','las nueve','las diez','las once','las doce'
];

const BG_EMOJIS = ['⏰','🕐','🕑','🕒','🕓','🕔','🌊','🦀','🌴','☀️','🐚','⭐'];

// ── STATE ────────────────────────────────────────────────────────────
let playerName    = '';
let totalQuestions = 10;   // default
let questions     = [];
let current       = 0;
let score         = 0;

// Confetti
const canvas = document.getElementById('confettiCanvas');
const ctx    = canvas.getContext('2d');
let confettiParticles = [];
let confettiAF        = null;

// ════════════════════════════════════════════════════════════════════
//  CLOCK DRAWING (SVG)
// ════════════════════════════════════════════════════════════════════
function drawClock(svgEl, hour, minute, color) {
  const h   = hour % 12 || 12;
  const cx  = 100, cy = 100, r = 88;

  const hourAngle = ((h / 12) * 360 + (minute / 60) * 30) - 90;
  const minAngle  = (minute / 60) * 360 - 90;
  const hRad = hourAngle * Math.PI / 180;
  const mRad = minAngle  * Math.PI / 180;
  const hLen = 48, mLen = 65;

  // Tick marks — offset by -π/2 so 12 is at the top (North)
  let ticks = '';
  for (let i = 0; i < 12; i++) {
    const a  = (i / 12) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + (r - 10) * Math.cos(a);
    const y1 = cy + (r - 10) * Math.sin(a);
    const x2 = cx + (r - 20) * Math.cos(a);
    const y2 = cy + (r - 20) * Math.sin(a);
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}"
                    x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
                    stroke="#CBD5E0" stroke-width="3" stroke-linecap="round"/>`;
  }

  // Numbers — same offset so 12 is at top, larger font, pulled slightly inward
  let nums = '';
  [12,1,2,3,4,5,6,7,8,9,10,11].forEach((n, i) => {
    const a  = (i / 12) * 2 * Math.PI - Math.PI / 2;
    const nx = cx + (r - 34) * Math.cos(a);
    const ny = cy + (r - 34) * Math.sin(a);
    nums += `<text x="${nx.toFixed(1)}" y="${ny.toFixed(1)}"
                   text-anchor="middle" dominant-baseline="central"
                   font-family="'Baloo 2',cursive" font-size="16"
                   font-weight="700" fill="#4A5568">${n}</text>`;
  });

  const hx = (cx + hLen * Math.cos(hRad)).toFixed(1);
  const hy = (cy + hLen * Math.sin(hRad)).toFixed(1);
  const mx = (cx + mLen * Math.cos(mRad)).toFixed(1);
  const my = (cy + mLen * Math.sin(mRad)).toFixed(1);

  svgEl.innerHTML = `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="white" stroke="${color}" stroke-width="10"/>
    ${ticks}
    ${nums}
    <line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}"
          stroke="#2D3748" stroke-width="7" stroke-linecap="round"/>
    <line x1="${cx}" y1="${cy}" x2="${mx}" y2="${my}"
          stroke="#4A5568" stroke-width="4" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="7" fill="${color}"/>
    <circle cx="${cx}" cy="${cy}" r="3" fill="white"/>
  `;
}

// ════════════════════════════════════════════════════════════════════
//  TIME LABEL HELPERS
// ════════════════════════════════════════════════════════════════════
function timeLabelShort(h, m) {
  const display = h % 12 || 12;
  if (m === 0)  return `${HOUR_WORDS[display]} en punto`;
  if (m === 30) return `${HOUR_WORDS[display]} y media`;
  if (m === 15) return `${HOUR_WORDS[display]} y cuarto`;
  if (m === 45) {
    const next = (display % 12) + 1;
    return `${HOUR_WORDS[next]} menos cuarto`;
  }
}

// ════════════════════════════════════════════════════════════════════
//  QUESTION BUILDING
// ════════════════════════════════════════════════════════════════════
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuestions(total) {
  const allTimes = [];
  for (let h = 1; h <= 12; h++) {
    [0, 15, 30, 45].forEach(m => allTimes.push({ h, m }));
  }
  const pool = shuffle(allTimes).slice(0, total);
  return pool.map((t, i) => ({
    ...t,
    // Alternate modes: first half clock→text, second half text→clock
    mode: i < Math.floor(total / 2) ? 'clockToText' : 'textToClock'
  }));
}

function generateWrongTextOptions(h, m) {
  const result = [], used = new Set([`${h}:${m}`]);
  while (result.length < 3) {
    const rh = Math.ceil(Math.random() * 12);
    const rm = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    const key = `${rh}:${rm}`;
    if (!used.has(key)) {
      used.add(key);
      result.push({ label: timeLabelShort(rh, rm), correct: false });
    }
  }
  return result;
}

function generateWrongClockOptions(h, m) {
  const result = [], used = new Set([`${h}:${m}`]);
  while (result.length < 3) {
    const rh = Math.ceil(Math.random() * 12);
    const rm = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    const key = `${rh}:${rm}`;
    if (!used.has(key)) {
      used.add(key);
      result.push({ h: rh, m: rm, correct: false });
    }
  }
  return result;
}

// ════════════════════════════════════════════════════════════════════
//  QUESTION COUNT SELECTOR
// ════════════════════════════════════════════════════════════════════
function selectQCount(n) {
  totalQuestions = n;
  document.querySelectorAll('.q-btn').forEach(btn => {
    btn.classList.toggle('selected', parseInt(btn.dataset.count) === n);
  });
}

// ════════════════════════════════════════════════════════════════════
//  GAME FLOW
// ════════════════════════════════════════════════════════════════════
function startGame() {
  const inp = document.getElementById('playerName').value.trim();
  if (!inp) {
    const el = document.getElementById('playerName');
    el.focus(); el.style.borderColor = 'var(--coral)';
    setTimeout(() => (el.style.borderColor = ''), 1000);
    return;
  }
  playerName = inp;
  questions  = shuffle(buildQuestions(totalQuestions));
  current    = 0;
  score      = 0;

  showScreen('game');
  document.getElementById('displayName').textContent = '👤 ' + playerName;
  loadQuestion();
}

function loadQuestion() {
  const q = questions[current];
  document.getElementById('questionCount').textContent = `${current + 1} / ${totalQuestions}`;
  document.getElementById('scoreDisplay').textContent  = score;
  document.getElementById('progressBar').style.width   = `${(current / totalQuestions) * 100}%`;

  // Animate card
  const card = document.getElementById('questionCard');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = 'cardIn 0.4s cubic-bezier(.68,-0.55,.27,1.55)';

  const color    = CLOCK_COLORS[current % CLOCK_COLORS.length];
  const badgeMap = { 0: 'En Punto 🕛', 15: 'Y Cuarto 🕒', 30: 'Y Media 🕧', 45: 'Menos Cuarto 🕤' };
  document.getElementById('questionTypeBadge').textContent = badgeMap[q.m];

  const clockContainer = document.getElementById('clockContainer');
  const textDisplay    = document.getElementById('timeTextDisplay');

  if (q.mode === 'clockToText') {
    clockContainer.style.display = 'block';
    textDisplay.style.display    = 'none';
    document.getElementById('questionLabel').textContent = '¿Qué hora marca el reloj?';
    drawClock(document.getElementById('clockSVG'), q.h, q.m, color);

    const correct = timeLabelShort(q.h, q.m);
    const opts    = shuffle([{ label: correct, correct: true }, ...generateWrongTextOptions(q.h, q.m)]);
    renderTextOptions(opts);

  } else {
    clockContainer.style.display = 'none';
    textDisplay.style.display    = 'block';
    textDisplay.textContent      = timeLabelShort(q.h, q.m);
    document.getElementById('questionLabel').textContent = '¿Qué reloj muestra esa hora?';

    const opts = shuffle([{ h: q.h, m: q.m, correct: true }, ...generateWrongClockOptions(q.h, q.m)]);
    renderClockOptions(opts);
  }
}

// ── RENDER OPTIONS ───────────────────────────────────────────────────
function renderTextOptions(opts) {
  const grid = document.getElementById('optionsGrid');
  grid.innerHTML = '';
  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className   = 'option-btn';
    btn.textContent = opt.label;
    btn.onclick     = () => handleAnswer(btn, opt.correct, opt.label, null);
    grid.appendChild(btn);
  });
}

function renderClockOptions(opts) {
  const grid   = document.getElementById('optionsGrid');
  grid.innerHTML = '';
  const colors = shuffle(CLOCK_COLORS).slice(0, 4);

  opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className        = 'option-btn clock-opt';
    btn.style.padding    = '12px 8px';
    btn.dataset.isCorrect = opt.correct ? 'true' : 'false';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.style.cssText = 'width:130px;height:130px;display:block;margin:0 auto 4px';
    btn.appendChild(svg);
    btn.onclick = () => handleAnswer(btn, opt.correct, null, null);
    grid.appendChild(btn);

    setTimeout(() => drawClock(svg, opt.h, opt.m, colors[i]), 0);
  });
}

// ── HANDLE ANSWER ────────────────────────────────────────────────────
function handleAnswer(btn, isCorrect) {
  document.querySelectorAll('.option-btn').forEach(b => (b.disabled = true));

  if (isCorrect) {
    btn.classList.add('correct');
    score += 10;
    document.getElementById('scoreDisplay').textContent = score;
  } else {
    btn.classList.add('wrong');
    // Highlight correct answer
    document.querySelectorAll('.option-btn').forEach(b => {
      if (b.dataset.isCorrect === 'true') b.classList.add('correct');
    });
  }

  const q = questions[current];
  const overlay = document.getElementById('feedbackOverlay');
  overlay.classList.add('show');

  if (isCorrect) {
    document.getElementById('feedbackEmoji').textContent =
      ['🎉','🏆','⭐','🌟','✨','🥳'][Math.floor(Math.random() * 6)];
    document.getElementById('feedbackTitle').textContent =
      ['¡Correcto! 🎊','¡Genial! 🔥','¡Exacto! 💪','¡Así se hace! 🌟'][Math.floor(Math.random() * 4)];
    document.getElementById('feedbackTitle').className = 'feedback-title correct';
    launchConfetti();
  } else {
    document.getElementById('feedbackEmoji').textContent =
      ['😅','🤔','💡','🧐'][Math.floor(Math.random() * 4)];
    document.getElementById('feedbackTitle').textContent = '¡Casi! Inténtalo de nuevo 💪';
    document.getElementById('feedbackTitle').className = 'feedback-title wrong';
  }

  const hDisplay = q.h % 12 || 12;
  const mPad     = String(q.m).padStart(2, '0');
  document.getElementById('feedbackExplanation').innerHTML =
    `<strong>${hDisplay}:${mPad}</strong> se dice<br>
     <strong style="font-size:1.1em;color:var(--ocean)">${timeLabelShort(q.h, q.m)}</strong>`;
}

function nextQuestion() {
  document.getElementById('feedbackOverlay').classList.remove('show');
  current++;
  if (current >= totalQuestions) showResults();
  else loadQuestion();
}

// ── RESULTS ──────────────────────────────────────────────────────────
function showResults() {
  showScreen('results');
  stopConfetti();

  const max = totalQuestions * 10;
  const pct = score / max;

  document.getElementById('scoreBig').textContent  = score;
  document.getElementById('scoreLabel').textContent = `puntos de ${max}`;
  document.getElementById('resultName').textContent = `¡${playerName}!`;

  let mascot, msg, stars;

  if (pct === 1) {
    mascot = '🏆'; stars = '⭐⭐⭐⭐⭐';
    msg = `¡PERFECTO, ${playerName}! ¡Eres el maestro de las horas! 🎊🎊🎊`;
    launchConfetti(); launchConfetti(); launchConfetti();
  } else if (pct >= 0.9) {
    mascot = '🦸'; stars = '⭐⭐⭐⭐⭐';
    msg = `¡Súper, ${playerName}! ¡Casi perfecto! Eres un superhéroe del reloj ⚡`;
    launchConfetti();
  } else if (pct >= 0.8) {
    mascot = '😎'; stars = '⭐⭐⭐⭐';
    msg = `¡Muy bien, ${playerName}! ¡Lo has hecho genial! Sigue practicando 🚀`;
  } else if (pct >= 0.6) {
    mascot = '🐬'; stars = '⭐⭐⭐';
    msg = `¡Buen trabajo, ${playerName}! Con más práctica serás el mejor 🌈`;
  } else if (pct >= 0.4) {
    mascot = '🐣'; stars = '⭐⭐';
    msg = `¡Ánimo, ${playerName}! Estás aprendiendo. Repasa y vuelve 📚`;
  } else {
    mascot = '🌱'; stars = '⭐';
    msg = `¡No te rindas, ${playerName}! Pulsa "Repasar las horas" y vuelve a intentarlo 💡`;
  }

  document.getElementById('resultMascot').textContent  = mascot;
  document.getElementById('resultMessage').textContent = msg;
  document.getElementById('starsRow').textContent      = stars;
}

function resetGame() {
  stopConfetti();
  showScreen('welcome');
  document.getElementById('playerName').value = playerName;
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ════════════════════════════════════════════════════════════════════
//  REVIEW MODAL
// ════════════════════════════════════════════════════════════════════
function openModal() {
  document.getElementById('modalOverlay').classList.add('show');
  buildReviewClocks();
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
}
function closeModalOnBg(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

function buildReviewClocks() {
  const sections = [
    { id: 'reviewClocksPoint',   times: [{ h:3, m:0  }, { h:7,  m:0  }, { h:11, m:0  }] },
    { id: 'reviewClocksHalf',    times: [{ h:2, m:30 }, { h:6,  m:30 }, { h:9,  m:30 }] },
    { id: 'reviewClocksQuarter', times: [{ h:4, m:15 }, { h:8,  m:15 }, { h:11, m:15 }] },
    { id: 'reviewClocksMinus',   times: [{ h:1, m:45 }, { h:5,  m:45 }, { h:10, m:45 }] },
  ];

  sections.forEach(sec => {
    const cont = document.getElementById(sec.id);
    cont.innerHTML = ''; // always rebuild to ensure correct clock positions

    sec.times.forEach((t, i) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'review-clock-item';

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 200 200');
      svg.style.cssText = 'width:110px;height:110px;display:block';

      const label = document.createElement('div');
      label.className   = 'rc-label';
      label.textContent = timeLabelShort(t.h, t.m);

      wrapper.appendChild(svg);
      wrapper.appendChild(label);
      cont.appendChild(wrapper);
      drawClock(svg, t.h, t.m, CLOCK_COLORS[i * 3]);
    });
  });
}

// ════════════════════════════════════════════════════════════════════
//  CONFETTI
// ════════════════════════════════════════════════════════════════════
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function launchConfetti() {
  const colors = ['#FF6B6B','#FFD93D','#4ECDC4','#6BCB77','#A78BFA','#74B9FF','#FF8E53'];
  for (let i = 0; i < 80; i++) {
    confettiParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.3,
      r: 6 + Math.random() * 8,
      c: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 5,
      vy: 3 + Math.random() * 4,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 8,
      alpha: 1,
      life: 120 + Math.floor(Math.random() * 80)
    });
  }
  if (!confettiAF) animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confettiParticles = confettiParticles.filter(p => p.life > 0);
  confettiParticles.forEach(p => {
    p.x   += p.vx; p.y += p.vy;
    p.rot += p.rotV; p.vy += 0.1;
    p.life--;
    p.alpha = Math.min(1, p.life / 30);
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot * Math.PI / 180);
    ctx.fillStyle = p.c;
    ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r / 1.5);
    ctx.restore();
  });
  if (confettiParticles.length > 0) {
    confettiAF = requestAnimationFrame(animateConfetti);
  } else {
    confettiAF = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function stopConfetti() {
  confettiParticles = [];
  if (confettiAF) { cancelAnimationFrame(confettiAF); confettiAF = null; }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ════════════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════════════

// Floating background emojis
const bgLayer = document.getElementById('bgLayer');
for (let i = 0; i < 18; i++) {
  const el = document.createElement('div');
  el.className   = 'floating-emoji';
  el.textContent = BG_EMOJIS[Math.floor(Math.random() * BG_EMOJIS.length)];
  el.style.left            = Math.random() * 100 + 'vw';
  el.style.animationDuration = (12 + Math.random() * 20) + 's';
  el.style.animationDelay    = (Math.random() * 20) + 's';
  el.style.fontSize          = (1 + Math.random() * 1.5) + 'rem';
  bgLayer.appendChild(el);
}

// Enter key shortcut
document.getElementById('playerName').addEventListener('keydown', e => {
  if (e.key === 'Enter') startGame();
});

// Default question count selection
selectQCount(totalQuestions);

// register service worker to enable offline & installation
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker registered', reg))
      .catch(err => console.error('SW registration failed:', err));
  });
}
selectQCount(10);
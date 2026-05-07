// minuteur.js — Minuteur d'examen intégré dans exam-blanc.qmd
// Injecte un compte à rebours configurable (2h par défaut)

(function() {
  const TIMER_KEY = 'eco-exam-timer';

  function injectTimer() {
    if (document.getElementById('exam-timer')) return;

    const style = document.createElement('style');
    style.textContent = `
      #exam-timer {
        position: fixed; top: 58px; right: 1rem; z-index: 8000;
        background: #0d2b4e; color: #fff; border-radius: 0.75rem;
        padding: 0.5rem 0.9rem; font-family: Inter, monospace;
        box-shadow: 0 4px 16px rgba(0,0,0,0.25); min-width: 130px;
        border: 1.5px solid rgba(255,255,255,0.1); transition: background 0.3s;
        user-select: none;
      }
      #exam-timer.warning { background: #92400e; border-color: #f59e0b; }
      #exam-timer.danger  { background: #991b1b; border-color: #fca5a5;
        animation: pulse-timer 1s infinite; }
      @keyframes pulse-timer {
        0%,100% { opacity:1; } 50% { opacity:0.7; }
      }
      #timer-label { font-size:0.62rem; font-weight:700; text-transform:uppercase;
        letter-spacing:0.09em; opacity:0.6; margin-bottom:0.15rem; }
      #timer-display { font-size:1.35rem; font-weight:800; letter-spacing:0.05em;
        color:#f0d080; font-variant-numeric: tabular-nums; }
      #timer-controls { display:flex; gap:0.35rem; margin-top:0.4rem; }
      .tc-btn { flex:1; padding:0.25rem; border-radius:0.35rem; border:none;
        font-size:0.7rem; font-weight:700; cursor:pointer; transition:all 0.15s; }
      .tc-start { background:#16a34a; color:#fff; }
      .tc-pause { background:#f59e0b; color:#0d2b4e; }
      .tc-reset { background:#334155; color:#94a3b8; }
      .tc-btn:hover { opacity:0.85; transform:scale(1.03); }
      #timer-cfg { display:flex; gap:0.35rem; margin-bottom:0.35rem; align-items:center; }
      #timer-cfg select { background:#1e293b; color:#f0d080; border:1px solid #334155;
        border-radius:0.35rem; padding:0.2rem 0.4rem; font-size:0.78rem; font-weight:700;
        cursor:pointer; outline:none; }
    `;
    document.head.appendChild(style);

    const el = document.createElement('div');
    el.id = 'exam-timer';
    el.innerHTML = `
      <div id="timer-label">⏱ Minuteur examen</div>
      <div id="timer-cfg">
        <select id="timer-select" onchange="timerSetDuration(this.value)">
          <option value="7200">2h00</option>
          <option value="5400">1h30</option>
          <option value="3600">1h00</option>
          <option value="10800">3h00</option>
        </select>
      </div>
      <div id="timer-display">2:00:00</div>
      <div id="timer-controls">
        <button class="tc-btn tc-start" onclick="timerToggle()">▶ Start</button>
        <button class="tc-btn tc-reset" onclick="timerReset()">↺</button>
      </div>
    `;
    document.body.appendChild(el);
  }

  let totalSeconds = 7200;
  let remaining   = 7200;
  let intervalId  = null;
  let running     = false;

  function fmt(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }

  function updateDisplay() {
    const d = document.getElementById('timer-display');
    const t = document.getElementById('exam-timer');
    if (!d || !t) return;
    d.textContent = fmt(remaining);
    t.classList.remove('warning', 'danger');
    if (remaining <= 300) t.classList.add('danger');   // 5 min
    else if (remaining <= 900) t.classList.add('warning'); // 15 min
  }

  window.timerToggle = function() {
    const btn = document.querySelector('.tc-start');
    if (!running) {
      if (remaining <= 0) timerReset();
      intervalId = setInterval(() => {
        remaining--;
        updateDisplay();
        if (remaining <= 0) {
          clearInterval(intervalId);
          running = false;
          if (btn) btn.textContent = '▶ Start';
          alert('⏰ Temps écoulé ! Posez votre stylo.');
        }
      }, 1000);
      running = true;
      if (btn) btn.textContent = '⏸ Pause';
    } else {
      clearInterval(intervalId);
      running = false;
      if (btn) btn.textContent = '▶ Reprendre';
    }
  };

  window.timerReset = function() {
    clearInterval(intervalId);
    running = false;
    remaining = totalSeconds;
    updateDisplay();
    const btn = document.querySelector('.tc-start');
    if (btn) btn.textContent = '▶ Start';
    const t = document.getElementById('exam-timer');
    if (t) t.classList.remove('warning','danger');
  };

  window.timerSetDuration = function(s) {
    totalSeconds = parseInt(s);
    timerReset();
  };

  document.addEventListener('DOMContentLoaded', () => {
    // Only inject on exam-blanc page
    if (window.location.pathname.includes('exam-blanc')) {
      injectTimer();
      updateDisplay();
    }
  });
})();

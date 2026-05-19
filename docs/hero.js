// hero.js — Système de personnage fictif "L'Économiste en herbe"
// Gestion XP, niveaux, badges, avatar évolutif

(function() {

// ──────────────────────────────
// CONFIGURATION DU PERSONNAGE
// ──────────────────────────────
const HERO_KEY = 'eco-hero-v1';

const LEVELS = [
  { level: 1, title: "Étudiant Naïf",       xpRequired: 0,   avatar: "🧑‍🎓", color: "#94a3b8", desc: "Vous commencez votre parcours économique." },
  { level: 2, title: "Apprenti Analyste",    xpRequired: 50,  avatar: "📚", color: "#60a5fa", desc: "Vous maîtrisez les premières notions." },
  { level: 3, title: "Observateur du Marché",xpRequired: 120, avatar: "🔍", color: "#34d399", desc: "Vous lisez les données avec aisance." },
  { level: 4, title: "Lecteur de Conjoncture",xpRequired:220, avatar: "📊", color: "#a78bfa", desc: "Vous décryptez l'actualité économique." },
  { level: 5, title: "Analyste Confirmé",    xpRequired: 350, avatar: "🧮", color: "#f59e0b", desc: "Vous argumentez avec rigueur." },
  { level: 6, title: "Économiste Engagé",    xpRequired: 500, avatar: "🌍", color: "#ef4444", desc: "Vous pensez politiques publiques." },
  { level: 7, title: "Expert en Conjoncture",xpRequired: 700, avatar: "🏛️", color: "#ec4899", desc: "Votre regard est celui d'un expert." },
  { level: 8, title: "Grand Économiste",     xpRequired: 950, avatar: "🎓", color: "#f97316", desc: "Vous maîtrisez tous les modules !" }
];

const BADGES = [
  { id: "premier_qcm",   icon: "⚡", label: "Premier pas",       desc: "Première question réussie",         xp: 10 },
  { id: "diagnostic_ok", icon: "🎯", label: "Diagnostiqué",      desc: "Diagnostic complété",               xp: 20 },
  { id: "serie_3",       icon: "🔥", label: "En série",          desc: "3 bonnes réponses consécutives",    xp: 15 },
  { id: "module1_fini",  icon: "🔬", label: "Fondements",        desc: "Module 1 terminé (≥2/3)",           xp: 30 },
  { id: "module2_fini",  icon: "📈", label: "Croissance",        desc: "Module 2 terminé (≥2/3)",           xp: 30 },
  { id: "module3_fini",  icon: "💶", label: "Dette maîtrisée",   desc: "Module 3 terminé (≥2/3)",           xp: 30 },
  { id: "module4_fini",  icon: "👷", label: "Marché du travail", desc: "Module 4 terminé (≥2/3)",           xp: 30 },
  { id: "module5_fini",  icon: "🌐", label: "International",     desc: "Module 5 terminé (≥2/3)",           xp: 30 },
  { id: "carnet_actif",  icon: "📓", label: "Carnet actif",      desc: "Premier module du carnet rempli",   xp: 25 },
  { id: "all_modules",   icon: "🏆", label: "Complet !",         desc: "Les 5 modules terminés",            xp: 100 },
  { id: "perfectionniste",icon:"💎", label: "Perfectionniste",   desc: "100% dans un module",               xp: 50 },
  { id: "veloce",        icon: "⚡", label: "Véloce",            desc: "5 questions en une seule session",  xp: 20 }
];

// XP par bonne réponse
const XP_CORRECT   = 15;
const XP_INCORRECT = 2;  // consolation

// ──────────────────────────────
// DONNÉES
// ──────────────────────────────
function loadHero() {
  try {
    return JSON.parse(localStorage.getItem(HERO_KEY) || '{}');
  } catch(e) { return {}; }
}
function saveHero(hero) {
  try { localStorage.setItem(HERO_KEY, JSON.stringify(hero)); } catch(e) {}
}

function getDefaultHero() {
  return {
    xp: 0,
    level: 1,
    badges: [],
    streak: 0,       // bonnes réponses consécutives
    sessionAnswers: 0, // réponses dans la session actuelle
    name: "Étudiant·e",
    totalCorrect: 0,
    totalAnswered: 0
  };
}

function getHeroState() {
  const stored = loadHero();
  return Object.assign(getDefaultHero(), stored);
}

// ──────────────────────────────
// CALCUL DE NIVEAU
// ──────────────────────────────
function getLevelForXP(xp) {
  let lvl = LEVELS[0];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) { lvl = LEVELS[i]; break; }
  }
  return lvl;
}

function getNextLevel(level) {
  return LEVELS.find(l => l.level === level + 1) || null;
}

function getXPProgress(xp) {
  const current = getLevelForXP(xp);
  const next    = getNextLevel(current.level);
  if (!next) return { pct: 100, xpInLevel: 0, xpNeeded: 0 };
  const xpInLevel = xp - current.xpRequired;
  const xpNeeded  = next.xpRequired - current.xpRequired;
  return { pct: Math.round((xpInLevel / xpNeeded) * 100), xpInLevel, xpNeeded };
}

// ──────────────────────────────
// ATTRIBUTION XP & BADGES
// ──────────────────────────────
function awardXP(amount, reason) {
  const hero = getHeroState();
  hero.xp = (hero.xp || 0) + amount;
  const newLevel = getLevelForXP(hero.xp);
  const leveled  = newLevel.level > (hero.level || 1);
  hero.level = newLevel.level;
  saveHero(hero);
  recordXPHistory(hero.xp);
  if (leveled) triggerLevelUp(newLevel);
  setTimeout(checkQuests, 100);
  refreshHeroWidget();
  return hero;
}

function unlockBadge(badgeId) {
  const hero = getHeroState();
  if (hero.badges.includes(badgeId)) return false;
  const badge = BADGES.find(b => b.id === badgeId);
  if (!badge) return false;
  hero.badges.push(badgeId);
  hero.xp = (hero.xp || 0) + badge.xp;
  hero.level = getLevelForXP(hero.xp).level;
  saveHero(hero);
  triggerBadge(badge);
  refreshHeroWidget();
  return true;
}

// ──────────────────────────────
// VÉRIFICATIONS AUTOMATIQUES
// ──────────────────────────────
function checkBadgesAfterQCM(qcmId, isCorrect) {
  const scores = JSON.parse(localStorage.getItem('eco-scores') || '{}');
  const hero   = getHeroState();

  // Premier QCM réussi
  if (isCorrect && hero.totalCorrect === 0) unlockBadge('premier_qcm');

  // Diagnostic complet (d1 à d5 tous répondus)
  const diagIds = ['d1','d2','d3','d4','d5'];
  if (diagIds.every(id => id in scores)) unlockBadge('diagnostic_ok');

  // Modules terminés
  const moduleQCMs = {
    module1_fini: ['m1q1','m1q2','m1q3'],
    module2_fini: ['m2q1','m2q2','m2q3'],
    module3_fini: ['m3q1','m3q2','m3q3'],
    module4_fini: ['m4q1','m4q2','m4q3'],
    module5_fini: ['m5q1','m5q2','m5q3']
  };
  Object.entries(moduleQCMs).forEach(([badge, ids]) => {
    const done    = ids.filter(id => id in scores);
    const correct = done.filter(id => scores[id] === 1).length;
    if (done.length === ids.length && correct >= 2) unlockBadge(badge);
    if (done.length === ids.length && correct === ids.length) unlockBadge('perfectionniste');
  });

  // Tous les modules
  const allModuleBadges = ['module1_fini','module2_fini','module3_fini','module4_fini','module5_fini'];
  if (allModuleBadges.every(b => hero.badges.includes(b))) unlockBadge('all_modules');
}

function checkCarnetBadge() {
  try {
    const data   = JSON.parse(localStorage.getItem('eco-carnet-v1') || '{}');
    const hasAny = Object.values(data).some(v => v && v.trim().length > 0);
    if (hasAny) unlockBadge('carnet_actif');
  } catch(e) {}
}

// ──────────────────────────────
// NOTIFICATIONS
// ──────────────────────────────
function triggerLevelUp(levelData) {
  showToast(`🎉 Niveau ${levelData.level} — ${levelData.title} !`, '#1a5c96', 4000);
}
function triggerBadge(badge) {
  showToast(`${badge.icon} Badge débloqué : « ${badge.label} » +${badge.xp} XP`, '#1e6b45', 3500);
}

function showToast(msg, bg, duration) {
  let t = document.getElementById('hero-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'hero-toast';
    t.style.cssText = `position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;
      padding:0.8rem 1.2rem;border-radius:0.65rem;font-weight:600;font-size:0.9rem;
      color:#fff;box-shadow:0 4px 16px rgba(0,0,0,0.2);
      transition:opacity 0.3s;opacity:0;pointer-events:none;max-width:320px;`;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.background = bg;
  t.style.opacity = '1';
  clearTimeout(t._timeout);
  t._timeout = setTimeout(() => { t.style.opacity = '0'; }, duration || 3000);
}

// ──────────────────────────────
// WIDGET HÉROS (sidebar / accueil)
// ──────────────────────────────
function buildHeroWidget(containerId) {
  const hero   = getHeroState();
  const level  = getLevelForXP(hero.xp);
  const prog   = getXPProgress(hero.xp);
  const next   = getNextLevel(level.level);
  const earned = BADGES.filter(b => hero.badges.includes(b.id));

  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = `
    <div style="background:#0d2b4e;color:#fff;border-radius:0.85rem;padding:1.25rem 1.4rem;font-family:Inter,sans-serif;">
      <div style="display:flex;align-items:center;gap:0.85rem;margin-bottom:1rem;">
        <div style="font-size:2.4rem;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${level.avatar}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;opacity:0.6;text-transform:uppercase;">Niveau ${level.level}</div>
          <div style="font-size:1rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${level.title}</div>
          <div style="font-size:0.78rem;opacity:0.75;margin-top:0.1rem;">${level.desc}</div>
        </div>
      </div>

      <div style="margin-bottom:0.4rem;display:flex;justify-content:space-between;font-size:0.75rem;opacity:0.8;">
        <span><strong style="color:#f0d080;">${hero.xp} XP</strong></span>
        <span>${next ? next.xpRequired + ' XP requis' : 'Niveau max !'}</span>
      </div>
      <div style="background:rgba(255,255,255,0.15);border-radius:999px;height:7px;overflow:hidden;">
        <div style="background:linear-gradient(90deg,#e8a020,#f0d080);height:100%;width:${prog.pct}%;border-radius:999px;transition:width 0.6s ease;"></div>
      </div>

      ${earned.length > 0 ? `
      <div style="margin-top:1rem;">
        <div style="font-size:0.7rem;font-weight:700;opacity:0.55;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem;">Badges obtenus</div>
        <div style="display:flex;flex-wrap:wrap;gap:0.35rem;">
          ${earned.map(b => `<span title="${b.label} — ${b.desc}" style="font-size:1.2rem;cursor:default;">${b.icon}</span>`).join('')}
        </div>
      </div>` : ''}

      <div style="margin-top:0.85rem;display:flex;justify-content:space-between;font-size:0.78rem;opacity:0.65;border-top:1px solid rgba(255,255,255,0.12);padding-top:0.65rem;">
        <span>✓ ${hero.totalCorrect || 0} réponses justes</span>
        <span>🏅 ${earned.length}/${BADGES.length} badges</span>
      </div>
    </div>
  `;
}

function refreshHeroWidget() {
  ['hero-widget', 'hero-widget-bilan', 'hero-widget-index'].forEach(id => {
    if (document.getElementById(id)) buildHeroWidget(id);
  });
}

// ──────────────────────────────
// INTÉGRATION AVEC LE MOTEUR QCM
// ──────────────────────────────
// On surcharge le initQCM pour y injecter la logique XP
const _originalInitQCM = window.initQCM;
window.initQCM = function(id, correctIdx, explication) {
  // Lance le QCM original
  if (_originalInitQCM) _originalInitQCM(id, correctIdx, explication);

  // On attend que le bouton existe et on l'intercepte
  setTimeout(() => {
    const container = document.getElementById(id);
    if (!container) return;
    const btn = container.querySelector('.qcm-btn');
    if (!btn) return;

    btn.addEventListener('click', function onHeroClick() {
      // Attendre un tick pour que qcm.js ait traité le résultat
      setTimeout(() => {
        const scores = JSON.parse(localStorage.getItem('eco-scores') || '{}');
        if (!(id in scores)) return; // pas encore enregistré
        const isCorrect = scores[id] === 1;

        const hero = getHeroState();
        hero.totalAnswered = (hero.totalAnswered || 0) + 1;
        hero.sessionAnswers = (hero.sessionAnswers || 0) + 1;

        if (isCorrect) {
          hero.totalCorrect = (hero.totalCorrect || 0) + 1;
          hero.streak = (hero.streak || 0) + 1;
          // XP de base
          hero.xp = (hero.xp || 0) + XP_CORRECT;
          if (hero.streak >= 3) {
            // Bonus streak
            hero.xp += 5;
            if (hero.streak === 3) showToast('🔥 Série de 3 ! Bonus XP x2', '#9333ea', 2500);
          }
        } else {
          hero.streak = 0;
          hero.xp = (hero.xp || 0) + XP_INCORRECT;
        }

        // Session answers badge
        if (hero.sessionAnswers >= 5) unlockBadge('veloce');
        if (hero.streak >= 3) unlockBadge('serie_3');

        hero.level = getLevelForXP(hero.xp).level;
        const oldLevel = getLevelForXP(hero.xp - (isCorrect ? XP_CORRECT : XP_INCORRECT)).level;
        saveHero(hero);
        if (hero.level > oldLevel) triggerLevelUp(getLevelForXP(hero.xp));
        checkBadgesAfterQCM(id, isCorrect);
        refreshHeroWidget();
      }, 50);

      btn.removeEventListener('click', onHeroClick);
    }, { once: true });
  }, 100);
};

// ──────────────────────────────
// INIT & EXPORT
// ──────────────────────────────
// ──────────────────────────────
// QUÊTES HEBDOMADAIRES
// ──────────────────────────────
const QUESTS = [
  { id:'q_qcm3', label:'Répondre à 3 QCM', icon:'🎯',
    xpReward:25, check: (h) => (h.totalAnswered||0) >= 3 },
  { id:'q_correct5', label:'5 bonnes réponses', icon:'✅',
    xpReward:35, check: (h) => (h.totalCorrect||0) >= 5 },
  { id:'q_streak3', label:'3 réponses consécutives', icon:'🔥',
    xpReward:30, check: (h) => (h.streak||0) >= 3 },
  { id:'q_flashcards', label:'Terminer une série de flashcards', icon:'🃏',
    xpReward:20, check: (h) => (h.flashcardsDone||0) >= 1 },
  { id:'q_speed', label:'Terminer un Speed Round', icon:'⚡',
    xpReward:30, check: (h) => (h.speedRoundsDone||0) >= 1 },
  { id:'q_calcul', label:'Réussir un exercice de calcul', icon:'🧮',
    xpReward:25, check: (h) => (h.calculsDone||0) >= 1 },
  { id:'q_2modules', label:'Compléter 2 modules (≥2/3)', icon:'📚',
    xpReward:50, check: (h) => {
      const scores = JSON.parse(localStorage.getItem('eco-scores')||'{}');
      const mods = ['m1','m2','m3','m4','m5'];
      let done = 0;
      mods.forEach(m => {
        const ids = [`${m}q1`,`${m}q2`,`${m}q3`];
        const correct = ids.filter(id => scores[id]===1).length;
        if (correct >= 2) done++;
      });
      return done >= 2;
    }
  },
  { id:'q_xp100', label:'Accumuler 100 XP', icon:'🏅',
    xpReward:20, check: (h) => (h.xp||0) >= 100 },
];

const QUEST_RESET_KEY = 'eco-quest-week';

function getWeekKey() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week  = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}

function getQuestState() {
  try {
    const data = JSON.parse(localStorage.getItem(QUEST_RESET_KEY) || '{}');
    if (data.week !== getWeekKey()) {
      // New week — pick 3 random quests, reset completed
      const picked = [...QUESTS].sort(() => Math.random()-0.5).slice(0,3).map(q => q.id);
      const fresh = { week: getWeekKey(), picked, completed: [] };
      localStorage.setItem(QUEST_RESET_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return data;
  } catch(e) {
    return { week: getWeekKey(), picked: QUESTS.slice(0,3).map(q=>q.id), completed: [] };
  }
}

function checkQuests() {
  const hero  = getHeroState();
  const state = getQuestState();
  let changed = false;
  state.picked.forEach(qid => {
    if (state.completed.includes(qid)) return;
    const quest = QUESTS.find(q => q.id === qid);
    if (quest && quest.check(hero)) {
      state.completed.push(qid);
      hero.xp = (hero.xp||0) + quest.xpReward;
      hero.level = getLevelForXP(hero.xp).level;
      saveHero(hero);
      changed = true;
      showToast(`🎯 Quête accomplie : ${quest.label} ! +${quest.xpReward} XP`, '#7c3aed', 4000);
    }
  });
  if (changed) {
    localStorage.setItem(QUEST_RESET_KEY, JSON.stringify(state));
    refreshHeroWidget();
  }
}

function buildQuestWidget(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const state  = getQuestState();
  const hero   = getHeroState();
  const active = state.picked.map(id => QUESTS.find(q => q.id === id)).filter(Boolean);

  el.innerHTML = `
    <div style="background:#1e293b;color:#fff;border-radius:0.85rem;padding:1.1rem 1.25rem;font-family:Inter,sans-serif;margin-top:0.75rem;">
      <div style="font-size:0.68rem;font-weight:700;letter-spacing:0.1em;opacity:0.55;text-transform:uppercase;margin-bottom:0.75rem;">
        🎯 Quêtes de la semaine
      </div>
      ${active.map(q => {
        const done = state.completed.includes(q.id);
        const prog = q.check(hero);
        return `
        <div style="display:flex;align-items:center;gap:0.65rem;margin-bottom:0.55rem;opacity:${done?0.6:1};">
          <div style="font-size:1.1rem;">${done?'✅':q.icon}</div>
          <div style="flex:1;font-size:0.82rem;font-weight:600;
            ${done?'text-decoration:line-through;color:#94a3b8;':'color:#e2e8f0;'}">${q.label}</div>
          <div style="font-size:0.72rem;font-weight:700;color:${done?'#34d399':'#f0d080'};">
            ${done?'Fait !':'+'+q.xpReward+' XP'}
          </div>
        </div>`;
      }).join('')}
      <div style="font-size:0.7rem;opacity:0.45;margin-top:0.5rem;">
        Reset dans ${7 - new Date().getDay()} jour(s)
      </div>
    </div>`;
}

// ──────────────────────────────
// HISTORIQUE XP
// ──────────────────────────────
const XP_HISTORY_KEY = 'eco-xp-history';
const MAX_HISTORY    = 30; // jours

function recordXPHistory(newXP) {
  try {
    const history = JSON.parse(localStorage.getItem(XP_HISTORY_KEY) || '[]');
    const today = new Date().toISOString().slice(0,10);
    const last  = history[history.length-1];
    if (last && last.date === today) {
      last.xp = newXP;
    } else {
      history.push({ date: today, xp: newXP });
      if (history.length > MAX_HISTORY) history.shift();
    }
    localStorage.setItem(XP_HISTORY_KEY, JSON.stringify(history));
  } catch(e) {}
}

function getXPHistory() {
  try {
    return JSON.parse(localStorage.getItem(XP_HISTORY_KEY) || '[]');
  } catch(e) { return []; }
}

function buildXPHistoryChart(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const history = getXPHistory();
  if (history.length < 2) {
    el.innerHTML = '<div style="font-size:0.8rem;color:#94a3b8;font-style:italic;padding:0.5rem 0;">Continuez à jouer pour voir votre progression XP ici !</div>';
    return;
  }

  const W = 380, H = 80;
  const pad = { l:32, r:8, t:8, b:20 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const maxXP = Math.max(...history.map(h=>h.xp), 1);
  const minXP = Math.min(...history.map(h=>h.xp));

  const pts = history.map((h,i) => {
    const x = pad.l + i * iw / (history.length-1);
    const y = pad.t + ih * (1 - (h.xp - minXP) / (maxXP - minXP || 1));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const area = [
    `${pad.l},${H-pad.b}`,
    ...history.map((h,i) => {
      const x = pad.l + i * iw / (history.length-1);
      const y = pad.t + ih * (1 - (h.xp - minXP) / (maxXP - minXP || 1));
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }),
    `${pad.l + iw},${H-pad.b}`
  ].join(' ');

  const last = history[history.length-1];
  const prev = history[history.length-2];
  const delta = last.xp - prev.xp;

  el.innerHTML = `
    <div style="margin-top:0.85rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem;">
        <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;opacity:0.55;">Historique XP (${history.length} jours)</div>
        <div style="font-size:0.78rem;font-weight:700;color:${delta>=0?'#34d399':'#f87171'};">
          ${delta>=0?'+':''}${delta} XP vs hier
        </div>
      </div>
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px;">
        <polygon points="${area}" fill="rgba(240,208,128,0.15)"/>
        <polyline points="${pts}" fill="none" stroke="#f0d080" stroke-width="2"/>
        <text x="${pad.l}" y="${H-5}" font-size="9" fill="rgba(255,255,255,0.4)">${history[0].date.slice(5)}</text>
        <text x="${W-pad.r}" y="${H-5}" font-size="9" fill="rgba(255,255,255,0.4)" text-anchor="end">${last.date.slice(5)}</text>
        <text x="${pad.l-2}" y="${pad.t+5}" font-size="8" fill="rgba(255,255,255,0.4)" text-anchor="end">${maxXP}</text>
      </svg>
    </div>`;
}

// ──────────────────────────────
// PARTAGE DE SCORE
// ──────────────────────────────
function buildShareWidget(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const hero  = getHeroState();
  const level = getLevelForXP(hero.xp||0);
  const earned = BADGES.filter(b => (hero.badges||[]).includes(b.id));

  el.innerHTML = `
    <div style="margin-top:0.75rem;">
      <button onclick="shareScore()" style="width:100%;padding:0.6rem;border-radius:0.5rem;
        border:1.5px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);
        color:#fff;font-weight:700;font-size:0.82rem;cursor:pointer;
        font-family:Inter,sans-serif;transition:all 0.18s;"
        onmouseover="this.style.background='rgba(255,255,255,0.15)'"
        onmouseout="this.style.background='rgba(255,255,255,0.08)'">
        📤 Partager mon niveau
      </button>
    </div>`;
}

window.shareScore = function() {
  const hero  = getHeroState();
  const level = getLevelForXP(hero.xp||0);
  const earned = BADGES.filter(b => (hero.badges||[]).includes(b.id));
  const text = `🎓 Économie Contemporaine — L1 EG\n${level.avatar} Niveau ${level.level} : ${level.title}\n⚡ ${hero.xp||0} XP · ✓ ${hero.totalCorrect||0} réponses · 🏅 ${earned.length} badges\n${earned.slice(0,5).map(b=>b.icon).join('')}`;

  if (navigator.share) {
    navigator.share({ title: 'Mon niveau Économie', text }).catch(()=>{});
  } else {
    navigator.clipboard?.writeText(text).then(() => {
      showToast('📋 Copié dans le presse-papiers !', '#1a5c96', 2500);
    }).catch(() => {
      prompt('Copiez ce texte pour le partager :', text);
    });
  }
};

window.HeroSystem = {
  getState: getHeroState,
  awardXP,
  unlockBadge,
  checkCarnetBadge,
  checkQuests,
  buildHeroWidget,
  buildQuestWidget,
  buildXPHistoryChart,
  buildShareWidget,
  refreshHeroWidget,
  LEVELS,
  BADGES,
  QUESTS,
  getLevelForXP,
  getXPProgress,
  getXPHistory,
  recordXPHistory,
};

document.addEventListener('DOMContentLoaded', () => {
  refreshHeroWidget();
  // Patcher le saveModule du carnet pour vérifier badge
  const origSave = window.saveModule;
  if (origSave) {
    window.saveModule = function(mod) {
      origSave(mod);
      checkCarnetBadge();
    };
  }
});

})();

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
  if (leveled) triggerLevelUp(newLevel);
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
window.HeroSystem = {
  getState: getHeroState,
  awardXP,
  unlockBadge,
  checkCarnetBadge,
  buildHeroWidget,
  refreshHeroWidget,
  LEVELS,
  BADGES,
  getLevelForXP,
  getXPProgress
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

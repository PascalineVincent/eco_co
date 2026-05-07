// eco-global.js — Améliorations globales du site
// Dark mode · Barre de progression navbar · Reprendre où j'en étais · Notion du jour

(function() {
'use strict';

// ═══════════════════════════════════════════
// 1. DARK MODE
// ═══════════════════════════════════════════
const DARK_KEY = 'eco-dark-mode';

function initDarkMode() {
  const saved = localStorage.getItem(DARK_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved !== null ? saved === '1' : prefersDark;
  if (isDark) document.documentElement.classList.add('dark-mode');
  injectDarkStyles();
  addDarkToggle();
}

function injectDarkStyles() {
  if (document.getElementById('dark-mode-styles')) return;
  const style = document.createElement('style');
  style.id = 'dark-mode-styles';
  style.textContent = `
    :root {
      --dm-bg: #0f172a;
      --dm-bg2: #1e293b;
      --dm-bg3: #334155;
      --dm-text: #e2e8f0;
      --dm-text2: #94a3b8;
      --dm-border: #334155;
      --dm-link: #60a5fa;
      --dm-card: #1e293b;
    }
    html.dark-mode body,
    html.dark-mode .quarto-container,
    html.dark-mode main {
      background-color: var(--dm-bg) !important;
      color: var(--dm-text) !important;
    }
    html.dark-mode .navbar,
    html.dark-mode .navbar-default {
      background-color: #0d1b2e !important;
      border-bottom: 1px solid var(--dm-border) !important;
    }
    html.dark-mode .navbar a,
    html.dark-mode .navbar .nav-link,
    html.dark-mode .navbar-brand {
      color: #cbd5e1 !important;
    }
    html.dark-mode .navbar .dropdown-menu {
      background-color: #1e293b !important;
      border: 1px solid var(--dm-border) !important;
    }
    html.dark-mode .navbar .dropdown-item {
      color: #cbd5e1 !important;
    }
    html.dark-mode .navbar .dropdown-item:hover {
      background-color: var(--dm-bg3) !important;
    }
    html.dark-mode h1, html.dark-mode h2, html.dark-mode h3,
    html.dark-mode h4, html.dark-mode h5, html.dark-mode h6 {
      color: #f1f5f9 !important;
    }
    html.dark-mode p, html.dark-mode li, html.dark-mode td, html.dark-mode th {
      color: var(--dm-text) !important;
    }
    html.dark-mode .card, html.dark-mode .callout,
    html.dark-mode [class*="callout"] {
      background-color: var(--dm-card) !important;
      border-color: var(--dm-border) !important;
    }
    html.dark-mode .callout-title {
      background-color: #1e3a5f !important;
    }
    html.dark-mode table {
      color: var(--dm-text) !important;
      background-color: var(--dm-card) !important;
    }
    html.dark-mode tbody td {
      color: var(--dm-text) !important;
      border-bottom-color: var(--dm-border) !important;
    }
    html.dark-mode tbody tr:nth-child(even) {
      background-color: #273549 !important;
    }
    html.dark-mode thead th {
      background-color: #0d2b4e !important;
      color: #fff !important;
    }
    html.dark-mode input, html.dark-mode textarea, html.dark-mode select {
      background-color: var(--dm-bg2) !important;
      color: var(--dm-text) !important;
      border-color: var(--dm-border) !important;
    }
    html.dark-mode .qcm-container, html.dark-mode .qi,
    html.dark-mode [id^="qcm-"] {
      background-color: var(--dm-card) !important;
      border-color: var(--dm-border) !important;
    }
    html.dark-mode .ch, html.dark-mode .qcm-choice {
      background-color: var(--dm-bg2) !important;
      border-color: var(--dm-border) !important;
      color: var(--dm-text) !important;
    }
    html.dark-mode .ch:hover:not(.locked) {
      background-color: #1e3a5f !important;
      border-color: #60a5fa !important;
    }
    html.dark-mode a { color: var(--dm-link) !important; }
    html.dark-mode .sidebar, html.dark-mode #quarto-sidebar {
      background-color: var(--dm-bg2) !important;
    }
    html.dark-mode footer, html.dark-mode .nav-footer {
      background-color: #0d1b2e !important;
      border-top-color: var(--dm-border) !important;
      color: var(--dm-text2) !important;
    }
    html.dark-mode code, html.dark-mode pre {
      background-color: #1e293b !important;
      color: #a5f3fc !important;
    }
    /* Dark toggle button */
    #dark-toggle {
      position: fixed; bottom: 1.25rem; left: 1.25rem; z-index: 9990;
      width: 42px; height: 42px; border-radius: 50%;
      background: #1e293b; border: 1.5px solid #334155;
      cursor: pointer; font-size: 1.15rem;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: all 0.2s; color: #f0d080;
    }
    #dark-toggle:hover { transform: scale(1.1); }
    html:not(.dark-mode) #dark-toggle { background: #fff; border-color: #e2e8f0; color: #475569; }
  `;
  document.head.appendChild(style);
}

function addDarkToggle() {
  if (document.getElementById('dark-toggle')) return;
  const btn = document.createElement('button');
  btn.id = 'dark-toggle';
  btn.title = 'Basculer mode sombre / clair';
  btn.innerHTML = document.documentElement.classList.contains('dark-mode') ? '☀️' : '🌙';
  btn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark-mode');
    localStorage.setItem(DARK_KEY, isDark ? '1' : '0');
    btn.innerHTML = isDark ? '☀️' : '🌙';
  });
  document.body.appendChild(btn);
}

// ═══════════════════════════════════════════
// 2. BARRE DE PROGRESSION GLOBALE (navbar)
// ═══════════════════════════════════════════
const ALL_QCM_IDS = ['d1','d2','d3','d4','d5',
  'm1q1','m1q2','m1q3','m2q1','m2q2','m2q3',
  'm3q1','m3q2','m3q3','m4q1','m4q2','m4q3','m5q1','m5q2','m5q3'];

function initProgressBar() {
  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #global-progress-bar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
      height: 3px; background: transparent; pointer-events: none;
    }
    #global-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #e8a020, #f0d080);
      transition: width 0.6s ease;
      box-shadow: 0 0 6px rgba(240,208,128,0.6);
    }
    #global-progress-tooltip {
      position: fixed; top: 6px; right: 12px; z-index: 9998;
      font-size: 0.7rem; font-weight: 700; color: #f0d080;
      background: rgba(13,27,78,0.85); padding: 2px 8px;
      border-radius: 999px; pointer-events: none;
      opacity: 0; transition: opacity 0.3s;
      font-family: Inter, sans-serif;
    }
  `;
  document.head.appendChild(style);

  const bar = document.createElement('div');
  bar.id = 'global-progress-bar';
  bar.innerHTML = '<div id="global-progress-fill" style="width:0%"></div>';
  document.body.prepend(bar);

  const tip = document.createElement('div');
  tip.id = 'global-progress-tooltip';
  document.body.appendChild(tip);

  // Show tooltip on hover of bar
  bar.addEventListener('mouseenter', () => { tip.style.opacity = '1'; });
  bar.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });

  updateProgressBar();
}

function updateProgressBar() {
  try {
    const scores = JSON.parse(localStorage.getItem('eco-scores') || '{}');
    const done = ALL_QCM_IDS.filter(id => id in scores).length;
    const pct = Math.round(done / ALL_QCM_IDS.length * 100);
    const fill = document.getElementById('global-progress-fill');
    const tip  = document.getElementById('global-progress-tooltip');
    if (fill) fill.style.width = pct + '%';
    if (tip)  tip.textContent = `Cours : ${pct}% (${done}/${ALL_QCM_IDS.length} QCM)`;
  } catch(e) {}
}

// ═══════════════════════════════════════════
// 3. DERNIÈRE PAGE VISITÉE
// ═══════════════════════════════════════════
const LAST_PAGE_KEY = 'eco-last-page';
const PAGE_LABELS = {
  'diagnostic.html': 'Diagnostic',
  'modules/m1-principes.html': 'Module 1 — Grands principes',
  'modules/m2-croissance.html': 'Module 2 — Croissance',
  'modules/m3-dette.html': 'Module 3 — Dette publique',
  'modules/m4-chomage.html': 'Module 4 — Chômage',
  'modules/m5-international.html': 'Module 5 — International',
  'modules/exam-blanc.html': 'Examen blanc',
  'modules/personnage.html': 'Mon personnage',
  'fil-rouge.html': 'Fil rouge',
  'glossaire.html': 'Glossaire',
  'carnet.html': 'Carnet de bord',
  'bilan.html': 'Mon bilan',
};

function trackLastPage() {
  const path = window.location.pathname;
  // Find relative path key
  const key = Object.keys(PAGE_LABELS).find(k => path.endsWith(k));
  if (key && !path.endsWith('index.html') && !path.endsWith('/')) {
    localStorage.setItem(LAST_PAGE_KEY, JSON.stringify({ url: path, label: PAGE_LABELS[key], time: Date.now() }));
  }
}

function showResumeButton() {
  // Only on index page
  if (!window.location.pathname.match(/\/(index\.html)?$/)) return;
  try {
    const data = JSON.parse(localStorage.getItem(LAST_PAGE_KEY) || 'null');
    if (!data) return;
    const age = (Date.now() - data.time) / 1000 / 60; // minutes
    if (age > 60 * 24 * 7) return; // ignore if > 7 days

    const btn = document.createElement('a');
    btn.href = data.url;
    btn.id = 'resume-btn';
    btn.innerHTML = `▶ Reprendre : <strong>${data.label}</strong>`;
    btn.style.cssText = `
      display:inline-flex; align-items:center; gap:0.5rem;
      background:#0d2b4e; color:#f0d080; font-weight:600;
      padding:0.6rem 1.2rem; border-radius:0.6rem;
      text-decoration:none; font-size:0.9rem;
      box-shadow:0 2px 8px rgba(0,0,0,0.15);
      transition:all 0.2s; margin: 0.75rem 0 0.25rem;
      border: 1.5px solid rgba(240,208,128,0.3);
      font-family: Inter, sans-serif;
    `;
    btn.addEventListener('mouseenter', () => { btn.style.background = '#1a3f6e'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = '#0d2b4e'; });

    // Insert after hero widget or after progress section
    const target = document.getElementById('hero-widget-index')
      || document.getElementById('score-global')?.closest('div');
    if (target) {
      target.parentNode.insertBefore(btn, target.nextSibling);
    } else {
      const main = document.querySelector('main') || document.body;
      main.prepend(btn);
    }
  } catch(e) {}
}

// ═══════════════════════════════════════════
// 4. NOTION DU JOUR (index uniquement)
// ═══════════════════════════════════════════
const NOTIONS = [
  { terme:"Coût d'opportunité", def:"La valeur de la meilleure option sacrifiée lors d'un choix économique.", ex:"Aller en cours plutôt que travailler = renoncer à son salaire horaire.", module:"M1" },
  { terme:"Bien public", def:"Bien non-rival (ma conso ne réduit pas celle d'autrui) et non-excluable (on ne peut en priver personne).", ex:"Défense nationale, phare maritime, météorologie.", module:"M1" },
  { terme:"Externalité négative", def:"Coût imposé à des tiers par l'activité d'un agent, sans compensation via le marché.", ex:"La pollution d'une usine sur les riverains.", module:"M1" },
  { terme:"PIB", def:"Valeur marchande de l'ensemble des biens et services finaux produits sur le territoire en un an.", ex:"Le PIB de la France est d'environ 2 800 Md€ (2023).", module:"M2" },
  { terme:"Valeur ajoutée", def:"Valeur créée par une entreprise = chiffre d'affaires − consommations intermédiaires.", ex:"Boulangerie CA 200k€ − farine 40k€ = VA 160k€.", module:"M2" },
  { terme:"PTF (productivité totale des facteurs)", def:"Part de la croissance non expliquée par l'accumulation de capital et de travail. Reflète le progrès technique.", ex:"Le 'résidu de Solow' explique ~50 % de la croissance à long terme.", module:"M2" },
  { terme:"IDH", def:"Indice synthétique combinant espérance de vie, éducation et revenu par habitant.", ex:"La France a un IDH de 0,910 (rang 26 mondial, 2023).", module:"M2" },
  { terme:"Déficit budgétaire", def:"Situation où les dépenses de l'État excèdent ses recettes sur une année.", ex:"Déficit français : ~5,5 % du PIB en 2024, au-dessus du seuil de Maastricht de 3 %.", module:"M3" },
  { terme:"Critères de Maastricht", def:"Règles européennes : déficit public < 3 % du PIB et dette publique < 60 % du PIB.", ex:"La France dépasse les deux critères en 2024.", module:"M3" },
  { terme:"Multiplicateur keynésien", def:"Effet amplificateur d'une dépense publique sur le PIB : 1 € injecté génère plus d'1 € de croissance.", ex:"Si le multiplicateur est 1,5, une relance de 10 Md€ génère +15 Md€ de PIB.", module:"M3" },
  { terme:"Chômage structurel", def:"Inadéquation durable entre les compétences des chômeurs et les emplois disponibles.", ex:"Un comptable déplacé par un logiciel d'IA sans formation à la reconversion.", module:"M4" },
  { terme:"Taux de chômage (BIT)", def:"(Chômeurs / population active) × 100. Le chômeur BIT est sans emploi, disponible et en recherche active.", ex:"Taux de chômage français : ~7,3 % au T3 2024.", module:"M4" },
  { terme:"Politiques actives de l'emploi", def:"Mesures visant à améliorer l'employabilité des chômeurs (formation, apprentissage, aides à l'embauche).", ex:"Le plan d'investissement dans les compétences (PIC) en France.", module:"M4" },
  { terme:"Courbe de Phillips", def:"Relation inverse entre inflation et chômage à court terme. À long terme, elle est verticale au NAIRU.", ex:"Friedman-Phelps (1968) : l'arbitrage disparaît quand les agents anticipent l'inflation.", module:"M4" },
  { terme:"Avantage comparatif", def:"Principe de Ricardo : se spécialiser là où le désavantage relatif est le plus faible.", ex:"Même si la France est plus productive dans tout, elle exporte là où elle est relativement la meilleure.", module:"M5" },
  { terme:"Taux de change réel", def:"Taux nominal corrigé de l'inflation relative des deux pays. Mesure la compétitivité-prix.", ex:"Si l'euro s'apprécie, les exportations françaises coûtent plus cher à l'étranger.", module:"M5" },
  { terme:"Balance commerciale", def:"Exportations − Importations de biens et services. Positive = excédent, négative = déficit.", ex:"La France affiche structurellement un déficit commercial (~73 Md€ en 2023).", module:"M5" },
  { terme:"Destruction créatrice", def:"Processus schumpétérien : l'innovation détruit des activités obsolètes et en crée de nouvelles.", ex:"L'IA générative remplace certains métiers cognitifs mais en crée d'autres (data scientist…).", module:"M2" },
  { terme:"Effet d'éviction", def:"L'emprunt public fait monter les taux d'intérêt et décourage l'investissement privé.", ex:"Argument libéral contre le financement du déficit par la dette.", module:"M3" },
  { terme:"Flexisécurité", def:"Modèle danois : flexibilité d'embauche/licenciement + allocations généreuses + formation active.", ex:"Le Danemark combine un faible chômage (~5 %) et une grande mobilité du marché du travail.", module:"M4" },
];

function showNotionDuJour() {
  if (!window.location.pathname.match(/\/(index\.html)?$/)) return;

  // Pick notion based on day of year (stable sur 24h)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const notion = NOTIONS[dayOfYear % NOTIONS.length];

  const el = document.createElement('div');
  el.id = 'notion-du-jour';
  el.innerHTML = `
    <div style="background:linear-gradient(135deg,#fffdf5,#fef9ec);border:1.5px solid #f59e0b;
      border-radius:0.85rem;padding:1.1rem 1.4rem;margin:1rem 0;font-family:Inter,sans-serif;">
      <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;
        color:#b45309;margin-bottom:0.35rem;">💡 Notion du jour · <span style="color:#92400e">${notion.module}</span></div>
      <div style="font-size:1.05rem;font-weight:700;color:#0d2b4e;margin-bottom:0.35rem;">${notion.terme}</div>
      <div style="font-size:0.88rem;color:#374151;line-height:1.55;margin-bottom:0.3rem;">${notion.def}</div>
      <div style="font-size:0.82rem;color:#92400e;font-style:italic;">Ex : ${notion.ex}</div>
    </div>
  `;

  // Insert before the module grid (after first heading)
  const h2 = document.querySelector('main h2');
  if (h2) {
    h2.parentNode.insertBefore(el, h2);
  }
}

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initProgressBar();
  trackLastPage();
  showResumeButton();
  showNotionDuJour();

  // Re-update progress bar when scores change (intercept localStorage)
  const origSet = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(key, value) {
    origSet(key, value);
    if (key === 'eco-scores') updateProgressBar();
  };
});

// Export for other scripts
window.EcoGlobal = { updateProgressBar, NOTIONS };

})();

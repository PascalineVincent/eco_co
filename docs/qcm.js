// qcm.js — moteur QCM interactif partagé
// Usage : initQCM('qcm-id', correctIndex, "Explication de la bonne réponse")

window.initQCM = function(id, correctIdx, explication) {
  const container = document.getElementById(id);
  if (!container) return;

  const options = container.querySelectorAll('.qcm-option');
  const feedback = container.querySelector('.qcm-feedback');
  const btn = container.querySelector('.qcm-btn');

  let answered = false;

  options.forEach((opt, i) => {
    opt.addEventListener('click', () => {
      if (answered) return;
      options.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  if (btn) {
    btn.addEventListener('click', () => {
      if (answered) return;
      const selected = container.querySelector('.qcm-option.selected');
      if (!selected) {
        btn.textContent = 'Sélectionnez une réponse d\'abord !';
        setTimeout(() => { btn.textContent = 'Valider'; }, 1500);
        return;
      }

      answered = true;
      const selectedIdx = Array.from(options).indexOf(selected);

      options.forEach((opt, i) => {
        if (i === correctIdx) opt.classList.add('correct');
        else if (opt.classList.contains('selected')) opt.classList.add('incorrect');
        opt.style.cursor = 'default';
      });

      if (feedback) {
        const isCorrect = selectedIdx === correctIdx;
        feedback.classList.add('show', isCorrect ? 'correct' : 'incorrect');
        feedback.innerHTML = (isCorrect
          ? '<strong>✓ Bonne réponse !</strong> '
          : '<strong>✗ Pas tout à fait.</strong> ')
          + explication;
      }

      btn.textContent = 'Réponse enregistrée';
      btn.disabled = true;
      btn.style.opacity = '0.6';

      // Persist score in localStorage
      try {
        const scores = JSON.parse(localStorage.getItem('eco-scores') || '{}');
        scores[id] = selectedIdx === correctIdx ? 1 : 0;
        localStorage.setItem('eco-scores', JSON.stringify(scores));
      } catch(e) {}
    });
  }
};

// Charger la progression dans la barre
window.loadProgress = function() {
  try {
    const scores = JSON.parse(localStorage.getItem('eco-scores') || '{}');
    const total = Object.keys(scores).length;
    const correct = Object.values(scores).filter(v => v === 1).length;
    const el = document.getElementById('score-global');
    if (el) el.textContent = `${correct} / ${total} questions réussies`;
  } catch(e) {}
};

document.addEventListener('DOMContentLoaded', function() {
  window.loadProgress();
  if (window.HeroSystem) window.HeroSystem.refreshHeroWidget();
});

// export-bilan.js — Export PDF du bilan de progression (client-side via jsPDF)

(function() {
  function injectExportButton() {
    if (document.getElementById('btn-export-bilan')) return;
    if (!window.location.pathname.includes('bilan')) return;

    const style = document.createElement('style');
    style.textContent = `
      #btn-export-bilan {
        display: inline-flex; align-items: center; gap: 0.5rem;
        background: #0d2b4e; color: #f0d080; font-weight: 700;
        padding: 0.6rem 1.2rem; border-radius: 0.55rem; border: none;
        cursor: pointer; font-size: 0.88rem; font-family: Inter, sans-serif;
        transition: all 0.18s; margin-top: 0.75rem;
      }
      #btn-export-bilan:hover { background: #1a3f6e; }
    `;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.id = 'btn-export-bilan';
    btn.innerHTML = '📄 Exporter mon bilan en PDF';
    btn.onclick = exportBilanPDF;

    // Insert near hero widget or at end of progression section
    const hero = document.getElementById('hero-widget-bilan');
    if (hero) {
      hero.parentNode.insertBefore(btn, hero.nextSibling);
    }
  }

  async function exportBilanPDF() {
    const btn = document.getElementById('btn-export-bilan');
    const orig = btn.innerHTML;
    btn.innerHTML = '⏳ Génération…';
    btn.disabled = true;

    try {
      // Load jsPDF dynamically
      if (!window.jspdf) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const W = 210, H = 297;
      const BLUE = [13, 43, 78];
      const AMBER = [240, 208, 128];
      const GRAY  = [55, 65, 81];
      const GREEN = [22, 163, 74];
      const RED   = [185, 28, 28];

      // ── HEADER ──
      doc.setFillColor(...BLUE);
      doc.rect(0, 0, W, 38, 'F');
      doc.setTextColor(240, 208, 128);
      doc.setFontSize(18); doc.setFont('helvetica', 'bold');
      doc.text('Mon bilan de progression', W/2, 16, { align: 'center' });
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 215, 230);
      doc.text('Économie Contemporaine — L1 EG', W/2, 23, { align: 'center' });
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR', {day:'2-digit',month:'long',year:'numeric'})}`, W/2, 29, { align: 'center' });

      // ── HERO ──
      let y = 48;
      if (window.HeroSystem) {
        const hero = window.HeroSystem.getState();
        const level = window.HeroSystem.getLevelForXP(hero.xp || 0);
        const prog  = window.HeroSystem.getXPProgress(hero.xp || 0);

        doc.setFillColor(240, 247, 253);
        doc.roundedRect(14, y, W-28, 32, 3, 3, 'F');
        doc.setDrawColor(191, 219, 254);
        doc.roundedRect(14, y, W-28, 32, 3, 3, 'S');

        doc.setTextColor(...BLUE);
        doc.setFontSize(13); doc.setFont('helvetica', 'bold');
        doc.text(`Niveau ${level.level} — ${level.title}`, 20, y+10);
        doc.setFontSize(9); doc.setFont('helvetica', 'normal');
        doc.setTextColor(...GRAY);
        doc.text(`${hero.xp || 0} XP total · ${(hero.totalCorrect||0)} bonnes réponses · ${(hero.badges||[]).length} badges`, 20, y+17);

        // XP bar
        doc.setFillColor(226, 232, 240);
        doc.roundedRect(20, y+22, W-54, 5, 2, 2, 'F');
        doc.setFillColor(232, 160, 32);
        const bw = Math.max(2, (W-54) * (prog.pct/100));
        doc.roundedRect(20, y+22, bw, 5, 2, 2, 'F');
        doc.setFontSize(8);
        doc.text(`${prog.pct}%`, W-28, y+26, { align: 'right' });

        y += 40;
      }

      // ── QCM SCORES ──
      const scores = JSON.parse(localStorage.getItem('eco-scores') || '{}');
      const modules = [
        { name:'Diagnostic', ids:['d1','d2','d3','d4','d5'] },
        { name:'Module 1 — Grands principes', ids:['m1q1','m1q2','m1q3'] },
        { name:'Module 2 — Croissance', ids:['m2q1','m2q2','m2q3'] },
        { name:'Module 3 — Budget & dette', ids:['m3q1','m3q2','m3q3'] },
        { name:'Module 4 — Chômage', ids:['m4q1','m4q2','m4q3'] },
        { name:'Module 5 — International', ids:['m5q1','m5q2','m5q3'] },
      ];

      doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(...BLUE);
      doc.text('Résultats par module', 14, y+8);
      y += 14;

      modules.forEach(m => {
        const done    = m.ids.filter(id => id in scores).length;
        const correct = m.ids.filter(id => scores[id]===1).length;
        const pct = done > 0 ? Math.round(correct/done*100) : null;
        const color = pct === null ? [148,163,184] : pct>=80 ? [22,163,74] : pct>=50 ? [232,160,32] : [185,28,28];

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, y, W-28, 12, 2, 2, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, y, W-28, 12, 2, 2, 'S');

        doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(...GRAY);
        doc.text(m.name, 20, y+8);

        doc.setFont('helvetica','bold'); doc.setTextColor(...color);
        const txt = pct !== null ? `${correct}/${done} (${pct}%)` : 'Non commencé';
        doc.text(txt, W-18, y+8, { align:'right' });

        if (pct !== null) {
          doc.setFillColor(226, 232, 240);
          doc.roundedRect(20, y+9.5, W-54, 1.5, 0.5, 0.5, 'F');
          doc.setFillColor(...color);
          doc.roundedRect(20, y+9.5, (W-54)*pct/100, 1.5, 0.5, 0.5, 'F');
        }
        y += 15;
      });

      // ── BADGES ──
      if (window.HeroSystem) {
        const hero   = window.HeroSystem.getState();
        const BADGES = window.HeroSystem.BADGES;
        const earned = BADGES.filter(b => (hero.badges||[]).includes(b.id));

        y += 4;
        doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(...BLUE);
        doc.text(`Badges obtenus (${earned.length}/${BADGES.length})`, 14, y);
        y += 8;

        if (earned.length > 0) {
          const cols = 3;
          earned.forEach((b, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const bx = 14 + col * (W-28)/cols;
            const by = y + row * 14;

            doc.setFillColor(212, 237, 223);
            doc.roundedRect(bx, by, (W-28)/cols - 2, 12, 2, 2, 'F');
            doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(30, 107, 69);
            doc.text(`${b.label}`, bx + 4, by + 7);
            doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...GRAY);
            doc.text(`+${b.xp} XP`, bx + 4, by + 11);
          });
          y += Math.ceil(earned.length / 3) * 14 + 4;
        }
      }

      // ── FOOTER ──
      doc.setFontSize(8); doc.setFont('helvetica','italic');
      doc.setTextColor(148, 163, 184);
      doc.text('Économie Contemporaine — L1 EG · Bilan personnel généré depuis le site du cours', W/2, H-10, {align:'center'});

      doc.save(`bilan-eco-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch(err) {
      console.error('Export PDF error:', err);
      alert('Erreur lors de l\'export PDF. Vérifiez votre connexion.');
    } finally {
      btn.innerHTML = orig;
      btn.disabled = false;
    }
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(injectExportButton, 500);
  });
})();

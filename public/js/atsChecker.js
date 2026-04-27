'use strict';

(function () {
  // Collecting data from prview 
  function collectResumeText() {
    const preview = document.getElementById('resumePreview') || document.querySelector('.resume') 
    || document.querySelector('.g-resume') || document.querySelector('.a-resume');
    if (!preview) return '';

    // Clone so we can strip the download button without affecting the page
    const clone = preview.cloneNode(true);
    const actionsEl = clone.querySelector('.resumeActions');
    if (actionsEl) actionsEl.remove();

    return clone.innerText.trim();
  }


  /* ── Draw the speedometer needle + arc ── */
  // function drawGauge(score) {
  //   const arc    = document.getElementById('atsScoreArc');
  //   const needle = document.getElementById('atsNeedle');
  //   if (!arc || !needle) return;

  //   const total  = 251;                          // full arc length
  //   const offset = total - (score / 100) * total;
  //   arc.setAttribute('stroke-dashoffset', String(offset));

  //   // colour by score
  //   const colour = score >= 80 ? '#22c55e' : score >= 55 ? '#f59e0b' : '#ef4444';
  //   arc.setAttribute('stroke', colour);

  //   // needle angle: -90deg = 0, +90deg = 100
  //   const angle = -90 + (score / 100) * 180;
  //   const rad   = angle * Math.PI / 180;
  //   const x2    = 100 + 72 * Math.sin(rad);
  //   const y2    = 100 - 72 * Math.cos(rad);
  //   needle.setAttribute('x2', String(x2));
  //   needle.setAttribute('y2', String(y2));
  // }
function drawGauge(score) {
  const scoreEl = document.getElementById('atsScoreNum');
  if (!scoreEl) return;

  scoreEl.textContent = score;

  const colour = score >= 80 ? '#22c55e'
               : score >= 55 ? '#f59e0b'
               :               '#ef4444';
  scoreEl.style.color = colour;
}

  /* ── Render results into the panel ── */
  function renderResults(data) {
    const score = data.ats_score ?? 0;

    // Score number
    const numEl = document.getElementById('atsScoreNum');
    if (numEl) numEl.textContent = score;

    // Gauge
    drawGauge(score);

    // Verdict pill
    const verdictEl = document.getElementById('atsVerdict');
    if (verdictEl) {
      if (score >= 80) {
        verdictEl.textContent = '✓ Strong resume';
        verdictEl.className   = 'ats-verdict ats-verdict--great';
      } else if (score >= 55) {
        verdictEl.textContent = 'Good — Room to improve';
        verdictEl.className   = 'ats-verdict ats-verdict--good';
      } else {
        verdictEl.textContent = 'Needs significant work';
        verdictEl.className   = 'ats-verdict ats-verdict--poor';
      }
    }

    // Summary
    const summaryEl = document.getElementById('atsSummary');
    if (summaryEl) summaryEl.textContent = data.summary || '';

    // Breakdown bars
    const bd = data.breakdown || {};
    const bars = [
      { id: 'atsBarKw',   val: bd.keyword_relevance,   max: 25 },
      { id: 'atsBarSk',   val: bd.skills_strength,      max: 15 },
      { id: 'atsBarEx',   val: bd.experience_quality,   max: 20 },
      { id: 'atsBarAch',  val: bd.achievements_impact,  max: 15 },
      { id: 'atsBarFmt',  val: bd.formatting,            max: 10 },
      { id: 'atsBarCmp',  val: bd.completeness,          max: 10 },
      { id: 'atsBarClr',  val: bd.clarity,               max: 5  },
    ];

    bars.forEach(({ id, val, max }) => {
      const bar    = document.getElementById(id);
      const valEl  = document.getElementById(id + 'Val');
      if (!bar || val === undefined) return;

      const pct = Math.round((val / max) * 100);
      bar.style.width = pct + '%';
      bar.className   = 'ats-bar ' + (pct >= 75 ? 'ats-bar--high' : pct >= 50 ? 'ats-bar--mid' : 'ats-bar--low');
      if (valEl) valEl.textContent = `${val}/${max}`;
    });

    // Missing keywords
    const kwWrap = document.getElementById('atsKeywords');
    if (kwWrap) {
      const kws = data.missing_keywords || [];
      kwWrap.innerHTML = kws.length
        ? kws.map(k => `<span class="ats-keyword">${k}</span>`).join('')
        : '<span style="font-size:var(--text-xs);color:var(--muted)">None — great keyword coverage!</span>';
    }

    // Improvements
    const impWrap = document.getElementById('atsImprovements');
    if (impWrap) {
      const imps = data.improvements || [];
      impWrap.innerHTML = imps.length
        ? imps.map(i => `
            <div class="ats-improvement-item">
              <div class="ats-dot"></div>
              <span>${i}</span>
            </div>`).join('')
        : '<span style="font-size:var(--text-xs);color:var(--muted)">No major improvements needed!</span>';
    }

    // Show results, hide empty state
    const empty   = document.getElementById('atsEmpty');
    const results = document.getElementById('atsResults');
    if (empty)   empty.style.display   = 'none';
    if (results) results.style.display = 'block';
  }


  /* ── Show error message ── */
  function showError(msg) {
    const errorEl = document.getElementById('atsError');
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.style.display = 'flex';
    setTimeout(() => { errorEl.style.display = 'none'; }, 5000);
  }


  /* ── Main: call the API ── */
  async function checkATS() {
    const btn    = document.getElementById('atsCheckBtn');
    const roleEl = document.getElementById('atsRoleInput');

    const role   = roleEl ? roleEl.value.trim() : 'Software Engineer';
    const resume = collectResumeText();

    if (!resume || resume.length < 30) {
      showError('Please fill in your resume details before checking the score.');
      return;
    }

    // Loading state
    if (btn) {
      btn.disabled   = true;
      btn.innerHTML  = '<i class="bi bi-arrow-repeat spin"></i> Analysing...';
    }

    // Hide previous error
    const errorEl = document.getElementById('atsError');
    if (errorEl) errorEl.style.display = 'none';

    try {
      const res  = await fetch('/api/ats/analyze', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ role, resume }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || 'Analysis failed. Please try again.');
        return;
      }

      renderResults(data);

    } catch (err) {
      showError('Network error. Please check your connection and try again.');
    } finally {
      if (btn) {
        btn.disabled  = false;
        btn.innerHTML = '<i class="bi bi-lightning-charge-fill"></i> Check Score';
      }
    }
  }


  /* ── Wire up button once DOM is ready ── */
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('atsCheckBtn');
    if (btn) btn.addEventListener('click', checkATS);
  });

})();

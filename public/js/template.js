/* =============================================================
   template.js — Live preview sync + load saved resume on edit
   ============================================================= */

'use strict';

/* ---- DOM refs: form inputs ---- */
const headName = document.getElementById('fullName');
const details  = document.getElementById('details');
const ph       = document.getElementById('phone');
const mail     = document.getElementById('email');
const linkedin = document.getElementById('linkedin');
const summary  = document.getElementById('summary');
const skills   = document.getElementById('skills');

/* ---- DOM refs: preview targets ---- */
const targetName     = document.getElementById('resName');
const targetTagline  = document.getElementById('resTagline');
const targetPh       = document.getElementById('resPhone');
const targetMail     = document.getElementById('resEmail');
const targetLinkedin = document.getElementById('resLinkedin');
const targetSummary  = document.getElementById('resSummary');
const targetExp      = document.getElementById('resExperience');
const targetEducation= document.getElementById('resEducation');
const targetSkills   = document.getElementById('resSkills');


/* ================================================================
   LIVE PREVIEW — sync form → preview on every keystroke
   ================================================================ */

function syncName() {
  targetName.textContent = headName.value.trim() || 'John Doe';
}
function syncTagline() {
  targetTagline.textContent = details.value.trim() ||
    'Backend Developer, proficient in DSA, guardian on LeetCode.';
}
function syncPhone() {
  targetPh.textContent = ph.value.trim() || '+91 8247624764';
}
function syncMail() {
  targetMail.textContent = mail.value.trim() || 'johndoe1997@gmail.com';
}
function syncLinkedin() {
  targetLinkedin.textContent = linkedin.value.trim() ||
    'linkedin.com/in/johndoe';
}
function syncSummary() {
  targetSummary.textContent = summary.value.trim() ||
    'Write a short professional summary here. Example: Passionate software developer with experience in building scalable web applications.';
}
function syncSkills() {
  const val = skills.value.trim();
  targetSkills.innerHTML = val
    ? `<p>${val}</p>`
    : `<p>Technical Skills: HTML, CSS, JavaScript, React, Node.js, Git, REST APIs</p>`;
}

headName.addEventListener('input', syncName);
details .addEventListener('input', syncTagline);
ph      .addEventListener('input', syncPhone);
mail    .addEventListener('input', syncMail);
linkedin.addEventListener('input', syncLinkedin);
summary .addEventListener('input', syncSummary);
skills  .addEventListener('input', syncSkills);


/* ================================================================
   EXPERIENCE MODAL
   ================================================================ */

const addExp      = document.getElementById('addExp');
const overlayExp  = document.getElementById('overlayExp');
const cancelExpBtn= document.getElementById('cancelExpBtn');
const saveExpBtn  = document.getElementById('saveExpBtn');

addExp.addEventListener('click', () => {
  overlayExp.style.display = 'flex';
});

cancelExpBtn.addEventListener('click', () => {
  overlayExp.style.display = 'none';
  clearExpModal();
});

overlayExp.addEventListener('click', (e) => {
  if (e.target === overlayExp) {
    overlayExp.style.display = 'none';
    clearExpModal();
  }
});

function clearExpModal() {
  document.getElementById('expTitle').value   = '';
  document.getElementById('expCompany').value = '';
  document.getElementById('expStart').value   = '';
  document.getElementById('expEnd').value     = '';
  document.getElementById('expDesc').value    = '';
}

function buildExpItem({ title, company, start, end, desc }) {
  const lines = desc
    ? desc.split('\n').filter(l => l.trim() !== '')
    : ['Developed and maintained web applications'];

  const item = document.createElement('div');
  item.className = 'expItem';
  item.innerHTML = `
    <div class="expHeader">
      <h3 class="expTitle">${title || 'Software Engineer'}</h3>
      <span class="expDuration">${(start || end) ? `${start} - ${end}` : ''}</span>
    </div>
    <p class="expCompany">${company || ''}</p>
    <ul class="expDesc">
      ${lines.map(l => `<li>${l}</li>`).join('')}
    </ul>
  `;
  return item;
}

saveExpBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const data = {
    title:   document.getElementById('expTitle').value.trim(),
    company: document.getElementById('expCompany').value.trim(),
    start:   document.getElementById('expStart').value.trim(),
    end:     document.getElementById('expEnd').value.trim(),
    desc:    document.getElementById('expDesc').value.trim(),
  };
  targetExp.appendChild(buildExpItem(data));
  overlayExp.style.display = 'none';
  clearExpModal();
});


/* ================================================================
   EDUCATION MODAL
   ================================================================ */

const addEdu      = document.getElementById('addEdu');
const overlayEdu  = document.getElementById('overlayEdu');
const cancelEduBtn= document.getElementById('cancelEduBtn');
const saveEduBtn  = document.getElementById('saveEduBtn');

addEdu.addEventListener('click', () => {
  overlayEdu.style.display = 'flex';
});

cancelEduBtn.addEventListener('click', () => {
  overlayEdu.style.display = 'none';
  clearEduModal();
});

overlayEdu.addEventListener('click', (e) => {
  if (e.target === overlayEdu) {
    overlayEdu.style.display = 'none';
    clearEduModal();
  }
});

function clearEduModal() {
  document.getElementById('eduDegree').value    = '';
  document.getElementById('eduInstitute').value = '';
  document.getElementById('eduStart').value     = '';
  document.getElementById('eduEnd').value       = '';
  document.getElementById('eduDesc').value      = '';
}

function buildEduItem({ degree, institute, start, end, desc }) {
  const lines = desc
    ? desc.split('\n').filter(l => l.trim() !== '')
    : ['Relevant coursework: Data Structures, Algorithms'];

  const item = document.createElement('div');
  item.className = 'expItem';
  item.innerHTML = `
    <div class="expHeader">
      <h3 class="expTitle">${degree || 'B.Tech in Computer Science'}</h3>
      <span class="expDuration">${(start || end) ? `${start} - ${end}` : ''}</span>
    </div>
    <p class="expCompany">${institute || ''}</p>
    <ul class="expDesc">
      ${lines.map(l => `<li>${l}</li>`).join('')}
    </ul>
  `;
  return item;
}

saveEduBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const data = {
    degree:    document.getElementById('eduDegree').value.trim(),
    institute: document.getElementById('eduInstitute').value.trim(),
    start:     document.getElementById('eduStart').value.trim(),
    end:       document.getElementById('eduEnd').value.trim(),
    desc:      document.getElementById('eduDesc').value.trim(),
  };
  targetEducation.appendChild(buildEduItem(data));
  overlayEdu.style.display = 'none';
  clearEduModal();
});


/* ================================================================
   LOAD SAVED RESUME — runs on page load if ?resumeId= is in URL
   ================================================================ */

async function loadResumeIfEditing() {
  const params   = new URLSearchParams(window.location.search);
  const resumeId = params.get('resumeId');
  if (!resumeId) return; // new resume — nothing to load

  // Show a loading indicator on the save button if it exists
  const saveBtn = document.getElementById('saveResumeBtn');
  if (saveBtn) {
    saveBtn.disabled   = true;
    saveBtn.innerHTML  = '<i class="bi bi-arrow-repeat spin"></i> Loading...';
  }

  try {
    const res  = await fetch(`/api/resumes/${resumeId}`);
    const data = await res.json();

    if (!res.ok) {
      // 401 = not logged in, 404 = resume doesn't belong to user
      if (res.status === 401) {
        window.location.href = '/user/login';
        return;
      }
      console.warn('Could not load resume:', data.message);
      return;
    }

    fillForm(data.resume);

  } catch (err) {
    console.error('Failed to load resume:', err);
  } finally {
    if (saveBtn) {
      saveBtn.disabled  = false;
      saveBtn.innerHTML = '<i class="bi bi-cloud-upload"></i> Save Resume';
    }
  }
}


/* ---- Fill every form field and re-render the full preview ---- */

function fillForm(resume) {

  /* -- Basic fields -- */
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el && val) el.value = val;
  };

  set('fullName', resume.fullName);
  set('details',  resume.tagline);
  set('phone',    resume.phone);
  set('email',    resume.email);
  set('linkedin', resume.linkedin);
  set('summary',  resume.summary);
  set('skills',   resume.skills);

  // Also fill the resume title field if it exists
  set('resumeTitle', resume.title);

  /* -- Sync all preview fields at once -- */
  syncName();
  syncTagline();
  syncPhone();
  syncMail();
  syncLinkedin();
  syncSummary();
  syncSkills();

  /* -- Experience entries -- */
  if (resume.experience && resume.experience.length) {
    targetExp.innerHTML = ''; // clear placeholder
    resume.experience.forEach(exp => {
      targetExp.appendChild(buildExpItem({
        title:   exp.title,
        company: exp.company,
        start:   exp.start,
        end:     exp.end,
        desc:    exp.desc,
      }));
    });
  }

  /* -- Education entries -- */
  if (resume.education && resume.education.length) {
    targetEducation.innerHTML = ''; // clear placeholder
    resume.education.forEach(edu => {
      targetEducation.appendChild(buildEduItem({
        degree:    edu.degree,
        institute: edu.institute,
        start:     edu.start,
        end:       edu.end,
        desc:      edu.desc,
      }));
    });
  }

  /* -- Pass resumeId to resumeSave.js so it updates instead of creating -- */
  // resumeSave.js checks window.editingResumeId on save
  window.editingResumeId = resume._id;
}


/* ================================================================
   INIT
   ================================================================ */
loadResumeIfEditing();

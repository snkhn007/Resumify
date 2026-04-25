/* =============================================================
   template03.js — Amazon SWE Live Preview + Load on Edit
   ============================================================= */

'use strict';

/* ---- DOM refs: inputs ---- */
const headName = document.getElementById('fullName');
const details  = document.getElementById('details');
const ph       = document.getElementById('phone');
const mail     = document.getElementById('email');
const linkedin = document.getElementById('linkedin');
const github   = document.getElementById('github');
const summary  = document.getElementById('summary');
const skills   = document.getElementById('skills');

/* ---- DOM refs: preview ---- */
const targetName     = document.getElementById('resName');
const targetTagline  = document.getElementById('resTagline');
const targetPhone    = document.getElementById('resPhone');
const targetEmail    = document.getElementById('resEmail');
const targetLinkedin = document.getElementById('resLinkedin');
const targetGithub   = document.getElementById('resGithub');
const targetSummary  = document.getElementById('resSummary');
const targetExp      = document.getElementById('resExperience');
const targetProj     = document.getElementById('resProjects');
const targetEdu      = document.getElementById('resEducation');
const targetSkills   = document.getElementById('resSkills');


/* ================================================================
   LIVE SYNC
   ================================================================ */

function syncName()    { targetName.textContent    = headName.value.trim() || 'Jane Smith'; }
function syncTagline() { targetTagline.textContent = details.value.trim()  || 'Software Development Engineer'; }
function syncSummary() { targetSummary.textContent = summary.value.trim()  || 'Results-driven SDE with experience building high-throughput microservices. Customer obsessed, data-driven, and passionate about ownership at scale.'; }

function syncContact() {
  targetPhone.textContent    = ph.value.trim()       || '+1 206 555 0100';
  targetEmail.textContent    = mail.value.trim()     || 'jane@email.com';
  targetLinkedin.textContent = linkedin.value.trim() || 'linkedin.com/in/jane';
  targetGithub.textContent   = github.value.trim()   || 'github.com/jane';
}

function syncSkills() {
  const val = skills.value.trim();
  if (!val) {
    targetSkills.innerHTML = '<span class="a-chip">Java</span><span class="a-chip">Python</span><span class="a-chip">AWS</span><span class="a-chip">Microservices</span>';
    return;
  }
  targetSkills.innerHTML = val
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => `<span class="a-chip">${s}</span>`)
    .join('');
}

headName.addEventListener('input', syncName);
details .addEventListener('input', syncTagline);
summary .addEventListener('input', syncSummary);
skills  .addEventListener('input', syncSkills);
[ph, mail, linkedin, github].forEach(el => el.addEventListener('input', syncContact));


/* ================================================================
   EXPERIENCE MODAL
   ================================================================ */

const addExp       = document.getElementById('addExp');
const overlayExp   = document.getElementById('overlayExp');
const cancelExpBtn = document.getElementById('cancelExpBtn');
const saveExpBtn   = document.getElementById('saveExpBtn');

addExp.addEventListener('click', () => overlayExp.style.display = 'flex');
cancelExpBtn.addEventListener('click', () => { overlayExp.style.display = 'none'; clearExpModal(); });
overlayExp.addEventListener('click', e => { if (e.target === overlayExp) { overlayExp.style.display = 'none'; clearExpModal(); } });

function clearExpModal() {
  ['expTitle','expCompany','expStart','expEnd','expDesc'].forEach(id => document.getElementById(id).value = '');
}

function buildExpItem({ title, company, start, end, desc }) {
  const lines = desc ? desc.split('\n').filter(l => l.trim()) : ['Describe ownership and impact with metrics'];
  const date  = [start, end].filter(Boolean).join(' – ');
  const div   = document.createElement('div');
  div.className = 'a-entry expItem';
  div.innerHTML = `
    <div class="a-entry-top">
      <div class="a-entry-org expTitle">${title || 'SDE II'}</div>
      ${date ? `<div class="a-entry-date expDuration">${date}</div>` : ''}
    </div>
    <div class="a-entry-role expCompany">${company || ''}</div>
    <ul class="a-entry-desc expDesc">
      ${lines.map(l => `<li>${l}</li>`).join('')}
    </ul>`;
  return div;
}

saveExpBtn.addEventListener('click', e => {
  e.preventDefault();
  targetExp.appendChild(buildExpItem({
    title:   document.getElementById('expTitle').value.trim(),
    company: document.getElementById('expCompany').value.trim(),
    start:   document.getElementById('expStart').value.trim(),
    end:     document.getElementById('expEnd').value.trim(),
    desc:    document.getElementById('expDesc').value.trim(),
  }));
  overlayExp.style.display = 'none';
  clearExpModal();
});


/* ================================================================
   PROJECTS MODAL
   ================================================================ */

const addProj       = document.getElementById('addProj');
const overlayProj   = document.getElementById('overlayProj');
const cancelProjBtn = document.getElementById('cancelProjBtn');
const saveProjBtn   = document.getElementById('saveProjBtn');

addProj.addEventListener('click', () => overlayProj.style.display = 'flex');
cancelProjBtn.addEventListener('click', () => { overlayProj.style.display = 'none'; clearProjModal(); });
overlayProj.addEventListener('click', e => { if (e.target === overlayProj) { overlayProj.style.display = 'none'; clearProjModal(); } });

function clearProjModal() {
  ['projName','projTech','projLink','projDesc'].forEach(id => document.getElementById(id).value = '');
}

function buildProjItem({ name, tech, link, desc }) {
  const lines = desc ? desc.split('\n').filter(l => l.trim()) : ['Describe what you built and its impact'];
  const div   = document.createElement('div');
  div.className = 'a-entry projItem';
  div.innerHTML = `
    <div class="a-entry-top">
      <div class="a-entry-org projName">${name || 'Project'}</div>
    </div>
    ${tech ? `<div class="a-entry-role projTech">${tech}</div>` : ''}
    ${link ? `<div class="a-entry-link projLink">${link}</div>` : ''}
    <ul class="a-entry-desc projDesc">
      ${lines.map(l => `<li>${l}</li>`).join('')}
    </ul>`;
  return div;
}

saveProjBtn.addEventListener('click', e => {
  e.preventDefault();
  targetProj.appendChild(buildProjItem({
    name: document.getElementById('projName').value.trim(),
    tech: document.getElementById('projTech').value.trim(),
    link: document.getElementById('projLink').value.trim(),
    desc: document.getElementById('projDesc').value.trim(),
  }));
  overlayProj.style.display = 'none';
  clearProjModal();
});


/* ================================================================
   EDUCATION MODAL
   ================================================================ */

const addEdu       = document.getElementById('addEdu');
const overlayEdu   = document.getElementById('overlayEdu');
const cancelEduBtn = document.getElementById('cancelEduBtn');
const saveEduBtn   = document.getElementById('saveEduBtn');

addEdu.addEventListener('click', () => overlayEdu.style.display = 'flex');
cancelEduBtn.addEventListener('click', () => { overlayEdu.style.display = 'none'; clearEduModal(); });
overlayEdu.addEventListener('click', e => { if (e.target === overlayEdu) { overlayEdu.style.display = 'none'; clearEduModal(); } });

function clearEduModal() {
  ['eduDegree','eduInstitute','eduStart','eduEnd','eduDesc'].forEach(id => document.getElementById(id).value = '');
}

function buildEduItem({ degree, institute, start, end, desc }) {
  const lines = desc ? desc.split('\n').filter(l => l.trim()) : [];
  const date  = [start, end].filter(Boolean).join(' – ');
  const div   = document.createElement('div');
  div.className = 'a-entry expItem';
  div.innerHTML = `
    <div class="a-entry-top">
      <div class="a-entry-org expTitle">${institute || 'University'}</div>
      ${date ? `<div class="a-entry-date expDuration">${date}</div>` : ''}
    </div>
    <div class="a-entry-role expCompany">${degree || ''}</div>
    ${lines.length ? `<ul class="a-entry-desc expDesc">${lines.map(l => `<li>${l}</li>`).join('')}</ul>` : ''}`;
  return div;
}

saveEduBtn.addEventListener('click', e => {
  e.preventDefault();
  targetEdu.appendChild(buildEduItem({
    degree:    document.getElementById('eduDegree').value.trim(),
    institute: document.getElementById('eduInstitute').value.trim(),
    start:     document.getElementById('eduStart').value.trim(),
    end:       document.getElementById('eduEnd').value.trim(),
    desc:      document.getElementById('eduDesc').value.trim(),
  }));
  overlayEdu.style.display = 'none';
  clearEduModal();
});


/* ================================================================
   LOAD SAVED RESUME ON EDIT
   ================================================================ */

async function loadResumeIfEditing() {
  const params   = new URLSearchParams(window.location.search);
  const resumeId = params.get('resumeId');
  if (!resumeId) return;

  const saveBtn = document.getElementById('saveResumeBtn');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Loading...'; }

  try {
    const res  = await fetch(`/api/resumes/${resumeId}`);
    const data = await res.json();
    if (!res.ok) { if (res.status === 401) window.location.href = '/user/login'; return; }
    fillForm(data.resume);
  } catch (err) {
    console.error('Failed to load resume:', err);
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="bi bi-cloud-upload"></i> Save Resume'; }
  }
}

function fillForm(resume) {
  const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
  set('fullName',    resume.fullName);
  set('details',     resume.tagline);
  set('phone',       resume.phone);
  set('email',       resume.email);
  set('linkedin',    resume.linkedin);
  set('github',      resume.github || '');
  set('summary',     resume.summary);
  set('skills',      resume.skills);
  set('resumeTitle', resume.title);

  syncName(); syncTagline(); syncContact(); syncSummary(); syncSkills();

  if (resume.experience?.length) {
    targetExp.innerHTML = '';
    resume.experience.forEach(e => targetExp.appendChild(buildExpItem(e)));
  }
  if (resume.projects?.length) {
    targetProj.innerHTML = '';
    resume.projects.forEach(p => targetProj.appendChild(buildProjItem(p)));
  }
  if (resume.education?.length) {
    targetEdu.innerHTML = '';
    resume.education.forEach(e => targetEdu.appendChild(buildEduItem({ degree: e.degree, institute: e.institute, start: e.start, end: e.end, desc: e.desc })));
  }

  window.editingResumeId = resume._id;
}

loadResumeIfEditing();
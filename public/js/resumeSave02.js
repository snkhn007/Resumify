/* =============================================================
   resumeSave02.js — Save / update for Google SWE template
   resumeSave03.js — Save / update for Amazon SWE template

   These are IDENTICAL in logic — only templateName differs.
   Copy this file, rename, change templateName value below.
   ============================================================= */

/* ----------  resumeSave02.js  ----------
   templateName: 'Google SWE'
   ---------------------------------------- */

'use strict';

const TEMPLATE_NAME = 'Google SWE'; // change to 'Amazon SWE' in resumeSave03.js

const saveResumeBtn = document.getElementById('saveResumeBtn');
const saveStatus    = document.getElementById('saveStatus');

function showSaveStatus(msg, type = 'success') {
  saveStatus.textContent = msg;
  saveStatus.className   = `save-status save-status--${type}`;
  setTimeout(() => { saveStatus.textContent = ''; saveStatus.className = 'save-status'; }, 4000);
}

/* ---- Collect experience from rendered DOM ---- */
function collectExperience() {
  return Array.from(document.querySelectorAll('#resExperience .expItem')).map(item => ({
    title:   item.querySelector('.expTitle')?.textContent   || '',
    company: item.querySelector('.expCompany')?.textContent || '',
    start:   item.querySelector('.expDuration')?.textContent?.split(' – ')[0]?.trim() || '',
    end:     item.querySelector('.expDuration')?.textContent?.split(' – ')[1]?.trim() || '',
    desc:    Array.from(item.querySelectorAll('.expDesc li')).map(li => li.textContent).join('\n'),
  }));
}

/* ---- Collect projects from rendered DOM ---- */
function collectProjects() {
  return Array.from(document.querySelectorAll('#resProjects .projItem')).map(item => ({
    name: item.querySelector('.projName')?.textContent || '',
    tech: item.querySelector('.projTech')?.textContent || '',
    link: item.querySelector('.projLink')?.textContent || '',
    desc: Array.from(item.querySelectorAll('.projDesc li')).map(li => li.textContent).join('\n'),
  }));
}

/* ---- Collect education from rendered DOM ---- */
function collectEducation() {
  return Array.from(document.querySelectorAll('#resEducation .expItem')).map(item => ({
    degree:    item.querySelector('.expTitle')?.textContent   || '',
    institute: item.querySelector('.expCompany')?.textContent || '',
    start:     item.querySelector('.expDuration')?.textContent?.split(' – ')[0]?.trim() || '',
    end:       item.querySelector('.expDuration')?.textContent?.split(' – ')[1]?.trim() || '',
    desc:      Array.from(item.querySelectorAll('.expDesc li')).map(li => li.textContent).join('\n'),
  }));
}

if (saveResumeBtn) {
  saveResumeBtn.addEventListener('click', async () => {
    const resumeId = window.editingResumeId || null;

    const payload = {
      resumeId,
      title:        document.getElementById('resumeTitle')?.value.trim() || 'My Resume',
      templateName: TEMPLATE_NAME,
      fullName:     document.getElementById('fullName')?.value.trim(),
      tagline:      document.getElementById('details')?.value.trim(),
      phone:        document.getElementById('phone')?.value.trim(),
      email:        document.getElementById('email')?.value.trim(),
      linkedin:     document.getElementById('linkedin')?.value.trim(),
      github:       document.getElementById('github')?.value.trim(),
      summary:      document.getElementById('summary')?.value.trim(),
      skills:       document.getElementById('skills')?.value.trim(),
      experience:   collectExperience(),
      projects:     collectProjects(),
      education:    collectEducation(),
    };

    saveResumeBtn.disabled  = true;
    saveResumeBtn.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Saving...';

    try {
      const res  = await fetch('/api/resumes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        showSaveStatus(res.status === 401 ? 'Please log in to save.' : (data.message || 'Save failed.'), 'error');
        return;
      }

      window.editingResumeId = data.resume._id;
      showSaveStatus('✓ Resume saved successfully!', 'success');

    } catch (_) {
      showSaveStatus('Network error. Could not save.', 'error');
    } finally {
      saveResumeBtn.disabled  = false;
      saveResumeBtn.innerHTML = '<i class="bi bi-cloud-upload"></i> Save Resume';
    }
  });
}

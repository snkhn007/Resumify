/* =============================================================
   resumeSave.js — saves or updates the current resume
   Reads window.editingResumeId (set by template.js when editing)
   to decide whether to POST (create) or PUT (update).
   ============================================================= */

'use strict';

const saveResumeBtn = document.getElementById('saveResumeBtn');
const saveStatus    = document.getElementById('saveStatus');

function showSaveStatus(msg, type = 'success') {
  saveStatus.textContent = msg;
  saveStatus.className   = `save-status save-status--${type}`;
  setTimeout(() => {
    saveStatus.textContent = '';
    saveStatus.className   = 'save-status';
  }, 4000);
}

/* ---- Collect experience from rendered DOM ---- */
function collectExperience() {
  return Array.from(
    document.querySelectorAll('#resExperience .expItem')
  ).map(item => ({
    title:   item.querySelector('.expTitle')?.textContent   || '',
    company: item.querySelector('.expCompany')?.textContent || '',
    start:   item.querySelector('.expDuration')?.textContent?.split(' - ')[0]?.trim() || '',
    end:     item.querySelector('.expDuration')?.textContent?.split(' - ')[1]?.trim() || '',
    desc:    Array.from(item.querySelectorAll('.expDesc li'))
               .map(li => li.textContent).join('\n'),
  }));
}

/* ---- Collect education from rendered DOM ---- */
function collectEducation() {
  return Array.from(
    document.querySelectorAll('#resEducation .expItem')
  ).map(item => ({
    degree:    item.querySelector('.expTitle')?.textContent   || '',
    institute: item.querySelector('.expCompany')?.textContent || '',
    start:     item.querySelector('.expDuration')?.textContent?.split(' - ')[0]?.trim() || '',
    end:       item.querySelector('.expDuration')?.textContent?.split(' - ')[1]?.trim() || '',
    desc:      Array.from(item.querySelectorAll('.expDesc li'))
                 .map(li => li.textContent).join('\n'),
  }));
}

/* ---- Save button handler ---- */
if (saveResumeBtn) {
  saveResumeBtn.addEventListener('click', async () => {

    const resumeId = window.editingResumeId || null; // set by template.js on edit

    const fullName = document.getElementById('fullName')?.value.trim();
    const tagline  = document.getElementById('details')?.value.trim();
    const phone    = document.getElementById('phone')?.value.trim();
    const email    = document.getElementById('email')?.value.trim();
    const linkedin = document.getElementById('linkedin')?.value.trim();
    const summary  = document.getElementById('summary')?.value.trim();
    const skills   = document.getElementById('skills')?.value.trim();
    const title    = document.getElementById('resumeTitle')?.value.trim()
                     || (fullName ? `${fullName}'s Resume` : 'My Resume');

    const payload = {
      resumeId,           // if set → backend updates, else creates new
      title,
      templateName: 'Classic',
      fullName, tagline, phone, email, linkedin, summary, skills,
      experience: collectExperience(),
      education:  collectEducation(),
    };

    // Loading state
    saveResumeBtn.disabled   = true;
    saveResumeBtn.innerHTML  = '<i class="bi bi-arrow-repeat spin"></i> Saving...';

    try {
      const res  = await fetch('/api/resumes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          showSaveStatus('Please log in to save your resume.', 'error');
        } else {
          showSaveStatus(data.message || 'Save failed.', 'error');
        }
        return;
      }

      // After first save, store the new ID so subsequent saves UPDATE
      window.editingResumeId = data.resume._id;
      showSaveStatus('✓ Resume saved successfully!', 'success');

    } catch (err) {
      showSaveStatus('Network error. Could not save.', 'error');
    } finally {
      saveResumeBtn.disabled  = false;
      saveResumeBtn.innerHTML = '<i class="bi bi-cloud-upload"></i> Save Resume';
    }
  });
}

/* =============================================================
   dashboard.js — loads and manages saved resumes
   Navbar/logout is handled by navbar.js — do NOT duplicate here.
   ============================================================= */

const resumeGrid     = document.getElementById('resumeGrid');
const resumesLoading = document.getElementById('resumesLoading');
const resumesEmpty   = document.getElementById('resumesEmpty');
const resumesError   = document.getElementById('resumesError');
const resumesErrorMsg= document.getElementById('resumesErrorMsg');
const resumeCount    = document.getElementById('resumeCount');

// Delete modal elements
const deleteOverlay    = document.getElementById('deleteOverlay');
const deleteResumeName = document.getElementById('deleteResumeName');
const cancelDeleteBtn  = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

let pendingDeleteId   = null;
let pendingDeleteCard = null;


/* ----- Helpers ----- */

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function getInitials(name) {
  if (!name) return 'R';
  const parts = name.trim().split(' ');
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase();
}


/* ----- Build a resume card DOM node ----- */

function createResumeCard(resume) {
  const card = document.createElement('div');
  card.className  = 'resume-card';
  card.dataset.id = resume._id;

  const getTemplateRoute = (templateName) => {
    switch (templateName) {
      case 'Google SWE':
        return '/user/template02';
      case 'Amazon SWE':
        return '/user/template03';
      default:
        return '/user/templates';
    }
  };

  const templateRoute = getTemplateRoute(resume.templateName);

  card.innerHTML = `
    <div class="resume-card-preview">
      <div class="resume-card-initials">${getInitials(resume.fullName)}</div>
      <span class="resume-card-template">${resume.templateName || 'Classic'}</span>
    </div>
    <div class="resume-card-body">
      <h3 class="resume-card-title">${resume.title || 'Untitled Resume'}</h3>
      <p class="resume-card-name">${resume.fullName || '—'}</p>
      <p class="resume-card-date">Updated ${formatDate(resume.updatedAt)}</p>
    </div>
    <div class="resume-card-actions">
      <a
        href="${templateRoute}?resumeId=${resume._id}"
        class="btn btn-light resume-card-btn"
        title="Edit this resume"
      >
        <i class="bi bi-pencil"></i> Edit
      </a>
      <button
        class="btn btn-danger resume-card-btn delete-btn"
        data-id="${resume._id}"
        data-title="${resume.title || 'Untitled Resume'}"
        title="Delete this resume"
      >
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `;

  return card;
}


/* ----- Load all resumes ----- */

async function loadResumes() {
  resumesLoading.style.display = 'flex';
  resumeGrid.style.display     = 'none';
  resumesEmpty.style.display   = 'none';
  resumesError.style.display   = 'none';

  try {
    const res  = await fetch('/api/resumes');
    const data = await res.json();

    if (!res.ok) {
      // Token expired or missing — send to login
      if (res.status === 401) {
        window.location.href = '/user/login';
        return;
      }
      throw new Error(data.message || 'Failed to load resumes');
    }

    resumesLoading.style.display = 'none';
    const { resumes } = data;

    // Update count badge
    resumeCount.textContent =
      `${resumes.length} resume${resumes.length !== 1 ? 's' : ''}`;

    if (resumes.length === 0) {
      resumesEmpty.style.display = 'flex';
      return;
    }

    // Render cards
    resumeGrid.innerHTML = '';
    resumes.forEach(r => resumeGrid.appendChild(createResumeCard(r)));
    resumeGrid.style.display = 'grid';

    // Wire delete buttons
    resumeGrid.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        pendingDeleteId   = btn.dataset.id;
        pendingDeleteCard = btn.closest('.resume-card');
        deleteResumeName.textContent = btn.dataset.title;
        deleteOverlay.style.display  = 'flex';
      });
    });

  } catch (err) {
    resumesLoading.style.display  = 'none';
    resumesErrorMsg.textContent   = err.message;
    resumesError.style.display    = 'flex';
  }
}


/* ----- Delete: confirm ----- */

confirmDeleteBtn.addEventListener('click', async () => {
  if (!pendingDeleteId) return;

  confirmDeleteBtn.disabled     = true;
  confirmDeleteBtn.innerHTML    = '<i class="bi bi-arrow-repeat spin"></i> Deleting...';

  try {
    const res = await fetch(`/api/resumes/${pendingDeleteId}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      pendingDeleteCard?.remove();

      const remaining = resumeGrid.querySelectorAll('.resume-card').length;
      resumeCount.textContent =
        `${remaining} resume${remaining !== 1 ? 's' : ''}`;

      if (remaining === 0) {
        resumeGrid.style.display   = 'none';
        resumesEmpty.style.display = 'flex';
      }
    }
  } catch (_) {}

  closeDeleteModal();
  confirmDeleteBtn.disabled  = false;
  confirmDeleteBtn.innerHTML = 'Delete';
});


/* ----- Delete: cancel / close ----- */

function closeDeleteModal() {
  deleteOverlay.style.display = 'none';
  pendingDeleteId   = null;
  pendingDeleteCard = null;
}

cancelDeleteBtn.addEventListener('click', closeDeleteModal);

deleteOverlay.addEventListener('click', (e) => {
  if (e.target === deleteOverlay) closeDeleteModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && deleteOverlay.style.display === 'flex') {
    closeDeleteModal();
  }
});


/* ----- Init ----- */
loadResumes();

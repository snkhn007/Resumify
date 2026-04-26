/* =============================================================
   admin.js — Admin Dashboard Logic
   ============================================================= */

'use strict';

let allUsers   = [];
let currentTab = 'pending';

/* ── Fetch all users ── */
async function loadUsers() {
  showState('loading');

  try {
    const res  = await fetch('/api/admin/users');
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 403) window.location.href = '/user/dashboard';
      throw new Error(data.message || 'Failed to load users');
    }

    allUsers = data.users || [];
    updateStats();
    renderTab(currentTab);

  } catch (err) {
    document.getElementById('adminErrorMsg').textContent = err.message;
    showState('error');
  }
}


/* ── Update stat counters ── */
function updateStats() {
  const pending  = allUsers.filter(u => u.status === 'pending').length;
  const rejected = allUsers.filter(u => u.status === 'rejected').length;
  const total    = allUsers.length;

  document.getElementById('statPending').textContent  = pending;
  document.getElementById('statTotal').textContent    = total;
  document.getElementById('statRejected').textContent = rejected;

  document.getElementById('tabPendingCount').textContent  = pending;
  document.getElementById('tabAllCount').textContent      = total;
  document.getElementById('tabRejectedCount').textContent = rejected;
}


/* ── Render cards for current tab ── */
function renderTab(tab) {
  currentTab = tab;

  let filtered;
  if (tab === 'pending')  filtered = allUsers.filter(u => u.status === 'pending');
  else if (tab === 'rejected') filtered = allUsers.filter(u => u.status === 'rejected');
  else filtered = allUsers;

  if (!filtered.length) {
    const titles = {
      pending:  'No pending approvals',
      rejected: 'No rejected users',
      all:      'No users yet'
    };
    const msgs = {
      pending:  'New recruiter registrations will appear here.',
      rejected: 'Rejected accounts will appear here.',
      all:      'Users will appear here once they sign up.'
    };
    document.getElementById('adminEmptyTitle').textContent = titles[tab];
    document.getElementById('adminEmptyMsg').textContent   = msgs[tab];
    showState('empty');
    return;
  }

  const grid = document.getElementById('adminGrid');
  grid.innerHTML = filtered.map(u => buildCard(u)).join('');

  // Wire action buttons
  grid.querySelectorAll('.btn-approve').forEach(btn => {
    btn.addEventListener('click', () => confirmAction(btn.dataset.id, btn.dataset.name, 'approve'));
  });
  grid.querySelectorAll('.btn-reject').forEach(btn => {
    btn.addEventListener('click', () => confirmAction(btn.dataset.id, btn.dataset.name, 'reject'));
  });

  showState('grid');
}


/* ── Build a single user card ── */
function buildCard(user) {
  const initial  = (user.firstName || '?')[0].toUpperCase();
  const roleClass = `role-${user.role || 'jobseeker'}`;
  const statusClass = `status-${user.status || 'active'}`;
  const date = new Date(user.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const showActions = user.status === 'pending';
  const actionsHtml = showActions ? `
    <div class="user-card-actions">
      <button class="btn-approve" data-id="${user._id}" data-name="${user.firstName} ${user.lastName}">
        <i class="bi bi-check-lg"></i> Approve
      </button>
      <button class="btn-reject" data-id="${user._id}" data-name="${user.firstName} ${user.lastName}">
        <i class="bi bi-x-lg"></i> Reject
      </button>
    </div>` : '';

  return `
    <div class="user-card" id="card-${user._id}">
      <div class="user-card-top">
        <div class="user-card-avatar">${initial}</div>
        <div style="overflow:hidden">
          <div class="user-card-name">${user.firstName} ${user.lastName}</div>
          <div class="user-card-email">${user.email}</div>
        </div>
      </div>
      <div class="user-card-meta">
        <span class="user-role-tag ${roleClass}">${capitalise(user.role || 'jobseeker')}</span>
        <span class="user-status-tag ${statusClass}">${capitalise(user.status || 'active')}</span>
      </div>
      <div class="user-card-date">Joined ${date}</div>
      ${actionsHtml}
    </div>`;
}

function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


/* ── Confirm modal before approve / reject ── */
let pendingAction = null;

function confirmAction(userId, userName, action) {
  const overlay  = document.getElementById('confirmOverlay');
  const titleEl  = document.getElementById('confirmTitle');
  const msgEl    = document.getElementById('confirmMsg');
  const okBtn    = document.getElementById('confirmOkBtn');

  titleEl.textContent = action === 'approve' ? 'Approve User' : 'Reject User';
  msgEl.textContent   = action === 'approve'
    ? `Approve ${userName}? They will be able to log in immediately.`
    : `Reject ${userName}? They will not be able to log in.`;

  okBtn.textContent  = action === 'approve' ? 'Approve' : 'Reject';
  okBtn.className    = action === 'approve' ? 'btn btn-primary' : 'btn btn-danger';

  pendingAction = { userId, action };
  overlay.style.display = 'flex';
}


/* ── Execute approve / reject ── */
async function executeAction() {
  if (!pendingAction) return;

  const { userId, action } = pendingAction;
  const overlay = document.getElementById('confirmOverlay');
  overlay.style.display = 'none';

  const url = `/api/admin/${action}/${userId}`;

  try {
    const res  = await fetch(url, { method: 'PATCH' });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Action failed');

    // Update local state and re-render
    allUsers = allUsers.map(u =>
      u._id === userId
        ? { ...u, status: action === 'approve' ? 'active' : 'rejected' }
        : u
    );

    updateStats();
    renderTab(currentTab);

  } catch (err) {
    alert('Error: ' + err.message);
  }

  pendingAction = null;
}


/* ── Show/hide UI states ── */
function showState(state) {
  document.getElementById('adminLoading').style.display = state === 'loading' ? 'flex'  : 'none';
  document.getElementById('adminError')  .style.display = state === 'error'   ? 'flex'  : 'none';
  document.getElementById('adminGrid')   .style.display = state === 'grid'    ? 'grid'  : 'none';
  document.getElementById('adminEmpty')  .style.display = state === 'empty'   ? 'flex'  : 'none';
}


/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {

  // Tab switching
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTab(tab.dataset.tab);
    });
  });

  // Confirm modal buttons
  document.getElementById('confirmOkBtn')    .addEventListener('click', executeAction);
  document.getElementById('confirmCancelBtn').addEventListener('click', () => {
    document.getElementById('confirmOverlay').style.display = 'none';
    pendingAction = null;
  });
  document.getElementById('confirmOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('confirmOverlay')) {
      document.getElementById('confirmOverlay').style.display = 'none';
      pendingAction = null;
    }
  });

  loadUsers();
});

/* =============================================================
   navbar.js — User dropdown toggle + logout
   Load this on every page that has a logged-in user (.user-menu).
   In EJS: <% if (user) { %> <script src="/js/navbar.js" defer></script> <% } %>
   ============================================================= */

(function () {
  const userMenuBtn  = document.getElementById('userMenuBtn');
  const userDropdown = document.getElementById('userDropdown');
  const logoutBtn    = document.getElementById('logoutBtn');

  /* ----- Dropdown toggle ----- */
  if (userMenuBtn && userDropdown) {

    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = userDropdown.classList.contains('open');
      userDropdown.classList.toggle('open', !isOpen);
      userMenuBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    // Close when clicking anywhere outside
    document.addEventListener('click', () => {
      userDropdown.classList.remove('open');
      userMenuBtn.setAttribute('aria-expanded', 'false');
    });

    // Prevent clicks inside dropdown from closing it
    userDropdown.addEventListener('click', (e) => e.stopPropagation());

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        userDropdown.classList.remove('open');
        userMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ----- Logout ----- */
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      logoutBtn.disabled = true;
      logoutBtn.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Logging out...';
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (_) {
        // Even if request fails, clear client state and redirect
      }
      window.location.href = '/user/login';
    });
  }

})();

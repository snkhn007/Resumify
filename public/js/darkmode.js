// darkmode.js — drop this in /public/js/ and load it on every page

(function () {
  const STORAGE_KEY = 'resumify-theme';
  const root        = document.documentElement;

  // Apply saved theme immediately (before paint) to avoid flash
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark') root.setAttribute('data-theme', 'dark');

  function isDark() {
    return root.getAttribute('data-theme') === 'dark';
  }

  function updateIcon() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (!icon) return;
    icon.className = isDark() ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
    btn.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function toggle() {
    if (isDark()) {
      root.removeAttribute('data-theme');
      localStorage.setItem(STORAGE_KEY, 'light');
    } else {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem(STORAGE_KEY, 'dark');
    }
    updateIcon();
  }

  // Wait for DOM, then wire up button
  document.addEventListener('DOMContentLoaded', () => {
    updateIcon();
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggle);
  });
})();

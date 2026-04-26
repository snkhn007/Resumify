const btn = document.getElementById('theme-toggle');
const root = document.documentElement;

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
  root.setAttribute('data-theme', 'dark');
}

btn.onclick = () => {
  if (root.hasAttribute('data-theme')) {
    root.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } else {
    root.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
};
/* =============================================================
   templateGallery.js — filter bar logic for /user/gallery
   Remove the inline <script> block from templateGallery.ejs
   and load this file instead:
   <script src="/js/templateGallery.js"></script>
   ============================================================= */

(function () {
  const filterBtns = document.querySelectorAll('.tg-filter-btn');
  const cards      = document.querySelectorAll('.tg-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show / hide cards
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.status === filter;
        card.style.display = match ? '' : 'none';
      });
    });
  });
})();

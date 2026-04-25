/* =============================================================
   pageRoutes.js — HTML page rendering
   Access rules:
     Public:    /  /login  /signup  /gallery
     Soft auth: /templates (builder) — open to guests, save requires login
     Protected: /dashboard
   ============================================================= */

const express    = require('express');
const pageRouter = express.Router();
const { requireAuthPage, softAuth } = require('../middleware/authMiddleware');

// Apply softAuth to ALL page routes — attaches req.user if token exists,
// never blocks. Individual routes below add stricter checks where needed.
pageRouter.use(softAuth);


/* ----- Public pages ----- */

// GET /user/
pageRouter.get('/', (req, res) => {
  res.render('index', { user: req.user || null });
});

// GET /user/home → canonical redirect
pageRouter.get('/home', (req, res) => {
  res.redirect(req.baseUrl);
});

// GET /user/login → redirect logged-in users to dashboard
pageRouter.get('/login', (req, res) => {
  if (req.user) return res.redirect('/user/dashboard');
  res.render('login', { user: null });
});

// GET /user/signup → redirect logged-in users to dashboard
pageRouter.get('/signup', (req, res) => {
  if (req.user) return res.redirect('/user/dashboard');
  res.render('signup', { user: null });
});

// GET /user/gallery → template chooser (public, guests can browse)
pageRouter.get('/gallery', (req, res) => {
  res.render('templateGallery', { user: req.user || null });
});


/* ----- Semi-protected: builder ----- */
// Open to guests (they can build freely), but save button in the EJS
// only renders for logged-in users. No hard redirect here by design.

// GET /user/templates
pageRouter.get('/templates', (req, res) => {
  res.render('templates', { user: req.user || null });
});
pageRouter.get('/template02', (req, res) => {
  res.render('template02', { user: req.user || null });
});
pageRouter.get('/template03', (req, res) => {
  res.render('template03', { user: req.user || null });
});


/* ----- Protected pages — redirect to login if no valid token ----- */

// GET /user/dashboard
pageRouter.get('/dashboard', requireAuthPage, (req, res) => {
  res.render('dashboard', { user: req.user });
});

// GET /user/profile — for future account settings page
pageRouter.get('/profile', requireAuthPage, (req, res) => {
  res.render('profile', { user: req.user });
});


/* ----- Dev/test route — remove before production ----- */
pageRouter.get('/test', (req, res) => {
  res.render('template02', { user: req.user || null });
});


module.exports = pageRouter;

const express    = require('express');
const pageRouter = express.Router();
const { requireAuthPage, softAuth } = require('../middleware/authMiddleware');

pageRouter.use(softAuth);

/* ── Block admin from job seeker pages ── */
const blockAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') return res.redirect('/user/admin');
  next();
};


/* ════════════════════════════════════
   PUBLIC PAGES
   ════════════════════════════════════ */

pageRouter.get('/', (req, res) => {
  res.render('index', { user: req.user || null });
});

pageRouter.get('/home', (req, res) => {
  res.redirect(req.baseUrl);
});

pageRouter.get('/login', (req, res) => {
  if (req.user) {
    return req.user.role === 'admin'
      ? res.redirect('/user/admin')
      : res.redirect('/user/dashboard');
  }
  res.render('login', { user: null });
});

pageRouter.get('/signup', (req, res) => {
  if (req.user) {
    return req.user.role === 'admin'
      ? res.redirect('/user/admin')
      : res.redirect('/user/dashboard');
  }
  res.render('signup', { user: null });
});

pageRouter.get('/gallery', blockAdmin, (req, res) => {
  res.render('templateGallery', { user: req.user || null });
});


/* ════════════════════════════════════
   BUILDER PAGES — blocked for admin
   ════════════════════════════════════ */

pageRouter.get('/templates',  blockAdmin, (req, res) => {
  res.render('templates',  { user: req.user || null });
});

pageRouter.get('/template02', blockAdmin, (req, res) => {
  res.render('template02', { user: req.user || null });
});

pageRouter.get('/template03', blockAdmin, (req, res) => {
  res.render('template03', { user: req.user || null });
});


/* ════════════════════════════════════
   PROTECTED PAGES
   ════════════════════════════════════ */

// Dashboard — job seekers only
pageRouter.get('/dashboard', requireAuthPage, (req, res) => {
  if (req.user.role === 'admin') return res.redirect('/user/admin');
  res.render('dashboard', { user: req.user });
});

// Admin panel — admin only
pageRouter.get('/admin', requireAuthPage, (req, res) => {
  if (req.user.role !== 'admin') return res.redirect('/user/dashboard');
  res.render('admin', { user: req.user });
});

pageRouter.get('/profile', requireAuthPage, (req, res) => {
  if (req.user.role === 'admin') return res.redirect('/user/admin');
  res.render('profile', { user: req.user });
});
pageRouter.get('/recruiter', requireAuthPage, (req, res) => {
  if (!['recruiter','coach'].includes(req.user.role)) return res.redirect('/user/dashboard');
  res.render('recruiter', { user: req.user });
});


/* ════════════════════════════════════
   DEV — remove before production
   ════════════════════════════════════ */
pageRouter.get('/test', (req, res) => {
  res.render('template02', { user: req.user || null });
});


module.exports = pageRouter;

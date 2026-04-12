// GET  /                        → index.html
// GET  /login                   → pages/login.html
// GET  /signup                  → pages/signup.html
// GET  /templates               → pages/templates.html

// Not Done ->
// GET  /dashboard               → pages/dashboard.html     (protected)
// GET  /builder                 → pages/builder.html        (protected)
// GET  /builder/:resumeId       → pages/builder.html        (protected, edit mode)
// GET  /profile                 → pages/profile.html        (protected)

const express = require('express');
const pageRouter = express.Router();

pageRouter.get('/', (req, res)=>{
    res.render('index');  
});

pageRouter.get('/home', (req,res)=>{
    res.redirect(req.baseUrl);
    // hardCoded -> 
    // res.redirect('/user');
});

pageRouter.get('/login', (req, res)=>{
    res.render('login')
});

pageRouter.get('/signup', (req, res)=>{
    res.render('signup');
});

pageRouter.get('/templates', (req, res)=>{
    res.render('templates')
});

module.exports = pageRouter;
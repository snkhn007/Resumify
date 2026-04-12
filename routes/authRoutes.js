// POST  /api/auth/signup        → register new user
// POST  /api/auth/login         → login, return JWT or set cookie

// Not Done ->
// POST  /api/auth/logout        → clear session / cookie
// GET   /api/auth/me            → return logged-in user's info

const express = require('express');
const authRouter = express.Router();

// for postman testing ->
// http://localhost:3000/api/auth/signup
authRouter.post('/signup', (req, res)=>{
    res.send("Submitted user SignUP");
});

// for postman testing ->
// http://localhost:3000/api/auth/login
authRouter.post('/login', (req, res)=>{
    res.send('Submitted user LOGIN');
});

module.exports = authRouter;
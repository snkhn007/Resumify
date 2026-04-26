const express = require('express');
const authRouter = express.Router();
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { signupValidation, loginValidation } = require('../middleware/backendValidation');
const { requireAuth } = require('../middleware/authMiddleware');
const User = require('../model/user');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET environment variable is not set.");
  process.exit(1);
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
};



// ==========================
// POST /api/auth/signup
// ==========================
authRouter.post('/signup', signupValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ✅ determine status based on role
    const status = (role === 'recruiter' || role === 'coach') 
      ? 'pending' 
      : 'active';

    // ✅ create user (password hashed via pre-save hook)
    const user = await User.create({ 
      firstName, 
      lastName, 
      email, 
      password,
      role: role || 'jobseeker',
      status
    });

    // 🚫 block pending users
    if (user.status === 'pending') {
      return res.status(403).json({ 
        message: 'Your account is pending admin approval.' 
      });
    }

    // ✅ generate token
    const token = jwt.sign(
      { 
        _id: user._id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, cookieOptions);

    return res.status(201).json({
      message: 'User registered successfully',
      user: { 
        _id: user._id, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});



authRouter.post('/login', loginValidation, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // ❌ user not found
    if (!user) {
      return res.status(400).json({
        message: 'Invalid email or password'
      });
    }

    // 🚫 block non-active users (pending / rejected)
    if (user.status !== 'active') {
      const message = user.status === 'pending'
        ? 'Your account is pending admin approval.'
        : 'Your account application was not approved.';

      return res.status(403).json({ message });
    }

    // 🔐 check password
    const validPassword = await user.comparePassword(password);

    if (!validPassword) {
      return res.status(400).json({
        message: 'Invalid email or password'
      });
    }

    // ✅ generate JWT
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', cookieOptions);

    // ✅ success response
    return res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

  } catch (err) {
    return res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});



// ==========================
// POST /api/auth/logout
// ==========================
authRouter.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  return res.status(200).json({ message: 'Logged out successfully' });
});



// ==========================
// GET /api/auth/me
// ==========================
authRouter.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({ user });

  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});



module.exports = authRouter;
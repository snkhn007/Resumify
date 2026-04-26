const express    = require('express');
const authRouter = express.Router();
const jwt        = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { signupValidation, loginValidation } = require('../middleware/backendValidation');
const { requireAuth } = require('../middleware/authMiddleware');
const User = require('../model/user');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not set.');
  process.exit(1);
}

const cookieOptions = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000
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

    const assignedRole   = role || 'jobseeker';
    const assignedStatus = (assignedRole === 'recruiter' || assignedRole === 'coach')
      ? 'pending'
      : 'active';

    // ✅ Pass plain password — model's pre-save hook hashes it automatically
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,          // plain text — pre-save hook handles hashing
      role:   assignedRole,
      status: assignedStatus
    });

    // Block pending users
    if (user.status === 'pending') {
      return res.status(403).json({
        message: 'Your account is pending admin approval.'
      });
    }

    const token = jwt.sign(
      {
        _id:       user._id,
        email:     user.email,
        firstName: user.firstName,
        lastName:  user.lastName,
        role:      user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, cookieOptions);

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id:       user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        role:      user.role,
        status:    user.status
      }
    });

  } catch (err) {
    console.error('SIGNUP ERROR:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// ==========================
// POST /api/auth/login
// ==========================
authRouter.post('/login', loginValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Block pending users
    if (user.status === 'pending') {
      return res.status(403).json({
        message: 'Your account is pending admin approval.'
      });
    }

    // Block rejected users
    if (user.status === 'rejected') {
      return res.status(403).json({
        message: 'Your account application was not approved.'
      });
    }

    // ✅ Use model's comparePassword method — handles bcrypt.compare correctly
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        _id:       user._id,
        email:     user.email,
        firstName: user.firstName,
        lastName:  user.lastName,
        role:      user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, cookieOptions);

    return res.status(200).json({
      message: 'Login successful',
      user: {
        _id:       user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        role:      user.role,
        status:    user.status
      }
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// ==========================
// POST /api/auth/logout
// ==========================
authRouter.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
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

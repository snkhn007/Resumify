const express     = require('express');
const adminRouter = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const User = require('../model/user');

/* ── Admin-only middleware ── */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Apply both middlewares to all admin routes
adminRouter.use(requireAuth, requireAdmin);


/* ── GET /api/admin/users — all users ── */
adminRouter.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });
    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


/* ── GET /api/admin/pending — pending users only ── */
adminRouter.get('/pending', async (req, res) => {
  try {
    const users = await User.find({ status: 'pending' }).select('-password');
    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


/* ── PATCH /api/admin/approve/:id ── */
adminRouter.patch('/approve/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ message: 'User approved', user });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


/* ── PATCH /api/admin/reject/:id ── */
adminRouter.patch('/reject/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ message: 'User rejected', user });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


module.exports = adminRouter;

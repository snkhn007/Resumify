const express = require('express');
const adminRouter = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const User = require('../model/user');

// Middleware — only admins can access these routes
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// GET /api/admin/pending — list all pending users
adminRouter.get('/pending', requireAuth, requireAdmin, async (req, res) => {
  const users = await User.find({ status: 'pending' })
    .select('-password');
  res.json({ users });
});

// PATCH /api/admin/approve/:id
adminRouter.patch('/approve/:id', requireAuth, requireAdmin, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id, 
    { status: 'active' }, 
    { new: true }
  ).select('-password');
  res.json({ message: 'User approved', user });
});

// PATCH /api/admin/reject/:id
adminRouter.patch('/reject/:id', requireAuth, requireAdmin, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id, 
    { status: 'rejected' }, 
    { new: true }
  ).select('-password');
  res.json({ message: 'User rejected', user });
});

module.exports = adminRouter;
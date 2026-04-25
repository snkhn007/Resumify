const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET environment variable is not set.");
  process.exit(1);
}

// For API routes — returns 401 JSON if not authenticated
const requireAuth = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// For page routes — redirects to /user/login if not authenticated
const requireAuthPage = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.redirect('/user/login');
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.redirect('/user/login');
  }
};

// Soft auth — attaches user if token exists, but never blocks
const softAuth = (req, res, next) => {
  const token = req.cookies?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // ignore invalid token
    }
  }
  next();
};

module.exports = { requireAuth, requireAuthPage, softAuth };

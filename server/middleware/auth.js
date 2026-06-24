const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  console.log('[Auth Middleware] Checking authorization for:', req.url);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
    console.log('[Auth Middleware] Token found in authorization header');
  }
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Make sure token exists
  if (!token) {
    console.warn('[Auth Middleware] No token provided');
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    console.log('[Auth Middleware] Verifying token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    const user = await User.findById(decoded.id);
    if (!user) {
      console.warn('[Auth Middleware] User not found for token');
      return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
    req.user = user;
    console.log('[Auth Middleware] User authenticated:', user.email);

    next();
  } catch (err) {
    console.error('[Auth Middleware Error] Authentication failed:', err.message);
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

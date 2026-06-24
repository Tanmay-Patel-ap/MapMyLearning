const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    console.log('[Auth] Register request for:', email);
    console.log('[Auth] Mongoose connection state:', mongoose.connection.readyState);

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    console.log('[Auth] User registered successfully:', user._id);
    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('[Auth Error] Registration failed:', err.message);
    console.error('[Auth Error] Full error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('[Auth] Login request for:', email);

    // Validate email & password
    if (!email || !password) {
      console.warn('[Auth] Missing email or password');
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.warn('[Auth] User not found:', email);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.warn('[Auth] Invalid password for:', email);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    console.log('[Auth] User logged in successfully:', user._id);
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('[Auth Error] Login failed:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    console.log('[Auth] Get current user request:', req.user?.id);
    const user = await User.findById(req.user.id);
    console.log('[Auth] Current user found:', user.email);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('[Auth Error] Get current user failed:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });

  const options = {
    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  console.log('[Auth] Sending token response');
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};

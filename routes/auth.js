const express = require('express');
const router = express.Router();

let User;
try { User = require('../models/User'); } catch(e) {}

function mongoose_available() {
  try {
    const mongoose = require('mongoose');
    return mongoose.connection.readyState === 1 && User;
  } catch { return false; }
}

// In-memory mock user store for demo
const mockUsers = [];

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    if (mongoose_available()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });
      const user = new User({ name, email, password, phone });
      await user.save();
      req.session.user = { _id: user._id, name: user.name, email: user.email };
      res.json({ success: true, message: 'Account created!', user: req.session.user });
    } else {
      // Mock mode
      if (mockUsers.find(u => u.email === email.toLowerCase())) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }
      const user = { _id: 'mock-' + Date.now(), name, email: email.toLowerCase(), password, phone };
      mockUsers.push(user);
      req.session.user = { _id: user._id, name: user.name, email: user.email };
      res.json({ success: true, message: 'Account created!', user: req.session.user });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    if (mongoose_available()) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      req.session.user = { _id: user._id, name: user.name, email: user.email };
      res.json({ success: true, message: 'Logged in!', user: req.session.user });
    } else {
      const user = mockUsers.find(u => u.email === email.toLowerCase() && u.password === password);
      if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
      req.session.user = { _id: user._id, name: user.name, email: user.email };
      res.json({ success: true, message: 'Logged in!', user: req.session.user });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out' });
});

module.exports = router;

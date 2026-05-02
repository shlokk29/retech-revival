const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

let User;
try { User = require('../models/User'); } catch(e) {}

function mongoose_available() {
  try {
    const mongoose = require('mongoose');
    return mongoose.connection.readyState === 1 && User;
  } catch { return false; }
}

// ─── Persistent mock user store ───────────────────────────────
const MOCK_FILE = path.join(__dirname, '..', 'mock_users.json');

function loadMockUsers() {
  try {
    if (fs.existsSync(MOCK_FILE)) {
      return JSON.parse(fs.readFileSync(MOCK_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

function saveMockUsers(users) {
  try {
    fs.writeFileSync(MOCK_FILE, JSON.stringify(users, null, 2));
  } catch {}
}

let mockUsers = loadMockUsers();

// ─── Helpers ──────────────────────────────────────────────────
const SALT_ROUNDS = 10;

async function hashPassword(plainText) {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

async function verifyPassword(plainText, hashed) {
  // Support legacy plain-text passwords (pre-bcrypt migration)
  if (!hashed.startsWith('$2a$') && !hashed.startsWith('$2b$')) {
    return plainText === hashed;
  }
  return bcrypt.compare(plainText, hashed);
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const hashedPwd = await hashPassword(password);

    if (mongoose_available()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });
      const user = new User({ name, email, password: hashedPwd, phone });
      await user.save();
      req.session.user = { _id: user._id, name: user.name, email: user.email };
      res.json({ success: true, message: 'Account created!', user: req.session.user });
    } else {
      // Mock mode — persisted to disk
      if (mockUsers.find(u => u.email === email.toLowerCase())) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }
      const user = { _id: 'mock-' + Date.now(), name, email: email.toLowerCase(), password: hashedPwd, phone };
      mockUsers.push(user);
      saveMockUsers(mockUsers);
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
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const passwordMatch = await verifyPassword(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      // Auto-migrate legacy plain-text password to bcrypt hash
      if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        user.password = await hashPassword(password);
        await user.save();
      }

      req.session.user = { _id: user._id, name: user.name, email: user.email };
      res.json({ success: true, message: 'Logged in!', user: req.session.user });
    } else {
      // Reload from disk in case another process updated
      mockUsers = loadMockUsers();
      const user = mockUsers.find(u => u.email === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const passwordMatch = await verifyPassword(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

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

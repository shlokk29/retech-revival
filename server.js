const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'retech-revival-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// ─── MongoDB Connection ───────────────────────────────────────
const MONGO_URI = 'mongodb://127.0.0.1:27017/retechrevival';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    // Seed sample data if DB is empty
    const Product = require('./models/Product');
    const count = await Product.countDocuments();
    if (count === 0) {
      await require('./utils/seed')();
    }
  })
  .catch(err => {
    console.warn('⚠️  MongoDB not available – running in mock/local mode.');
    console.warn('   Start MongoDB or install it to enable full functionality.');
  });

// ─── API Routes ───────────────────────────────────────────────
app.use('/api/products', require('./routes/products'));
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/sell',     require('./routes/sell'));
app.use('/api/cart',     require('./routes/cart'));

// ─── Session check helper ─────────────────────────────────────
app.get('/api/me', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ loggedIn: true, user: req.session.user });
  }
  res.json({ loggedIn: false });
});

// ─── Serve frontend ───────────────────────────────────────────
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Retech Revival server running at http://localhost:${PORT}`);
});
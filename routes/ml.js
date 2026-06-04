/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║         ReTech Revival — ML API Routes                       ║
 * ║  Endpoints for price prediction, recommendations, trending   ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const express = require('express');
const router = express.Router();
const pricePredictor = require('../ml/pricePredictor');
const recommender = require('../ml/recommender');
const trendingScorer = require('../ml/trendingScorer');

let Product, UserInteraction;
try { Product = require('../models/Product'); } catch (e) {}
try { UserInteraction = require('../models/UserInteraction'); } catch (e) {}

const mockProducts = require('../utils/mockData');

// ── Helper: Get all products (DB or mock) ─────────────────────
async function getAllProducts() {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1 && Product) {
      return await Product.find({ inStock: true }).lean();
    }
  } catch (e) {}
  return mockProducts;
}

// ── Helper: Get interactions (DB or synthetic) ────────────────
async function getInteractions() {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1 && UserInteraction) {
      // Last 7 days of interactions
      const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
      return await UserInteraction.find({ createdAt: { $gte: since } }).lean();
    }
  } catch (e) {}
  return []; // Empty = will use synthetic scores
}

// ── Initialize ML models on startup ───────────────────────────
let mlInitialized = false;

async function initML() {
  if (mlInitialized) return;
  try {
    const products = await getAllProducts();
    if (products.length === 0) return;

    // Train price predictor
    pricePredictor.train(products);

    // Build recommendation index
    recommender.buildIndex(products);

    // Compute trending scores
    const interactions = await getInteractions();
    trendingScorer.compute(interactions, products);

    mlInitialized = true;
    console.log('✅ All ML models initialized successfully');
  } catch (err) {
    console.warn('⚠️  ML initialization warning:', err.message);
  }
}

// Lazy init — will run on first request if not already done
async function ensureInit() {
  if (!mlInitialized) await initML();
}

// ── POST /api/ml/predict-price ────────────────────────────────
// Predict fair resale price for a device
router.post('/predict-price', async (req, res) => {
  try {
    await ensureInit();
    const { brand, ram, storage, condition, processor, originalPrice, rating } = req.body;

    if (!brand) {
      return res.status(400).json({ success: false, message: 'Brand is required' });
    }

    const prediction = pricePredictor.predict({
      brand,
      ram: ram || '8GB',
      storage: storage || '256GB SSD',
      condition: condition || 'Good',
      processor: processor || 'Intel Core i5',
      originalPrice: originalPrice || 65000,
      rating: rating || 4.0
    });

    res.json({ success: true, data: prediction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/ml/recommend/:productId ──────────────────────────
// Get product recommendations based on a specific product
router.get('/recommend/:productId', async (req, res) => {
  try {
    await ensureInit();
    const count = parseInt(req.query.count) || 4;
    const recommendations = recommender.getRecommendations(req.params.productId, count);

    res.json({ success: true, data: recommendations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/ml/personalized ─────────────────────────────────
// Get personalized recommendations based on user history
router.post('/personalized', async (req, res) => {
  try {
    await ensureInit();
    const { viewedProductIds } = req.body;
    const count = parseInt(req.query.count) || 6;

    if (!viewedProductIds || !viewedProductIds.length) {
      // Fall back to trending products
      const trending = trendingScorer.getTopTrending(count);
      return res.json({ success: true, data: trending, source: 'trending' });
    }

    // Fetch the viewed products
    const products = await getAllProducts();
    const viewed = viewedProductIds
      .map(id => products.find(p => p._id?.toString() === id))
      .filter(Boolean);

    if (viewed.length === 0) {
      const trending = trendingScorer.getTopTrending(count);
      return res.json({ success: true, data: trending, source: 'trending' });
    }

    const recommendations = recommender.getPersonalized(viewed, count);
    res.json({ success: true, data: recommendations, source: 'personalized' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/ml/trending ──────────────────────────────────────
// Get trending products
router.get('/trending', async (req, res) => {
  try {
    await ensureInit();
    const count = parseInt(req.query.count) || 6;
    const trending = trendingScorer.getTopTrending(count);

    res.json({ success: true, data: trending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/ml/product-insights/:productId ───────────────────
// Get ML insights for a specific product (price tag + trend + recommendations)
router.get('/product-insights/:productId', async (req, res) => {
  try {
    await ensureInit();
    const products = await getAllProducts();
    const product = products.find(p => p._id?.toString() === req.params.productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const priceTag = pricePredictor.getAIPriceTag(product);
    const trend = trendingScorer.getProductTrend(req.params.productId);
    const recommendations = recommender.getRecommendations(req.params.productId, 4);

    res.json({
      success: true,
      data: {
        priceTag,
        trend,
        recommendations,
        isTrending: trendingScorer.isTrending(req.params.productId)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/ml/track ────────────────────────────────────────
// Track a user interaction for ML purposes
router.post('/track', async (req, res) => {
  try {
    const { productId, type } = req.body;
    if (!productId || !type) {
      return res.status(400).json({ success: false, message: 'productId and type required' });
    }

    const userId = req.session?.user?._id || req.sessionID || 'anonymous';

    try {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1 && UserInteraction) {
        await UserInteraction.create({ userId, productId, type, metadata: req.body.metadata });
      }
    } catch (e) {} // silently fail if DB is down

    // Store in session for cold-start recommendations
    if (!req.session.viewedProducts) req.session.viewedProducts = [];
    if (type === 'view' && !req.session.viewedProducts.includes(productId)) {
      req.session.viewedProducts.push(productId);
      // Keep last 20 viewed
      if (req.session.viewedProducts.length > 20) req.session.viewedProducts.shift();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/ml/status ────────────────────────────────────────
// Get ML models status
router.get('/status', async (req, res) => {
  res.json({
    success: true,
    data: {
      initialized: mlInitialized,
      models: {
        pricePredictor: {
          trained: pricePredictor.model?.trained || false,
          lastTrained: pricePredictor.lastTrained
        },
        recommender: {
          built: recommender.products.length > 0,
          productCount: recommender.products.length,
          lastBuilt: recommender.lastBuilt
        },
        trending: {
          computed: trendingScorer.lastComputed != null,
          scoredItems: trendingScorer.trendingScores.size,
          lastComputed: trendingScorer.lastComputed
        }
      }
    }
  });
});

// ── POST /api/ml/retrain ──────────────────────────────────────
// Force retrain all models
router.post('/retrain', async (req, res) => {
  try {
    mlInitialized = false;
    await initML();
    res.json({ success: true, message: 'All ML models retrained successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Export both the router and the init function
module.exports = router;
module.exports.initML = initML;

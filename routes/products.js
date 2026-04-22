const express = require('express');
const router = express.Router();

let Product;
try { Product = require('../models/Product'); } catch(e) {}

// Mock products for when DB is unavailable
const mockProducts = require('../utils/mockData');

// GET /api/products - List with optional filters
router.get('/', async (req, res) => {
  try {
    const { brand, condition, minPrice, maxPrice, q, sort, category } = req.query;
    let query = {};
    if (brand) query.brand = brand;
    if (condition) query.condition = condition;
    if (category) query.category = new RegExp(category, 'i');
    if (minPrice || maxPrice) query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
    if (q) query.$or = [
      { name: new RegExp(q, 'i') },
      { brand: new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') },
      { tags: new RegExp(q, 'i') }
    ];

    let products;
    if (mongoose_available()) {
      let dbQuery = Product.find({ ...query, inStock: true });
      if (sort === 'price_asc') dbQuery = dbQuery.sort({ price: 1 });
      else if (sort === 'price_desc') dbQuery = dbQuery.sort({ price: -1 });
      else if (sort === 'rating') dbQuery = dbQuery.sort({ rating: -1 });
      else dbQuery = dbQuery.sort({ createdAt: -1 });
      products = await dbQuery.lean();
    } else {
      products = filterMock(mockProducts, { brand, condition, minPrice, maxPrice, q, sort });
    }

    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    let product;
    if (mongoose_available()) {
      product = await Product.findById(req.params.id).lean();
    } else {
      product = mockProducts.find(p => p._id === req.params.id);
    }
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products - Create listing (authenticated)
router.post('/', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Please login to create a listing' });
    }
    if (mongoose_available()) {
      const product = new Product({ ...req.body, sellerId: req.session.user._id });
      await product.save();
      res.status(201).json({ success: true, data: product });
    } else {
      res.json({ success: true, data: { ...req.body, _id: 'mock-' + Date.now() }, message: 'Mock: Product created (DB offline)' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

function mongoose_available() {
  try {
    const mongoose = require('mongoose');
    return mongoose.connection.readyState === 1 && Product;
  } catch { return false; }
}

function filterMock(products, { brand, condition, minPrice, maxPrice, q, sort }) {
  let result = [...products];
  if (brand) result = result.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  if (condition) result = result.filter(p => p.condition === condition);
  if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
  if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));
  if (q) result = result.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.brand.toLowerCase().includes(q.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(q.toLowerCase())
  );
  if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
  return result;
}

module.exports = router;

const express = require('express');
const router = express.Router();

// Session-based cart (works without DB)
// GET /api/cart
router.get('/', (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({ success: true, data: { items: cart, total, count: cart.length } });
});

// POST /api/cart/add
router.post('/add', (req, res) => {
  if (!req.session.cart) req.session.cart = [];
  const { productId, name, price, brand, condition, image } = req.body;
  const existing = req.session.cart.find(i => i.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    req.session.cart.push({ productId, name, price: Number(price), brand, condition, image, quantity: 1 });
  }
  res.json({ success: true, message: 'Added to cart', count: req.session.cart.length });
});

// PUT /api/cart/update
router.put('/update', (req, res) => {
  if (!req.session.cart) req.session.cart = [];
  const { productId, quantity } = req.body;
  const item = req.session.cart.find(i => i.productId === productId);
  if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });
  if (quantity <= 0) {
    req.session.cart = req.session.cart.filter(i => i.productId !== productId);
  } else {
    item.quantity = quantity;
  }
  res.json({ success: true, data: req.session.cart });
});

// DELETE /api/cart/remove/:id
router.delete('/remove/:id', (req, res) => {
  if (!req.session.cart) req.session.cart = [];
  req.session.cart = req.session.cart.filter(i => i.productId !== req.params.id);
  res.json({ success: true, message: 'Item removed' });
});

// POST /api/cart/checkout
router.post('/checkout', (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });
  const { name, email, phone, address, payment } = req.body;
  if (!name || !phone || !address) {
    return res.status(400).json({ success: false, message: 'Please fill all delivery details' });
  }
  const orderId = 'RTO' + Date.now().toString().slice(-8);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  req.session.cart = []; // Clear cart
  res.json({
    success: true,
    message: 'Order placed successfully!',
    data: {
      orderId,
      total,
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toDateString(),
      items: cart.length
    }
  });
});

module.exports = router;

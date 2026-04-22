const express = require('express');
const router = express.Router();

// Valuation pricing rules
const brandMultiplier = {
  'Apple': 0.75, 'Dell': 0.58, 'HP': 0.55, 'Lenovo': 0.55,
  'ASUS': 0.52, 'Microsoft': 0.65, 'Acer': 0.48, 'Samsung': 0.60, 'Other': 0.45
};
const conditionMultiplier = {
  'like-new': 0.88, 'excellent': 0.75, 'good': 0.60, 'fair': 0.40, 'poor': 0.22
};
const ramBonus = { '4': 0, '8': 2000, '16': 5000, '32': 9000, '64': 14000 };
const storageBonus = { '128': 0, '256': 1500, '512': 3500, '1000': 6000, '2000': 10000 };
const ageMultiplier = { '0-1': 1.0, '1-2': 0.85, '2-3': 0.70, '3-5': 0.55, '5+': 0.35 };

// POST /api/sell/estimate
router.post('/estimate', (req, res) => {
  const { brand, purchasePrice, condition, ram, storage, age, accessories } = req.body;

  if (!brand || !purchasePrice || !condition) {
    return res.status(400).json({ success: false, message: 'Brand, purchase price and condition are required' });
  }

  const base = Number(purchasePrice);
  const bm = brandMultiplier[brand] || 0.45;
  const cm = conditionMultiplier[condition] || 0.50;
  const am = ageMultiplier[age] || 0.65;
  const rb = ramBonus[String(ram)] || 0;
  const sb = storageBonus[String(storage)] || 0;
  let accBonus = 0;
  if (accessories) {
    if (accessories.includes('charger')) accBonus += 800;
    if (accessories.includes('box')) accBonus += 400;
    if (accessories.includes('bag')) accBonus += 300;
  }

  const estimated = Math.round((base * bm * cm * am) + rb + sb + accBonus);
  const minPrice = Math.round(estimated * 0.90);
  const maxPrice = Math.round(estimated * 1.10);

  res.json({
    success: true,
    data: {
      estimated,
      minPrice,
      maxPrice,
      breakdown: {
        baseValue: Math.round(base * bm),
        conditionDeduction: Math.round(base * bm * (1 - cm)),
        ageDeduction: Math.round(base * bm * cm * (1 - am)),
        ramBonus: rb,
        storageBonus: sb,
        accessoriesBonus: accBonus
      }
    }
  });
});

// POST /api/sell/submit - Submit sell request
router.post('/submit', (req, res) => {
  // In a real app this would create a pickup request in DB
  const { name, email, phone, address, deviceDetails, estimate } = req.body;
  if (!name || !phone || !deviceDetails) {
    return res.status(400).json({ success: false, message: 'Please fill all required fields' });
  }
  // Generate a mock request ID
  const requestId = 'RT' + Date.now().toString().slice(-8);
  res.json({
    success: true,
    message: 'Sell request submitted! Our team will contact you within 24 hours.',
    data: {
      requestId,
      estimatedPrice: estimate,
      pickupScheduled: true,
      contactTime: '24 hours'
    }
  });
});

module.exports = router;

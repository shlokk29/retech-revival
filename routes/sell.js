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
const ramBonus = { '4': 0, '8': 2000, '16': 5000, '32': 12000, '64': 20000 };
const storageBonus = { '128': 0, '256': 1500, '512': 4000, '1000': 8000, '2000': 15000 };
const processorBonus = {
  'celeron': 0, 'pentium': 0, 'athlon': 0, 'other': 0, 'snapdragon': 1000,
  'i3': 1500, 'r3': 1500,
  'i5': 3000, 'r5': 3000,
  'i7': 6000, 'r7': 6000,
  'i5_ultra': 5000, 'i7_ultra': 8000,
  'i9': 15000, 'r9': 15000, 'i9_ultra': 18000,
  'm1': 5000, 'm2': 7000, 'm3': 9000,
  'm1_pro': 10000, 'm2_pro': 12000, 'm3_pro': 14000,
  'm1_max': 18000, 'm2_max': 22000, 'm3_max': 25000
};
const ageMultiplier = { '0-1': 1.0, '1-2': 0.85, '2-3': 0.70, '3-5': 0.55, '5+': 0.35 };

// POST /api/sell/estimate
router.post('/estimate', (req, res) => {
  const { brand, purchasePrice, condition, detailedCondition, ram, storage, processor, age, accessories } = req.body;

  if (!brand || !purchasePrice || !condition) {
    return res.status(400).json({ success: false, message: 'Brand, purchase price and condition are required' });
  }

  const base = Number(purchasePrice);
  const bm = brandMultiplier[brand] || 0.45;
  let cm = conditionMultiplier[condition] || 0.50; // default base condition multiplier
  const am = ageMultiplier[age] || 0.65;
  const rb = ramBonus[String(ram)] || 0;
  const sb = storageBonus[String(storage)] || 0;
  const pb = processorBonus[String(processor)] || 0;
  let accBonus = 0;
  if (accessories) {
    if (accessories.includes('charger')) accBonus += 1000;
    if (accessories.includes('box')) accBonus += 600;
    if (accessories.includes('bag')) accBonus += 500;
  }

  let detailDeduction = 0;
  let isDead = false;

  // Process detailed condition if provided
  if (detailedCondition) {
    // Override base condition logic
    cm = 0.88; // Start with 'like-new' multiplier and deduct based on specifics

    if (detailedCondition.power === 'no') {
      isDead = true;
      cm = 0.15; // Dead device value
    } else {
      // Display issues
      if (detailedCondition.display === 'scratches') detailDeduction += base * bm * 0.05;
      else if (detailedCondition.display === 'spots') detailDeduction += base * bm * 0.15;
      else if (detailedCondition.display === 'broken') detailDeduction += base * bm * 0.35;

      // Physical condition
      if (detailedCondition.physical === 'scratches') detailDeduction += base * bm * 0.05;
      else if (detailedCondition.physical === 'dents') detailDeduction += base * bm * 0.10;
      else if (detailedCondition.physical === 'broken') detailDeduction += base * bm * 0.20;

      // Hardware issues
      if (detailedCondition.issues && detailedCondition.issues.length > 0) {
        const issuePenalty = base * bm * 0.05; // 5% base value penalty per issue
        detailDeduction += detailedCondition.issues.length * issuePenalty;
      }
    }
  }

  let estimated = Math.round((base * bm * cm * am) - detailDeduction + rb + sb + pb + accBonus);
  
  if (estimated < 1000) estimated = 1000; // Minimum salvage value

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
        conditionDeduction: Math.round((base * bm * (1 - cm)) + detailDeduction),
        ageDeduction: Math.round(base * bm * cm * (1 - am)),
        ramBonus: rb,
        storageBonus: sb,
        processorBonus: pb,
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

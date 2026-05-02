const express = require('express');
const router = express.Router();

let Review, Product;
try { Review = require('../models/Review'); } catch(e) {}
try { Product = require('../models/Product'); } catch(e) {}

// In-memory mock reviews for when DB is unavailable — product-specific
const mockReviews = [
  // ── MacBook Air M1 (mock-001) ──
  { _id: 'mr-001a', productId: 'mock-001', userId: 'mu-1', userName: 'Aarav Sharma', rating: 5,
    title: 'Best laptop purchase I have made!',
    body: 'The M1 MacBook Air is an absolute beast. Battery easily lasts 10+ hours with my coding workflow. Came in near-mint condition — I honestly cannot tell it is refurbished. ReTech packaging was also top-notch.',
    helpful: 18, verified: true, createdAt: new Date('2026-03-12') },
  { _id: 'mr-001b', productId: 'mock-001', userId: 'mu-2', userName: 'Sneha Reddy', rating: 5,
    title: 'Saved ₹30K and got a flawless device',
    body: 'Was nervous buying refurbished but this MacBook Air M1 looks and performs like brand new. Silent, fast, and the Retina display is gorgeous. Perfect for my graphic design work.',
    helpful: 14, verified: true, createdAt: new Date('2026-02-28') },
  { _id: 'mr-001c', productId: 'mock-001', userId: 'mu-3', userName: 'Kunal Mehra', rating: 4,
    title: 'Great for students — lightweight and fast',
    body: 'Using it for college and it handles everything from note-taking to video editing. Only 4 stars because 256GB fills up fast, but performance-wise it is fantastic.',
    helpful: 9, verified: true, createdAt: new Date('2026-04-05') },

  // ── Dell XPS 13 (mock-002) ──
  { _id: 'mr-002a', productId: 'mock-002', userId: 'mu-4', userName: 'Priya Patel', rating: 5,
    title: 'InfinityEdge display is stunning',
    body: 'The nearly bezel-less display on the XPS 13 is incredible for productivity. 16GB RAM handles my VS Code + Docker setup without breaking a sweat. Excellent condition as described.',
    helpful: 11, verified: true, createdAt: new Date('2026-03-20') },
  { _id: 'mr-002b', productId: 'mock-002', userId: 'mu-5', userName: 'Arjun Nair', rating: 4,
    title: 'Premium build, runs like new',
    body: 'Build quality is outstanding — the aluminium chassis feels premium. Performance with the i7 is great for my development work. Minor wear on the bottom panel but nothing visible during use.',
    helpful: 7, verified: true, createdAt: new Date('2026-01-15') },

  // ── Lenovo ThinkPad X1 Carbon (mock-003) ──
  { _id: 'mr-003a', productId: 'mock-003', userId: 'mu-6', userName: 'Rohit Verma', rating: 5,
    title: 'Built like a tank, light as a feather',
    body: 'The ThinkPad keyboard is legendary for a reason — best typing experience on any laptop. Military-grade durability and it weighs almost nothing. Perfect for my daily commute to office.',
    helpful: 13, verified: true, createdAt: new Date('2026-02-10') },
  { _id: 'mr-003b', productId: 'mock-003', userId: 'mu-7', userName: 'Divya Iyer', rating: 4,
    title: 'Reliable workhorse for professionals',
    body: 'Using this for business meetings and presentations. Screen is crisp, the anti-glare coating is great outdoors. Came in "Good" condition but honestly looks excellent. 3-month warranty gives peace of mind.',
    helpful: 6, verified: true, createdAt: new Date('2026-03-28') },

  // ── HP Spectre x360 (mock-004) ──
  { _id: 'mr-004a', productId: 'mock-004', userId: 'mu-8', userName: 'Ananya Gupta', rating: 5,
    title: 'OLED display is absolutely breathtaking',
    body: 'The OLED screen on this Spectre x360 blew me away — colours are vibrant and blacks are truly black. Convertible mode is fantastic for drawing with a stylus. Feels brand new despite being refurbished!',
    helpful: 16, verified: true, createdAt: new Date('2026-04-02') },
  { _id: 'mr-004b', productId: 'mock-004', userId: 'mu-9', userName: 'Vikram Singh', rating: 5,
    title: 'Best 2-in-1 convertible out there',
    body: 'Use it as a laptop during the day and as a tablet for Netflix at night. The 360° hinge is smooth. Battery easily gets 9-10 hours. Amazing value at this price vs buying new.',
    helpful: 10, verified: true, createdAt: new Date('2026-01-22') },

  // ── ASUS ROG Zephyrus G14 (mock-005) ──
  { _id: 'mr-005a', productId: 'mock-005', userId: 'mu-10', userName: 'Karthik Rajan', rating: 5,
    title: 'Gaming beast in a compact body',
    body: 'Runs Valorant at 120fps and handles Cyberpunk 2077 on high settings. The Ryzen 9 + RTX 3060 combo is insane. Cannot believe I got this for ₹68K — new price would be over ₹1.1 lakh!',
    helpful: 22, verified: true, createdAt: new Date('2026-03-08') },
  { _id: 'mr-005b', productId: 'mock-005', userId: 'mu-11', userName: 'Ravi Deshmukh', rating: 5,
    title: 'Perfect for gaming AND content creation',
    body: 'I edit 4K video on Premiere Pro and game in the evening — this G14 handles both without thermal throttling. The 120Hz QHD panel is buttery smooth. Speakers are surprisingly loud too.',
    helpful: 15, verified: true, createdAt: new Date('2026-02-14') },
  { _id: 'mr-005c', productId: 'mock-005', userId: 'mu-12', userName: 'Neha Kapoor', rating: 4,
    title: 'Great gaming laptop, minor fan noise',
    body: 'Performance is top-tier for the price. Only reason for 4 stars is the fans get quite loud during heavy gaming sessions. Otherwise, build quality is excellent and battery lasts 5-6 hours for regular use.',
    helpful: 8, verified: true, createdAt: new Date('2026-04-10') },

  // ── MacBook Pro 13" M2 (mock-006) ──
  { _id: 'mr-006a', productId: 'mock-006', userId: 'mu-13', userName: 'Ishita Banerjee', rating: 5,
    title: 'M2 chip is incredibly fast',
    body: 'Upgraded from an Intel MacBook and the difference is night and day. Apps open instantly, compiling code takes half the time. 18-hour battery is not a joke — I charge every other day!',
    helpful: 19, verified: true, createdAt: new Date('2026-03-25') },
  { _id: 'mr-006b', productId: 'mock-006', userId: 'mu-14', userName: 'Manish Joshi', rating: 5,
    title: 'Perfect for creative professionals',
    body: 'Running Final Cut Pro and Logic Pro simultaneously without any lag. The Liquid Retina display is stunning for colour grading. Saved almost ₹50K compared to Apple Store. Condition is truly "Like New".',
    helpful: 12, verified: true, createdAt: new Date('2026-04-08') },

  // ── Acer Swift 5 (mock-007) ──
  { _id: 'mr-007a', productId: 'mock-007', userId: 'mu-15', userName: 'Pooja Agarwal', rating: 4,
    title: 'Incredibly light — only 990g!',
    body: 'I carry this in my bag all day and barely feel it. Battery gets me through a full day of classes. The i5 handles Excel, PowerPoint, and Chrome with 15+ tabs easily. Best budget pick for students.',
    helpful: 7, verified: true, createdAt: new Date('2026-03-05') },
  { _id: 'mr-007b', productId: 'mock-007', userId: 'mu-16', userName: 'Amit Tiwari', rating: 4,
    title: 'Solid everyday laptop at a great price',
    body: 'Does everything I need — browsing, documents, video calls. Not a powerhouse but at ₹31K for a well-built ultrabook, the value is unbeatable. Display is sharp and viewing angles are good.',
    helpful: 5, verified: true, createdAt: new Date('2026-02-18') },

  // ── HP EliteBook 840 G8 (mock-008) ──
  { _id: 'mr-008a', productId: 'mock-008', userId: 'mu-17', userName: 'Suresh Kumar', rating: 5,
    title: 'Enterprise-grade quality at half the price',
    body: 'The Sure View privacy screen is a game changer for working on confidential data in cafés. Build quality is superb — this laptop was ₹75K new and I got it for ₹44K in excellent condition.',
    helpful: 9, verified: true, createdAt: new Date('2026-03-18') },
  { _id: 'mr-008b', productId: 'mock-008', userId: 'mu-18', userName: 'Meera Jain', rating: 4,
    title: 'Business laptop that delivers',
    body: 'Using it for my freelance consulting work. Fast i7, 16GB RAM, and 512GB SSD is perfect. The privacy screen is a nice touch. Keyboard feels great for long typing sessions.',
    helpful: 6, verified: true, createdAt: new Date('2026-01-30') },

  // ── Lenovo IdeaPad Gaming 3 (mock-009) ──
  { _id: 'mr-009a', productId: 'mock-009', userId: 'mu-19', userName: 'Siddharth Rao', rating: 4,
    title: 'Best budget gaming laptop!',
    body: 'Plays GTA V and Fortnite on medium-high settings without issues. The Ryzen 5 + GTX 1650 combo is solid for the price. 120Hz display makes gameplay smooth. Great entry point into PC gaming.',
    helpful: 11, verified: true, createdAt: new Date('2026-04-01') },
  { _id: 'mr-009b', productId: 'mock-009', userId: 'mu-20', userName: 'Tanvi Saxena', rating: 4,
    title: 'Good gaming laptop for college students',
    body: 'I use it for both studying and gaming. Handles both well. Battery life is short (about 4-5 hours) but that is expected for a gaming laptop. Display and keyboard are good for the price.',
    helpful: 5, verified: true, createdAt: new Date('2026-02-25') },

  // ── Microsoft Surface Pro 8 (mock-010) ──
  { _id: 'mr-010a', productId: 'mock-010', userId: 'mu-21', userName: 'Aditya Malhotra', rating: 5,
    title: 'Best tablet-laptop hybrid ever',
    body: 'The PixelSense display at 120Hz is gorgeous for drawing and note-taking. With the Type Cover it is a full productivity machine. The pen input latency is near-zero. Architects and designers, this one is for you!',
    helpful: 14, verified: true, createdAt: new Date('2026-03-30') },
  { _id: 'mr-010b', productId: 'mock-010', userId: 'mu-22', userName: 'Kavita Menon', rating: 4,
    title: 'Versatile device for on-the-go work',
    body: 'Love the detachable keyboard — makes it easy to switch between laptop and tablet mode. Great for meetings and presentations. Only wish it had more than 256GB storage, but cloud storage solves that.',
    helpful: 8, verified: true, createdAt: new Date('2026-01-18') },

  // ── MacBook Pro 16" M3 Max (mock-011) ──
  { _id: 'mr-011a', productId: 'mock-011', userId: 'mu-23', userName: 'Rajesh Krishnan', rating: 5,
    title: 'The ultimate creative powerhouse',
    body: 'Editing 8K RAW footage in DaVinci Resolve without dropping a single frame. 36GB unified memory handles 3D rendering in Blender effortlessly. The XDR display is the best I have ever used on a laptop. Worth every rupee.',
    helpful: 20, verified: true, createdAt: new Date('2026-04-12') },
  { _id: 'mr-011b', productId: 'mock-011', userId: 'mu-24', userName: 'Nandini Bhat', rating: 5,
    title: 'Saved ₹1.4 lakh — looks brand new',
    body: 'Was saving up for the new M3 Max but found this on ReTech in "Like New" condition. Absolutely zero signs of use. 12-month warranty sealed the deal. This machine is a monster for music production.',
    helpful: 17, verified: true, createdAt: new Date('2026-03-02') },

  // ── Razer Blade 15 (mock-012) ──
  { _id: 'mr-012a', productId: 'mock-012', userId: 'mu-25', userName: 'Varun Chawla', rating: 5,
    title: 'Sleekest gaming laptop on the market',
    body: 'The Razer Blade 15 is basically a MacBook for gamers. Premium aluminium build, RTX 3070 Ti destroys every game, and the 240Hz QHD panel is insanely smooth. Runs AAA titles on ultra without breaking a sweat.',
    helpful: 13, verified: true, createdAt: new Date('2026-02-08') },
  { _id: 'mr-012b', productId: 'mock-012', userId: 'mu-26', userName: 'Deepika Naidu', rating: 4,
    title: 'Powerful but runs warm under load',
    body: 'Incredible specs — i9 + RTX 3070 Ti is a dream combo. Only downside is thermals get toasty during prolonged gaming. Using a cooling pad solves it. Build quality is premium and the keyboard RGB is gorgeous.',
    helpful: 9, verified: true, createdAt: new Date('2026-03-22') },
];

function mongoose_available() {
  try {
    const mongoose = require('mongoose');
    return mongoose.connection.readyState === 1 && Review && Product;
  } catch { return false; }
}

// Helper: recalculate product rating & review count
async function updateProductRating(productId) {
  if (!mongoose_available()) return;
  const stats = await Review.aggregate([
    { $match: { productId: require('mongoose').Types.ObjectId.createFromHexString(productId) } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviews: stats[0].count
    });
  }
}

// GET /api/reviews/:productId — Get reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    let reviews;
    if (mongoose_available()) {
      reviews = await Review.find({ productId: req.params.productId })
        .sort({ createdAt: -1 })
        .lean();
    } else {
      reviews = mockReviews.filter(r => r.productId === req.params.productId);
    }

    // Calculate stats
    const total = reviews.length;
    const avgRating = total > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
      : 0;
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(r => { distribution[r.rating - 1]++; });

    res.json({
      success: true,
      data: {
        reviews,
        stats: { total, avgRating, distribution }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reviews — Submit a review (auth required)
router.post('/', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Please login to submit a review' });
    }

    const { productId, rating, title, body } = req.body;

    if (!productId || !rating || !title || !body) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    if (title.length > 120) {
      return res.status(400).json({ success: false, message: 'Title must be 120 characters or less' });
    }
    if (body.length > 2000) {
      return res.status(400).json({ success: false, message: 'Review must be 2000 characters or less' });
    }

    if (mongoose_available()) {
      // Check if user already reviewed this product
      const existing = await Review.findOne({
        productId,
        userId: req.session.user._id
      });
      if (existing) {
        return res.status(409).json({ success: false, message: 'You have already reviewed this product' });
      }

      const review = new Review({
        productId,
        userId: req.session.user._id,
        userName: req.session.user.name,
        rating: Number(rating),
        title,
        body,
        verified: true
      });
      await review.save();
      await updateProductRating(productId);
      res.status(201).json({ success: true, data: review });
    } else {
      // Mock mode
      const mockReview = {
        _id: 'mock-' + Date.now(),
        productId,
        userId: 'mock-user-session',
        userName: req.session.user.name,
        rating: Number(rating),
        title,
        body,
        helpful: 0,
        verified: true,
        createdAt: new Date()
      };
      res.status(201).json({ success: true, data: mockReview, message: 'Mock: Review created (DB offline)' });
    }
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this product' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reviews/:id/helpful — Mark review as helpful
router.post('/:id/helpful', async (req, res) => {
  try {
    if (mongoose_available()) {
      const review = await Review.findByIdAndUpdate(
        req.params.id,
        { $inc: { helpful: 1 } },
        { new: true }
      );
      if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
      res.json({ success: true, data: { helpful: review.helpful } });
    } else {
      res.json({ success: true, data: { helpful: 1 }, message: 'Mock: Helpful count incremented' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

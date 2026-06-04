/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║       ReTech Revival — ML Product Recommender                ║
 * ║  Hybrid content-based + collaborative filtering engine       ║
 * ║  Uses cosine similarity on multi-dimensional feature vectors ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const { SimilarityEngine } = require('./engine');

class ProductRecommender {
  constructor() {
    this.engine = new SimilarityEngine();
    this.products = [];
    this.productMap = new Map(); // id -> index
    this.brandMap = {};
    this.categoryMap = {};
    this.lastBuilt = null;
  }

  /**
   * Extract multi-dimensional feature vector for a product
   * Features: [brand_vec..., condition, ram, storage, price_norm, rating, processor_tier, category]
   */
  _extractFeatures(product) {
    // Brand one-hot (sparse)
    const brandVec = new Array(Object.keys(this.brandMap).length).fill(0);
    if (this.brandMap[product.brand] !== undefined) {
      brandVec[this.brandMap[product.brand]] = 1;
    }

    // Condition score (normalized 0-1)
    const condMap = { 'Like New': 1.0, 'Excellent': 0.75, 'Good': 0.5, 'Fair': 0.25 };
    const condScore = condMap[product.condition] || 0.5;

    // RAM normalized (4-64 GB -> 0-1)
    const ram = parseInt(String(product.ram).replace(/[^\d]/g, '')) || 8;
    const ramNorm = Math.min(ram / 64, 1);

    // Storage normalized (128GB-2TB -> 0-1)
    let storage = parseInt(String(product.storage).replace(/[^\d]/g, '')) || 256;
    if (storage <= 4) storage *= 1000;
    const storageNorm = Math.min(storage / 2000, 1);

    // Price normalized (₹20k-₹300k -> 0-1)
    const priceNorm = Math.min(product.price / 300000, 1);

    // Rating normalized
    const ratingNorm = (product.rating || 4.0) / 5.0;

    // Processor tier
    const procTier = this._processorTier(product.processor || '') / 10;

    // Category score
    const catScore = (product.category || '').toLowerCase().includes('gaming') ? 1 : 0;

    // Tags features (gaming, ultrabook, business)
    const tags = (product.tags || []).map(t => t.toLowerCase());
    const isGaming = tags.some(t => ['gaming', 'rog', 'rtx', 'gtx'].includes(t)) ? 1 : 0;
    const isUltrabook = tags.some(t => ['ultrabook', 'lightweight', 'thin'].includes(t)) ? 1 : 0;
    const isBusiness = tags.some(t => ['business', 'enterprise', 'thinkpad'].includes(t)) ? 1 : 0;
    const isPro = tags.some(t => ['pro', 'creator', 'developer'].includes(t)) ? 1 : 0;

    return [
      ...brandVec,
      condScore,
      ramNorm,
      storageNorm,
      priceNorm,
      ratingNorm,
      procTier,
      catScore,
      isGaming,
      isUltrabook,
      isBusiness,
      isPro
    ];
  }

  _processorTier(proc) {
    const p = proc.toLowerCase();
    if (p.includes('m3 max')) return 10;
    if (p.includes('m2 max') || p.includes('m3 pro')) return 9;
    if (p.includes('i9') || p.includes('r9') || p.includes('ryzen 9')) return 8;
    if (p.includes('m3') || p.includes('m2 pro') || p.includes('m1 max')) return 7.5;
    if (p.includes('m2') || p.includes('m1 pro')) return 7;
    if (p.includes('i7') || p.includes('r7') || p.includes('ryzen 7')) return 6;
    if (p.includes('m1')) return 5.5;
    if (p.includes('i5') || p.includes('r5') || p.includes('ryzen 5')) return 4;
    if (p.includes('i3') || p.includes('r3') || p.includes('ryzen 3')) return 2;
    return 3;
  }

  /**
   * Build the recommendation index from products
   * @param {Object[]} products - Product catalog
   */
  buildIndex(products) {
    this.products = products;
    this.productMap.clear();

    // Build brand map
    const brands = [...new Set(products.map(p => p.brand))];
    this.brandMap = {};
    brands.forEach((b, i) => { this.brandMap[b] = i; });

    // Build product ID to index map
    products.forEach((p, i) => {
      this.productMap.set(p._id?.toString(), i);
    });

    // Build similarity engine
    this.engine.buildIndex(products, (p) => this._extractFeatures(p));
    this.lastBuilt = new Date();

    console.log(`🤖 Recommender built index: ${products.length} products, ${Object.keys(this.brandMap).length} brands`);
  }

  /**
   * Get recommendations for a specific product
   * @param {string} productId - Product ID to get recommendations for
   * @param {number} count - Number of recommendations
   * @returns {Object[]}
   */
  getRecommendations(productId, count = 4) {
    const idx = this.productMap.get(productId);
    if (idx === undefined) return [];

    const similar = this.engine.findSimilar(idx, count);
    return similar.map(s => ({
      ...s.item,
      matchScore: Math.round(s.similarity * 100),
      matchReason: this._getMatchReason(this.products[idx], s.item)
    }));
  }

  /**
   * Get personalized recommendations based on user interaction history
   * @param {Object[]} viewedProducts - Products the user has interacted with
   * @param {number} count - Number of recommendations
   * @returns {Object[]}
   */
  getPersonalized(viewedProducts, count = 6) {
    if (!viewedProducts.length || !this.engine.normVectors.length) return [];

    // Build user preference profile by averaging feature vectors of viewed products
    const featureLen = this.engine.vectors[0].length;
    const profileVec = new Array(featureLen).fill(0);
    const weights = viewedProducts.map((_, i) => 1 + i * 0.5); // newer = higher weight
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    viewedProducts.forEach((product, i) => {
      const features = this._extractFeatures(product);
      features.forEach((v, j) => {
        profileVec[j] += v * weights[i] / totalWeight;
      });
    });

    const excludeIds = new Set(viewedProducts.map(p => p._id?.toString()));
    const results = this.engine.findSimilarByVector(profileVec, count, excludeIds);

    return results.map(r => ({
      ...r.item,
      matchScore: Math.round(r.similarity * 100),
      matchReason: 'Based on your browsing history'
    }));
  }

  /**
   * Generate human-readable match reason
   */
  _getMatchReason(source, target) {
    const reasons = [];
    if (source.brand === target.brand) reasons.push(`Same brand (${source.brand})`);
    if (source.condition === target.condition) reasons.push('Same condition');

    const sRam = parseInt(String(source.ram).replace(/[^\d]/g, '')) || 0;
    const tRam = parseInt(String(target.ram).replace(/[^\d]/g, '')) || 0;
    if (sRam === tRam) reasons.push(`Same RAM (${source.ram})`);

    const priceDiff = Math.abs(source.price - target.price) / source.price;
    if (priceDiff < 0.2) reasons.push('Similar price range');

    const sTags = new Set(source.tags || []);
    const tTags = target.tags || [];
    const sharedTags = tTags.filter(t => sTags.has(t));
    if (sharedTags.length > 0) reasons.push(`Shared: ${sharedTags.join(', ')}`);

    return reasons.length ? reasons[0] : 'Similar specifications';
  }
}

// Singleton
const recommender = new ProductRecommender();
module.exports = recommender;

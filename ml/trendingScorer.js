/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║     ReTech Revival — ML Trending / Demand Scorer             ║
 * ║  Exponential decay scoring + demand forecasting              ║
 * ║  Identifies trending products based on user interactions     ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const { TrendingScorer } = require('./engine');

class DemandForecaster {
  constructor() {
    this.trendingScores = new Map();
    this.lastComputed = null;
    this.topTrending = [];
  }

  /**
   * Compute trending scores from recent interactions
   * @param {Object[]} interactions - UserInteraction documents
   * @param {Object[]} products - Product catalog
   * @param {number} halfLifeHours - Decay half-life (default 72 hours)
   */
  compute(interactions, products, halfLifeHours = 72) {
    // Base trending scores from real interactions
    this.trendingScores = TrendingScorer.score(interactions, halfLifeHours);

    // If no interactions yet, generate synthetic scores based on product attributes
    if (this.trendingScores.size === 0 && products.length > 0) {
      this._generateSyntheticScores(products);
    }

    // Rank products
    const productData = products.map(p => {
      const id = p._id?.toString();
      const score = this.trendingScores.get(id) || 0;
      return { ...p, trendScore: score };
    });

    productData.sort((a, b) => b.trendScore - a.trendScore);
    this.topTrending = productData;
    this.lastComputed = new Date();

    console.log(`📈 Trending computed: ${this.trendingScores.size} scored items, top score = ${productData[0]?.trendScore?.toFixed(2) || 0}`);
  }

  /**
   * Generate realistic synthetic scores when there are no real interactions
   * Uses product attributes to create plausible trending scores
   */
  _generateSyntheticScores(products) {
    for (const product of products) {
      const id = product._id?.toString();
      if (!id) continue;

      let score = 0;

      // Higher ratings -> more trending
      score += (product.rating || 4) * 3;

      // More reviews -> more popular
      score += Math.min(product.reviews || 0, 200) * 0.15;

      // Better condition -> more desirable
      const condBonus = { 'Like New': 8, 'Excellent': 5, 'Good': 2, 'Fair': 0 };
      score += condBonus[product.condition] || 0;

      // Bigger discount -> more trending
      if (product.originalPrice && product.price) {
        const discount = (1 - product.price / product.originalPrice) * 100;
        score += discount * 0.2;
      }

      // Popular brands get a boost
      const brandBoost = { 'Apple': 6, 'ASUS': 3, 'Dell': 2, 'HP': 2, 'Lenovo': 2, 'Microsoft': 2 };
      score += brandBoost[product.brand] || 0;

      // Gaming/high-spec devices trend higher
      const tags = (product.tags || []).map(t => t.toLowerCase());
      if (tags.some(t => ['gaming', 'rog', 'rtx'].includes(t))) score += 5;
      if (tags.some(t => ['m1', 'm2', 'm3'].includes(t))) score += 4;

      // Add randomness for variety
      score += Math.random() * 4;

      this.trendingScores.set(id, Math.round(score * 100) / 100);
    }
  }

  /**
   * Get top trending products
   * @param {number} count - Number of trending products to return
   * @returns {Object[]}
   */
  getTopTrending(count = 6) {
    return this.topTrending.slice(0, count).map(p => ({
      ...p,
      trendLabel: this._getTrendLabel(p.trendScore),
      trendEmoji: this._getTrendEmoji(p.trendScore)
    }));
  }

  /**
   * Get trend score for a specific product
   * @param {string} productId
   * @returns {Object}
   */
  getProductTrend(productId) {
    const score = this.trendingScores.get(productId) || 0;
    const rank = this.topTrending.findIndex(p => p._id?.toString() === productId) + 1;
    return {
      score: Math.round(score * 100) / 100,
      rank: rank || null,
      label: this._getTrendLabel(score),
      emoji: this._getTrendEmoji(score),
      percentile: rank ? Math.round((1 - rank / this.topTrending.length) * 100) : 0
    };
  }

  /**
   * Check if a product is trending (top 30%)
   */
  isTrending(productId) {
    const rank = this.topTrending.findIndex(p => p._id?.toString() === productId) + 1;
    if (!rank) return false;
    return rank <= Math.max(3, Math.ceil(this.topTrending.length * 0.3));
  }

  _getTrendLabel(score) {
    if (score > 40) return 'Hot Right Now';
    if (score > 25) return 'Trending';
    if (score > 15) return 'Popular';
    if (score > 8) return 'Rising';
    return 'Steady';
  }

  _getTrendEmoji(score) {
    if (score > 40) return '🔥';
    if (score > 25) return '📈';
    if (score > 15) return '⭐';
    if (score > 8) return '↗️';
    return '📊';
  }
}

// Singleton
const forecaster = new DemandForecaster();
module.exports = forecaster;

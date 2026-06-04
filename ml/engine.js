/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           ReTech Revival — ML Core Engine                    ║
 * ║  Lightweight ML algorithms implemented in pure JavaScript    ║
 * ║  No external ML library dependencies required                ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ── Multi-variable Linear Regression ─────────────────────────
class LinearRegression {
  constructor() {
    this.weights = [];
    this.bias = 0;
    this.featureNames = [];
    this.featureMeans = [];
    this.featureStds = [];
    this.targetMean = 0;
    this.targetStd = 1;
    this.trained = false;
  }

  /**
   * Train the regression model using gradient descent
   * @param {number[][]} X - Feature matrix (each row is a sample)
   * @param {number[]} y - Target values
   * @param {Object} opts - Training options
   */
  train(X, y, opts = {}) {
    const lr = opts.learningRate || 0.01;
    const epochs = opts.epochs || 1000;
    const n = X.length;
    if (n === 0) return;

    const numFeatures = X[0].length;

    // Normalize features (z-score)
    this.featureMeans = new Array(numFeatures).fill(0);
    this.featureStds = new Array(numFeatures).fill(1);
    for (let j = 0; j < numFeatures; j++) {
      const col = X.map(row => row[j]);
      this.featureMeans[j] = col.reduce((a, b) => a + b, 0) / n;
      const variance = col.reduce((sum, v) => sum + (v - this.featureMeans[j]) ** 2, 0) / n;
      this.featureStds[j] = Math.sqrt(variance) || 1;
    }

    // Normalize target
    this.targetMean = y.reduce((a, b) => a + b, 0) / n;
    const tVar = y.reduce((sum, v) => sum + (v - this.targetMean) ** 2, 0) / n;
    this.targetStd = Math.sqrt(tVar) || 1;

    // Normalize data
    const Xn = X.map(row => row.map((v, j) => (v - this.featureMeans[j]) / this.featureStds[j]));
    const yn = y.map(v => (v - this.targetMean) / this.targetStd);

    // Initialize weights
    this.weights = new Array(numFeatures).fill(0);
    this.bias = 0;

    // Gradient descent
    for (let epoch = 0; epoch < epochs; epoch++) {
      let biasGrad = 0;
      const wGrad = new Array(numFeatures).fill(0);

      for (let i = 0; i < n; i++) {
        let pred = this.bias;
        for (let j = 0; j < numFeatures; j++) {
          pred += this.weights[j] * Xn[i][j];
        }
        const error = pred - yn[i];
        biasGrad += error;
        for (let j = 0; j < numFeatures; j++) {
          wGrad[j] += error * Xn[i][j];
        }
      }

      this.bias -= (lr / n) * biasGrad;
      for (let j = 0; j < numFeatures; j++) {
        this.weights[j] -= (lr / n) * wGrad[j];
      }
    }

    this.trained = true;
  }

  /**
   * Predict value for a single sample
   * @param {number[]} features - Feature vector
   * @returns {number} Predicted value (denormalized)
   */
  predict(features) {
    if (!this.trained) return 0;
    const normalized = features.map((v, j) => (v - this.featureMeans[j]) / this.featureStds[j]);
    let pred = this.bias;
    for (let j = 0; j < normalized.length; j++) {
      pred += this.weights[j] * normalized[j];
    }
    return pred * this.targetStd + this.targetMean;
  }

  /**
   * Get R² score for model evaluation
   */
  score(X, y) {
    const predictions = X.map(row => this.predict(row));
    const mean = y.reduce((a, b) => a + b, 0) / y.length;
    const ssRes = y.reduce((sum, actual, i) => sum + (actual - predictions[i]) ** 2, 0);
    const ssTot = y.reduce((sum, actual) => sum + (actual - mean) ** 2, 0);
    return 1 - (ssRes / (ssTot || 1));
  }
}

// ── Cosine Similarity Engine ─────────────────────────────────
class SimilarityEngine {
  constructor() {
    this.items = [];
    this.vectors = [];
    this.featureNames = [];
  }

  /**
   * Build the similarity index from items
   * @param {Object[]} items - Array of items with features
   * @param {Function} featureExtractor - Function to extract feature vector from item
   */
  buildIndex(items, featureExtractor) {
    this.items = items;
    this.vectors = items.map(featureExtractor);
    // Normalize vectors for faster cosine computation
    this.normVectors = this.vectors.map(v => {
      const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
      return v.map(x => x / norm);
    });
  }

  /**
   * Find K most similar items to a given item
   * @param {number} itemIndex - Index of the reference item
   * @param {number} k - Number of recommendations
   * @returns {Object[]} Array of { item, similarity } objects
   */
  findSimilar(itemIndex, k = 5) {
    if (itemIndex < 0 || itemIndex >= this.items.length) return [];
    const refVec = this.normVectors[itemIndex];

    const scores = this.normVectors.map((vec, i) => {
      if (i === itemIndex) return { index: i, score: -1 }; // exclude self
      const sim = vec.reduce((sum, v, j) => sum + v * refVec[j], 0);
      return { index: i, score: sim };
    });

    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, k).map(s => ({
      item: this.items[s.index],
      similarity: Math.round(s.score * 100) / 100
    }));
  }

  /**
   * Find similar items by an ad-hoc feature vector (e.g., user preference profile)
   * @param {number[]} queryVec - Feature vector
   * @param {number} k - Number of results
   * @param {Set} excludeIds - Set of item IDs to exclude
   * @returns {Object[]}
   */
  findSimilarByVector(queryVec, k = 5, excludeIds = new Set()) {
    const qNorm = Math.sqrt(queryVec.reduce((s, x) => s + x * x, 0)) || 1;
    const qNormVec = queryVec.map(x => x / qNorm);

    const scores = this.normVectors.map((vec, i) => {
      if (excludeIds.has(this.items[i]._id?.toString())) return { index: i, score: -1 };
      const sim = vec.reduce((sum, v, j) => sum + v * qNormVec[j], 0);
      return { index: i, score: sim };
    });

    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, k).map(s => ({
      item: this.items[s.index],
      similarity: Math.round(s.score * 100) / 100
    }));
  }
}

// ── Exponential Decay Trending Scorer ────────────────────────
class TrendingScorer {
  /**
   * Score items by recency-weighted interaction counts
   * @param {Object[]} interactions - Array of { itemId, timestamp, type }
   * @param {number} halfLifeHours - Half-life for exponential decay (default 72h)
   * @returns {Map<string, number>} Map of itemId -> trending score
   */
  static score(interactions, halfLifeHours = 72) {
    const now = Date.now();
    const lambda = Math.LN2 / (halfLifeHours * 3600 * 1000);
    const typeWeights = { view: 1, click: 2, cart: 5, purchase: 10, search: 1.5 };
    const scores = new Map();

    for (const interaction of interactions) {
      const age = now - new Date(interaction.createdAt || interaction.timestamp).getTime();
      const decay = Math.exp(-lambda * age);
      const weight = typeWeights[interaction.type] || 1;
      const itemId = interaction.productId || interaction.itemId;
      scores.set(itemId, (scores.get(itemId) || 0) + weight * decay);
    }

    return scores;
  }

  /**
   * Rank items by trending score
   * @param {Object[]} items - Items to rank (must have _id)
   * @param {Map<string, number>} scores - Trending scores map
   * @returns {Object[]} Items sorted by trending score descending, with trendScore attached
   */
  static rank(items, scores) {
    return items
      .map(item => ({
        ...item,
        trendScore: scores.get(item._id?.toString()) || 0
      }))
      .sort((a, b) => b.trendScore - a.trendScore);
  }
}

// ── K-Means Clustering (for user segmentation) ───────────────
class KMeans {
  /**
   * Simple K-Means clustering
   * @param {number[][]} data - Data points
   * @param {number} k - Number of clusters
   * @param {number} maxIter - Maximum iterations
   * @returns {{ centroids: number[][], labels: number[] }}
   */
  static cluster(data, k = 3, maxIter = 50) {
    const n = data.length;
    if (n === 0) return { centroids: [], labels: [] };
    const dim = data[0].length;

    // Initialize centroids randomly (K-means++)
    const centroids = [data[Math.floor(Math.random() * n)].slice()];
    while (centroids.length < k) {
      const distances = data.map(point => {
        return Math.min(...centroids.map(c =>
          point.reduce((sum, v, i) => sum + (v - c[i]) ** 2, 0)
        ));
      });
      const totalDist = distances.reduce((a, b) => a + b, 0);
      let r = Math.random() * totalDist;
      for (let i = 0; i < n; i++) {
        r -= distances[i];
        if (r <= 0) { centroids.push(data[i].slice()); break; }
      }
    }

    let labels = new Array(n).fill(0);

    for (let iter = 0; iter < maxIter; iter++) {
      // Assignment step
      const newLabels = data.map(point => {
        let minDist = Infinity, minIdx = 0;
        centroids.forEach((c, ci) => {
          const dist = point.reduce((sum, v, i) => sum + (v - c[i]) ** 2, 0);
          if (dist < minDist) { minDist = dist; minIdx = ci; }
        });
        return minIdx;
      });

      // Check convergence
      if (newLabels.every((l, i) => l === labels[i])) break;
      labels = newLabels;

      // Update step
      for (let ci = 0; ci < k; ci++) {
        const members = data.filter((_, i) => labels[i] === ci);
        if (members.length === 0) continue;
        for (let d = 0; d < dim; d++) {
          centroids[ci][d] = members.reduce((s, m) => s + m[d], 0) / members.length;
        }
      }
    }

    return { centroids, labels };
  }
}

module.exports = { LinearRegression, SimilarityEngine, TrendingScorer, KMeans };

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║       ReTech Revival — Frontend ML Widgets                   ║
 * ║  Premium UI components for ML model results                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ── ML Interaction Tracker ────────────────────────────────────
const MLTracker = {
  track(productId, type, metadata = {}) {
    if (!productId) return;
    fetch('/api/ml/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, type, metadata })
    }).catch(() => {});
    // Also store locally for personalization
    const viewed = JSON.parse(localStorage.getItem('rt_viewed') || '[]');
    if (!viewed.includes(productId)) {
      viewed.push(productId);
      if (viewed.length > 30) viewed.shift();
      localStorage.setItem('rt_viewed', JSON.stringify(viewed));
    }
  },
  getViewed() {
    return JSON.parse(localStorage.getItem('rt_viewed') || '[]');
  }
};

// ── Recommendation Carousel Widget ───────────────────────────
async function loadRecommendations(productId, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="ml-section">
      <div class="ml-section-header">
        <div class="ml-section-title">
          <span class="ml-badge-ai">🤖 AI</span>
          <h3>You May Also Like</h3>
        </div>
        <span class="ml-powered">Powered by ML Engine</span>
      </div>
      <div class="ml-recs-grid ml-loading">
        ${Array(4).fill('<div class="ml-skeleton-card"><div class="ml-skeleton-img"></div><div class="ml-skeleton-text"></div><div class="ml-skeleton-text short"></div></div>').join('')}
      </div>
    </div>`;

  try {
    const r = await fetch('/api/ml/recommend/' + productId + '?count=4');
    const data = await r.json();
    if (!data.success || !data.data.length) {
      container.innerHTML = '';
      return;
    }

    const grid = container.querySelector('.ml-recs-grid');
    grid.classList.remove('ml-loading');
    grid.innerHTML = data.data.map(p => `
      <div class="ml-rec-card" onclick="location.href='/product.html?id=${p._id}'">
        <div class="ml-rec-match">${p.matchScore}% Match</div>
        <div class="ml-rec-img">
          <img src="${p.images?.[0] || 'img/laptop2.png'}" alt="${p.name}" loading="lazy" />
        </div>
        <div class="ml-rec-body">
          <div class="ml-rec-name">${p.name}</div>
          <div class="ml-rec-reason">${p.matchReason}</div>
          <div class="ml-rec-price">
            <span class="ml-rec-current">${formatPrice(p.price)}</span>
            <span class="ml-rec-original">${formatPrice(p.originalPrice)}</span>
          </div>
        </div>
      </div>`).join('');
  } catch (e) {
    container.innerHTML = '';
  }
}

// ── Trending Products Widget ─────────────────────────────────
async function loadTrending(containerId, count = 6) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="ml-trending-grid ml-loading">
      ${Array(count).fill('<div class="ml-skeleton-card"><div class="ml-skeleton-img"></div><div class="ml-skeleton-text"></div></div>').join('')}
    </div>`;

  try {
    const r = await fetch('/api/ml/trending?count=' + count);
    const data = await r.json();
    if (!data.success || !data.data.length) {
      container.innerHTML = '<p style="text-align:center;color:var(--text3)">No trending data available yet</p>';
      return;
    }

    const grid = container.querySelector('.ml-trending-grid');
    grid.classList.remove('ml-loading');
    grid.innerHTML = data.data.map((p, i) => `
      <div class="ml-trending-card" onclick="location.href='/product.html?id=${p._id}'">
        <div class="ml-trending-rank">#${i + 1}</div>
        <div class="ml-trending-badge">${p.trendEmoji} ${p.trendLabel}</div>
        <div class="ml-trending-img">
          <img src="${p.images?.[0] || 'img/laptop2.png'}" alt="${p.name}" loading="lazy" />
        </div>
        <div class="ml-trending-body">
          <div class="ml-trending-name">${p.name}</div>
          <div class="ml-trending-specs">${p.processor || ''} · ${p.ram || ''}</div>
          <div class="ml-trending-price">
            <span class="ml-trending-current">${formatPrice(p.price)}</span>
            <span class="ml-trending-score">Score: ${p.trendScore?.toFixed(1) || '0'}</span>
          </div>
        </div>
      </div>`).join('');
  } catch (e) {
    container.innerHTML = '';
  }
}

// ── AI Price Insights Widget (Product Page) ──────────────────
async function loadProductInsights(productId, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const r = await fetch('/api/ml/product-insights/' + productId);
    const data = await r.json();
    if (!data.success) return;

    const { priceTag, trend, isTrending } = data.data;
    let html = '<div class="ml-insights">';

    // AI Price Tag
    if (priceTag) {
      const colorMap = {
        green: 'rgba(5,150,105,0.12)',
        blue: 'rgba(14,165,233,0.12)',
        gray: 'rgba(107,114,128,0.12)',
        violet: 'rgba(139,92,246,0.12)'
      };
      const borderMap = {
        green: 'rgba(5,150,105,0.3)',
        blue: 'rgba(14,165,233,0.3)',
        gray: 'rgba(107,114,128,0.3)',
        violet: 'rgba(139,92,246,0.3)'
      };
      html += `
        <div class="ml-price-insight" style="background:${colorMap[priceTag.color]};border-color:${borderMap[priceTag.color]}">
          <div class="ml-price-insight-header">
            <span class="ml-badge-ai">🤖 AI Analysis</span>
            <span class="ml-confidence">${priceTag.confidence}% confidence</span>
          </div>
          <div class="ml-price-tag">${priceTag.tag}</div>
          <div class="ml-price-details">
            <div class="ml-fair-price">
              <span class="ml-label">AI Fair Value</span>
              <span class="ml-value">${formatPrice(priceTag.fairPrice)}</span>
            </div>
            ${priceTag.savings > 0 ? `
            <div class="ml-savings-pill">
              <span>You save ${formatPrice(priceTag.savings)} (${priceTag.savingsPct}%)</span>
            </div>` : ''}
          </div>
        </div>`;
    }

    // Trending Badge
    if (isTrending && trend) {
      html += `
        <div class="ml-trend-badge">
          <span>${trend.emoji} ${trend.label}</span>
          <span class="ml-trend-rank">${trend.rank ? '#' + trend.rank + ' trending' : ''}</span>
        </div>`;
    }

    html += '</div>';
    container.innerHTML = html;
  } catch (e) {
    // Silently fail — ML insights are supplementary
  }
}

// ── AI Price Prediction Widget (Sell Page) ───────────────────
async function getAIPricePrediction(specs) {
  try {
    const r = await fetch('/api/ml/predict-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(specs)
    });
    const data = await r.json();
    if (data.success) return data.data;
  } catch (e) {}
  return null;
}

function renderAIPrediction(prediction, containerId) {
  const container = document.getElementById(containerId);
  if (!container || !prediction || !prediction.aiPowered) return;

  container.innerHTML = `
    <div class="ml-prediction-card">
      <div class="ml-prediction-header">
        <span class="ml-badge-ai">🧠 AI</span>
        <span class="ml-prediction-title">Smart Price Prediction</span>
      </div>
      <div class="ml-prediction-body">
        <div class="ml-prediction-main">
          <span class="ml-prediction-label">ML Predicted Value</span>
          <span class="ml-prediction-value">${formatPrice(prediction.predicted)}</span>
        </div>
        <div class="ml-prediction-range">
          <div class="ml-range-bar">
            <div class="ml-range-fill" style="width:${prediction.confidence}%"></div>
          </div>
          <div class="ml-range-labels">
            <span>${formatPrice(prediction.range.min)}</span>
            <span class="ml-confidence-text">${prediction.confidence}% confident</span>
            <span>${formatPrice(prediction.range.max)}</span>
          </div>
        </div>
        <div class="ml-model-info">
          <span>🔬 ${prediction.modelInfo.algorithm}</span>
          <span>📊 ${prediction.modelInfo.features} features analyzed</span>
        </div>
      </div>
    </div>`;
}

// ── Trending Badges for Catalog ──────────────────────────────
async function enrichCatalogWithML(products) {
  try {
    const r = await fetch('/api/ml/trending?count=100');
    const data = await r.json();
    if (!data.success) return products;

    const trendMap = new Map();
    data.data.forEach((t, i) => {
      trendMap.set(t._id?.toString(), { rank: i + 1, label: t.trendLabel, emoji: t.trendEmoji, score: t.trendScore });
    });

    return products.map(p => {
      const trend = trendMap.get(p._id?.toString());
      return { ...p, _mlTrend: trend || null };
    });
  } catch (e) {
    return products;
  }
}

// ── ML Status Dashboard Widget ───────────────────────────────
async function loadMLStatus(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const r = await fetch('/api/ml/status');
    const data = await r.json();
    if (!data.success) return;

    const m = data.data.models;
    container.innerHTML = `
      <div class="ml-status-grid">
        <div class="ml-status-card ${m.pricePredictor.trained ? 'active' : ''}">
          <div class="ml-status-icon">🧠</div>
          <div class="ml-status-name">Price Predictor</div>
          <div class="ml-status-state">${m.pricePredictor.trained ? '● Active' : '○ Inactive'}</div>
        </div>
        <div class="ml-status-card ${m.recommender.built ? 'active' : ''}">
          <div class="ml-status-icon">🤖</div>
          <div class="ml-status-name">Recommender</div>
          <div class="ml-status-state">${m.recommender.built ? '● ' + m.recommender.productCount + ' products' : '○ Not built'}</div>
        </div>
        <div class="ml-status-card ${m.trending.computed ? 'active' : ''}">
          <div class="ml-status-icon">📈</div>
          <div class="ml-status-name">Trending Scorer</div>
          <div class="ml-status-state">${m.trending.computed ? '● ' + m.trending.scoredItems + ' scored' : '○ Not computed'}</div>
        </div>
      </div>`;
  } catch (e) {}
}

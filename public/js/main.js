// ── Global JS: Navbar, Auth State, Toast, Cart Count ─────────

// Navbar scroll effect
window.addEventListener('scroll', () => {
  document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 20);
});

// Active nav link
document.querySelectorAll('.nav-links a').forEach(link => {
  if (link.href === location.href) link.classList.add('active');
});

// Toast system
function showToast(msg, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s forwards';
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

// Format price in Indian Rupees
function formatPrice(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

// Stars renderer
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
}

// Condition badge color
function conditionBadgeClass(condition) {
  const map = { 'Like New': 'badge-green', 'Excellent': 'badge-blue', 'Good': 'badge-violet', 'Fair': 'badge-orange' };
  return map[condition] || 'badge-violet';
}

// Discount % calculator
function discountPct(price, original) {
  return Math.round((1 - price / original) * 100);
}

// ── Auth state management ─────────────────────────────────────
let currentUser = null;

async function loadAuthState() {
  try {
    const r = await fetch('/api/me');
    const data = await r.json();
    currentUser = data.loggedIn ? data.user : null;
  } catch { currentUser = null; }
  updateNavAuth();
}

function updateNavAuth() {
  const loginBtn = document.getElementById('nav-login-btn');
  const signupBtn = document.getElementById('nav-signup-btn');
  const userMenu = document.getElementById('nav-user-menu');
  const userName = document.getElementById('nav-user-name');

  if (currentUser) {
    if (loginBtn) loginBtn.classList.add('hidden');
    if (signupBtn) signupBtn.classList.add('hidden');
    if (userMenu) userMenu.classList.remove('hidden');
    if (userName) userName.textContent = currentUser.name.split(' ')[0];
  } else {
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (signupBtn) signupBtn.classList.remove('hidden');
    if (userMenu) userMenu.classList.add('hidden');
  }
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  currentUser = null;
  showToast('Logged out successfully', 'info');
  setTimeout(() => location.href = '/', 800);
}

// ── Cart count update ─────────────────────────────────────────
async function updateCartCount() {
  try {
    const r = await fetch('/api/cart');
    const data = await r.json();
    const badge = document.getElementById('cart-count-badge');
    if (badge) badge.textContent = data.data.count || 0;
  } catch { }
}

// ── Add to cart ───────────────────────────────────────────────
async function addToCart(productId, name, price, brand, condition) {
  try {
    const r = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, name, price, brand, condition })
    });
    const data = await r.json();
    if (data.success) {
      showToast(`${name} added to cart!`, 'success');
      updateCartCount();
    } else {
      showToast(data.message || 'Failed to add to cart', 'error');
    }
  } catch {
    showToast('Network error. Please try again.', 'error');
  }
}

// Init
loadAuthState();
updateCartCount();

// ── Theme Management ──────────────────────────────────────────
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') document.documentElement.dataset.theme = 'dark';

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'theme-toggle';
  toggleBtn.style.cssText = 'position:fixed; bottom:20px; left:20px; z-index:9999; background:var(--bg2); border:1px solid var(--border); border-radius:50%; width:44px; height:44px; cursor:pointer; box-shadow:var(--shadow); display:flex; align-items:center; justify-content:center; color:var(--text); transition:all 0.3s ease;';

  const updateIcon = () => {
    toggleBtn.innerHTML = document.documentElement.dataset.theme === 'dark'
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
  };

  toggleBtn.onmouseenter = () => toggleBtn.style.transform = 'scale(1.1)';
  toggleBtn.onmouseleave = () => toggleBtn.style.transform = 'scale(1)';

  toggleBtn.onclick = () => {
    const current = document.documentElement.dataset.theme;
    const next = current === 'dark' ? 'light' : 'dark';
    if (next === 'dark') document.documentElement.dataset.theme = 'dark';
    else delete document.documentElement.dataset.theme;
    localStorage.setItem('theme', next);
    updateIcon();
  };

  document.body.appendChild(toggleBtn);
  updateIcon();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}

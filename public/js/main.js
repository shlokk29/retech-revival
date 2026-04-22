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
  const loginBtn  = document.getElementById('nav-login-btn');
  const signupBtn = document.getElementById('nav-signup-btn');
  const userMenu  = document.getElementById('nav-user-menu');
  const userName  = document.getElementById('nav-user-name');

  if (currentUser) {
    if (loginBtn)  loginBtn.classList.add('hidden');
    if (signupBtn) signupBtn.classList.add('hidden');
    if (userMenu)  userMenu.classList.remove('hidden');
    if (userName)  userName.textContent = currentUser.name.split(' ')[0];
  } else {
    if (loginBtn)  loginBtn.classList.remove('hidden');
    if (signupBtn) signupBtn.classList.remove('hidden');
    if (userMenu)  userMenu.classList.add('hidden');
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
  } catch {}
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

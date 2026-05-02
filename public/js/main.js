// ── Apply theme before paint (prevents FOUC) ─────────────────
(function () {
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.dataset.theme = 'dark';
  }
})();

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

// ── Add to cart (auth-gated) ──────────────────────────────────
async function addToCart(productId, name, price, brand, condition, image, type = 'buy', duration = null) {
  // Block if not logged in — show sign-in modal
  if (!currentUser) {
    showAuthRequiredModal();
    return;
  }
  try {
    const r = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, name, price, brand, condition, image: image || '', type, duration })
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

// ── Auth-Required Modal ───────────────────────────────────────
function showAuthRequiredModal() {
  // Don't stack multiples
  if (document.getElementById('auth-required-modal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'auth-required-modal';
  overlay.style.cssText = `
    position:fixed; inset:0; z-index:50000;
    background:rgba(0,0,0,0.65); backdrop-filter:blur(8px);
    display:flex; align-items:center; justify-content:center;
    animation: authModalFadeIn 0.3s ease forwards;
  `;

  overlay.innerHTML = `
    <style>
      @keyframes authModalFadeIn { from{opacity:0} to{opacity:1} }
      @keyframes authModalSlideUp { from{opacity:0;transform:translateY(32px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes authModalShake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-6px)} 30%{transform:translateX(6px)} 45%{transform:translateX(-4px)} 60%{transform:translateX(4px)} 75%{transform:translateX(-2px)} }
      .auth-modal-card {
        background:var(--bg2); border:1px solid var(--border); border-radius:24px;
        padding:2.5rem 2rem; width:100%; max-width:420px; position:relative;
        box-shadow: 0 32px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05);
        animation: authModalSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards;
        text-align:center;
      }
      .auth-modal-icon {
        width:72px; height:72px; border-radius:50%; margin:0 auto 1.25rem;
        background: linear-gradient(135deg, rgba(15,40,71,0.15), rgba(16,185,129,0.1));
        display:flex; align-items:center; justify-content:center;
        font-size:2rem;
        animation: authModalShake 0.6s ease 0.4s;
      }
      .auth-modal-card h2 { font-size:1.4rem; font-weight:800; margin-bottom:0.5rem; color:var(--text); }
      .auth-modal-card p  { font-size:0.92rem; color:var(--text2); line-height:1.6; margin-bottom:1.75rem; }
      .auth-modal-btns { display:flex; flex-direction:column; gap:0.65rem; }
      .auth-modal-btns a, .auth-modal-btns button {
        display:flex; align-items:center; justify-content:center; gap:0.5rem;
        padding:0.85rem 1.5rem; border-radius:12px; font-size:0.95rem;
        font-weight:600; font-family:inherit; cursor:pointer;
        transition: all 0.25s; text-decoration:none; border:none;
      }
      .auth-modal-login {
        background: linear-gradient(135deg, var(--primary), #0a1628);
        color:white; box-shadow: 0 4px 20px rgba(15,40,71,0.4);
        position:relative; overflow:hidden;
      }
      .auth-modal-login:hover { transform:translateY(-2px); box-shadow: 0 8px 30px rgba(15,40,71,0.55); }
      .auth-modal-login::after {
        content:''; position:absolute; top:0; left:-100%; width:50%; height:100%;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);
        transform:skewX(-20deg); animation: shimmer 3s infinite;
      }
      .auth-modal-signup {
        background:var(--bg3); border:1px solid var(--border); color:var(--text);
      }
      .auth-modal-signup:hover { border-color:var(--primary); color:var(--primary); transform:translateY(-1px); }
      .auth-modal-close {
        position:absolute; top:16px; right:16px;
        background:var(--bg3); border:1px solid var(--border);
        color:var(--text2); width:32px; height:32px;
        border-radius:50%; display:flex; align-items:center; justify-content:center;
        cursor:pointer; font-size:1.1rem; transition:all 0.2s;
      }
      .auth-modal-close:hover { background:rgba(244,63,94,0.1); color:var(--red); border-color:rgba(244,63,94,0.3); transform:rotate(90deg); }
      .auth-modal-perks { display:flex; justify-content:center; gap:1.5rem; margin-bottom:1.5rem; }
      .auth-modal-perk { display:flex; flex-direction:column; align-items:center; gap:0.3rem; font-size:0.75rem; color:var(--text2); }
      .auth-modal-perk span:first-child { font-size:1.2rem; }
      .auth-modal-skip { background:none!important; border:none!important; color:var(--text3)!important; font-size:0.82rem!important; padding:0.5rem!important; }
      .auth-modal-skip:hover { color:var(--text2)!important; text-decoration:underline; transform:none!important; }
    </style>
    <div class="auth-modal-card">
      <button class="auth-modal-close" onclick="closeAuthModal()" aria-label="Close">✕</button>
      <div class="auth-modal-icon">🔒</div>
      <h2>Sign In Required</h2>
      <p>Create a free account or log in to add items to your cart, track orders, and enjoy a personalized experience.</p>
      <div class="auth-modal-perks">
        <div class="auth-modal-perk"><span>🛡️</span> Warranty</div>
        <div class="auth-modal-perk"><span>📦</span> Free Delivery</div>
        <div class="auth-modal-perk"><span>🔄</span> 30-Day Returns</div>
      </div>
      <div class="auth-modal-btns">
        <a href="/login.html" class="auth-modal-login">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          Log In
        </a>
        <a href="/signup.html" class="auth-modal-signup">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          Create Free Account
        </a>
        <button class="auth-modal-skip" onclick="closeAuthModal()">Continue browsing</button>
      </div>
    </div>
  `;

  // Close on overlay click (outside card)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeAuthModal();
  });

  // Close on Escape key
  const escHandler = (e) => {
    if (e.key === 'Escape') { closeAuthModal(); document.removeEventListener('keydown', escHandler); }
  };
  document.addEventListener('keydown', escHandler);

  document.body.appendChild(overlay);
}

function closeAuthModal() {
  const modal = document.getElementById('auth-required-modal');
  if (modal) {
    modal.style.animation = 'authModalFadeIn 0.2s ease reverse forwards';
    setTimeout(() => modal.remove(), 200);
  }
}

// ── Mobile Nav Toggle (global) ────────────────────────────────
function toggleMenu() {
  const navLinks = document.getElementById('nav-links');
  if (!navLinks) return;
  navLinks.classList.toggle('open');
  // Close menu when clicking outside
  if (navLinks.classList.contains('open')) {
    setTimeout(() => {
      document.addEventListener('click', function closeNav(e) {
        if (!navLinks.contains(e.target) && !e.target.closest('.hamburger')) {
          navLinks.classList.remove('open');
          document.removeEventListener('click', closeNav);
        }
      });
    }, 10);
  }
}

// Close mobile nav on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    const navLinks = document.getElementById('nav-links');
    if (navLinks) navLinks.classList.remove('open');
  });
});

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

// ── AI Chatbot Auto-loader ────────────────────────────────────
(function loadChatbot() {
  // Inject chatbot CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/chatbot.css';
  document.head.appendChild(link);

  // Inject chatbot JS
  const script = document.createElement('script');
  script.src = 'js/chatbot.js';
  script.defer = true;
  document.body.appendChild(script);
})();

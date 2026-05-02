const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// New logo HTML to replace the old icon-based logo in navbars
const oldNavLogoSingle = `<a href="/" class="nav-logo"><div class="logo-icon"><i data-lucide="recycle"></i></div><span>Retech Revival</span></a>`;
const newNavLogo = `<a href="/" class="nav-logo">
      <img src="img/logo.png" alt="Retech Revival Logo" style="width:36px;height:36px;border-radius:8px;object-fit:cover;">
      <div>
        <span style="display:block;font-weight:800;letter-spacing:-0.02em;">Retech Revival</span>
        <span style="display:block;font-size:0.62rem;color:var(--text2);letter-spacing:0.08em;text-transform:uppercase;margin-top:-2px;">Tech Reborn. Value Restored.</span>
      </div>
    </a>`;

// Footer logo pattern
const oldFooterLogo = `<div class="nav-logo"><div class="logo-icon"><i data-lucide="recycle"></i></div><span>Retech Revival</span></div>`;
const newFooterLogo = `<div class="nav-logo">
            <img src="img/logo.png" alt="Retech Revival Logo" style="width:32px;height:32px;border-radius:8px;object-fit:cover;">
            <div>
              <span style="display:block;font-weight:800;letter-spacing:-0.02em;">Retech Revival</span>
              <span style="display:block;font-size:0.6rem;color:var(--text2);letter-spacing:0.08em;text-transform:uppercase;margin-top:-2px;">Tech Reborn. Value Restored.</span>
            </div>
          </div>`;

const files = ['catalog.html', 'product.html', 'sell.html', 'cart.html', 'about.html', 'dashboard.html'];

files.forEach(file => {
  const filepath = path.join(publicDir, file);
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');
  let changed = false;

  if (content.includes(oldNavLogoSingle)) {
    content = content.replace(oldNavLogoSingle, newNavLogo);
    changed = true;
  }
  if (content.includes(oldFooterLogo)) {
    content = content.replace(oldFooterLogo, newFooterLogo);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Updated:', file);
  } else {
    console.log('No match in:', file);
  }
});

// Also fix login and signup pages (they use a different logo format)
['login.html', 'signup.html'].forEach(file => {
  const filepath = path.join(publicDir, file);
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');
  const old = `<div class="logo-icon"><i data-lucide="recycle"></i></div>`;
  const newLogo = `<img src="img/logo.png" alt="Logo" style="width:44px;height:44px;border-radius:10px;object-fit:cover;box-shadow:0 0 20px rgba(108,99,255,0.4);">`;
  if (content.includes(old)) {
    content = content.replace(old, newLogo);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Updated:', file);
  }
});

console.log('Done!');

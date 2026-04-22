const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

function replaceInFile(filename, replaceFn) {
  const filepath = path.join(publicDir, filename);
  if (fs.existsSync(filepath)) {
    const original = fs.readFileSync(filepath, 'utf8');
    const modified = replaceFn(original);
    if (original !== modified) {
      fs.writeFileSync(filepath, modified, 'utf8');
      console.log(`Updated ${filename}`);
    }
  }
}

// 1. index.html
replaceInFile('index.html', (content) => {
  // Remove hero stats
  content = content.replace(/<div class="hero-stats">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, '</div>\n          </div>');
  
  // Replace laptop icon with image
  content = content.replace(/<div class="laptop-icon">.*?<\/div>/, '<img src="img/laptop1.png" style="width:100%; border-radius:10px; margin-bottom:1rem;" alt="Premium Laptop">');
  
  // Remove testimonials section
  content = content.replace(/<!-- TESTIMONIALS -->[\s\S]*?<\/section>/, '');
  
  // Replace product placeholder in script
  content = content.replace(/<div style="height:160px;.*?"><i data-lucide="laptop"><\/i><\/div>/g, '<img src="img/laptop2.png" style="width:100%; height:160px; object-fit:cover; border-radius:8px 8px 0 0;" alt="Laptop">');
  
  // Also remove "98% Happy Customers" etc. if there are any other leftovers
  
  return content;
});

// 2. catalog.html
replaceInFile('catalog.html', (content) => {
  content = content.replace(
    /<div class="prod-img">\s*<div class="prod-discount">(.*?)<\/div>\s*<i data-lucide="laptop"><\/i>\s*<\/div>/g,
    '<div class="prod-img" style="background: url(\\\'img/laptop2.png\\\') center/cover; padding:0;">\n              <div class="prod-discount" style="z-index:2;">$1</div>\n            </div>'
  );
  return content;
});

// 3. cart.html
replaceInFile('cart.html', (content) => {
  content = content.replace(
    /<div class="cart-item-icon"><i data-lucide="laptop"><\/i><\/div>/g,
    '<div class="cart-item-icon" style="padding:0; overflow:hidden;"><img src="img/laptop2.png" style="width:100%; height:100%; object-fit:cover;"></div>'
  );
  return content;
});

// 4. about.html
replaceInFile('about.html', (content) => {
  // Remove the stats section
  content = content.replace(/<section class="section-sm" style="background:var\(--bg2\)">\s*<div class="container">\s*<div class="stats-row">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/, '');
  return content;
});

console.log('Patch 2 applied.');

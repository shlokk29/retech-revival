const fs = require('fs');
const path = require('path');

// 1. Update utils/seed.js
const seedPath = path.join(__dirname, 'utils', 'seed.js');
let seedContent = fs.readFileSync(seedPath, 'utf8');
seedContent = seedContent.replace(/images:\s*\[\]/g, (match, offset, str) => {
  // Find the brand nearby
  const beforeStr = str.substring(Math.max(0, offset - 300), offset);
  const brandMatch = beforeStr.match(/brand:\s*'([^']+)'/);
  if (brandMatch) {
    const brand = brandMatch[1].toLowerCase();
    return `images: ['/img/${brand}.png']`;
  }
  return match;
});
fs.writeFileSync(seedPath, seedContent, 'utf8');

// 2. Update frontend files
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

replaceInFile('index.html', (content) => {
  return content.replace(/<img src="img\/laptop2\.png"/g, '<img src="${p.images?.[0] || \\\'img/laptop2.png\\\'}" onerror="this.src=\\\'img/laptop2.png\\\'"');
});

replaceInFile('catalog.html', (content) => {
  return content.replace(/background:\s*url\(\\'img\/microsoft\.png\\'\)/g, 'background: url(\\\'${p.images?.[0] || "img/laptop2.png"}\\\')');
});

replaceInFile('product.html', (content) => {
  return content.replace(/<img src="img\/laptop1\.png"/g, '<img src="${p.images?.[0] || \\\'img/laptop1.png\\\'}" onerror="this.src=\\\'img/laptop1.png\\\'"');
});

replaceInFile('cart.html', (content) => {
  return content.replace(/<img src="img\/laptop2\.png"/g, '<img src="${item.image || \\\'/img/\\\' + (item.brand ? item.brand.toLowerCase() : \\\'\\\') + \\\'.png\\\'}" onerror="this.src=\\\'/img/laptop2.png\\\'"');
});

console.log('Images patch applied.');

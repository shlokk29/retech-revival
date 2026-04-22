const fs = require('fs');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/images:\s*\[\]/g, (match, offset, str) => {
    const beforeStr = str.substring(Math.max(0, offset - 1000), offset);
    const brandMatch = beforeStr.match(/brand:\s*'([^']+)'/);
    if (brandMatch) {
      const brand = brandMatch[1].toLowerCase();
      return `images: ['img/${brand}.png']`;
    }
    return match;
  });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Patched', filePath);
}

patchFile('./utils/mockData.js');
patchFile('./utils/seed.js');

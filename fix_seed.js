const fs = require('fs');
let c = fs.readFileSync('./utils/seed.js', 'utf8');
c = c.replace(/images:\s*\[\]/g, (m, o, s) => {
  const b = s.substring(Math.max(0, o - 300), o).match(/brand:\s*'([^']+)'/);
  return b ? `images: ['/img/${b[1].toLowerCase()}.png']` : m;
});
fs.writeFileSync('./utils/seed.js', c);
console.log('Seed updated');

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/retechrevival').then(async () => {
  console.log('Connected to DB');
  const seed = require('./utils/seed');
  await seed();
  console.log('Seeded successfully');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

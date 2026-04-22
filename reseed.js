const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/retechrevival').then(async () => {
  await require('./utils/seed')();
  console.log('Reseeded successfully.');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

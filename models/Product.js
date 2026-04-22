const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  brand:       { type: String, required: true },
  category:    { type: String, default: 'Laptop' },
  price:       { type: Number, required: true },
  originalPrice: { type: Number },
  condition:   { type: String, enum: ['Like New', 'Excellent', 'Good', 'Fair'], default: 'Good' },
  ram:         { type: String },
  storage:     { type: String },
  processor:   { type: String },
  display:     { type: String },
  battery:     { type: String },
  warranty:    { type: String, default: '6 months' },
  images:      [{ type: String }],
  description: { type: String },
  inStock:     { type: Boolean, default: true },
  sold:        { type: Boolean, default: false },
  sellerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating:      { type: Number, default: 4.0 },
  reviews:     { type: Number, default: 0 },
  tags:        [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

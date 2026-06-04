const mongoose = require('mongoose');

const userInteractionSchema = new mongoose.Schema({
  userId:    { type: String, default: 'anonymous' }, // session ID or user ID
  productId: { type: String, required: true },
  type:      { type: String, enum: ['view', 'click', 'cart', 'purchase', 'search'], required: true },
  metadata:  { type: mongoose.Schema.Types.Mixed },  // optional extra data (search query, etc.)
}, { timestamps: true });

// Indexes for fast aggregation queries
userInteractionSchema.index({ productId: 1, type: 1 });
userInteractionSchema.index({ userId: 1, type: 1 });
userInteractionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('UserInteraction', userInteractionSchema);

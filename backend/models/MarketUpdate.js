const mongoose = require('mongoose');

const MarketUpdateSchema = new mongoose.Schema({
  title: {
    marathi: { type: String, required: true },
    hindi: { type: String, required: true },
    english: { type: String, required: true }
  },
  value: {
    marathi: { type: String, required: true },
    hindi: { type: String, required: true },
    english: { type: String, required: true }
  },
  category: { 
    type: String, 
    enum: ['gold', 'silver', 'crypto', 'nft', 'stock', 'other'],
    default: 'other'
  },
  trend: {
    type: String,
    enum: ['up', 'down', 'neutral'],
    default: 'neutral'
  },
  icon: { type: String }, // Optional icon name from a set
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketUpdate', MarketUpdateSchema);

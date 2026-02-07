const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    marathi: String,
    hindi: String,
    english: String
  },
  content: {
    marathi: String,
    hindi: String,
    english: String
  },
  image: {
    type: String
  },
  videoUrl: {
    type: String, // Optional YouTube/Video URL
    required: false
  },
  topUpdates: {
    marathi: { type: [String], default: [] },
    hindi: { type: [String], default: [] },
    english: { type: [String], default: [] }
  },
  category: {
    type: String,
    required: true,
    enum: ['maharashtra', 'politics', 'entertainment', 'sports', 'business', 'astro', 'lifestyle', 'technology', 'world', 'india']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('News', newsSchema);

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
    enum: ['maharashtra', 'politics', 'entertainment', 'sports', 'business', 'astro', 'lifestyle', 'technology', 'world', 'india', 'crime']
  },
  isLive: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    user: { type: String, default: 'Reader' },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('News', newsSchema);

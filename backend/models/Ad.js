const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: '',
  },
  position: {
    type: String,
    enum: ['popup', 'sidebar'],
    default: 'popup',
  },
  active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Ad', AdSchema);

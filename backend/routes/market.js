const express = require('express');
const router = express.Router();
const MarketUpdate = require('../models/MarketUpdate');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Get all updates
router.get('/', async (req, res) => {
  try {
    const updates = await MarketUpdate.find().sort({ createdAt: -1 });
    res.json(updates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create update (Admin)
router.post('/create', authenticateToken, isAdmin, async (req, res) => {
  try {
    const update = new MarketUpdate(req.body);
    const saved = await update.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete update (Admin)
router.delete('/delete/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await MarketUpdate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Update deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

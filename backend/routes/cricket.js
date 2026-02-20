const express = require('express');
const router = express.Router();
const cricketController = require('../controllers/cricketController');

router.get('/all', cricketController.getAll);
router.get('/live', cricketController.getLiveMatches);
router.get('/live-debug', cricketController.getLiveDebug);
router.get('/upcoming', cricketController.getUpcomingMatches);
router.get('/recent', cricketController.getRecentMatches);

module.exports = router;

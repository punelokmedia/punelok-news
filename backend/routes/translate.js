const express = require('express');
const router = express.Router();
const { translate } = require('@vitalets/google-translate-api');

router.post('/', async (req, res) => {
  try {
    const { text, from, to } = req.body;

    if (!text || !from || !to) {
      return res.status(400).json({ message: 'Missing required translation parameters (text, from, to)' });
    }

    // Map common language names to ISO codes if needed
    const langMap = {
      'marathi': 'mr',
      'hindi': 'hi',
      'english': 'en',
      'bengali': 'bn',
      'punjabi': 'pa',
      'gujarati': 'gu',
      'tamil': 'ta',
      'telugu': 'te'
    };

    const sourceLang = langMap[from.toLowerCase()] || from;
    const targetLang = langMap[to.toLowerCase()] || to;

    if (sourceLang === targetLang) {
       return res.json({ translatedText: text });
    }

    const result = await translate(text, { from: sourceLang, to: targetLang });
    
    res.json({ translatedText: result.text });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ message: 'Translation failed', error: error.message });
  }
});

module.exports = router;

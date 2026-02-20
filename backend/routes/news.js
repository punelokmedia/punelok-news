const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const News = require('../models/News');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const { translate } = require('@vitalets/google-translate-api');
const crypto = require('crypto');

const langMap = {
  'marathi': 'mr',
  'hindi': 'hi',
  'english': 'en'
};

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create News (Admin Only - Auto Translated)
router.post('/create', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category, language, videoUrl, isLive } = req.body;
    let topUpdates = [];
    try {
        topUpdates = JSON.parse(req.body.topUpdates || '[]');
    } catch (e) {
        topUpdates = [];
    }
    
    let imageUrl = '';

    // Check if Cloudinary is configured
    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                   process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

    if (req.file) {
      if (!isCloudinaryConfigured) {
        console.warn('Cloudinary is not configured in .env. Skipping image upload.');
      } else {
        try {
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'punelok_news' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            uploadStream.end(req.file.buffer);
          });
          imageUrl = result.secure_url;
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          return res.status(500).json({ message: 'Image upload failed', error: uploadError.message });
        }
      }
    }

    // Prepare multilingual fields
    const titles = { marathi: '', hindi: '', english: '' };
    const contents = { marathi: '', hindi: '', english: '' };
    const updates = { marathi: [], hindi: [], english: [] };
    
    const targetLanguages = ['marathi', 'hindi', 'english'];
    const fromCode = langMap[language];

    for (const targetLang of targetLanguages) {
        const toCode = langMap[targetLang];
        
        if (targetLang === language) {
            titles[targetLang] = title;
            contents[targetLang] = content;
            updates[targetLang] = topUpdates;
            
        } else {
            try {
                 console.log(`Translating new post to ${targetLang}...`);
                 // Wait 1000ms
                 await new Promise(r => setTimeout(r, 1000));
                 
                 const [transTitle, transContent] = await Promise.all([
                    translate(title, { from: fromCode, to: toCode }),
                    translate(content, { from: fromCode, to: toCode })
                 ]);
                 
                 let translatedUpdates = [];
                 if (topUpdates.length > 0) {
                     await new Promise(r => setTimeout(r, 1000));
                     const batchedUpdates = topUpdates.join(' ||| ');
                     const transBatch = await translate(batchedUpdates, { from: fromCode, to: toCode });
                     translatedUpdates = transBatch.text.split('|||').map(s => s.trim());
                 }

                 titles[targetLang] = transTitle.text;
                 contents[targetLang] = transContent.text;
                 updates[targetLang] = translatedUpdates.length === topUpdates.length ? translatedUpdates : topUpdates;
                 console.log(`Successfully translated to ${targetLang}`);

            } catch (err) {
                console.error(`Translation to ${targetLang} failed during creation:`, err.message);
                titles[targetLang] = title;
                contents[targetLang] = content;
                updates[targetLang] = topUpdates;
            }
        }
    }

    const newsItem = new News({
        title: titles,
        content: contents,
        topUpdates: updates,
        category,
        image: imageUrl,
        videoUrl,
        isLive: isLive === 'true' || isLive === true
    });
    
    await newsItem.save();

    res.status(201).json({ message: 'News created and translated successfully', news: newsItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating news', error: error.message });
  }
});

// Get All News (Public)
router.get('/', async (req, res) => {
  try {
    const { category, language, limit } = req.query;
    let query = {};
    if (category) query.category = category;


    const news = await News.find(query).sort({ createdAt: -1 }).limit(Number(limit) || 20);
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update News (Admin Only)
// Update News (Admin Only)
router.put('/update/:id', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category, language, videoUrl, isLive } = req.body;
    let topUpdates = [];
    try {
        topUpdates = JSON.parse(req.body.topUpdates || '[]');
    } catch (e) {
        topUpdates = [];
    }

    // Find existing news
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });

    let imageUrl = req.body.existingImage; 

    // Cloudinary Config Check
    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                   process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

    if (req.file) {
      if (!isCloudinaryConfigured) {
          console.warn("Cloudinary not configured, skipping upload");
      } else {
          try {
            const result = await new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'punelok_news' },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              );
              uploadStream.end(req.file.buffer);
            });
            imageUrl = result.secure_url;
          } catch (uploadError) {
            console.error('Image upload failed:', uploadError);
            return res.status(500).json({ message: 'Image upload failed', error: uploadError.message });
          }
      }
    } else if (req.body.image === 'null') {
        imageUrl = '';
    }
    
    if (imageUrl === undefined) {
        imageUrl = news.image;
    }

    // Update fields
    const targetLanguages = ['marathi', 'hindi', 'english'];
    const fromCode = langMap[language];

    console.log(`Update request for language: ${language} (fromCode: ${fromCode})`);

    if (language && targetLanguages.includes(language)) {
        for (const targetLang of targetLanguages) {
            if (targetLang === language) {
                console.log(`Setting ${targetLang} fields directly from request`);
                news.title[targetLang] = title;
                news.content[targetLang] = content;
                news.topUpdates[targetLang] = topUpdates;
            } else {
                const toCode = langMap[targetLang];
                console.log(`Translating to ${targetLang} (toCode: ${toCode})...`);
                try {
                     // Wait 1000ms between language blocks
                     await new Promise(r => setTimeout(r, 1000));

                     console.log(`Translating Title and Content...`);
                     const [transTitle, transContent] = await Promise.all([
                        translate(title, { from: fromCode, to: toCode }),
                        translate(content, { from: fromCode, to: toCode })
                     ]);
                     
                     // Batch translate updates to avoid rate limits
                     let translatedUpdates = [];
                     if (topUpdates.length > 0) {
                         await new Promise(r => setTimeout(r, 1000));
                         console.log(`Translating ${topUpdates.length} updates in one batch...`);
                         const batchedUpdates = topUpdates.join(' ||| ');
                         const transBatch = await translate(batchedUpdates, { from: fromCode, to: toCode });
                         translatedUpdates = transBatch.text.split('|||').map(s => s.trim());
                     }
    
                     news.title[targetLang] = transTitle.text;
                     news.content[targetLang] = transContent.text;
                     news.topUpdates[targetLang] = translatedUpdates.length === topUpdates.length ? translatedUpdates : topUpdates;
                     console.log(`Successfully updated and translated ${targetLang}`);
    
                } catch (err) {
                    console.error(`Translation to ${targetLang} failed during update:`, err.message);
                    // Fallback: Use provided text but log the failure
                    news.title[targetLang] = title;
                    news.content[targetLang] = content;
                    news.topUpdates[targetLang] = topUpdates;
                }
            }
        }
        
        news.markModified('title');
        news.markModified('content');
        news.markModified('topUpdates');
    }

    // Update shared fields
    news.category = category;
    news.image = imageUrl;
    news.videoUrl = videoUrl;
    if (isLive !== undefined) {
        news.isLive = isLive === 'true' || isLive === true;
    }

    await news.save();

    res.json({ message: 'News updated and translated successfully', news });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating news', error: error.message });
  }
});

// Delete News (Delete single item for now, can extend to delete group)
router.delete('/delete/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });

    // Ideally, we could delete all with same groupId:
    // await News.deleteMany({ groupId: news.groupId });
    // But currently user might want granular control.
    // Let's delete JUST this one as per standard CRUD, 
    // unless query param ?all=true is passed.
    
    if (req.query.all === 'true' && news.groupId) {
         await News.deleteMany({ groupId: news.groupId });
         return res.json({ message: 'All versions of this news deleted successfully' });
    }

    await News.findByIdAndDelete(req.params.id);
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Single News by ID
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Increment View Count
router.patch('/:id/view', async (req, res) => {
    try {
        const news = await News.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
        res.json({ views: news?.views });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Increment Like Count
router.patch('/:id/like', async (req, res) => {
    try {
        const news = await News.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
        res.json({ likes: news?.likes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add Comment
router.post('/:id/comment', async (req, res) => {
    try {
        const { user, content } = req.body;
        const news = await News.findById(req.params.id);
        if (!news) return res.status(404).json({ message: 'News not found' });
        
        // Sorting comments helps show latest on top if handled here, but usually array.push and frontend sort is standard.
        // Let's just push.
        news.comments.push({ user: user || 'Punelok Reader', content });
        await news.save();
        
        res.json(news.comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

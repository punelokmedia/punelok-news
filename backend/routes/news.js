const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const News = require('../models/News');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const translate = require('@vitalets/google-translate-api');
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
    const { title, content, category, language, videoUrl } = req.body;
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

    // Parallel translation
    await Promise.all(targetLanguages.map(async (targetLang) => {
        const toCode = langMap[targetLang];
        
        if (targetLang === language) {
            titles[targetLang] = title;
            contents[targetLang] = content;
            updates[targetLang] = topUpdates;
        } else {
            try {
                 const [transTitle, transContent] = await Promise.all([
                    translate(title, { from: fromCode, to: toCode }),
                    translate(content, { from: fromCode, to: toCode })
                 ]);
                 
                 const transUpdates = await Promise.all(
                    topUpdates.map(u => translate(u, { from: fromCode, to: toCode }))
                 );

                 titles[targetLang] = transTitle.text;
                 contents[targetLang] = transContent.text;
                 updates[targetLang] = transUpdates.map(t => t.text);

            } catch (err) {
                console.error(`Translation to ${targetLang} failed`, err);
                // Fallback to original text if translation fails
                titles[targetLang] = title;
                contents[targetLang] = content;
                updates[targetLang] = topUpdates;
            }
        }
    }));

    const newsItem = new News({
        title: titles,
        content: contents,
        topUpdates: updates,
        category,
        image: imageUrl,
        videoUrl
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
    const { title, content, category, language, videoUrl } = req.body;
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
    // Ensure nested objects exist if they were somehow missing (though schema defaults should handle it)
    if (!news.title) news.title = {};
    if (!news.content) news.content = {};
    if (!news.topUpdates) news.topUpdates = {};

    // Update specific language fields
    if (language && ['marathi', 'hindi', 'english'].includes(language)) {
        news.title[language] = title;
        news.content[language] = content;
        news.topUpdates[language] = topUpdates;
        
        // Mark as modified just in case Mongoose doesn't catch deep object change
        news.markModified('title');
        news.markModified('content');
        news.markModified('topUpdates');
    }

    // Update shared fields
    news.category = category;
    news.image = imageUrl;
    news.videoUrl = videoUrl;

    await news.save();

    res.json({ message: 'News updated successfully', news });
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

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const News = require('../models/News');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const { translateText } = require('../utils/translateText');
const crypto = require('crypto');

const APP_LANGS = ['marathi', 'hindi', 'english'];

function nonEmpty(s) {
  return typeof s === 'string' && s.trim().length > 0;
}

/** Pick which locale to translate from when filling targetLang */
function pickSourceLocaleForTarget(titleObj, targetLang) {
  if (!titleObj || typeof titleObj !== 'object') return null;
  const candidates = ['marathi', 'hindi', 'english'].filter((l) => l !== targetLang);
  for (const loc of candidates) {
    if (nonEmpty(titleObj[loc])) return loc;
  }
  return null;
}

function pickSourceLocaleForTopUpdates(tuObj, targetLang) {
  if (!tuObj || typeof tuObj !== 'object') return null;
  const candidates = ['marathi', 'hindi', 'english'].filter((l) => l !== targetLang);
  for (const loc of candidates) {
    const arr = tuObj[loc];
    if (Array.isArray(arr) && arr.length > 0 && arr.some((x) => nonEmpty(x))) return loc;
  }
  return null;
}

/** Legacy rows sometimes store title as a plain string — normalize to nested object. */
async function normalizeDocTitle(doc) {
  if (!doc?._id) return;
  const t = doc.title;
  if (typeof t === 'string' && t.trim()) {
    const nested = { marathi: t.trim(), hindi: '', english: '' };
    doc.title = nested;
    await News.findByIdAndUpdate(doc._id, { $set: { title: nested } });
  }
}

/** List/card views: fill missing title only (persist). */
async function ensureTitleLocale(doc, targetLang) {
  await normalizeDocTitle(doc);
  if (!doc?.title || typeof doc.title !== 'object') return;
  if (!APP_LANGS.includes(targetLang)) return;
  if (nonEmpty(doc.title[targetLang])) return;

  const src = pickSourceLocaleForTarget(doc.title, targetLang);
  if (!src) return;

  try {
    const text = await translateText(doc.title[src], src, targetLang);
    doc.title[targetLang] = text;
    await News.findByIdAndUpdate(doc._id, {
      $set: { [`title.${targetLang}`]: text },
    });
  } catch (err) {
    console.error(`ensureTitleLocale ${doc._id}:`, err.message);
  }
}

/** Detail view: fill title, content, topUpdates when missing (persist). */
async function ensureFullArticleLocales(doc, targetLang) {
  if (!doc || !APP_LANGS.includes(targetLang)) return;

  await normalizeDocTitle(doc);

  const $set = {};

  const fillBlock = async (blockKey) => {
    const block = doc[blockKey];
    if (!block || typeof block !== 'object') return;
    if (nonEmpty(block[targetLang])) return;
    const src = pickSourceLocaleForTarget(block, targetLang);
    if (!src || !nonEmpty(block[src])) return;
    try {
      const text = await translateText(block[src], src, targetLang);
      $set[`${blockKey}.${targetLang}`] = text;
      block[targetLang] = text;
    } catch (e) {
      console.error(`ensureFull ${blockKey}:`, e.message);
    }
  };

  await fillBlock('title');
  await fillBlock('content');

  const tu = doc.topUpdates;
  if (tu && typeof tu === 'object' && !Array.isArray(tu)) {
    const destArr = tu[targetLang];
    const srcLocale = pickSourceLocaleForTopUpdates(tu, targetLang);
    const srcArr = srcLocale ? tu[srcLocale] : null;
    const needs =
      (!destArr || destArr.length === 0) &&
      Array.isArray(srcArr) &&
      srcArr.length > 0 &&
      srcArr.some((x) => nonEmpty(x));
    if (needs && srcLocale) {
      try {
        const batched = srcArr.join(' ||| ');
        const batchOut = await translateText(batched, srcLocale, targetLang);
        const translatedUpdates = batchOut.split('|||').map((s) => s.trim());
        if (translatedUpdates.length === srcArr.length) {
          $set[`topUpdates.${targetLang}`] = translatedUpdates;
          tu[targetLang] = translatedUpdates;
        }
      } catch (e) {
        console.error('ensureFull topUpdates:', e.message);
      }
    }
  }

  if (Object.keys($set).length > 0) {
    await News.findByIdAndUpdate(doc._id, { $set });
    doc.markModified('title');
    doc.markModified('content');
    doc.markModified('topUpdates');
  }
}

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

    for (const targetLang of targetLanguages) {
        if (targetLang === language) {
            titles[targetLang] = title;
            contents[targetLang] = content;
            updates[targetLang] = topUpdates;
            
        } else {
            try {
                 console.log(`Translating new post to ${targetLang}...`);
                 await new Promise(r => setTimeout(r, 600));
                 
                 const transTitle = await translateText(title, language, targetLang);
                 const transContent = await translateText(content, language, targetLang);
                 
                 let translatedUpdates = [];
                 if (topUpdates.length > 0) {
                     await new Promise(r => setTimeout(r, 600));
                     const batchedUpdates = topUpdates.join(' ||| ');
                     const transBatchText = await translateText(batchedUpdates, language, targetLang);
                     translatedUpdates = transBatchText.split('|||').map(s => s.trim());
                 }

                 titles[targetLang] = transTitle;
                 contents[targetLang] = transContent;
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

    const lang =
      language && APP_LANGS.includes(String(language).toLowerCase())
        ? String(language).toLowerCase()
        : 'marathi';

    const news = await News.find(query).sort({ createdAt: -1 }).limit(Number(limit) || 20);

    const batchSize = 3;
    for (let i = 0; i < news.length; i += batchSize) {
      const slice = news.slice(i, i + batchSize);
      await Promise.all(slice.map((doc) => ensureTitleLocale(doc, lang)));
    }

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

    console.log(`Update request for language: ${language}`);

    if (language && targetLanguages.includes(language)) {
        for (const targetLang of targetLanguages) {
            if (targetLang === language) {
                console.log(`Setting ${targetLang} fields directly from request`);
                news.title[targetLang] = title;
                news.content[targetLang] = content;
                news.topUpdates[targetLang] = topUpdates;
            } else {
                console.log(`Translating to ${targetLang}...`);
                try {
                     await new Promise(r => setTimeout(r, 600));

                     const transTitle = await translateText(title, language, targetLang);
                     const transContent = await translateText(content, language, targetLang);
                     
                     let translatedUpdates = [];
                     if (topUpdates.length > 0) {
                         await new Promise(r => setTimeout(r, 600));
                         console.log(`Translating ${topUpdates.length} updates in one batch...`);
                         const batchedUpdates = topUpdates.join(' ||| ');
                         const transBatchText = await translateText(batchedUpdates, language, targetLang);
                         translatedUpdates = transBatchText.split('|||').map(s => s.trim());
                     }
    
                     news.title[targetLang] = transTitle;
                     news.content[targetLang] = transContent;
                     news.topUpdates[targetLang] = translatedUpdates.length === topUpdates.length ? translatedUpdates : topUpdates;
                     console.log(`Successfully updated and translated ${targetLang}`);
    
                } catch (err) {
                    console.error(`Translation to ${targetLang} failed during update:`, err.message);
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

    const { language } = req.query;
    const lang =
      language && APP_LANGS.includes(String(language).toLowerCase())
        ? String(language).toLowerCase()
        : null;

    if (lang) {
      await ensureFullArticleLocales(news, lang);
    }

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

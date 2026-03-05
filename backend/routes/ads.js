const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Ad = require('../models/Ad');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create Ad (Admin Only)
router.post('/create', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { title, link, position, active } = req.body;
        let imageUrl = '';

        if (req.file) {
            try {
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'punelok_ads' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(req.file.buffer);
                });
                imageUrl = result.secure_url;
            } catch (err) {
                console.error('Image upload failed:', err);
                return res.status(500).json({ message: 'Image upload failed' });
            }
        }

        const ad = new Ad({
            title,
            imageUrl,
            link,
            position,
            active: active === 'true' || active === true,
        });

        await ad.save();
        res.status(201).json({ message: 'Ad created successfully', ad });
    } catch (error) {
        console.error('Error creating ad:', error);
        res.status(500).json({ message: 'Error creating ad', error: error.message });
    }
});

// Get All Ads (Public, for frontend)
router.get('/', async (req, res) => {
    try {
        const query = {};
        if (req.query.active !== undefined) query.active = req.query.active === 'true';
        if (req.query.position) query.position = req.query.position;

        const ads = await Ad.find(query).sort({ createdAt: -1 });
        res.json(ads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Ad (Admin Only)
router.put('/update/:id', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { title, link, position, active, existingImage } = req.body;
        const ad = await Ad.findById(req.params.id);
        
        if (!ad) return res.status(404).json({ message: 'Ad not found' });

        let imageUrl = existingImage || ad.imageUrl;

        if (req.file) {
            try {
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'punelok_ads' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(req.file.buffer);
                });
                imageUrl = result.secure_url;
            } catch (err) {
                console.error('Image upload failed:', err);
                return res.status(500).json({ message: 'Image upload failed' });
            }
        }

        ad.title = title;
        ad.link = link;
        ad.position = position;
        ad.active = active === 'true' || active === true;
        ad.imageUrl = imageUrl;

        await ad.save();
        res.json({ message: 'Ad updated successfully', ad });
    } catch (error) {
        console.error('Error updating ad:', error);
        res.status(500).json({ message: 'Error updating ad', error: error.message });
    }
});

// Delete Ad (Admin Only)
router.delete('/delete/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const ad = await Ad.findByIdAndDelete(req.params.id);
        if (!ad) return res.status(404).json({ message: 'Ad not found' });
        res.json({ message: 'Ad deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

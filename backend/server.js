require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/punelok_db')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const translateRoutes = require('./routes/translate');

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/translate', translateRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

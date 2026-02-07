const mongoose = require('mongoose');
const News = require('./models/News');
const dotenv = require('dotenv');

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const news = await News.find().sort({ createdAt: -1 }).limit(10);
        
        news.forEach((item, index) => {
            console.log(`\n--- [${index + 1}] ID: ${item._id} ---`);
            console.log('Title (MR):', item.title?.marathi?.substring(0, 30));
            console.log('Updates count (MR/HI/EN):', `${item.topUpdates?.marathi?.length}/${item.topUpdates?.hindi?.length}/${item.topUpdates?.english?.length}`);
            console.log('HI Update 1:', item.topUpdates?.hindi?.[0]);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkDB();

const mongoose = require('mongoose');
const News = require('./models/News');
const dotenv = require('dotenv');

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const news = await News.find().sort({ createdAt: -1 }).limit(5);
        
        news.forEach((item, index) => {
            console.log(`\n--- News Item ${index + 1} ---`);
            console.log('ID:', item._id);
            console.log('Title (MR):', item.title?.marathi);
            console.log('Top Updates count:');
            console.log('  Marathi:', item.topUpdates?.marathi?.length);
            console.log('  Hindi:', item.topUpdates?.hindi?.length);
            console.log('  English:', item.topUpdates?.english?.length);
            console.log('Top Updates (HI):', JSON.stringify(item.topUpdates?.hindi, null, 2));
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkDB();

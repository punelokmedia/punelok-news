const mongoose = require('mongoose');
const News = require('./models/News');
const dotenv = require('dotenv');

dotenv.config();

const manualFix = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Target the specific news item by ID or Title
        const news = await News.findOne({ 'title.marathi': { $regex: 'नव्या मेट्रो', $options: 'i' } });

        if (!news) {
            console.log('News item not found!');
            return;
        }

        console.log(`Fixing News ID: ${news._id}`);

        // Manually set translations
        news.title.english = "Inauguration of new metro line completed";
        news.title.hindi = "नई मेट्रो लाइन का उद्घाटन संपन्न";

        news.content.english = "This new metro line will be of great benefit in reducing traffic congestion in the city. The Chief Minister and other dignitaries were present at the event.";
        news.content.hindi = "शहर में ट्रैफिक जाम को कम करने के लिए इस नई मेट्रो लाइन से बहुत फायदा होगा। मुख्यमंत्री और अन्य गणमान्य व्यक्ति इस कार्यक्रम में उपस्थित थे।";

        // Updates
        const updatesEn = [
            "Inauguration of new metro line completed",
            "Inspiring story of a farmer: A Class 10 dropout farmer in Maharashtra is improving farming using AI and is now helping other farmers too.",
            "Mahindra 15000 crore investment: Mahindra announced a major investment in a new manufacturing unit in Maharashtra.",
            "Municipal elections in Maharashtra and Zilla Parishad voting pace is underway."
        ];
        
        const updatesHi = [
            "नई मेट्रो लाइन का उद्घाटन संपन्न",
            "एक किसान की प्रेरणादायी कहानी: महाराष्ट्र का एक कक्षा 10 ड्रॉपआउट किसान AI का उपयोग करके खेती में सुधार कर रहा है और अब अन्य किसानों की भी मदद कर रहा है।",
            "महिंद्रा 15000 करोड़ निवेश: महिंद्रा ने महाराष्ट्र में नई विनिर्माण इकाई में बड़े निवेश की घोषणा की।",
            "महाराष्ट्र में नगर निगम चुनाव और जिला परिषद मतदान की गति जारी है।"
        ];

        // Assign only if original array length allows (to be safe), or just overwrite
        if (news.topUpdates.marathi.length > 0) {
             // We'll trust our manual list matches the intent of the Marathi ones
             // Actually, let's map them carefully if we can, but overwriting is safer for "fixing" appearances
             news.topUpdates.english = updatesEn;
             news.topUpdates.hindi = updatesHi;
        }

        news.markModified('title');
        news.markModified('content');
        news.markModified('topUpdates');

        await news.save();
        console.log('Successfully applied manual translations!');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

manualFix();

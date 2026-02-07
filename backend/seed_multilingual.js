const mongoose = require('mongoose');
const News = require('./models/News');
const dotenv = require('dotenv');

dotenv.config();

const sampleNews = [
    {
        title: {
            marathi: "पुण्यात पावसाचा जोर वाढला, धरणांच्या पाणीसाठ्यात वाढ",
            hindi: "पुणे में बारिश का जोर बढ़ा, बांधों के जलस्तर में बढ़ोतरी",
            english: "Rain intensity increases in Pune, water levels in dams rise"
        },
        content: {
            marathi: "गेल्या दोन दिवसांपासून पुण्यात पावसाने हजेरी लावली आहे. यामुळे खडकवासला आणि पानशेत धरणांच्या पाणीसाठ्यात लक्षणीय वाढ झाली आहे. हवामान खात्याने पुढील २४ तास सतर्कतेचा इशारा दिला आहे.",
            hindi: "पिछले दो दिनों से पुणे में बारिश हो रही है। इससे खड़कवासला और पानशेत बांधों के जलस्तर में काफी बढ़ोतरी हुई है। मौसम विभाग ने अगले 24 घंटों के लिए अलर्ट जारी किया है।",
            english: "Rain has been present in Pune for the past two days. This has led to a significant increase in water storage in Khadakwasla and Panshet dams. The Meteorological Department has issued an alert for the next 24 hours."
        },
        category: "maharashtra",
        image: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=1000"
    },
    {
        title: {
            marathi: "भारताच्या क्रिकेट संघाने विश्वचषक जिंकला",
            hindi: "भारतीय क्रिकेट टीम ने विश्व कप जीता",
            english: "Indian cricket team wins the World Cup"
        },
        content: {
            marathi: "रोमांचक अंतिम सामन्यात भारताने प्रतिस्पर्ध्यांचा पराभव करून ऐतिहासिक विजय मिळवला. संपूर्ण देशात आनंदाचे वातावरण आहे. कर्णधाराने या विजयाचे श्रेय सांघिक कामगिरीला दिले आहे.",
            hindi: "रोमांचक फाइनल मैच में भारत ने प्रतिद्वंद्वियों को हराकर ऐतिहासिक जीत हासिल की। पूरे देश में खुशी का माहौल है। कप्तान ने इस जीत का श्रेय टीम के प्रदर्शन को दिया है।",
            english: "In a thrilling final match, India defeated their opponents to secure a historic victory. There is an atmosphere of joy across the country. The captain credited the victory to teamwork."
        },
        category: "sports",
        image: "https://images.unsplash.com/photo-1531415074968-0ecc083f4485?auto=format&fit=crop&q=80&w=1000"
    },
    {
        title: {
            marathi: "नव्या मेट्रो मार्गाचे उदघाटन संपन्न",
            hindi: "नए मेट्रो मार्ग का उद्घाटन संपन्न",
            english: "Inauguration of new metro line completed"
        },
        content: {
            marathi: "शहरातील वाहतूक कोंडी कमी करण्यासाठी या नव्या मेट्रो मार्गाचा मोठा फायदा होणार आहे. मुख्यमंत्री आणि इतर मान्यवर या कार्यक्रमाला उपस्थित होते.",
            hindi: "शहर में ट्रैफिक जाम को कम करने के लिए इस नए मेट्रो मार्ग का बड़ा फायदा होगा। मुख्यमंत्री और अन्य गणमान्य व्यक्ति इस कार्यक्रम में उपस्थित थे।",
            english: "This new metro line will be of great benefit in reducing traffic congestion in the city. The Chief Minister and other dignitaries were present at the event."
        },
        category: "maharashtra",
        image: "https://images.unsplash.com/photo-1556608882-66fd60c70d44?auto=format&fit=crop&q=80&w=1000"
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing news
        await News.deleteMany({});
        console.log('Cleared existing news');

        const crypto = require('crypto');

        for (const news of sampleNews) {
            const groupId = crypto.randomUUID();
            
            // Create for Marathi
            await News.create({
                title: news.title.marathi,
                content: news.content.marathi,
                category: news.category,
                language: 'marathi',
                image: news.image,
                groupId: groupId,
                createdAt: new Date()
            });

            // Create for Hindi
            await News.create({
                title: news.title.hindi,
                content: news.content.hindi,
                category: news.category,
                language: 'hindi',
                image: news.image,
                groupId: groupId,
                createdAt: new Date()
            });

            // Create for English
            await News.create({
                title: news.title.english,
                content: news.content.english,
                category: news.category,
                language: 'english',
                image: news.image,
                groupId: groupId,
                createdAt: new Date()
            });
        }

        console.log('Database seeded with multilingual news!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();

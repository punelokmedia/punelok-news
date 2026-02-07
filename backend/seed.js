require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Clear existing users to avoid duplicates
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Create Admin
        const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
        const adminUser = new User({
            username: 'admin',
            password: hashedPasswordAdmin,
            role: 'admin',
            isApproved: true
        });

        // Create User
        const hashedPasswordUser = await bcrypt.hash('user123', 10);
        const normalUser = new User({
            username: 'user',
            password: hashedPasswordUser,
            role: 'user',
            isApproved: true // Auto-approved for testing
        });

        await adminUser.save();
        await normalUser.save();

        console.log('Users created successfully');
        console.log('--------------------------------');
        console.log('Admin Credentials:');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('--------------------------------');
        console.log('User Credentials:');
        console.log('Username: user');
        console.log('Password: user123');
        console.log('--------------------------------');

        mongoose.disconnect();
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();

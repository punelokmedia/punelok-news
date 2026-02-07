const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    // If role is admin, automatically approve (or maybe not? Let's say first admin is auto-approved or manual DB insert)
    // For now, let's say all users are pending unless it's the very first user (bootstrapping)
    
    // Check if any users exist to make the first one admin and approved
    const isFirstUser = await User.countDocuments() === 0;
    const userRole = isFirstUser ? 'admin' : (role || 'user');
    const isApproved = isFirstUser ? true : false; 

    const newUser = new User({
      username,
      password: hashedPassword,
      role: userRole,
      isApproved
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', isApproved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: 'Account pending approval from admin' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Pending Users (Admin Only)
router.get('/pending-users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ isApproved: false, role: 'user' });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve User (Admin Only)
router.post('/approve-user', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isApproved = true;
    await user.save();
    res.json({ message: 'User approved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get User Stats (Admin Only)
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const pendingUsers = await User.countDocuments({ isApproved: false });
    
    res.json({
      totalUsers,
      totalAdmins,
      pendingUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create User/Admin (Admin Only)
router.post('/create-user', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      role: role || 'user',
      isApproved: true // Admin-created users are auto-approved
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

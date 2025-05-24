// routes/users.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs'); // Changed from bcrypt to bcryptjs for consistency if you use both
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/auth'); // Assuming this is your authenticateToken middleware
require('dotenv').config();

// Register
router.post('/register', [
  body('email').isEmail().withMessage('Invalid email format.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.').trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword }
    });

    // Use 'userId' (lowercase 'd') for consistency with typical convention and authenticateToken middleware
    const payload = { userId: user.id, email: user.email }; 
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // Optional

    res.status(201).json({
      message: 'Registered successfully!',
      token,
      user: { id: user.id, email: user.email } // Correctly sending user object
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: 'Error registering user' });
  }
});


// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(), // Changed message
  body('password').notEmpty().withMessage('Password is required.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials!' });

    // Use 'userId' (lowercase 'd') for consistency
    const payload = { userId: user.id, email: user.email }; 
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // Optional
    
    // **MODIFIED RESPONSE TO INCLUDE USER OBJECT**
    res.json({ 
        message: 'Login successful!', 
        token,
        user: { id: user.id, email: user.email } 
    });
  } catch (err) {
    console.error("Error logging in:", err); // Log the actual error
    res.status(500).json({ error: 'Error logging in!' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// Example protected route - /api/users/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // authenticateToken should put { userId: '...', email: '...' } into req.user
    // Ensure req.user.userId is used here (lowercase 'd')
    const userFromDb = await prisma.user.findUnique({
      where: { id: req.user.userId }, // Use userId (lowercase 'd') from token payload
      select: { id: true, email: true } // Only select necessary fields
    });
    if (!userFromDb) return res.status(404).json({ error: 'User not found!' });
    
    // Return in the format { user: { ... } } as expected by AuthContext
    res.json({ user: userFromDb }); 
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

module.exports = router;
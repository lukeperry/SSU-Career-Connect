// routes/authRoutes.js
const express = require('express');
const router = express.Router();
//const User = require('../models/User');
const bcrypt = require('bcrypt');
const { verifyToken } = require('../../utils/authMiddleware');
const { generateToken } = require('../../utils/jwt');
const jwt = require('jsonwebtoken');
const Talent = require('../models/talent');
const HRPartner = require('../models/hrPartner');

// Placeholder route for testing
router.get('/test', (req, res) => {
  res.send('Auth route is working!');
});

// Register a talent
  router.post('/register/talent', async (req, res) => {
    const { username, email, password, skills } = req.body;

  // Check for missing fields
  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Please type a username, email, and a password' });
  }

   // Validate username (no whitespace and minimum length of 3 characters)
   if (/\s/.test(username) || username.length < 3) {
    return res.status(400).json({ message: 'Username cannot contain spaces and must be at least 3 characters' });
  }

  // Validate password (no whitespace and minimum length of 8 characters)
  if (/\s/.test(password) || password.length < 8) {
    return res.status(400).json({ message: 'Password cannot contain spaces and must be at least 8 characters' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  try {
    // Check if the talent exists
    const talentExists = await Talent.findOne({ username });
    const emailExists = await Talent.findOne({ email });
    if (talentExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }
    if (emailExists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user with hashed password
    const newTalent = new Talent({
      username,
      email,
      password: hashedPassword,
      skills,
    });
    await newTalent.save();

    res.status(201).json({ message: 'Talent registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Register a HR Partner
router.post('/register/hr', async (req, res) => {
  const { username, email, password, companyName } = req.body;

// Check for missing fields
if (!username || !password) {
  return res.status(400).json({ message: 'Please type a username and a password' });
}

 // Validate username (no whitespace and minimum length of 3 characters)
 if (/\s/.test(username) || username.length < 3) {
  return res.status(400).json({ message: 'Username cannot contain spaces and must be at least 3 characters' });
}
// Validate password (no whitespace and minimum length of 8 characters)
if (/\s/.test(password) || password.length < 8) {
  return res.status(400).json({ message: 'Password cannot contain spaces and must be at least 8 characters' });
}
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ message: 'Please provide a valid email address' });
}

try {
    // Check if the HR exists
    const hrExists = await HRPartner.findOne({ username });
    const emailExists = await HRPartner.findOne({ email });
    if (hrExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }
    if (emailExists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }


  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newHR = new HRPartner({
    username,
    email,
    password: hashedPassword,
    companyName,
  });

  await newHR.save();

  res.status(201).json({ message: 'HR Partner registered successfully' });
} catch (error) {
  console.error('Error during registration:', error);
  res.status(500).json({ message: 'Server error', error });
}
});

// Login Talent
router.post('/login/talent', async (req, res) => {
  try {
    // Find user in the database
    const { email, password } = req.body;
    const talent = await Talent.findOne({ email });

    if (!talent) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Match password (compare hashed password with input password)
    const isMatch = await bcrypt.compare(password, talent.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: talent._id, 
        role: 'talent' },
       process.env.JWT_SECRET, 
       { expiresIn: '1h' });
    console.log('Talent Generated JWT token:', token); // Log the generated JWT token
    res.status(200).json({ message: 'Login successful!', token });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

//Login HR Partner
router.post('/login/hr', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hrPartner = await HRPartner.findOne({ email });
    // Find user in the database

    if (!hrPartner) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Match password (compare hashed password with input password)
    const isMatch = await bcrypt.compare(password, hrPartner.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: hrPartner._id, 
        role: 'hr', 
        companyName: hrPartner.companyName 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    console.log('HR Generated JWT token:', token); // Log the generated JWT token

    res.status(200).json({ 
      message: 'Login successful!', 
      token, 
      companyName: hrPartner.companyName });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Middleware to verify token and role
router.get('/protected', verifyToken, (req, res) => {
  console.log('Accessing protected route, user:', req.user); // Log the user information
  res.json({ message: 'This is a protected route', user: req.user });
});
module.exports = router;

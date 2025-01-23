// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { verifyToken } = require('../../utils/authMiddleware');
const { generateToken } = require('../../utils/jwt');
const jwt = require('jsonwebtoken');
const Talent = require('../models/talent');
const HRPartner = require('../models/hrPartner');
const { validationResult } = require('express-validator');

// Placeholder route for testing
router.get('/test', (req, res) => {
  res.send('Auth route is working!');
});

// Register a talent
router.post('/register/talent', async (req, res) => {
  const { username, firstName, lastName, birthday, gender, email, phoneNumber, password } = req.body;

  // Check for missing fields
  if (!username || !firstName || !lastName || !birthday || !gender || !email || !phoneNumber || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Check if the talent exists
    const emailExists = await Talent.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const usernameExists = await Talent.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new talent with hashed password
    const newTalent = new Talent({
      username,
      firstName,
      lastName,
      birthday,
      gender,
      email,
      phoneNumber,
      password: hashedPassword,
    });
    await newTalent.save();

    res.status(201).json({ message: 'Talent registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error possible', error });
  }
});

// Update talent profile
router.put('/profile', verifyToken, async (req, res) => {
  const { username, email } = req.body;
  try {
    console.log('Received request to update profile:', req.body);

    const existingUser = await Talent.findOne({ $or: [{ username }, { email }] });
    console.log('Existing user:', existingUser);

    if (existingUser && existingUser._id.toString() !== req.user.id) {
      console.log('Username or email already taken');
      return res.status(400).json({ message: 'Username or email already taken' });
    }

    const talent = await Talent.findById(req.user.id);
    console.log('Talent found:', talent);

    if (!talent) {
      console.log('Talent not found');
      return res.status(404).json({ message: 'Talent not found' });
    }

    talent.username = username;
    talent.email = email;
    // Update other fields as needed

    await talent.save();
    console.log('Profile updated successfully');
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error: possible existing username or email' });
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
    res.status(200).json({ message: 'Login successful!', token, id: talent._id });

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
      companyName: hrPartner.companyName,
      id: hrPartner._id });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get talent dashboard data
router.get('/dashboard/talent', verifyToken, async (req, res) => {
  try {
    const talent = await Talent.findById(req.user.id).select('firstName email');
    if (!talent) {
      return res.status(404).json({ message: 'Talent not found' });
    }
    res.json(talent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Middleware to verify token and role
router.get('/protected', verifyToken, (req, res) => {
  console.log('Accessing protected route, user:', req.user); // Log the user information
  res.json({ message: 'This is a protected route', user: req.user });
});
module.exports = router;

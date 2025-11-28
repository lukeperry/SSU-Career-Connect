// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { verifyToken } = require('../../utils/authMiddleware');
const { generateToken } = require('../../utils/jwt');
const jwt = require('jsonwebtoken');
const Talent = require('../models/talent');
const HRPartner = require('../models/hrPartner');
const { generateFirebaseToken } = require('../controllers/firebaseAuthController');
const { validationResult } = require('express-validator');

// Placeholder route for testing
router.get('/test', (req, res) => {
  res.send('Auth route is working!');
});

// Generate Firebase token for authenticated users
router.post('/firebase-token', verifyToken, generateFirebaseToken);

// Generate Firebase token for authenticated users
router.post('/firebase-token', verifyToken, generateFirebaseToken);

// Register a talent
router.post('/register/talent', async (req, res) => {
  const { username, firstName, lastName, birthday, gender, email, phoneNumber, password } = req.body;

  // Check for missing fields with detailed error messages
  const missingFields = [];
  if (!username) missingFields.push('username');
  if (!firstName) missingFields.push('firstName');
  if (!lastName) missingFields.push('lastName');
  if (!birthday) missingFields.push('birthday');
  if (!gender) missingFields.push('gender');
  if (!email) missingFields.push('email');
  if (!phoneNumber) missingFields.push('phoneNumber');
  if (!password) missingFields.push('password');
  
  if (missingFields.length > 0) {
    return res.status(400).json({ 
      message: `Missing required fields: ${missingFields.join(', ')}` 
    });
  }

  // Validate username (no whitespace and minimum length of 3 characters)
  if (/\s/.test(username) || username.length < 3) {
    return res.status(400).json({ message: 'Username cannot contain spaces and must be at least 3 characters' });
  }

  // Validate password (no whitespace and minimum length of 8 characters)
  if (/\s/.test(password) || password.length < 8) {
    return res.status(400).json({ message: 'Password cannot contain spaces and must be at least 8 characters' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
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
  const { username, firstName, lastName, email, password, companyName, phoneNumber, birthday, gender } = req.body;

// Check for missing fields
if (!username || !password || !firstName || !lastName || !email || !companyName || !phoneNumber || !birthday || !gender) {
  return res.status(400).json({ message: 'Please provide all required fields' });
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
    firstName,
    lastName,
    email,
    password: hashedPassword,
    companyName,
    phoneNumber,
    birthday,
    gender,
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

    // Check if account is deactivated
    if (talent.isActive === false) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
    }

    // Match password (compare hashed password with input password)
    const isMatch = await bcrypt.compare(password, talent.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: talent._id, 
        role: 'talent' },
       process.env.JWT_SECRET, 
       { expiresIn: '1h' });
    console.log('Talent Generated JWT token:', token); // Log the generated JWT token
    
    // 🚀 PRE-CALCULATE MATCH SCORES IN BACKGROUND (don't block login response)
    // This ensures scores are cached by the time user navigates to job board
    setImmediate(async () => {
      try {
        console.log(`🔄 [Background] Pre-calculating match scores for talent ${talent._id}...`);
        const Job = require('../models/Job');
        const { getOrCalculateMatchScore } = require('../../utils/matchAlgorithm');
        
        const jobs = await Job.find({ status: 'open' });
        const startTime = Date.now();
        
        // Calculate all scores in parallel (will be cached)
        await Promise.all(jobs.map(async (job) => {
          try {
            await getOrCalculateMatchScore(job, talent);
          } catch (error) {
            console.error(`❌ [Background] Error pre-calculating for job ${job.title}:`, error.message);
          }
        }));
        
        const endTime = Date.now();
        console.log(`✅ [Background] Pre-calculated ${jobs.length} match scores in ${endTime - startTime}ms`);
      } catch (error) {
        console.error('❌ [Background] Error pre-calculating match scores:', error.message);
      }
    });
    
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

    // Check if account is deactivated
    if (hrPartner.isActive === false) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
    }

    // Match password (compare hashed password with input password)
    const isMatch = await bcrypt.compare(password, hrPartner.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: hrPartner._id, 
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

router.post('/api/auth/register', async (req, res) => {
  try {
    const { role, ...userData } = req.body;
    console.log('Registration attempt:', { role, ...userData }); // Debug log

    let user;
    if (role === 'talent') {
      user = new Talent(userData);
    } else if (role === 'hr') {
      user = new HRPartner(userData);
    } else {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    await user.save();
    res.status(201).json({ 
      success: true, 
      message: 'Registration successful' 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;

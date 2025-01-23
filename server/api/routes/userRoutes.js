const express = require('express');
const router = express.Router();
const HRPartner = require('../models/hrPartner');
const Talent = require('../models/talent');

// Test route
router.get('/', (req, res) => {
  res.send('User Route is working!');
});

// Fetch all HR users
router.get('/hr', async (req, res) => {
  try {
    const hrUsers = await HRPartner.find().select('username email profilePicture firstName lastName');
    res.json(hrUsers);
  } catch (error) {
    console.error('Error fetching HR users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch all Talent users
router.get('/talent', async (req, res) => {
  try {
    const talentUsers = await Talent.find().select('username email profilePicture firstName lastName');
    res.json(talentUsers);
  } catch (error) {
    console.error('Error fetching Talent users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

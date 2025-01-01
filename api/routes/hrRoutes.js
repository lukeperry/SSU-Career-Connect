// api/routes/hrRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../../utils/authMiddleware');
const HRPartner = require('../models/hrPartner');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads')); // Ensure the directory exists
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Optional: Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG and PNG images are allowed.'));
    }
    cb(null, true);
  }
});

// Upload profile picture
router.post('/upload-profile-picture', verifyToken, upload.single('profilePicture'), async (req, res) => {
  try {
    console.log('File received:', req.file);
    const hrPartner = await HRPartner.findById(req.user.id);
    if (!hrPartner) {
      return res.status(404).json({ message: 'HR Partner not found' });
    }

    hrPartner.profilePicture = `/uploads/${req.file.filename}`;
    await hrPartner.save();

    res.status(200).json({ profilePicture: hrPartner.profilePicture });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch HR profile details
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const hrPartner = await HRPartner.findById(req.user.id);
    if (!hrPartner) {
      return res.status(404).json({ message: 'HR Partner not found' });
    }
    res.status(200).json(hrPartner);
  } catch (error) {
    console.error('Error fetching HR profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
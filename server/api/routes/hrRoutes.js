// api/routes/hrRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const { verifyToken } = require('../../utils/authMiddleware');
const HRPartner = require('../models/hrPartner');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Azure Blob Storage configuration
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME);

// Upload profile picture
router.post('/upload-profile-picture', verifyToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const hrPartner = await HRPartner.findById(req.user.id);
    if (!hrPartner) {
      return res.status(404).json({ message: 'HR Partner not found' });
    }

    const blobName = `${req.user.id}-${uuidv4()}${path.extname(req.file.originalname)}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.upload(req.file.buffer, req.file.size, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    });

    const profilePictureUrl = blockBlobClient.url;
    hrPartner.profilePicture = profilePictureUrl;
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
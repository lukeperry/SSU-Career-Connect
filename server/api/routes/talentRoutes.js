const express = require('express');
const router = express.Router();
const multer = require('multer');
const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
const { verifyToken } = require('../../utils/authMiddleware');
const Talent = require('../models/talent');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const crypto = require('crypto');

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Azure Blob Storage configuration
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME);

// Generate SAS token
const generateSASToken = (blobName) => {
  const sasOptions = {
    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME,
    blobName: blobName,
    permissions: BlobSASPermissions.parse("r"),
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour
  };
  return generateBlobSASQueryParameters(sasOptions, blobServiceClient.credential).toString();
};

// Get talent profile by ID or current user
router.get('/profile/:id?', verifyToken, async (req, res) => {
  try {
    const talentId = req.params.id || req.user.id;
    const talent = await Talent.findById(talentId).select('username firstName lastName birthday gender email phoneNumber location experience skills profilePicture resumeUrl');
    if (!talent) {
      return res.status(404).json({ message: 'Talent not found' });
    }
    res.json(talent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update talent profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const updatedData = req.body;
    const talent = await Talent.findByIdAndUpdate(req.user.id, updatedData, { new: true });
    if (!talent) {
      return res.status(404).json({ message: 'Talent not found' });
    }
    res.json(talent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update talent profile picture
router.post('/upload-profile-picture', verifyToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const talent = await Talent.findById(req.user.id);
    if (!talent) {
      return res.status(404).json({ message: 'Talent not found' });
    }

    if (req.file) {
      const blobName = `${uuidv4()}-${req.file.originalname}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      console.log('Uploading to Azure Blob Storage:', blobName);

      await blockBlobClient.uploadData(req.file.buffer, {
        blobHTTPHeaders: { blobContentType: req.file.mimetype },
      });

      const profilePictureUrl = blockBlobClient.url;
      console.log('Profile picture URL:', profilePictureUrl);

      talent.profilePicture = profilePictureUrl;
      await talent.save();

      res.json({ message: 'Profile picture updated successfully', profilePicture: profilePictureUrl });
    } else {
      res.status(400).json({ message: 'No file uploaded' });
    }
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload resume
router.post('/upload-resume', verifyToken, upload.single('resume'), async (req, res) => {
  try {
    const talent = await Talent.findById(req.user.id);
    if (!talent) {
      return res.status(404).json({ message: 'Talent not found' });
    }

    if (req.file) {
      const blobName = `${uuidv4()}-${req.file.originalname}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      console.log('Uploading to Azure Blob Storage:', blobName);

      await blockBlobClient.uploadData(req.file.buffer, {
        blobHTTPHeaders: { blobContentType: req.file.mimetype },
      });

      const resumeUrl = blockBlobClient.url;
      console.log('Resume URL:', resumeUrl);

      talent.resumeUrl = resumeUrl;
      await talent.save();

      res.json({ message: 'Resume uploaded successfully', resumeUrl: resumeUrl });
    } else {
      res.status(400).json({ message: 'No file uploaded' });
    }
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update resume URL
router.put('/update-resume-url', verifyToken, async (req, res) => {
  try {
    const { resumeUrl } = req.body;
    if (!resumeUrl) {
      return res.status(400).json({ message: 'No resume URL provided' });
    }

    const talent = await Talent.findById(req.user.id);
    if (!talent) {
      return res.status(404).json({ message: 'Talent not found' });
    }

    talent.resumeUrl = resumeUrl;
    await talent.save();

    res.json({ message: 'Resume URL updated successfully', resumeUrl: resumeUrl });
  } catch (error) {
    console.error('Error updating resume URL:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
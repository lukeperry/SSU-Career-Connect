// api/routes/hrRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
const { verifyToken } = require('../../utils/authMiddleware');
const HRPartner = require('../models/hrPartner');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const Job = require('../models/job');

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

// HR Upload profile picture
router.post('/upload-profile-picture', verifyToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const hrPartner = await HRPartner.findById(req.user.id);
    if (!hrPartner) {
      return res.status(404).json({ message: 'HR Partner not found' });
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

      hrPartner.profilePicture = profilePictureUrl;
      await hrPartner.save();

      res.json({ message: 'Profile picture updated successfully', profilePicture: profilePictureUrl });
    } else {
      res.status(400).json({ message: 'No file uploaded' });
    }
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

// Fetch HR profile details by ID
router.get('/profile/:id', verifyToken, async (req, res) => {
  try {
    const hrPartner = await HRPartner.findById(req.params.id).select('username firstName lastName email profilePicture');
    if (!hrPartner) {
      return res.status(404).json({ message: 'HR Partner not found' });
    }
    res.json(hrPartner);
  } catch (error) {
    console.error('Error fetching HR profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update HR profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const updatedData = req.body;
    const hrPartner = await HRPartner.findByIdAndUpdate(req.user.id, updatedData, { new: true });
    if (!hrPartner) {
      return res.status(404).json({ message: 'HR Partner not found' });
    }
    res.json(hrPartner);
  } catch (error) {
    console.error('Error updating HR profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a job
router.delete('/jobs/:id', verifyToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    await job.remove();
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
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
    expiresOn: new Date(new Date().valueOf() + 24 * 3600 * 1000), // 24 hours
  };
  return generateBlobSASQueryParameters(sasOptions, blobServiceClient.credential).toString();
};

// HR Upload profile picture
router.post('/upload-profile-picture', verifyToken, upload.single('profilePicture'), async (req, res) => {
  try {
  const userId = req.user.id || req.user._id;
  const hrPartner = await HRPartner.findById(userId);
    if (!hrPartner) {
      return res.status(404).json({ message: 'HR Partner not found' });
    }

    if (req.file) {
      // Delete old profile picture if it exists
      if (hrPartner.profilePicture) {
        try {
          const oldUrl = new URL(hrPartner.profilePicture);
          const oldBlobName = oldUrl.pathname.split('/').pop();
          const oldBlobClient = containerClient.getBlockBlobClient(oldBlobName);
          
          console.log('Deleting old HR profile picture:', oldBlobName);
          await oldBlobClient.deleteIfExists();
          console.log('Old HR profile picture deleted successfully');
        } catch (deleteError) {
          console.error('Error deleting old HR profile picture:', deleteError);
          // Continue with upload even if delete fails
        }
      }

      const blobName = `${uuidv4()}-${req.file.originalname}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      console.log('Uploading new HR profile picture to Azure Blob Storage:', blobName);

      await blockBlobClient.uploadData(req.file.buffer, {
        blobHTTPHeaders: { blobContentType: req.file.mimetype },
      });

      // Generate SAS token for the blob
      const sasToken = generateSASToken(blobName);
      const profilePictureUrl = `${blockBlobClient.url}?${sasToken}`;
      console.log('Profile picture URL with SAS:', profilePictureUrl);

      // Save base URL without SAS token (we'll generate fresh tokens when fetching)
      hrPartner.profilePicture = blockBlobClient.url;
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
  const userId = req.user.id || req.user._id;
  const hrPartner = await HRPartner.findById(userId);
    if (!hrPartner) {
      return res.status(404).json({ message: 'HR Partner not found' });
    }
    
    // Add SAS token to profile picture URL if it exists
    if (hrPartner.profilePicture) {
      try {
        // Remove any existing query parameters (old SAS tokens)
        const cleanUrl = hrPartner.profilePicture.split('?')[0];
        const url = new URL(cleanUrl);
        const blobName = url.pathname.split('/').slice(2).join('/'); // Skip container name in path
        const sasToken = generateSASToken(blobName);
        hrPartner.profilePicture = `${cleanUrl}?${sasToken}`;
      } catch (error) {
        console.error('Error generating SAS token for profile picture:', error);
      }
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
    const hrPartner = await HRPartner.findById(req.params.id).select('username firstName lastName email profilePicture birthday gender phoneNumber companyName createdAt');
    if (!hrPartner) {
      return res.status(404).json({ message: 'HR Partner not found' });
    }
    
    // Add SAS token to profile picture URL if it exists
    if (hrPartner.profilePicture) {
      try {
        // Remove any existing query parameters (old SAS tokens)
        const cleanUrl = hrPartner.profilePicture.split('?')[0];
        const url = new URL(cleanUrl);
        const blobName = url.pathname.split('/').slice(2).join('/'); // Skip container name in path
        const sasToken = generateSASToken(blobName);
        hrPartner.profilePicture = `${cleanUrl}?${sasToken}`;
      } catch (error) {
        console.error('Error generating SAS token for profile picture:', error);
      }
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
  const userId = req.user.id || req.user._id;
  const hrPartner = await HRPartner.findByIdAndUpdate(userId, updatedData, { new: true });
    if (!hrPartner) {
      return res.status(404).json({ message: 'HR Partner not found' });
    }
    res.json(hrPartner);
  } catch (error) {
    console.error('Error updating HR profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all company names (for autocomplete suggestions)
router.get('/companies', async (req, res) => {
  try {
    // Get all unique company names from HR partners using aggregation
    const result = await HRPartner.aggregate([
      { $match: { companyName: { $exists: true, $ne: '' } } },
      { $group: { _id: '$companyName' } },
      { $sort: { _id: 1 } }
    ]);
    
    // Extract company names from aggregation result
    const companies = result.map(item => item._id);
    
    res.json(companies);
  } catch (error) {
    console.error('Error fetching company names:', error);
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
    
    // Verify that the job belongs to the HR user
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this job' });
    }
    
    await job.deleteOne();
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
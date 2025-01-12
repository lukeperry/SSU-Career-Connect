const express = require('express');
const router = express.Router();
const multer = require('multer');
const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
const { verifyToken } = require('../../utils/authMiddleware');
const Talent = require('../models/talent');
const { v4: uuidv4 } = require('uuid');

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

// Get talent profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const talent = await Talent.findById(req.user.id);
    if (!talent) {
      return res.status(404).json({ message: 'Talent not found' });
    }
    res.json(talent); // Ensure the response is sent only once
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update talent profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const talent = await Talent.findById(req.user.id);
    if (!talent) {
      return res.status(404).json({ message: 'Talent not found' });
    }

    const { username, firstName, lastName, birthday, gender, email, phoneNumber } = req.body;
    talent.username = username;
    talent.firstName = firstName;
    talent.lastName = lastName;
    talent.birthday = birthday;
    talent.gender = gender;
    talent.email = email;
    talent.phoneNumber = phoneNumber;

    await talent.save();
    res.json({ message: 'Profile updated successfully' });
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

module.exports = router;
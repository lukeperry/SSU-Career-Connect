const express = require('express');
const router = express.Router();
const HRPartner = require('../models/hrPartner');
const Talent = require('../models/talent');
const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');

// Azure Blob Storage configuration
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

// Generate SAS token with 24-hour expiration
const generateSASToken = (blobName) => {
  try {
    // Decode the blob name to handle special characters
    const decodedBlobName = decodeURIComponent(blobName);
    
    const sasOptions = {
      containerName: process.env.AZURE_STORAGE_CONTAINER_NAME,
      blobName: decodedBlobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + 24 * 3600 * 1000), // 24 hours
    };
    
    const sasToken = generateBlobSASQueryParameters(sasOptions, blobServiceClient.credential).toString();
    console.log(`Generated SAS token for: ${decodedBlobName}`);
    return sasToken;
  } catch (error) {
    console.error('Error generating SAS token:', error);
    throw error;
  }
};

// Helper function to add SAS token to profile picture URL
const addSASTokenToProfilePicture = (user) => {
  if (user.profilePicture) {
    try {
      const url = new URL(user.profilePicture);
      // Extract blob name from URL path, removing the container name
      const pathParts = url.pathname.split('/');
      const blobName = decodeURIComponent(pathParts.slice(2).join('/')); // Skip first two parts (empty and container name)
      
      console.log(`Processing profile picture: ${blobName}`);
      
      const sasToken = generateSASToken(blobName);
      // Remove existing query parameters and add new SAS token
      const baseUrl = user.profilePicture.split('?')[0];
      user.profilePicture = `${baseUrl}?${sasToken}`;
      
      console.log(`Updated profile picture URL for user: ${user.username || user.email}`);
    } catch (error) {
      console.error('Error generating SAS token for profile picture:', error);
      console.error('Original URL:', user.profilePicture);
    }
  }
  return user;
};

// Test route
router.get('/', (req, res) => {
  res.send('User Route is working!');
});

// Fetch all HR users
router.get('/hr', async (req, res) => {
  try {
    const hrUsers = await HRPartner.find().select('username email profilePicture firstName lastName companyName');
    // Add SAS tokens to profile pictures
    const usersWithSAS = hrUsers.map(user => {
      const userObj = user.toObject();
      return addSASTokenToProfilePicture(userObj);
    });
    res.json(usersWithSAS);
  } catch (error) {
    console.error('Error fetching HR users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch all Talent users
router.get('/talent', async (req, res) => {
  try {
    const talentUsers = await Talent.find().select('username email profilePicture firstName lastName');
    // Add SAS tokens to profile pictures
    const usersWithSAS = talentUsers.map(user => {
      const userObj = user.toObject();
      return addSASTokenToProfilePicture(userObj);
    });
    res.json(usersWithSAS);
  } catch (error) {
    console.error('Error fetching Talent users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

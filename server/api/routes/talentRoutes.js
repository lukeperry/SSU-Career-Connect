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
  console.log('Generating SAS token for blob:', blobName);
  const sasOptions = {
    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME,
    blobName: blobName,
    permissions: BlobSASPermissions.parse("r"),
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + 24 * 3600 * 1000), // 24 hours
  };
  const sasToken = generateBlobSASQueryParameters(sasOptions, blobServiceClient.credential).toString();
  console.log('Generated SAS token:', sasToken);
  return sasToken;
};

// Get talent profile by ID or current user
router.get('/profile/:id?', verifyToken, async (req, res) => {
  try {
    // Accept both id and _id for compatibility
    const userId = req.user.id || req.user._id;
    const talentId = req.params.id || userId;
    const talent = await Talent.findById(talentId).select('username firstName lastName birthday gender email phoneNumber location province city barangay experience skills profilePicture resumeUrl documents age civilStatus educationLevel school degree major graduationYear isSSUGraduate employmentStatus currentCompany currentPosition yearsOfExperience expectedSalary profileCompleted profileCompletionPercentage accountStatus verifiedEmail verifiedPhone');
    if (!talent) {
      return res.status(404).json({ message: 'Talent not found' });
    }
    
    // Add SAS token to profile picture URL if it exists
    if (talent.profilePicture) {
      try {
        // Remove any existing query parameters (old SAS tokens)
        const cleanUrl = talent.profilePicture.split('?')[0];
        const url = new URL(cleanUrl);
        // Azure URL format: https://account.blob.core.windows.net/container/blobname
        // Path format: /container/blobname -> we need just blobname
        const pathParts = url.pathname.split('/').filter(part => part.length > 0);
        // Decode URI components to handle spaces and special characters
        const blobName = decodeURIComponent(pathParts.slice(1).join('/'));
        console.log('Profile picture - Clean URL:', cleanUrl);
        console.log('Profile picture - Extracted blob name:', blobName);
        const sasToken = generateSASToken(blobName);
        talent.profilePicture = `${cleanUrl}?${sasToken}`;
      } catch (error) {
        console.error('Error generating SAS token for profile picture:', error);
      }
    }
    
    // Add SAS token to resume URL if it exists
    if (talent.resumeUrl) {
      try {
        // Remove any existing query parameters (old SAS tokens)
        const cleanUrl = talent.resumeUrl.split('?')[0];
        const url = new URL(cleanUrl);
        // Azure URL format: https://account.blob.core.windows.net/container/blobname
        // Path format: /container/blobname -> we need just blobname
        const pathParts = url.pathname.split('/').filter(part => part.length > 0);
        // Decode URI components to handle spaces and special characters
        const blobName = decodeURIComponent(pathParts.slice(1).join('/'));
        console.log('Resume - Clean URL:', cleanUrl);
        console.log('Resume - Extracted blob name:', blobName);
        const sasToken = generateSASToken(blobName);
        talent.resumeUrl = `${cleanUrl}?${sasToken}`;
      } catch (error) {
        console.error('Error generating SAS token for resume:', error);
      }
    }
    
    // Add SAS tokens to documents
    if (talent.documents && talent.documents.length > 0) {
      talent.documents = talent.documents.map(doc => {
        try {
          const cleanUrl = doc.url.split('?')[0];
          const url = new URL(cleanUrl);
          const pathParts = url.pathname.split('/').filter(part => part.length > 0);
          const blobName = decodeURIComponent(pathParts.slice(1).join('/'));
          const sasToken = generateSASToken(blobName);
          return {
            ...doc.toObject(),
            url: `${cleanUrl}?${sasToken}`
          };
        } catch (error) {
          console.error('Error generating SAS token for document:', error);
          return doc;
        }
      });
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
    
    // Find the talent first
  const userId = req.user.id || req.user._id;
  const talent = await Talent.findById(userId);
    if (!talent) {
      return res.status(404).json({ message: 'Talent not found' });
    }
    
    // Update fields manually
    Object.keys(updatedData).forEach(key => {
      talent[key] = updatedData[key];
    });
    
    // Save (this triggers pre-save middleware for age and profile completion calculation)
    await talent.save();
    
    res.json(talent);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update talent profile picture
router.post('/upload-profile-picture', verifyToken, upload.single('profilePicture'), async (req, res) => {
  try {
  const userId = req.user.id || req.user._id;
  const talent = await Talent.findById(userId);
    if (!talent) {
      return res.status(404).json({ message: 'Talent not found' });
    }

    if (req.file) {
      // Delete old profile picture if it exists
      if (talent.profilePicture) {
        try {
          const oldUrl = new URL(talent.profilePicture);
          const pathParts = oldUrl.pathname.split('/').filter(part => part.length > 0);
          const oldBlobName = decodeURIComponent(pathParts.slice(1).join('/'));
          const oldBlobClient = containerClient.getBlockBlobClient(oldBlobName);
          
          console.log('Deleting old profile picture:', oldBlobName);
          await oldBlobClient.deleteIfExists();
          console.log('Old profile picture deleted successfully');
        } catch (deleteError) {
          console.error('Error deleting old profile picture:', deleteError);
          // Continue with upload even if delete fails
        }
      }

      // Sanitize filename: replace spaces with underscores, remove special chars
      const sanitizedFilename = req.file.originalname
        .replace(/\s+/g, '_')
        .replace(/[^\w\-\.]/g, '');
      
      const blobName = `${uuidv4()}-${sanitizedFilename}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      console.log('Uploading new profile picture to Azure Blob Storage:', blobName);

      await blockBlobClient.uploadData(req.file.buffer, {
        blobHTTPHeaders: { blobContentType: req.file.mimetype },
      });

      // Generate SAS token for the blob
      const sasToken = generateSASToken(blobName);
      const profilePictureUrl = `${blockBlobClient.url}?${sasToken}`;
      console.log('Profile picture URL with SAS:', profilePictureUrl);

      // Save only the blob name, we'll generate SAS tokens when fetching
      talent.profilePicture = blockBlobClient.url;
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
  const userId = req.user.id || req.user._id;
  const talent = await Talent.findById(userId);
    if (!talent) {
      return res.status(404).json({ message: 'Talent not found' });
    }

    if (req.file) {
      // Delete old resume if it exists
      if (talent.resumeUrl) {
        try {
          const oldUrl = new URL(talent.resumeUrl);
          const pathParts = oldUrl.pathname.split('/').filter(part => part.length > 0);
          const oldBlobName = decodeURIComponent(pathParts.slice(1).join('/'));
          const oldBlobClient = containerClient.getBlockBlobClient(oldBlobName);
          
          console.log('Deleting old resume:', oldBlobName);
          await oldBlobClient.deleteIfExists();
          console.log('Old resume deleted successfully');
        } catch (deleteError) {
          console.error('Error deleting old resume:', deleteError);
          // Continue with upload even if delete fails
        }
      }

      // Sanitize filename: replace spaces with underscores, remove special chars except dots, hyphens, underscores
      const sanitizedFilename = req.file.originalname
        .replace(/\s+/g, '_')  // Replace spaces with underscores
        .replace(/[^\w\-\.]/g, '');  // Remove special characters except word chars, hyphens, dots
      
      const blobName = `${uuidv4()}-${sanitizedFilename}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      console.log('Uploading new resume to Azure Blob Storage:', blobName);

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

  const userId = req.user.id || req.user._id;
  const talent = await Talent.findById(userId);
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

// Upload document (multiple documents support)
router.post('/upload-document', verifyToken, upload.single('resume'), async (req, res) => {
  try {
  const userId = req.user.id || req.user._id;
  const talent = await Talent.findById(userId);
    if (!talent) {
      return res.status(404).json({ message: 'Talent not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Sanitize filename
    const sanitizedFilename = req.file.originalname
      .replace(/\s+/g, '_')
      .replace(/[^\w\-\.]/g, '');
    
    const blobName = `documents/${uuidv4()}-${sanitizedFilename}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    console.log('Uploading document to Azure Blob Storage:', blobName);

    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype },
    });

    const documentUrl = blockBlobClient.url;
    console.log('Document URL:', documentUrl);

    // Initialize documents array if it doesn't exist
    if (!talent.documents) {
      talent.documents = [];
    }

    // Add new document to the array
    talent.documents.push({
      filename: req.body.filename || req.file.originalname,
      url: documentUrl,
      uploadedAt: new Date()
    });

    await talent.save();

    res.json({ 
      message: 'Document uploaded successfully', 
      documents: talent.documents 
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete document
router.delete('/delete-document/:documentId', verifyToken, async (req, res) => {
  try {
  const userId = req.user.id || req.user._id;
  const talent = await Talent.findById(userId);
    if (!talent) {
      return res.status(404).json({ message: 'Talent not found' });
    }

    const document = talent.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete from Azure Blob Storage
    try {
      const url = new URL(document.url);
      const pathParts = url.pathname.split('/').filter(part => part.length > 0);
      const blobName = decodeURIComponent(pathParts.slice(1).join('/'));
      const blobClient = containerClient.getBlockBlobClient(blobName);
      
      console.log('Deleting document:', blobName);
      await blobClient.deleteIfExists();
      console.log('Document deleted from blob storage');
    } catch (deleteError) {
      console.error('Error deleting document from blob storage:', deleteError);
      // Continue with database deletion even if blob deletion fails
    }


  // Remove from array (fix for Mongoose subdocument removal)
  talent.documents.pull(document._id || document.id);
  await talent.save();

    res.json({ 
      message: 'Document deleted successfully', 
      documents: talent.documents 
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
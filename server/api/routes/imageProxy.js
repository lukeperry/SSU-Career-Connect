// Image proxy route to bypass CORS issues
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');

// Azure Blob Storage configuration
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

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

// Proxy endpoint for images
router.get('/image/*', async (req, res) => {
  try {
    // Get the blob name from the path (everything after /image/)
    const blobName = req.params[0];
    
    console.log('Proxying image request for blob:', blobName);
    
    // Generate Azure Blob URL with SAS token
    const cleanUrl = `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER_NAME}/${blobName}`;
    const sasToken = generateSASToken(blobName);
    const imageUrl = `${cleanUrl}?${sasToken}`;
    
    console.log('Fetching from Azure:', imageUrl);
    
    // Fetch the image from Azure
    const response = await axios.get(imageUrl, {
      responseType: 'stream'
    });
    
    // Set appropriate headers
    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
    
    // Pipe the image stream to the response
    response.data.pipe(res);
    
  } catch (error) {
    console.error('Error proxying image:', error.message);
    res.status(500).json({ error: 'Failed to load image' });
  }
});

module.exports = router;

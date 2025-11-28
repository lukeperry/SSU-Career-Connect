// Configure CORS for Azure Blob Storage
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

const configureCORS = async () => {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );

    const properties = await blobServiceClient.getProperties();
    
    console.log('Current CORS rules:', properties.cors);
    
    // Set CORS rules
    const corsRules = [
      {
        allowedOrigins: '*', // Allow all origins - you can restrict this to specific domains
        allowedMethods: 'GET,HEAD,OPTIONS',
        allowedHeaders: '*',
        exposedHeaders: '*',
        maxAgeInSeconds: 3600
      }
    ];

    await blobServiceClient.setProperties({
      cors: corsRules
    });

    console.log('✅ CORS configuration updated successfully!');
    console.log('New CORS rules:', corsRules);
    
  } catch (error) {
    console.error('❌ Error configuring CORS:', error.message);
    console.error('Full error:', error);
  }
};

configureCORS();

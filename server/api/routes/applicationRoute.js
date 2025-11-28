// routes/applicationRoute.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../utils/authMiddleware');
const Application = require('../models/application');
const Job = require('../models/job');
const Talent = require('../models/talent');
const { getOrCalculateMatchScore } = require('../../utils/matchAlgorithm'); // Import the smart caching match score function
const mongoose = require('mongoose'); // Import mongoose
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

// Helper function to add SAS token to profile picture URL
const addSASTokenToProfilePicture = (talent) => {
  if (talent && talent.profilePicture) {
    try {
      console.log('Original profile picture URL:', talent.profilePicture);
      
      // Remove any existing query parameters (old SAS tokens)
      const cleanUrl = talent.profilePicture.split('?')[0];
      const url = new URL(cleanUrl);
      // Azure URL format: https://account.blob.core.windows.net/container/blobname
      // Path format: /container/blobname -> we need just blobname
      const pathParts = url.pathname.split('/').filter(part => part.length > 0);
      // Decode URI components to handle spaces and special characters
      const blobName = decodeURIComponent(pathParts.slice(1).join('/'));
      console.log('Clean URL:', cleanUrl);
      console.log('Extracted blob name:', blobName);
      
      const sasToken = generateSASToken(blobName);
      talent.profilePicture = `${cleanUrl}?${sasToken}`;
      console.log('Profile picture with SAS token:', talent.profilePicture);
    } catch (error) {
      console.error('Error generating SAS token for profile picture:', error);
      console.error('Profile picture URL that caused error:', talent.profilePicture);
    }
  } else {
    console.log('No profile picture found for talent:', talent?.firstName, talent?.lastName);
  }
  return talent;
};

// Test connection
router.get('/application', (req, res) => {
  res.status(200).json({ message: 'Connected to application routes' });
});

// Apply to a job
router.post('/job/:id/apply', verifyToken, async (req, res) => {
  const { id } = req.params;
  const talentId = req.user.id;  // Assuming the user is the talent

  console.log(`Applying for job with ID: ${id} by talent with ID: ${talentId}`);

  try {
    // Check if the job is open
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    console.log(`Job status: ${job.status}`); // Log the job status

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job is no longer open for applications.' });
    }

    // Check if the user has already applied
    const existingApplication = await Application.findOne({ jobId: id, talentId });
    console.log(`Existing application: ${existingApplication}`); // Log the existing application
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job.' });
    }

    // Calculate match score (uses cache if available)
    const talent = await Talent.findById(talentId); // Fetch the talent details
    const matchScore = await getOrCalculateMatchScore(job, talent);
  
    // Create a new application
    const application = new Application({
      jobId: id,
      talentId,
      matchScore,
      status: 'pending'
    });
    await application.save();

    // Update the job document to include the talent's ID in the applicants array
    job.applicants.push(talentId);
    await job.save();

    res.status(200).json({ message: 'Application successful!', application });
  } catch (err) {
    console.error('Error applying for job:', err);
    res.status(500).json({ message: 'Error applying for job', error: err });
  }
});

// Get all applications for a job (admin or HR should be able to see this)
router.get('/job/:id/applications', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    console.log('Fetching applications for job:', id);
    const applications = await Application.find({ jobId: id }).populate('talentId', 'firstName lastName profilePicture email'); // Populate talent details
    console.log('Found', applications.length, 'applications');
    
    // Add SAS tokens to profile pictures
    const applicationsWithSAS = applications.map((app, index) => {
      const appObj = app.toObject();
      console.log(`Processing application ${index + 1}:`, appObj.talentId?.firstName, appObj.talentId?.lastName);
      if (appObj.talentId) {
        appObj.talentId = addSASTokenToProfilePicture(appObj.talentId);
      }
      return appObj;
    });
    
    console.log('Returning applications with SAS tokens');
    res.status(200).json({ applications: applicationsWithSAS });
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status
router.put('/:id/status', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const application = await Application.findByIdAndUpdate(id, { status }, { new: true })
      .populate('jobId', 'title companyName salary')
      .populate('talentId', '_id');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // If the application is accepted, update the talent's hiring status
    if (status === 'accepted' && application.talentId) {
      await Talent.findByIdAndUpdate(application.talentId._id, {
        hiredThroughPlatform: true,
        hiredDate: new Date(),
        hiredCompany: application.jobId?.companyName || 'Unknown Company',
        hiredPosition: application.jobId?.title || 'Unknown Position',
        employmentStatus: 'Employed'
      });
      console.log(`✅ Talent ${application.talentId._id} marked as hired through platform`);
    }

    res.json(application);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark application as viewed (similar to notification read)
router.put('/:id/viewed', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const application = await Application.findByIdAndUpdate(
      id, 
      { viewed: true }, 
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: 'Application marked as viewed', application });
  } catch (error) {
    console.error('Error marking application as viewed:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all submitted applications for the logged-in talent
router.get('/submitted', verifyToken, async (req, res) => {
  try {
    const applications = await Application.find({ talentId: req.user.id }).populate('jobId', 'title companyName description location requirements requiredSkills');
    res.status(200).json({ applications });
  } catch (err) {
    console.error('Error fetching submitted applications:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel/Withdraw an application
router.delete('/:applicationId/cancel', verifyToken, async (req, res) => {
  const { applicationId } = req.params;
  const talentId = req.user.id;

  try {
    // Find the application
    const application = await Application.findById(applicationId);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify the application belongs to the logged-in talent
    if (application.talentId.toString() !== talentId) {
      return res.status(403).json({ message: 'You are not authorized to cancel this application' });
    }

    // Remove talent from job's applicants array if job exists
    if (application.jobId) {
      await Job.findByIdAndUpdate(
        application.jobId,
        { $pull: { applicants: talentId } }
      );
    }

    // Delete the application
    await Application.findByIdAndDelete(applicationId);

    res.status(200).json({ message: 'Application cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling application:', err);
    res.status(500).json({ message: 'Error cancelling application', error: err });
  }
});

// Fetch applications for HR's jobs
router.get('/hr', verifyToken, async (req, res) => {
  try {
    const hrId = req.user.id; // Assuming req.user.id contains the HR's ID

    const jobs = await Job.find({ postedBy: hrId }).select('_id');
    const jobIds = jobs.map(job => job._id);

    const applications = await Application.find({ jobId: { $in: jobIds } }).populate('talentId jobId');

    // Add SAS tokens to profile pictures
    const applicationsWithSAS = applications.map(app => {
      const appObj = app.toObject();
      if (appObj.talentId) {
        appObj.talentId = addSASTokenToProfilePicture(appObj.talentId);
      }
      return appObj;
    });

    res.json({ applications: applicationsWithSAS });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific application by ID
router.get('/job/:id/applications', verifyToken, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid application ID' });
  }
  try {
    const application = await Application.findById(id).populate('talentId', 'firstName lastName profilePicture email');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
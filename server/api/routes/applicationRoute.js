// routes/applicationRoute.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../utils/authMiddleware');
const Application = require('../models/application');
const Job = require('../models/job');
const Talent = require('../models/talent');
const { calculateMatchScore } = require('../../utils/matchAlgorithm'); // Import the calculateMatchScore function
const mongoose = require('mongoose'); // Import mongoose

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

    // Calculate match score
    const talent = await Talent.findById(talentId); // Fetch the talent details
    const matchScore = await calculateMatchScore(job, talent);
  
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
    const applications = await Application.find({ jobId: id }).populate('talentId', 'firstName lastName profilePicture email'); // Populate talent details
    res.status(200).json({ applications });
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
    const application = await Application.findByIdAndUpdate(id, { status }, { new: true });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
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

// Fetch applications for HR's jobs
router.get('/hr', verifyToken, async (req, res) => {
  try {
    const hrId = req.user.id; // Assuming req.user.id contains the HR's ID

    const jobs = await Job.find({ postedBy: hrId }).select('_id');
    const jobIds = jobs.map(job => job._id);

    const applications = await Application.find({ jobId: { $in: jobIds } }).populate('talentId jobId');

    res.json({ applications });
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
const express = require('express');
const router = express.Router();
const Job = require('../models/job'); // Job model
const { verifyToken } = require('../../utils/authMiddleware'); // Authentication middleware
const HRPartner = require('../models/hrPartner'); // To verify the poster is an HR partner

// Test route
/*router.get('/', (req, res) => {
  res.send('Job Route is working!');
});*/

// Post a new job (Only HR Partners)
router.post('/post', verifyToken, async (req, res) => {
  const { title, description, requirements, requiredSkills, salary, location, companyName } = req.body;

  // Check user role (ensure it's an HR partner)
  if (req.user.role !== 'hr') {
    return res.status(403).json({ message: 'Only HR partners can post jobs' });
  }

  // Validate fields
  if (!title || !description || !requirements || !requiredSkills || !location || !companyName) {
    return res.status(400).json({ message: 'Please provide all required fields: title, description, requirements, required skills, location, and company name' });
  }
  if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
    return res.status(400).json({ message: 'Required Skills must be a non-empty array.' });
  }
  try {
    // Create a new job posting
    const newJob = new Job({
      title,
      description,
      requirements,
      requiredSkills,
      salary,
      location,
      companyName,
      postedBy: req.user.id, // From token payload
    });

    await newJob.save();

    res.status(201).json({ message: 'Job posted successfully', job: newJob });
  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to fetch all jobs
router.get('/', verifyToken, async (req, res) => {
  try {
    // Fetch all jobs
    const jobs = await Job.find();

    if (jobs.length === 0) {
      return res.status(404).json({ message: 'No jobs found.' });
    }

    res.status(200).json({ jobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error. Could not fetch jobs.' });
  }
});

module.exports = router;
// routes/applicationRoute.js
const express = require('express');
const router = express.Router();
const Application = require('../models/application');
const Job = require('../models/job');
const { verifyToken } = require('../../utils/authMiddleware');

// Apply to a job
router.post('/job/:id/apply', verifyToken, async (req, res) => {
    const { id } = req.params;
    const talentId = req.user.id;  // Assuming the user is the talent
  
    try {
      // Check if the job is open
      const job = await Job.findById(id);
      if (job.status !== 'open') {
        return res.status(400).json({ message: 'This job is no longer open for applications.' });
      }
  
      // Check if the user has already applied
      const existingApplication = await Application.findOne({ jobId: id, talentId });
      if (existingApplication) {
        return res.status(400).json({ message: 'You have already applied to this job.' });
      }
  
      // Create a new application
      const application = new Application({
        jobId: id,
        talentId,
        status: 'pending'
      });
      await application.save();
  
      res.status(200).json({ message: 'Application successful!', application });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error applying for job', error: err });
    }
  });

  // Get all applications for a job (admin or HR should be able to see this)
router.get('/job/:id/applications', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
      const applications = await Application.find({ jobId: id });
      res.status(200).json({ applications });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching applications', error: err });
    }
  });
  
  // Update application status (HR/Admin)
router.put('/application/:id/status', verifyToken, async (req, res) => {
    const { status } = req.body;  // New status, e.g., 'accepted' or 'rejected'
  
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
  
    try {
      const application = await Application.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
  
      res.status(200).json({ message: 'Application status updated', application });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating application status', error: err });
    }
  });
  
  module.exports = router;
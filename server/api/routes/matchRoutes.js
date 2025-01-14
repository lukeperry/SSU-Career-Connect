const express = require('express');
const router = express.Router();
const { calculateMatchScore } = require('../../utils/matchAlgorithm');
const Job = require('../models/job');
const Talent = require('../models/talent');
const { verifyToken } = require('../../utils/authMiddleware');

router.get('/matches', verifyToken, async (req, res) => {
  try {
    console.log('User ID from token:', req.user.id); // Log the user ID from the token

    const candidate = await Talent.findById(req.user.id);
    console.log('Candidate:', candidate); // Log the candidate object

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Log the candidate's skills and experience
    console.log('Candidate Skillss:', candidate.skills);
    console.log('Candidate Experience:', candidate.experience);

    // Comment out the rest of the code for now
    /*
    const jobs = await Job.find();
    const matches = [];

    for (const job of jobs) {
      const score = await calculateMatchScore(job, candidate);
      matches.push({ job, score });
    }

    matches.sort((a, b) => b.score - a.score); // Sort matches by score in descending order

    res.json(matches);
    */
    res.json({ message: 'Logging candidate skills and experience' });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
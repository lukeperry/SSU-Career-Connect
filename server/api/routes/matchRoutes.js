const express = require('express');
const router = express.Router();
const { calculateMatchScore } = require('../../utils/matchAlgorithm');
const Job = require('../models/job');
const Talent = require('../models/talent');
const { verifyToken } = require('../../utils/authMiddleware');

router.get('/matches', verifyToken, async (req, res) => {
  try {
    const candidate = await Talent.findById(req.user.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const jobs = await Job.find();
    const matchScores = await Promise.all(jobs.map(async (job) => {
      const score = await calculateMatchScore(job, candidate);
      return { job, score };
    }));

    const sortedMatches = matchScores.sort((a, b) => b.score - a.score);
    res.json(sortedMatches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
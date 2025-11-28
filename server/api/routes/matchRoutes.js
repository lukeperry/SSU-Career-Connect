const express = require('express');
const router = express.Router();
const { getOrCalculateMatchScore, batchCalculateMatchScores } = require('../../utils/matchAlgorithm');
const Job = require('../models/job');
const Talent = require('../models/talent');
const { verifyToken } = require('../../utils/authMiddleware');

router.get('/matches', verifyToken, async (req, res) => {
  try {
    const candidate = await Talent.findById(req.user.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Only fetch open jobs, limit to 100 for performance
    // Select only necessary fields to reduce data transfer
    const jobs = await Job.find({ status: 'open' })
      .select('title description requirements requiredSkills salary location companyName postedBy createdAt')
      .limit(100)
      .lean(); // Convert to plain JS objects for better performance

    console.log(`📊 Calculating matches for ${jobs.length} open jobs...`);
    const startTime = Date.now();

    // Calculate all match scores in parallel for maximum speed
    // The 15-second timeout is sufficient for ~20-30 jobs
    const matchScores = await Promise.all(jobs.map(async (job) => {
      try {
        const score = await getOrCalculateMatchScore(job, candidate);
        return { job, score };
      } catch (error) {
        console.error(`❌ Error calculating score for job ${job.title}:`, error.message);
        return { job, score: 0 };
      }
    }));

    // Sort by score (highest first) and return top 20
    const sortedMatches = matchScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    const endTime = Date.now();
    console.log(`✅ Calculated ${jobs.length} matches in ${endTime - startTime}ms, returning top 20`);

    res.json(sortedMatches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
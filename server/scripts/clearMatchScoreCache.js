// Clear all cached match scores to force fresh ML calculations
// Run this once to clear old scores and recalculate with TensorFlow

const mongoose = require('mongoose');
require('dotenv').config();

async function clearMatchScoreCache() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the MatchScore model
    const MatchScore = require('../api/models/matchScore');

    // Count existing scores
    const count = await MatchScore.countDocuments();
    console.log(`Found ${count} cached match scores`);

    if (count > 0) {
      // Delete all cached scores
      const result = await MatchScore.deleteMany({});
      console.log(`✅ Deleted ${result.deletedCount} cached scores`);
      console.log('Next time match scores are requested, they will be recalculated with TensorFlow ML model');
    } else {
      console.log('No cached scores found');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearMatchScoreCache();

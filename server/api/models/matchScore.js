const mongoose = require('mongoose');

const matchScoreSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job',
    required: true 
  },
  talentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Talent',
    required: true 
  },
  score: { 
    type: Number, 
    required: true 
  },
  jobSkillsHash: { 
    type: String, 
    required: true 
  },
  talentSkillsHash: { 
    type: String, 
    required: true 
  },
  calculatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Compound index for fast lookups - prevents duplicate calculations
matchScoreSchema.index({ jobId: 1, talentId: 1 }, { unique: true });

// Index for fetching sorted matches for a talent
matchScoreSchema.index({ talentId: 1, score: -1 });

// Index for cleanup of old scores (optional, for future use)
matchScoreSchema.index({ calculatedAt: 1 });

module.exports = mongoose.model('MatchScore', matchScoreSchema);

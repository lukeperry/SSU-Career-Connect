const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
  talentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Talent',  // ealent model who applied
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  matchScore: { 
    type: Number, 
    default: 0 
  },
  appliedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;

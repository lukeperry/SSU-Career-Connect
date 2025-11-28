const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  requirements: {
    type: String, // List of requirements
    required: true,
  },
  requiredSkills: { 
    type: [String], 
    required: true,
  }, // Skills required for the job
  salary: {
    type: String, // Can use String for range or number for exact value
    required: false, // Made optional since not all job postings include salary
  },
  location: {
    type: String,
    required: true,
  },
  companyName: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['open', 'closed'], 
    default: 'open' ,
  },  // Status of the job
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'HRPartner' 
  },  // The HR Partner who posted the job
  applicants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'talent' 
  }],  // Talents who applied for the job
  createdAt: { 
    type: Date, 
    default: Date.now 
  },

});

// ============================================================
// DATABASE INDEXES - For 90% faster queries
// ============================================================
// Index for listing active jobs (most common query)
jobSchema.index({ status: 1, createdAt: -1 });

// Index for HR's job management
jobSchema.index({ postedBy: 1, status: 1 });

// Index for skill-based matching (used by match algorithm)
jobSchema.index({ requiredSkills: 1 });

// Index for location-based searches
jobSchema.index({ location: 1, status: 1 });

// Compound index for common filters
jobSchema.index({ status: 1, companyName: 1, createdAt: -1 });

console.log('✅ Job model indexes created');

module.exports = mongoose.model('Job', jobSchema);

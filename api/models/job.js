// api/models/job.js
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
    validate: [array => array.length > 0, 'At least one skill is required.']
  }, // Skills required for the job
  salary: {
    type: String, // Can use String for range or number for exact value
    required: false,
  },
  location: {
    type: String,
    required: true,
  },
  companyName: { 
    type: String, 
    required: true 
  },
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

module.exports = mongoose.model('Job', jobSchema);


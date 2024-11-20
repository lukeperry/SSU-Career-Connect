// api/models/talent.js
const mongoose = require('mongoose');

const graduateSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  skills: { type: [String], required: true },  // List of skills
  resume: { type: String },  // CV or Resume link/file
  certificates: { type: [String] },  // Array of certificate links
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],  // Jobs the graduate has applied to
  createdAt: { type: Date, default: Date.now },
});

// Method to compare password
graduateSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
module.exports = mongoose.model('Talent', graduateSchema);

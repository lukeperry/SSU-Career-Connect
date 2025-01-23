// api/models/hrPartner.js
const mongoose = require('mongoose');

const hrPartnerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  profilePicture: { type: String }, // Add this field
  jobPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],  // Job posts created by HR
  createdAt: { type: Date, default: Date.now },
});

// Method to compare password
hrPartnerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('HRPartner', hrPartnerSchema);

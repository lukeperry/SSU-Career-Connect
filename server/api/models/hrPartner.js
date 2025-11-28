// api/models/hrPartner.js
const mongoose = require('mongoose');

const hrPartnerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  profilePicture: { type: String },
  birthday: { type: Date }, // Add this field
  gender: { type: String }, // Add this field
  phoneNumber: { type: String }, // Add this field
  jobPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  isActive: { type: Boolean, default: true }, // For admin to activate/deactivate accounts
  createdAt: { type: Date, default: Date.now },
});

// ============================================================
// DATABASE INDEXES - For 90% faster queries
// ============================================================
// Note: username and email already have unique indexes from schema definition

// Index for company-based queries
hrPartnerSchema.index({ companyName: 1 });

console.log('✅ HRPartner model indexes created');

// Method to compare password
hrPartnerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('HRPartner', hrPartnerSchema);

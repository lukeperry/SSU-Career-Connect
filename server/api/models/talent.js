// api/models/talent.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const talentSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthday: { type: Date, required: true },
  gender: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  location: { type: String },
  experience: { type: String },
  profilePicture: { type: String },
  skills: { type: [String]},
  createdAt: { type: Date, default: Date.now },
});
// Method to compare password
talentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Talent', talentSchema);
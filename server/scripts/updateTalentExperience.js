require('dotenv').config();
const mongoose = require('mongoose');
const Talent = require('../models/talent');

const updateTalentExperience = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const talents = await Talent.find({ experience: { $exists: false } });

  for (const talent of talents) {
    // Ensure required fields are populated
    talent.firstName = talent.firstName || 'Unknown';
    talent.lastName = talent.lastName || 'Unknown';
    talent.birthday = talent.birthday || new Date('1900-01-01');
    talent.gender = talent.gender || 'Unknown';
    talent.phoneNumber = talent.phoneNumber || '000-000-0000';
    talent.location = talent.location || 'Unknown';
    talent.experience = 'No experience provided'; // Default value or fetch from another source if available

    await talent.save();
    console.log(`Updated talent: ${talent._id}`);
  }

  mongoose.disconnect();
};

updateTalentExperience().catch(err => console.error('Error updating talent experience:', err));
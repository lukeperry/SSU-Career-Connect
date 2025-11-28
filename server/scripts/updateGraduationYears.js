const mongoose = require('mongoose');
require('dotenv').config();

// Import Talent model
const Talent = require('../api/models/talent');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Generate random graduation year between 2018-2024
const getRandomGraduationYear = () => {
  return Math.floor(Math.random() * 7) + 2018; // 2018-2024
};

// Update talents without graduation years
const updateTalents = async () => {
  try {
    console.log('🔄 Finding talents without graduation years...\n');
    
    // Find talents without graduationYear or where it's null, 0, or undefined
    const talentsToUpdate = await Talent.find({
      $or: [
        { graduationYear: { $exists: false } },
        { graduationYear: null },
        { graduationYear: 0 },
        { graduationYear: '' }
      ]
    });

    if (talentsToUpdate.length === 0) {
      console.log('✅ All talents already have graduation years!');
      process.exit(0);
    }

    console.log(`📋 Found ${talentsToUpdate.length} talents to update:\n`);

    let updateCount = 0;
    for (const talent of talentsToUpdate) {
      const graduationYear = getRandomGraduationYear();
      
      // Update the talent
      await Talent.findByIdAndUpdate(talent._id, {
        graduationYear: graduationYear,
        educationLevel: talent.educationLevel || 'Bachelor\'s Degree' // Set default if missing
      });

      console.log(`✅ Updated: ${talent.firstName} ${talent.lastName} → Graduation Year: ${graduationYear}`);
      updateCount++;
    }

    console.log(`\n✅ Successfully updated ${updateCount} talents!`);
    console.log('📊 All talents now have graduation years for education analytics.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating talents:', error);
    process.exit(1);
  }
};

// Run the update
updateTalents();

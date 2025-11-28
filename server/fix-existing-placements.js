// One-time script to fix existing accepted applications
// This updates talents who were hired before the hiredThroughPlatform fix was added

require('dotenv').config();
const mongoose = require('mongoose');
const Talent = require('./api/models/talent');
const Application = require('./api/models/application');
const Job = require('./api/models/job');

async function fixExistingPlacements() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all accepted applications
    const acceptedApplications = await Application.find({ status: 'accepted' })
      .populate('jobId', 'title companyName salary')
      .populate('talentId', '_id firstName lastName hiredThroughPlatform');

    console.log(`📊 Found ${acceptedApplications.length} accepted application(s)\n`);

    if (acceptedApplications.length === 0) {
      console.log('❌ No accepted applications found. Nothing to fix.');
      process.exit(0);
    }

    let updatedCount = 0;
    let alreadyMarkedCount = 0;

    for (const app of acceptedApplications) {
      if (!app.talentId) {
        console.log(`⚠️  Application ${app._id} has no talent ID, skipping...`);
        continue;
      }

      const talent = app.talentId;
      
      if (talent.hiredThroughPlatform === true) {
        console.log(`✓ ${talent.firstName} ${talent.lastName} - Already marked as hired`);
        alreadyMarkedCount++;
      } else {
        // Update the talent
        await Talent.findByIdAndUpdate(talent._id, {
          hiredThroughPlatform: true,
          hiredDate: app.appliedAt || new Date(),
          hiredCompany: app.jobId?.companyName || 'Unknown Company',
          hiredPosition: app.jobId?.title || 'Unknown Position',
          employmentStatus: 'Employed'
        });
        
        console.log(`✅ ${talent.firstName} ${talent.lastName} - Updated to hired through platform`);
        console.log(`   - Company: ${app.jobId?.companyName || 'Unknown'}`);
        console.log(`   - Position: ${app.jobId?.title || 'Unknown'}`);
        updatedCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 Summary:');
    console.log(`   Total Accepted Applications: ${acceptedApplications.length}`);
    console.log(`   Already Marked as Hired: ${alreadyMarkedCount}`);
    console.log(`   Newly Updated: ${updatedCount}`);
    console.log('='.repeat(60));

    // Verify the counts
    const totalHired = await Talent.countDocuments({ hiredThroughPlatform: true });
    console.log(`\n✅ Total talents marked as hired through platform: ${totalHired}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixExistingPlacements();

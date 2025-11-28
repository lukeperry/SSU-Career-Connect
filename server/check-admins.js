require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./api/models/admin');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('📊 Checking admin accounts in MongoDB Atlas...\n');
    
    const admins = await Admin.find({}, 'email role createdAt').sort({ createdAt: -1 });
    
    if (admins.length === 0) {
      console.log('❌ No admin accounts found!');
      console.log('\n💡 Create one at: https://ssu.lpzb.me/admin/register');
      console.log('\nℹ️  Registration is currently ENABLED (ALLOW_ADMIN_REGISTRATION=true)');
    } else {
      console.log(`✅ Found ${admins.length} admin account(s):\n`);
      admins.forEach((admin, i) => {
        console.log(`${i+1}. Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Created: ${new Date(admin.createdAt).toLocaleString()}\n`);
      });
      console.log('👉 Log in at: https://ssu.lpzb.me/admin/login');
      console.log('\n📝 After login, get your token in browser console:');
      console.log('   localStorage.getItem("admin_token")');
    }
    
    mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });

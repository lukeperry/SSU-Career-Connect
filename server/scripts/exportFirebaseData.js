const admin = require('../config/firebaseAdmin');

async function exportData() {
  try {
    console.log('Starting Firebase data export...');
    
    // Export messages
    const messagesSnapshot = await admin.firestore()
      .collection('messages')
      .get();
    
    const messages = [];
    messagesSnapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Export notifications
    const notificationsSnapshot = await admin.firestore()
      .collection('notifications')
      .get();
    
    const notifications = [];
    notificationsSnapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Save to file
    const fs = require('fs');
    const backup = {
      messages,
      notifications,
      exportDate: new Date().toISOString()
    };

    fs.writeFileSync(
      './firebase-backup.json', 
      JSON.stringify(backup, null, 2)
    );

    console.log('Export complete!');
  } catch (error) {
    console.error('Export failed:', error);
  }
}

exportData();
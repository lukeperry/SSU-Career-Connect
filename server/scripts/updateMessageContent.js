const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-admin.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function updateMessages() {
  try {
    const messagesRef = db.collection('messages');
    const snapshot = await messagesRef.get();
    
    let updateCount = 0;
    
    for (const doc of snapshot.docs) {
      const messageData = doc.data();
      
      // Check if message doesn't have content
      if (!messageData.content) {
        await doc.ref.update({
          content: '[Historical message]'
        });
        updateCount++;
      }
    }
    
    console.log(`Updated ${updateCount} messages`);
  } catch (error) {
    console.error('Error updating messages:', error);
  }
}

// Run the update
updateMessages().then(() => {
  console.log('Update complete');
  process.exit(0);
}).catch(error => {
  console.error('Update failed:', error);
  process.exit(1);
});

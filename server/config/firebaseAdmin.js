const admin = require('firebase-admin');
const serviceAccount = require('../firebase-admin.json'); // Update with the path to your service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ssu-career-connect.firebaseio.com" // Ensure this is correct
});

const db = admin.firestore();

module.exports = { admin, db };
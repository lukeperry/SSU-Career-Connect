const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../utils/authMiddleware');
const { db } = require('../../config/firebaseAdmin'); // Import Firestore from Firebase Admin SDK

// Get notifications for a user
router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const notificationsRef = db.collection('notifications');
    const querySnapshot = await notificationsRef.where('receiverId', '==', userId).orderBy('timestamp', 'desc').get();

    const notifications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate() // Convert Firestore timestamp to JavaScript Date
    }));
    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
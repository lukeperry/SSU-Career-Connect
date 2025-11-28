const express = require('express');
const router = express.Router();
const admin = require('../../config/firebaseAdmin');
const { verifyToken } = require('../../utils/authMiddleware');

// Get notifications
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // Already a string from JWT

    console.log('Fetching notifications for userId:', userId);

    // Remove orderBy to avoid index requirement - we'll sort on client side
    const notificationsRef = admin.firestore()
      .collection('notifications')
      .where('receiverId', '==', userId);

    const snapshot = await notificationsRef.get();
    const notifications = [];

    snapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      });
    });

    console.log(`Found ${notifications.length} notifications for user ${userId}`);

    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notificationRef = admin.firestore().collection('notifications').doc(id);
    const notification = await notificationRef.get();

    if (!notification.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Verify the notification belongs to the user
    if (notification.data().receiverId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Mark as read
    await notificationRef.update({ read: true });

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

module.exports = router;
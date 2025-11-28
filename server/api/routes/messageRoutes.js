const express = require('express');
const router = express.Router();
const admin = require('../../config/firebaseAdmin');
const { verifyToken } = require('../../utils/authMiddleware');
const mongoose = require('mongoose');
const Talent = require('../models/talent');
const HRPartner = require('../models/hrPartner');

// Send a new message
router.post('/', verifyToken, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
  const senderId = req.user._id;

    console.log('[Message] Starting send attempt:', {
      senderId,
      receiverId,
      contentLength: content?.length
    });

    // Verify user exists in your MongoDB (check both Talent and HRPartner)
    const senderExists = await Talent.findById(senderId) || await HRPartner.findById(senderId);
    const receiverExists = await Talent.findById(receiverId) || await HRPartner.findById(receiverId);

    if (!senderExists || !receiverExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add message to Firebase
    const messagesRef = admin.firestore().collection('messages');
    const newMessage = await messagesRef.add({
      content,
      receiverId,
      senderId,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('[Message] Successfully added to Firestore:', newMessage.id);

    // Add notification
    const notificationsRef = admin.firestore().collection('notifications');
    await notificationsRef.add({
      senderId,
      receiverId,
      message: `New message received`,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('[Message] Notification created');

    res.status(201).json({
      success: true,
      messageId: newMessage.id
    });
  } catch (error) {
    console.error('[Message] Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error.message 
    });
  }
});

// ============================================================
// OPTIMIZED: Messages page initialization (single API call)
// Fetches Firebase token + all users in one request
// ============================================================
router.get('/init', verifyToken, async (req, res) => {
  try {
    const startTime = Date.now();
    const Talent = require('../models/talent');
    const HRPartner = require('../models/hrPartner');
    const admin = require('firebase-admin');

    // Generate Firebase custom token
  const firebaseToken = await admin.auth().createCustomToken(req.user._id);

    // Fetch all users in parallel (HR + Talent)
    const [hrUsers, talentUsers] = await Promise.all([
      HRPartner.find()
        .select('_id firstName lastName email profilePicture companyName')
        .lean(),
      Talent.find()
        .select('_id firstName lastName email profilePicture')
        .lean()
    ]);

    // Map users with consistent id field
    const allUsers = [
      ...hrUsers.map(user => ({ ...user, id: user._id.toString(), role: 'hr' })),
      ...talentUsers.map(user => ({ ...user, id: user._id.toString(), role: 'talent' }))
    ];

    res.json({
      firebaseToken,
      users: allUsers,
  currentUserId: req.user._id,
      currentUserRole: req.user.role,
      responseTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('Error initializing messages:', error);
    res.status(500).json({ error: 'Failed to initialize messages' });
  }
});

// Get messages between two users
router.get('/:otherUserId', verifyToken, async (req, res) => {
  try {
  const userId = req.user._id;
    const otherUserId = req.params.otherUserId;

    // Get messages from Firebase using MongoDB IDs
    const messagesRef = admin.firestore().collection('messages');
    const snapshot = await messagesRef
      .where('senderId', 'in', [userId, otherUserId])
      .where('receiverId', 'in', [userId, otherUserId])
      .orderBy('timestamp', 'desc')
      .get();

    const messages = [];
    
    // Get user details from MongoDB to attach names
    const [user1, user2] = await Promise.all([
      mongoose.model('User').findById(userId),
      mongoose.model('User').findById(otherUserId)
    ]);

    snapshot.forEach(doc => {
      const messageData = doc.data();
      messages.push({
        id: doc.id,
        content: messageData.content,
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        senderName: messageData.senderId === userId ? user1.name : user2.name,
        receiverName: messageData.receiverId === userId ? user1.name : user2.name,
        timestamp: messageData.timestamp?.toDate()
      });
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;
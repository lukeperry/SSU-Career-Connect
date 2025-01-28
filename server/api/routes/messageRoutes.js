const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../utils/authMiddleware');
const Message = require('../models/message');
const HRPartner = require('../models/hrPartner'); // Import HRPartner model
const Talent = require('../models/talent'); // Import Talent model
const { db, admin } = require('../../config/firebaseAdmin'); // Import Firestore and admin from Firebase Admin SDK
const mongoose = require('mongoose'); // Import mongoose to use ObjectId

// Send a new message
router.post('/', verifyToken, async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  // Validate and convert IDs to ObjectId
  if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
    return res.status(400).json({ message: 'Invalid senderId or receiverId' });
  }

  try {
    // Fetch sender's details from HRPartner or Talent collections
    console.log('Fetching sender details for ID:', senderId); // Add logging
    let sender = await HRPartner.findById(new mongoose.Types.ObjectId(senderId));
    if (!sender) {
      sender = await Talent.findById(new mongoose.Types.ObjectId(senderId));
    }
    if (!sender) {
      console.log('Sender not found for ID:', senderId); // Add logging
      return res.status(404).json({ message: 'Sender not found' });
    }

    const message = new Message({ senderId: new mongoose.Types.ObjectId(senderId), receiverId: new mongoose.Types.ObjectId(receiverId), content });
    await message.save();

    // Create a notification in Firestore
    const notification = {
      senderId: sender._id.toString(),
      receiverId: receiverId,
      message: `You have a new message from ${sender.firstName} ${sender.lastName}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    console.log('Creating notification:', notification); // Add logging
    await db.collection('notifications').add(notification);

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
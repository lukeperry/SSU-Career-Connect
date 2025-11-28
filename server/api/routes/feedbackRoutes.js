const express = require('express');
const router = express.Router();
require('../models/user'); // Ensure User model is registered for population
const Feedback = require('../models/feedback');
const { verifyToken, restrictTo } = require('../../utils/authMiddleware');
// Submit feedback (talent/hr)
const Talent = require('../models/talent');
const HRPartner = require('../models/hrPartner');

// Public: Get all approved feedbacks (for both HR and Talent)
router.get('/public', verifyToken, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ status: 'approved' }).lean();
    // Attach userName if missing (for legacy data)
    const Talent = require('../models/talent');
    const HRPartner = require('../models/hrPartner');
    const feedbacksWithUser = await Promise.all(feedbacks.map(async fb => {
      let userName = fb.userName || '';
      if (!userName) {
        if (fb.userType === 'talent') {
          const talent = await Talent.findById(fb.userId).select('firstName lastName');
          if (talent) {
            userName = `${talent.firstName} ${talent.lastName}`.trim();
          }
        } else if (fb.userType === 'hr') {
          const hr = await HRPartner.findById(fb.userId).select('firstName lastName');
          if (hr) {
            userName = `${hr.firstName} ${hr.lastName}`.trim();
          }
        }
      }
      return { ...fb, userName };
    }));
    res.json(feedbacksWithUser);
  } catch (err) {
    console.error('Failed to fetch public feedback:', err);
    res.status(500).json({ error: 'Failed to fetch feedback.' });
  }
});

// Admin: Delete feedback
router.delete('/:id', verifyToken, (req, res, next) => {
  if (!['PLATFORM_ADMIN', 'SSU_ADMIN'].includes(req.user.adminRole)) {
    return res.status(403).json({ message: 'Access denied: PLATFORM_ADMIN or SSU_ADMIN only' });
  }
  next();
}, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ error: 'Feedback not found.' });
    res.json({ message: 'Feedback deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete feedback.' });
  }
});

// Talent/HR: Get approved feedbacks for their userType
router.get('/user', verifyToken, restrictTo('talent', 'hr'), async (req, res) => {
  try {
    const userType = req.user.role; // 'talent' or 'hr'
    const feedbacks = await Feedback.find({ status: 'approved', userType }).lean();
    res.json(feedbacks);
  } catch (err) {
    console.error('Failed to fetch user feedback:', err);
    res.status(500).json({ error: 'Failed to fetch feedback.', details: err?.message, stack: err?.stack });
  }
});

router.post('/', verifyToken, restrictTo('talent', 'hr'), async (req, res) => {
  try {
    const { feedbackText, rating } = req.body;
    const userType = req.user.role; // 'talent' or 'hr'
    let userName = '';
    let userEmail = '';
    if (userType === 'talent') {
      const talent = await Talent.findById(req.user._id).select('firstName lastName email');
      if (talent) {
        userName = `${talent.firstName} ${talent.lastName}`.trim();
        userEmail = talent.email;
      }
    } else if (userType === 'hr') {
      const hr = await HRPartner.findById(req.user._id).select('firstName lastName email');
      if (hr) {
        userName = `${hr.firstName} ${hr.lastName}`.trim();
        userEmail = hr.email;
      }
    }
    const feedback = new Feedback({
      userId: req.user._id,
      userType,
      userName,
      userEmail,
      feedbackText,
      rating
    });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully.' });
  } catch (err) {
    console.error('Feedback submission error:', err);
    res.status(500).json({ error: 'Failed to submit feedback.', details: err?.message, stack: err?.stack });
  }
});

// Admin: Get all feedback
router.get('/', verifyToken, (req, res, next) => {
  if (!['PLATFORM_ADMIN', 'SSU_ADMIN'].includes(req.user.adminRole)) {
    return res.status(403).json({ message: 'Access denied: PLATFORM_ADMIN or SSU_ADMIN only' });
  }
  next();
}, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().lean();
    // Dynamically attach user name/email from correct collection
    const Talent = require('../models/talent');
    const HRPartner = require('../models/hrPartner');
    const feedbacksWithUser = await Promise.all(feedbacks.map(async fb => {
      let userName = fb.userName || '';
      let userEmail = fb.userEmail || '';
      if (!userName || !userEmail) {
        if (fb.userType === 'talent') {
          const talent = await Talent.findById(fb.userId).select('firstName lastName email');
          if (talent) {
            userName = `${talent.firstName} ${talent.lastName}`.trim();
            userEmail = talent.email;
          }
        } else if (fb.userType === 'hr') {
          const hr = await HRPartner.findById(fb.userId).select('firstName lastName email');
          if (hr) {
            userName = `${hr.firstName} ${hr.lastName}`.trim();
            userEmail = hr.email;
          }
        }
      }
      return { ...fb, userName, userEmail };
    }));
    res.json(feedbacksWithUser);
  } catch (err) {
    console.error('Failed to fetch feedback:', err);
    res.status(500).json({ error: 'Failed to fetch feedback.', details: err?.message, stack: err?.stack, user: req.user });
  }
});

// Admin: Approve/Reject feedback
router.patch('/:id', verifyToken, (req, res, next) => {
  if (!['PLATFORM_ADMIN', 'SSU_ADMIN'].includes(req.user.adminRole)) {
    return res.status(403).json({ message: 'Access denied: PLATFORM_ADMIN or SSU_ADMIN only' });
  }
  next();
}, async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!feedback) return res.status(404).json({ error: 'Feedback not found.' });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update feedback status.' });
  }
});

module.exports = router;

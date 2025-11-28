//Here involves the verification and separation between talents and HR's
const express = require('express');
const router = express.Router();
const { verifyToken, restrictTo } = require('../../utils/authMiddleware');
const Job = require('../models/job');
const Talent = require('../models/talent');
const HRPartner = require('../models/hrPartner');
const Application = require('../models/application');
const admin = require('../../config/firebaseAdmin');
const { batchCalculateMatchScores } = require('../../utils/matchAlgorithm');


// ============================================================
// OPTIMIZED DASHBOARD ENDPOINTS
// Single API call replaces 5 sequential calls (2.5s → 0.6s = 76% faster)
// ============================================================

// Talent Dashboard Summary - All data in one API call
router.get('/talent/summary', verifyToken, async (req, res) => {
  try {
    const startTime = Date.now();
  const userId = req.user._id;
    
    // Fetch notifications from Firestore
    const notificationsSnapshot = await admin.firestore()
      .collection('notifications')
      .where('receiverId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get();
    
    const notifications = [];
    notificationsSnapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      });
    });
    
    // Execute MongoDB queries in PARALLEL
    const [talent, jobs, applications] = await Promise.all([
      // 1. Profile (use _id from JWT token)
      Talent.findById(userId)
        .select('firstName lastName profilePicture skills experience location')
        .lean(),
      
      // 2. Recent jobs (limit 5, only active)
      Job.find({ status: 'open' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title companyName createdAt')
        .lean(),
      
      // 3. Submitted applications with populated job details
      Application.find({ talentId: userId })
        .populate('jobId', 'title companyName')
        .sort({ appliedAt: -1 })
        .limit(10) // Limit to recent 10
        .select('jobId status appliedAt')
        .lean()
    ]);

    if (!talent) {
      return res.status(404).json({ error: 'Talent profile not found' });
    }

    // Return response immediately (match calculation runs in background)
    const response = {
      success: true,
      profile: talent,
      notifications: notifications || [],
      recentJobs: jobs || [],
      submittedJobs: applications || [],
      responseTime: Date.now() - startTime
    };

    res.status(200).json(response);

    // 5. Calculate match scores in background (non-blocking)
    // This prevents 11-second match calculation from blocking dashboard load
    setImmediate(async () => {
      try {
        const allJobs = await Job.find({ status: 'open' }).limit(100).lean();
        const matches = await batchCalculateMatchScores(allJobs, talent, 10);
        console.log(`✅ Background match calculation completed for ${talent.firstName}: ${matches.length} jobs`);
      } catch (error) {
        console.error('Background match calculation error:', error);
      }
    });

  } catch (error) {
    console.error('Error fetching talent dashboard summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// HR Dashboard Summary - All data in one API call
router.get('/hr/summary', verifyToken, async (req, res) => {
  try {
    const startTime = Date.now();
  const userId = req.user._id;
    
    console.log('🔍 HR Dashboard request for userId:', userId);
    
    // Fetch notifications from Firestore
    let notifications = [];
    try {
      const notificationsSnapshot = await admin.firestore()
        .collection('notifications')
        .where('receiverId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();
      
      notificationsSnapshot.forEach(doc => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        });
      });
      console.log('✅ Fetched', notifications.length, 'notifications');
    } catch (notifError) {
      console.error('⚠️ Firestore notifications error (non-blocking):', notifError.message);
      // Continue without notifications
    }
    
    // Execute MongoDB queries in PARALLEL
    console.log('🔄 Fetching HR profile and applications...');
    const [hr, jobs] = await Promise.all([
      // 1. Profile (use _id from JWT token)
      HRPartner.findById(userId)
        .select('firstName lastName profilePicture companyName isActive')
        .lean(),
      
      // 2. Get jobs posted by this HR (avoid .distinct() due to MongoDB API v1 restrictions)
      Job.find({ postedBy: userId }).select('_id').lean()
    ]);
    
    // Extract job IDs from the jobs array
    const jobIds = jobs.map(job => job._id);

    if (!hr) {
      console.error('❌ HR profile not found for userId:', userId);
      return res.status(404).json({ error: 'HR profile not found' });
    }

    console.log('✅ HR profile found:', hr.firstName, hr.lastName, '| isActive:', hr.isActive);

    // Check if account is deactivated
    if (hr.isActive === false) {
      console.warn('⚠️ HR account is deactivated:', userId);
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
    }

    // 3. Fetch recent applications
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('talentId', 'firstName lastName profilePicture')
      .populate('jobId', 'title')
      .sort({ appliedAt: -1 })
      .limit(5)
      .select('talentId jobId appliedAt viewed status')
      .lean();

    console.log('✅ Fetched', applications.length, 'recent applications');

    res.status(200).json({
      success: true,
      profile: hr,
      notifications: notifications || [],
      recentApplications: applications || [],
      responseTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('Error fetching HR dashboard summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Legacy routes (kept for backward compatibility)
// Protected route for Talents
router.get('/talent/dashboard', verifyToken, restrictTo('talent'), async (req, res) => {
  res.json({
    success: true,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    message: 'Welcome to the Talent dashboard!',
  });
});

// Protected route for HR Partners
router.get('/hr/dashboard', verifyToken, restrictTo('hr'), async (req, res) => {
  res.json({
    success: true,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    message: 'Welcome to the HR dashboard!',
  });
});
/*
// HR Dashboard
router.get('/hr', authMiddleware, (req, res) => {
  res.json({
    success: true,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    message: 'Welcome to the HR dashboard!',
  });
});

// Talent Dashboard
router.get('/talent', authMiddleware, (req, res) => {
  res.json({
    success: true,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    message: 'Welcome to the Talent dashboard!',
  });
});

*/
module.exports = router;



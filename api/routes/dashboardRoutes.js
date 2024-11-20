//Here involves the verification and separation between talents and HR's
const express = require('express');
const router = express.Router();
const { verifyToken, restrictTo } = require('../../utils/authMiddleware');
const authMiddleware = require('../../utils/authMiddleware'); // Middleware to verify JWT
const Job = require('../models/job'); // Replace with your Job model


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



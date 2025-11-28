// api/routes/adminAuthRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const { verifyToken } = require('../../utils/authMiddleware');

// Environment variable to control registration
const ALLOW_ADMIN_REGISTRATION = process.env.ALLOW_ADMIN_REGISTRATION === 'true';

// ============================================================
// REGISTER ADMIN (Protected - Only in development or with flag)
// ============================================================
router.post('/register', async (req, res) => {
  // Check if admin registration is allowed
  if (!ALLOW_ADMIN_REGISTRATION) {
    return res.status(403).json({ 
      message: 'Admin registration is disabled. Contact the platform administrator.' 
    });
  }

  try {
    const { username, firstName, lastName, email, password, role, organization, department } = req.body;

    // Validation
    if (!username || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if admin already exists
    const usernameExists = await Admin.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const emailExists = await Admin.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new admin
    const newAdmin = new Admin({
      username,
      firstName,
      lastName,
      email,
      password, // Will be hashed by pre-save middleware
      role: role || 'SSU_ADMIN',
      organization: organization || 'Samar State University',
      department
    });

    await newAdmin.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newAdmin._id, 
        role: 'admin',
        adminRole: newAdmin.role,
        organization: newAdmin.organization
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Admin account created successfully',
      token,
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        email: newAdmin.email,
        role: newAdmin.role,
        organization: newAdmin.organization
      }
    });

  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ============================================================
// LOGIN ADMIN
// ============================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is active
    if (!admin.active) {
      return res.status(403).json({ message: 'Account is deactivated. Contact administrator.' });
    }

    // Compare password
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    await admin.updateLastLogin();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        role: 'admin',
        adminRole: admin.role,
        organization: admin.organization
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        roleDisplay: admin.getRoleDisplay(),
        organization: admin.organization,
        department: admin.department,
        lastLogin: admin.lastLogin
      }
    });

  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ============================================================
// GET ADMIN PROFILE
// ============================================================
router.get('/profile', verifyToken, async (req, res) => {
  try {
    // Verify this is an admin token
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(admin);
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================
// UPDATE ADMIN PROFILE
// ============================================================
router.put('/profile', verifyToken, async (req, res) => {
  try {
    // Verify this is an admin token
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { firstName, lastName, department, organization } = req.body;
    
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Update allowed fields
    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (department) admin.department = department;
    if (organization) admin.organization = organization;

    await admin.save();

    res.json({
      message: 'Profile updated successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        organization: admin.organization,
        department: admin.department
      }
    });

  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================
// CHANGE PASSWORD
// ============================================================
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    // Verify this is an admin token
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify current password
    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password (will be hashed by pre-save middleware)
    admin.password = newPassword;
    await admin.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================
// CHECK IF REGISTRATION IS ALLOWED (Public endpoint)
// ============================================================
router.get('/registration-status', (req, res) => {
  res.json({ 
    registrationAllowed: ALLOW_ADMIN_REGISTRATION,
    message: ALLOW_ADMIN_REGISTRATION 
      ? 'Admin registration is currently enabled' 
      : 'Admin registration is disabled. Contact administrator for access.'
  });
});

module.exports = router;

// api/routes/adminUserManagementRoutes.js
// User Management Routes - PLATFORM ADMIN ONLY
const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const HRPartner = require('../models/hrPartner');
const Talent = require('../models/talent');
const Job = require('../models/job');
const Application = require('../models/application');
const { verifyToken } = require('../../utils/authMiddleware');
const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');

// Azure Blob Storage configuration
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME);

// ============================================================
// MIDDLEWARE - Check if user is Platform Admin
// ============================================================
const isPlatformAdmin = (req, res, next) => {
  console.log('isPlatformAdmin check:', { 
    role: req.user.role, 
    adminRole: req.user.adminRole,
    fullUser: req.user 
  });
  
  if (req.user.role !== 'admin' || req.user.adminRole !== 'PLATFORM_ADMIN') {
    console.log('Access denied - not Platform Admin');
    return res.status(403).json({ 
      message: 'Access denied. Only Platform Administrators can access this resource.' 
    });
  }
  console.log('Access granted - Platform Admin verified');
  next();
};

// ============================================================
// MIDDLEWARE - Check if user is Platform Admin or Government Admin
// (For read-only viewing of HR Partners and Talents)
// ============================================================
const isPlatformOrGovtAdmin = (req, res, next) => {
  console.log('isPlatformOrGovtAdmin check:', { 
    role: req.user.role, 
    adminRole: req.user.adminRole 
  });
  
  if (req.user.role !== 'admin') {
    console.log('Access denied - not admin');
    return res.status(403).json({ 
      message: 'Access denied. Admin access required.' 
    });
  }

  const allowedRoles = ['PLATFORM_ADMIN', 'GOVT_ADMIN'];
  if (!allowedRoles.includes(req.user.adminRole)) {
    console.log('Access denied - not Platform or Govt Admin');
    return res.status(403).json({ 
      message: 'Access denied. Platform or Government Administrator access required.' 
    });
  }
  
  console.log('Access granted - Platform or Govt Admin verified');
  next();
};

// ============================================================
// GET ALL ADMINS (Platform Admin Only)
// ============================================================
router.get('/admins', verifyToken, isPlatformAdmin, async (req, res) => {
  try {
    const admins = await Admin.find()
      .select('-password') // Exclude password
      .sort({ createdAt: -1 });

    // Group by role
    const grouped = {
      platformAdmins: admins.filter(a => a.role === 'PLATFORM_ADMIN'),
      govtAdmins: admins.filter(a => a.role === 'GOVT_ADMIN'),
      ssuAdmins: admins.filter(a => a.role === 'SSU_ADMIN')
    };

    res.json({
      total: admins.length,
      admins,
      grouped,
      counts: {
        platform: grouped.platformAdmins.length,
        govt: grouped.govtAdmins.length,
        ssu: grouped.ssuAdmins.length,
        active: admins.filter(a => a.active).length,
        inactive: admins.filter(a => !a.active).length
      }
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Server error fetching admins' });
  }
});

// ============================================================
// CREATE NEW ADMIN (Platform Admin Only)
// ============================================================
router.post('/admins', verifyToken, isPlatformAdmin, async (req, res) => {
  try {
    const { username, firstName, lastName, email, password, role, organization, department } = req.body;

    // Validation
    if (!username || !firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Validate role - Platform Admin can only create these roles
    const allowedRoles = ['PLATFORM_ADMIN', 'GOVT_ADMIN', 'SSU_ADMIN'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ 
        message: `Invalid role. Allowed roles: ${allowedRoles.join(', ')}` 
      });
    }

    // Check if username already exists
    const usernameExists = await Admin.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists
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
      role,
      organization: organization || getDefaultOrganization(role),
      department,
      active: true
    });

    await newAdmin.save();

    res.status(201).json({
      message: 'Admin account created successfully',
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        email: newAdmin.email,
        role: newAdmin.role,
        roleDisplay: newAdmin.getRoleDisplay(),
        organization: newAdmin.organization,
        department: newAdmin.department,
        active: newAdmin.active,
        createdAt: newAdmin.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Server error creating admin account' });
  }
});

// ============================================================
// GET SINGLE ADMIN (Platform Admin Only)
// ============================================================
router.get('/admins/:id', verifyToken, isPlatformAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      admin: {
        ...admin.toObject(),
        roleDisplay: admin.getRoleDisplay()
      }
    });
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({ message: 'Server error fetching admin' });
  }
});

// ============================================================
// UPDATE ADMIN (Platform Admin Only)
// ============================================================
router.put('/admins/:id', verifyToken, isPlatformAdmin, async (req, res) => {
  try {
    const { firstName, lastName, organization, department, active } = req.body;

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Update allowed fields
    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (organization) admin.organization = organization;
    if (department !== undefined) admin.department = department;
    if (active !== undefined) admin.active = active;

    await admin.save();

    res.json({
      message: 'Admin account updated successfully',
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
        active: admin.active
      }
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ message: 'Server error updating admin' });
  }
});

// ============================================================
// ACTIVATE/DEACTIVATE ADMIN (Platform Admin Only)
// ============================================================
router.patch('/admins/:id/toggle-status', verifyToken, isPlatformAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Prevent deactivating yourself
    if (admin._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    // Toggle active status
    admin.active = !admin.active;
    await admin.save();

    res.json({
      message: `Admin account ${admin.active ? 'activated' : 'deactivated'} successfully`,
      admin: {
        id: admin._id,
        username: admin.username,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        active: admin.active
      }
    });
  } catch (error) {
    console.error('Error toggling admin status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================
// DELETE ADMIN (Platform Admin Only) - Soft delete by deactivating
// ============================================================
router.delete('/admins/:id', verifyToken, isPlatformAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Prevent deleting yourself
    if (admin._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Soft delete by deactivating
    admin.active = false;
    await admin.save();

    res.json({
      message: 'Admin account deactivated successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        active: admin.active
      }
    });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================
// GET ALL HR PARTNERS (Platform Admin and Government Admin)
// ============================================================
router.get('/hr-partners', verifyToken, isPlatformOrGovtAdmin, async (req, res) => {
  try {
    const hrPartners = await HRPartner.find()
      .select('-password') // Exclude password
      .sort({ createdAt: -1 });

    // Get job counts by company name (centralized per company)
    const Job = require('../models/job');
    const hrPartnersWithJobCounts = await Promise.all(
      hrPartners.map(async (hr) => {
        const hrObj = hr.toObject();
        // Count all jobs posted by this company (not just this HR partner)
        const jobCount = await Job.countDocuments({ companyName: hr.companyName });
        hrObj.companyJobsPosted = jobCount;
        return hrObj;
      })
    );

    res.json({
      total: hrPartnersWithJobCounts.length,
      hrPartners: hrPartnersWithJobCounts,
      counts: {
        active: hrPartnersWithJobCounts.filter(hr => hr.isActive !== false).length,
        inactive: hrPartnersWithJobCounts.filter(hr => hr.isActive === false).length
      }
    });
  } catch (error) {
    console.error('Error fetching HR partners:', error);
    res.status(500).json({ message: 'Server error fetching HR partners' });
  }
});

// ============================================================
// ACTIVATE/DEACTIVATE HR PARTNER (Platform Admin Only)
// ============================================================
router.patch('/hr-partners/:id/toggle-status', verifyToken, isPlatformAdmin, async (req, res) => {
  try {
    console.log('Toggle HR Partner Status - ID:', req.params.id);
    const hrPartner = await HRPartner.findById(req.params.id);
    if (!hrPartner) {
      console.log('HR Partner not found:', req.params.id);
      return res.status(404).json({ message: 'HR Partner not found' });
    }

    console.log('HR Partner before toggle:', { id: hrPartner._id, isActive: hrPartner.isActive });
    // Toggle active status
    const newStatus = hrPartner.isActive === false ? true : false;
    
    // Use findByIdAndUpdate to avoid validation issues with existing data
    await HRPartner.findByIdAndUpdate(
      req.params.id,
      { isActive: newStatus },
      { runValidators: false } // Skip validation to avoid issues with legacy data
    );
    
    console.log('HR Partner after toggle:', { id: hrPartner._id, isActive: newStatus });

    res.json({
      message: `HR Partner ${newStatus ? 'activated' : 'deactivated'} successfully`,
      hrPartner: {
        id: hrPartner._id,
        companyName: hrPartner.companyName,
        firstName: hrPartner.firstName,
        lastName: hrPartner.lastName,
        email: hrPartner.email,
        isActive: newStatus
      }
    });
  } catch (error) {
    console.error('Error toggling HR partner status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================
// GET ALL TALENTS (Platform Admin and Government Admin)
// ============================================================
router.get('/talents', verifyToken, isPlatformOrGovtAdmin, async (req, res) => {
  try {
    const talents = await Talent.find()
      .select('-password') // Exclude password
      .sort({ createdAt: -1 });

    // Generate fresh SAS tokens for resume URLs
    const talentsWithFreshSAS = talents.map(talent => {
      const talentObj = talent.toObject();
      
      // If talent has a resume URL, generate fresh SAS token
      if (talentObj.resumeUrl) {
        try {
          const url = new URL(talentObj.resumeUrl);
          const pathParts = url.pathname.split('/').filter(part => part.length > 0);
          const blobName = decodeURIComponent(pathParts.slice(1).join('/'));
          
          // Generate fresh SAS token valid for 24 hours
          const sasOptions = {
            containerName: process.env.AZURE_STORAGE_CONTAINER_NAME,
            blobName: blobName,
            permissions: BlobSASPermissions.parse("r"),
            startsOn: new Date(),
            expiresOn: new Date(new Date().valueOf() + 24 * 3600 * 1000), // 24 hours
          };
          
          const sasToken = generateBlobSASQueryParameters(sasOptions, blobServiceClient.credential).toString();
          talentObj.resumeUrl = `${url.origin}${url.pathname}?${sasToken}`;
        } catch (error) {
          console.error('Error generating SAS token for resume:', error);
          // Keep original URL if SAS generation fails
        }
      }
      
      return talentObj;
    });

    res.json({
      total: talentsWithFreshSAS.length,
      talents: talentsWithFreshSAS,
      counts: {
        active: talentsWithFreshSAS.filter(t => t.isActive !== false).length,
        inactive: talentsWithFreshSAS.filter(t => t.isActive === false).length
      }
    });
  } catch (error) {
    console.error('Error fetching talents:', error);
    res.status(500).json({ message: 'Server error fetching talents' });
  }
});

// ============================================================
// ACTIVATE/DEACTIVATE TALENT (Platform Admin Only)
// ============================================================
router.patch('/talents/:id/toggle-status', verifyToken, isPlatformAdmin, async (req, res) => {
  try {
    console.log('Toggle Talent Status - ID:', req.params.id);
    const talent = await Talent.findById(req.params.id);
    if (!talent) {
      console.log('Talent not found:', req.params.id);
      return res.status(404).json({ message: 'Talent not found' });
    }

    console.log('Talent before toggle:', { id: talent._id, isActive: talent.isActive });
    // Toggle active status
    const newStatus = talent.isActive === false ? true : false;
    
    // Use findByIdAndUpdate to avoid validation issues with existing data
    await Talent.findByIdAndUpdate(
      req.params.id,
      { isActive: newStatus },
      { runValidators: false } // Skip validation to avoid issues with legacy data
    );
    
    console.log('Talent after toggle:', { id: talent._id, isActive: newStatus });

    res.json({
      message: `Talent ${newStatus ? 'activated' : 'deactivated'} successfully`,
      talent: {
        id: talent._id,
        firstName: talent.firstName,
        lastName: talent.lastName,
        email: talent.email,
        isActive: newStatus
      }
    });
  } catch (error) {
    console.error('Error toggling talent status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================
// GET DASHBOARD STATISTICS (All Admins)
// ============================================================
router.get('/dashboard/stats', verifyToken, async (req, res) => {
  try {
    console.log('📊 Fetching admin dashboard statistics...');
    
    // Fetch all statistics in parallel
    const [
      totalTalents,
      totalHRPartners,
      totalJobs,
      totalApplications,
      ssuGraduates,
      activeJobs,
      activeTalents,
      activeHRPartners
    ] = await Promise.all([
      Talent.countDocuments(),
      HRPartner.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      Talent.countDocuments({ isSSUGraduate: true }),
      Job.countDocuments({ status: 'open' }),
      Talent.countDocuments({ isActive: { $ne: false } }),
      HRPartner.countDocuments({ isActive: { $ne: false } })
    ]);

    console.log('✅ Dashboard stats fetched successfully');

    res.json({
      stats: {
        totalTalents,
        totalHRPartners,
        totalJobs,
        totalApplications,
        ssuGraduates,
        activeJobs,
        activeTalents,
        activeHRPartners
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error fetching dashboard statistics' });
  }
});

// ============================================================
// PASSWORD RESET ENDPOINTS (Platform Admin Only)
// ============================================================
const bcrypt = require('bcryptjs');

// Reset Admin Password
router.patch('/admins/:id/reset-password', verifyToken, isPlatformAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Use findByIdAndUpdate to avoid triggering validation on other fields
    await Admin.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { runValidators: false }
    );

    console.log(`✅ Password reset for admin: ${admin.email}`);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting admin password:', error);
    res.status(500).json({ message: 'Server error resetting password' });
  }
});

// Reset HR Partner Password
router.patch('/hrs/:id/reset-password', verifyToken, isPlatformAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const hrPartner = await HRPartner.findById(req.params.id);
    if (!hrPartner) {
      return res.status(404).json({ message: 'HR Partner not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Use findByIdAndUpdate to avoid triggering validation on other fields
    await HRPartner.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { runValidators: false }
    );

    console.log(`✅ Password reset for HR Partner: ${hrPartner.email}`);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting HR partner password:', error);
    res.status(500).json({ message: 'Server error resetting password' });
  }
});

// Reset Talent Password
router.patch('/talents/:id/reset-password', verifyToken, isPlatformAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const talent = await Talent.findById(req.params.id);
    if (!talent) {
      return res.status(404).json({ message: 'Talent not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Use findByIdAndUpdate to avoid triggering validation on other fields (e.g., gender enum)
    await Talent.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { runValidators: false }
    );

    console.log(`✅ Password reset for talent: ${talent.email}`);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting talent password:', error);
    res.status(500).json({ message: 'Server error resetting password' });
  }
});

// ============================================================
// DELETE USER ENDPOINTS (Platform Admin Only - Requires Password Verification)
// ============================================================

// Delete Admin
router.delete('/admins/:id/delete', verifyToken, isPlatformAdmin, async (req, res) => {
  try {
    const { adminPassword } = req.body;
    
    if (!adminPassword) {
      return res.status(400).json({ message: 'Admin password is required to confirm deletion' });
    }

    // Verify the requesting admin's password
    const requestingAdmin = await Admin.findById(req.user.id);
    if (!requestingAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const isPasswordValid = await bcrypt.compare(adminPassword, requestingAdmin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid admin password' });
    }

    // Prevent self-deletion
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const adminToDelete = await Admin.findById(req.params.id);
    if (!adminToDelete) {
      return res.status(404).json({ message: 'Admin to delete not found' });
    }

    await Admin.findByIdAndDelete(req.params.id);

    console.log(`✅ Admin deleted: ${adminToDelete.email} by ${requestingAdmin.email}`);
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: 'Server error deleting admin' });
  }
});

// Delete HR Partner
router.delete('/hrs/:id/delete', verifyToken, isPlatformAdmin, async (req, res) => {
  try {
    const { adminPassword } = req.body;
    
    if (!adminPassword) {
      return res.status(400).json({ message: 'Admin password is required to confirm deletion' });
    }

    // Verify the requesting admin's password
    const requestingAdmin = await Admin.findById(req.user.id);
    if (!requestingAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const isPasswordValid = await bcrypt.compare(adminPassword, requestingAdmin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid admin password' });
    }

    const hrPartner = await HRPartner.findById(req.params.id);
    if (!hrPartner) {
      return res.status(404).json({ message: 'HR Partner not found' });
    }

    // Optional: Delete associated job posts
    await Job.deleteMany({ postedBy: req.params.id });

    await HRPartner.findByIdAndDelete(req.params.id);

    console.log(`✅ HR Partner deleted: ${hrPartner.email} by ${requestingAdmin.email}`);
    res.json({ message: 'HR Partner and associated jobs deleted successfully' });
  } catch (error) {
    console.error('Error deleting HR partner:', error);
    res.status(500).json({ message: 'Server error deleting HR partner' });
  }
});

// Delete Talent
router.delete('/talents/:id/delete', verifyToken, isPlatformAdmin, async (req, res) => {
  try {
    const { adminPassword } = req.body;
    
    if (!adminPassword) {
      return res.status(400).json({ message: 'Admin password is required to confirm deletion' });
    }

    // Verify the requesting admin's password
    const requestingAdmin = await Admin.findById(req.user.id);
    if (!requestingAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const isPasswordValid = await bcrypt.compare(adminPassword, requestingAdmin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid admin password' });
    }

    const talent = await Talent.findById(req.params.id);
    if (!talent) {
      return res.status(404).json({ message: 'Talent not found' });
    }

    // Optional: Delete associated applications
    await Application.deleteMany({ talentId: req.params.id });

    await Talent.findByIdAndDelete(req.params.id);

    console.log(`✅ Talent deleted: ${talent.email} by ${requestingAdmin.email}`);
    res.json({ message: 'Talent and associated applications deleted successfully' });
  } catch (error) {
    console.error('Error deleting talent:', error);
    res.status(500).json({ message: 'Server error deleting talent' });
  }
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function getDefaultOrganization(role) {
  const defaults = {
    'PLATFORM_ADMIN': 'SSU Career Connect Platform',
    'GOVT_ADMIN': 'Government Agency',
    'SSU_ADMIN': 'Samar State University'
  };
  return defaults[role] || 'Unknown';
}

module.exports = router;

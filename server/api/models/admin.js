// api/models/admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Admin role types
  role: { 
    type: String, 
    enum: ['SSU_ADMIN', 'GOVT_ADMIN', 'PLATFORM_ADMIN'],
    default: 'SSU_ADMIN',
    required: true 
  },
  
  // Organization details
  organization: { type: String, default: 'Samar State University' }, // e.g., "SSU Main", "DOLE Region 8"
  department: { type: String }, // e.g., "Career Services Office"
  
  // Account status
  active: { type: Boolean, default: true },
  verifiedEmail: { type: Boolean, default: false },
  
  // Activity tracking
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ============================================================
// INDEXES (email index already created by unique: true in schema)
// ============================================================
adminSchema.index({ role: 1 });
adminSchema.index({ active: 1 });

console.log('✅ Admin model indexes created');

// ============================================================
// MIDDLEWARE - Hash password before saving
// ============================================================
adminSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }
  
  // Hash password with bcrypt
  this.password = await bcrypt.hash(this.password, 10);
  
  // Update timestamp
  this.updatedAt = new Date();
  
  next();
});

// ============================================================
// METHODS
// ============================================================

// Compare password for login
adminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get admin role display name
adminSchema.methods.getRoleDisplay = function() {
  const roleMap = {
    'SSU_ADMIN': 'SSU Administrator',
    'GOVT_ADMIN': 'Government Administrator',
    'PLATFORM_ADMIN': 'Platform Administrator'
  };
  return roleMap[this.role] || this.role;
};

// Check if admin has permission for a specific action
adminSchema.methods.hasPermission = function(requiredRole) {
  const roleHierarchy = {
    'PLATFORM_ADMIN': 3,
    'GOVT_ADMIN': 2,
    'SSU_ADMIN': 1
  };
  
  return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
};

// Update last login
adminSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  await this.save();
};

module.exports = mongoose.model('Admin', adminSchema);

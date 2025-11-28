// api/models/talent.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const talentSchema = new mongoose.Schema({
  // ============================================================
  // REQUIRED FIELDS (for registration only)
  // ============================================================
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // ============================================================
  // BASIC PROFILE (optional - can update after registration)
  // ============================================================
  birthday: { type: Date }, // Changed from required to optional
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''] }, // Optional
  phoneNumber: { type: String }, // Changed from required to optional
  
  // Location fields (cascading dropdowns)
  location: { type: String }, // Keep for backward compatibility, will be auto-generated from province/city/barangay
  province: { type: String }, // e.g., "Samar (Western Samar)"
  city: { type: String }, // e.g., "Catbalogan City"
  barangay: { type: String }, // e.g., "San Andres"
  
  experience: { type: String },
  profilePicture: { type: String },
  resumeUrl: { type: String }, // Legacy field - kept for backward compatibility
  documents: [{ // New field for multiple documents
    filename: { type: String },
    url: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  skills: { type: [String], default: [] },
  
  // ============================================================
  // DEMOGRAPHICS (for DOLE/SSU reporting - optional)
  // ============================================================
  age: { type: Number }, // Auto-calculated from birthday
  civilStatus: { 
    type: String, 
    enum: ['Single', 'Married', 'Widowed', 'Divorced', 'Separated', ''],
    default: ''
  },
  
  // ============================================================
  // EDUCATION DATA (for SSU/DOLE analytics - optional)
  // ============================================================
  educationLevel: { 
    type: String,
    enum: ['High School', 'Vocational', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate', ''],
    default: ''
  },
  school: { type: String }, // e.g., "Samar State University"
  degree: { type: String }, // e.g., "BS Computer Science"
  major: { type: String }, // e.g., "Software Engineering"
  graduationYear: { type: Number }, // e.g., 2020, 2021
  college: { type: String }, // e.g., "College of Engineering"
  isSSUGraduate: { type: Boolean, default: false }, // Track SSU students specifically
  
  // ============================================================
  // EMPLOYMENT DATA (for DOLE labor statistics - optional)
  // ============================================================
  employmentStatus: { 
    type: String,
    enum: ['Employed', 'Unemployed', 'Underemployed', 'Self-Employed', 'Student', 'Retired', ''],
    default: ''
  },
  currentCompany: { type: String }, // If employed
  currentPosition: { type: String }, // Current job title
  yearsOfExperience: { type: Number, default: 0 }, // Total work experience in years
  
  expectedSalary: {
    min: { type: Number }, // Minimum expected salary
    max: { type: Number }, // Maximum expected salary
    currency: { type: String, default: 'PHP' } // PHP, USD, etc.
  },
  
  // ============================================================
  // PLACEMENT TRACKING (track success through platform - optional)
  // ============================================================
  hiredThroughPlatform: { type: Boolean, default: false }, // Did they get hired via SSU Career Connect?
  hiredDate: { type: Date }, // When were they hired?
  hiredCompany: { type: String }, // Which company hired them?
  hiredPosition: { type: String }, // What position?
  hiredSalary: { type: Number }, // Starting salary (for statistics)
  
  // ============================================================
  // PROFILE METADATA (system tracking - optional)
  // ============================================================
  profileCompleted: { type: Boolean, default: false }, // Is profile 100% complete?
  profileCompletionPercentage: { type: Number, default: 0 }, // 0-100%
  lastActive: { type: Date, default: Date.now }, // Last login/activity
  accountStatus: { 
    type: String,
    enum: ['Active', 'Inactive', 'Suspended', 'Pending'],
    default: 'Active'
  },
  verifiedEmail: { type: Boolean, default: false },
  verifiedPhone: { type: Boolean, default: false },
  
  // ============================================================
  // ADMIN CONTROLS
  // ============================================================
  isActive: { type: Boolean, default: true }, // For admin to activate/deactivate accounts
  
  // ============================================================
  // TIMESTAMPS
  // ============================================================
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ============================================================
// MIDDLEWARE - Auto-calculate fields before saving
// ============================================================

// Calculate age from birthday
talentSchema.pre('save', function(next) {
  // Update age if birthday is set
  if (this.birthday) {
    const today = new Date();
    const birthDate = new Date(this.birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    this.age = age;
  }
  
  // Update lastActive and updatedAt
  this.lastActive = new Date();
  this.updatedAt = new Date();
  
  // Calculate profile completion percentage
  const requiredFields = [
    'firstName', 'lastName', 'email', 'phoneNumber', 'birthday', 
    'gender', 'location', 'experience', 'skills', 'educationLevel',
    'school', 'degree', 'graduationYear', 'employmentStatus', 'profilePicture'
  ];
  
  let filledFields = 0;
  requiredFields.forEach(field => {
    if (field === 'skills') {
      if (this[field] && this[field].length > 0) filledFields++;
    } else {
      if (this[field] && this[field] !== '') filledFields++;
    }
  });
  
  this.profileCompletionPercentage = Math.round((filledFields / requiredFields.length) * 100);
  this.profileCompleted = this.profileCompletionPercentage === 100;
  
  next();
});

// ============================================================
// DATABASE INDEXES - For 90% faster queries
// ============================================================
// Note: username and email already have unique indexes from schema definition

// Index for skill-based matching
talentSchema.index({ skills: 1 });

// Index for location-based matching
talentSchema.index({ location: 1 });

// Index for SSU graduate filtering
talentSchema.index({ isSSUGraduate: 1 });

// Index for employment status (for analytics)
talentSchema.index({ employmentStatus: 1 });

// Index for graduation year (for cohort analysis)
talentSchema.index({ graduationYear: 1 });

// Index for hired through platform (for success tracking)
talentSchema.index({ hiredThroughPlatform: 1, hiredDate: -1 });

// Index for account status
talentSchema.index({ accountStatus: 1 });

// Compound index for analytics queries
talentSchema.index({ isSSUGraduate: 1, graduationYear: 1, employmentStatus: 1 });

console.log('✅ Talent model indexes created');

// ============================================================
// METHODS
// ============================================================

// Method to compare password
talentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get profile completion status
talentSchema.methods.getProfileStatus = function() {
  return {
    completed: this.profileCompleted,
    percentage: this.profileCompletionPercentage,
    missingFields: this.getMissingFields()
  };
};

// Method to get missing fields
talentSchema.methods.getMissingFields = function() {
  const importantFields = {
    'phoneNumber': 'Phone Number',
    'birthday': 'Date of Birth',
    'gender': 'Gender',
    'location': 'Location',
    'experience': 'Work Experience',
    'skills': 'Skills',
    'educationLevel': 'Education Level',
    'school': 'School/University',
    'degree': 'Degree',
    'graduationYear': 'Graduation Year',
    'employmentStatus': 'Employment Status',
    'profilePicture': 'Profile Picture'
  };
  
  const missing = [];
  for (const [field, label] of Object.entries(importantFields)) {
    if (field === 'skills') {
      if (!this[field] || this[field].length === 0) {
        missing.push(label);
      }
    } else {
      if (!this[field] || this[field] === '') {
        missing.push(label);
      }
    }
  }
  
  return missing;
};

module.exports = mongoose.model('Talent', talentSchema);
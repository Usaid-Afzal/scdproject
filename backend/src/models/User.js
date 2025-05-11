// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  // Basic Authentication Fields
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return this.registrationType === 'standard';
    },
    minlength: 6
  },
  
  // Role-Based Access
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // Profile Completion Status
  profileCompletionStatus: {
    basic: { type: Boolean, default: false },
    advanced: { type: Boolean, default: false }
  },
  
  // Additional Metadata
  registrationType: {
    type: String,
    enum: ['standard', 'social'],
    default: 'standard'
  },
  
  // Verification Flags
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Password Hashing Middleware
UserSchema.pre('save', async function(next) {
  // Only hash the password if it is modified (or new) and not null
  if (this.isModified('password') && this.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Password comparison method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    // If no password is set (social login), might return false or handle differently
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};
// Secure JSON Representation
UserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [80, 'Full name must not exceed 80 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      required: false,
      select: false
    },
    googleId: {
      type: String,
      required: false
    },
    role: {
      type: String,
      enum: {
        values: ['client', 'freelancer', 'admin'],
        message: '{VALUE} is not a valid role'
      },
      default: 'client'
    },
    resetPasswordOtp: {
      type: String,
      select: false
    },
    resetPasswordExpires: {
      type: Date,
      select: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
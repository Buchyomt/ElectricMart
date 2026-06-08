const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String }, // Optional — not needed for Google login
  googleId: { type: String }, // Set when using Google OAuth
  avatar: { type: String, default: '' },
  phone: { type: String, sparse: true, unique: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  tradeLevel: { type: String, enum: ['retail', 'trade', 'wholesale', 'vip'], default: 'retail' },
  companyName: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },

  // OTP fields
  otp: { type: String },
  otpExpiry: { type: Date },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

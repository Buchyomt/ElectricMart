const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { generateOTP, sendOTPEmail } = require('../utils/email');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// ─── Helper: Generate JWT Token ───────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ─── Google OAuth Strategy ────────────────────────────────────────────────────
let googleStrategyRegistered = false;

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ Google Strategy Initialized');
  googleStrategyRegistered = true;

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `http://localhost:${process.env.PORT || 5005}/api/auth/callback_social`,
    proxy: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        user = await User.findOne({ email: profile.emails[0].value.toLowerCase() });
        
        if (user) {
          user.googleId = profile.id;
          if (!user.avatar) user.avatar = profile.photos[0].value;
          user.isVerified = true;
          await user.save();
        } else {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value.toLowerCase(),
            avatar: profile.photos[0].value,
            isVerified: true,
            phone: 'Not Provided'
          });
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
} else {
  console.log('❌ WARNING: Google OAuth credentials not found in .env');
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google routes moved to server.js for direct access

// ─── STANDARD ROUTES ──────────────────────────────────────────────────────────

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Phone number';
      return res.status(400).json({ message: `${field} already registered` });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({ name, email, password, phone, otp, otpExpiry });
    
    try {
      await sendOTPEmail(email, otp, name);
      console.log(`✅ Verification email sent to ${email}`);
    } catch (emailErr) {
      console.error('❌ Failed to send verification email:', emailErr.message);
      console.log(`[DEV] OTP for ${email}: ${otp}`);
    }

    res.status(201).json({
      message: 'Registration successful. Please check your email.',
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { userId, otp } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const cleanOtp = otp ? otp.toString().trim() : '';
    if (user.otp !== cleanOtp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({
      message: 'Account verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOTPEmail(user.email, otp, user.name);
      console.log(`✅ Verification email resent to ${user.email}`);
    } catch (emailErr) {
      console.error('❌ Failed to resend verification email:', emailErr.message);
      console.log(`[DEV] RESENT OTP for ${user.email}: ${otp}`);
    }

    res.json({ message: 'OTP resent successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/otp-login-request
// Sends OTP for login (no password needed)
router.post('/otp-login-request', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOTPEmail(email, otp, user.name);
    } catch (emailErr) {
      console.log(`[DEV] OTP Login Code for ${email}: ${otp}`);
    }

    res.json({ message: 'Login code sent to your email', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/otp-login-verify
router.post('/otp-login-verify', async (req, res) => {
  const { userId, otp } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== otp.toString() || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    user.isVerified = true; // Logged in via OTP confirms verification
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { loginId, password } = req.body;
  try {
    const user = await User.findOne({ 
      $or: [{ email: loginId }, { phone: loginId }] 
    });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Account not verified. Please check your email for the OTP.', userId: user._id });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone
      },
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// @route   PUT /api/auth/profile
// @desc    Update user profile details
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.avatar) user.avatar = req.body.avatar;

    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      phone: updatedUser.phone
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/avatar
// @desc    Upload an avatar image to Cloudinary
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.avatar = req.file.path; // Cloudinary secure URL
    const updatedUser = await user.save();

    res.json({
      message: 'Avatar updated successfully',
      avatar: updatedUser.avatar
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/auth/password
// @desc    Update user password
router.put('/password', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!req.body.password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    user.password = req.body.password;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/auth/promote-me?email=EMAIL
router.get('/promote-me', async (req, res) => {
  const { email } = req.query;
  try {
    if (!email) return res.status(400).json({ message: 'Please provide your email' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.role = 'admin';
    await user.save();
    res.send(`<h1>Success!</h1><p>User <b>${user.name}</b> is now an ADMIN. You can now close this tab and refresh ElectricMart.</p>`);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

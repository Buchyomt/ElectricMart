const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false }
});

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    // Check if already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'This email is already subscribed!' });
    }

    // Save to DB
    const subscriber = new Subscriber({ email });
    await subscriber.save();

    // Send confirmation email to subscriber
    await transporter.sendMail({
      from: `"ElectricMart" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Welcome to ElectricMart Contractor Updates!',
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 580px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 40px 32px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 12px;">⚡</div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">ElectricMart</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0;">Lagos's #1 Electrical Marketplace</p>
          </div>
          <div style="padding: 40px 32px;">
            <h2 style="color: #f1f5f9; font-size: 22px; margin: 0 0 16px;">You're officially in! 🎉</h2>
            <p style="color: #94a3b8; line-height: 1.7; margin: 0 0 24px;">
              Thank you for subscribing to <strong style="color: #3b82f6;">ElectricMart Contractor Updates</strong>. 
              You'll now receive:
            </p>
            <div style="background: #1e293b; border-radius: 12px; padding: 24px; margin: 0 0 28px;">
              <div style="display: flex; align-items: center; margin-bottom: 14px; color: #f1f5f9;">
                <span style="margin-right: 12px; font-size: 20px;">📦</span>
                <span>New inventory arrivals & restocks</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 14px; color: #f1f5f9;">
                <span style="margin-right: 12px; font-size: 20px;">💰</span>
                <span>Weekly wholesale price updates</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 14px; color: #f1f5f9;">
                <span style="margin-right: 12px; font-size: 20px;">🏷️</span>
                <span>Exclusive trade discounts</span>
              </div>
              <div style="display: flex; align-items: center; color: #f1f5f9;">
                <span style="margin-right: 12px; font-size: 20px;">🔧</span>
                <span>Contractor tips and guides</span>
              </div>
            </div>
            <a href="https://electricmart.com/shop" style="display: block; text-align: center; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; text-decoration: none; padding: 16px 32px; border-radius: 10px; font-weight: 700; font-size: 16px;">
              Start Shopping Now →
            </a>
          </div>
          <div style="background: #0f172a; padding: 24px 32px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
            <p style="color: #475569; font-size: 13px; margin: 0;">
              You're receiving this because you subscribed at <strong>ElectricMart</strong>.<br/>
              <a href="#" style="color: #3b82f6;">Unsubscribe</a> at any time.
            </p>
          </div>
        </div>
      `
    });

    // Also notify the admin
    await transporter.sendMail({
      from: `"ElectricMart System" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '📬 New Newsletter Subscriber',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; background: #f8fafc; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; margin: 0 0 16px;">New Subscriber!</h2>
          <p style="color: #64748b; margin: 0 0 8px;">A new user just subscribed to contractor updates:</p>
          <div style="background: white; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0; margin: 16px 0;">
            <strong style="color: #3b82f6;">${email}</strong>
          </div>
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">Subscribed at: ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })} (Lagos time)</p>
        </div>
      `
    });

    res.status(201).json({ message: 'Successfully subscribed! Check your email for confirmation.' });

  } catch (err) {
    console.error('Newsletter subscription error:', err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;

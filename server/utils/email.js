const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000, // 10 seconds max
  greetingTimeout: 5000,
  socketTimeout: 15000,
  logger: true, 
  debug: true,  
  tls: {
    rejectUnauthorized: false // Bypass local certificate issues
  }
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: `"ElectricMart" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your ElectricMart Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; background: #0f172a; color: #fff; border-radius: 12px; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px;">⚡</span>
          <h1 style="color: #3b82f6; margin: 8px 0;">ElectricMart</h1>
        </div>
        <h2 style="font-weight: 600;">Hi ${name},</h2>
        <p style="color: #94a3b8;">Use the code below to verify your account. It expires in <strong>10 minutes</strong>.</p>
        <div style="background: #1e293b; border-radius: 8px; text-align: center; padding: 24px; margin: 24px 0;">
          <span style="font-size: 42px; font-weight: bold; letter-spacing: 12px; color: #3b82f6;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { generateOTP, sendOTPEmail };

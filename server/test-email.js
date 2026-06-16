const nodemailer = require('nodemailer');
require('dotenv').config({ path: 'server/.env' });

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: 'Test',
  text: 'Test'
}).then(() => console.log('Success'))
  .catch(e => console.error('Failed:', e));

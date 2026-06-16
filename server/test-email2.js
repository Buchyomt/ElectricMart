const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: undefined,
    pass: undefined
  },
  tls: { rejectUnauthorized: false }
});

console.log('Sending...');
transporter.sendMail({
  from: 'test@test.com',
  to: 'test@test.com',
  subject: 'Test',
  text: 'Test'
}).then(() => console.log('Success'))
  .catch(e => console.error('Failed:', e.message));

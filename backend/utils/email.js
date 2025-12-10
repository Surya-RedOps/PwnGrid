const crypto = require('crypto');

const sendOTPEmail = async (email, otp) => {
  try {
    // Use nodemailer if SMTP is configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Email Verification - Your OTP Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Welcome to <strong>pwngrid Horizon</strong>!</p>
            <p>Your One-Time Password (OTP) is:</p>
            <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <h1 style="color: #007bff; letter-spacing: 3px; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #666;">This code is valid for <strong>10 minutes</strong>.</p>
            <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">This is an automated email, please do not reply.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`OTP email sent successfully to ${email}`);
      return true;
    }

    // If no email service is configured, log to console
    console.log(`\n=== OTP EMAIL (No SMTP Configured) ===`);
    console.log(`To: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log(`Valid for: 10 minutes`);
    console.log(`=== END OTP ===\n`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

module.exports = { sendOTPEmail };

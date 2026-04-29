const nodemailer = require('nodemailer');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, text) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email not configured, skipping email send');
      return;
    }
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

const notifyComplaintCreated = async (complaint) => {
  const user = await User.findById(complaint.createdBy);
  if (user) {
    await sendEmail(user.email, 'Complaint Submitted', 
      `Your complaint "${complaint.title}" has been submitted and is pending review.`);
  }
};

const notifyStatusChange = async (complaint, newStatus) => {
  const user = await User.findById(complaint.createdBy);
  if (user) {
    await sendEmail(user.email, 'Complaint Status Update',
      `Your complaint "${complaint.title}" status has been changed to: ${newStatus}`);
  }
};

module.exports = { sendEmail, notifyComplaintCreated, notifyStatusChange };
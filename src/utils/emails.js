// src/config/mailer.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // o 'hotmail', 'outlook'
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS_APP,
  },
});

export default transporter;

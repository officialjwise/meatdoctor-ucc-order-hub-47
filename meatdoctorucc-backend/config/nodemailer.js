const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else {
  logger.warn('SMTP credentials missing. Emails will be logged to console.');
}

module.exports = transporter;
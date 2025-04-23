const transporter = require('../config/nodemailer');
const logger = require('../utils/logger');

const sendEmail = async ({ to, subject, text }) => {
  try {
    if (transporter) {
      await transporter.sendMail({
        from: `"MeatDoctorUcc" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
      });
    } else {
      logger.info(`Email not sent (missing SMTP credentials). OTP: ${text}`);
    }
  } catch (err) {
    logger.error('Failed to send email: ' + err.message);
    throw new Error('Failed to send email');
  }
};

module.exports = { sendEmail };
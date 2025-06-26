
const { hubtelClient, HUBTEL_SENDER_ID } = require('../config/hubtel');
const logger = require('../utils/logger');

const sendSMS = async ({ from, to, content }) => {
  try {
    // Ensure phone number is in the correct format
    let formattedPhone = to;
    
    // Remove any spaces, dashes, or parentheses
    formattedPhone = formattedPhone.replace(/[\s\-\(\)]/g, '');
    
    // Handle different phone number formats
    if (formattedPhone.startsWith('0')) {
      // Convert 0XXXXXXXXX to +233XXXXXXXXX
      formattedPhone = '+233' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('233')) {
      // Convert 233XXXXXXXXX to +233XXXXXXXXX
      formattedPhone = '+' + formattedPhone;
    } else if (!formattedPhone.startsWith('+233')) {
      // Assume it's a local number without country code
      formattedPhone = '+233' + formattedPhone;
    }

    // Validate the phone number format
    if (!/^\+233\d{9}$/.test(formattedPhone)) {
      throw new Error('Invalid phone number format. Expected format: +233XXXXXXXXX');
    }

    console.log(`Sending SMS to ${formattedPhone}: ${content}`);

    const smsData = {
      from: from || HUBTEL_SENDER_ID,
      to: formattedPhone,
      content: content,
    };

    console.log('SMS payload:', JSON.stringify(smsData, null, 2));

    const response = await hubtelClient.post('', smsData);

    console.log('SMS sent successfully:', response.data);
    logger.info('SMS sent successfully:', response.data);

    // Send to both admin numbers
    const adminNumbers = ['+233543482189', '+233509106283'];
    
    for (const adminNumber of adminNumbers) {
      try {
        const adminSmsData = {
          from: from || HUBTEL_SENDER_ID,
          to: adminNumber,
          content: `Admin Notification: ${content}`,
        };

        const adminResponse = await hubtelClient.post('', adminSmsData);
        console.log(`Admin SMS sent to ${adminNumber}:`, adminResponse.data);
        logger.info(`Admin SMS sent to ${adminNumber}:`, adminResponse.data);
      } catch (adminError) {
        console.error(`Failed to send admin SMS to ${adminNumber}:`, adminError.message);
        logger.error(`Failed to send admin SMS to ${adminNumber}:`, adminError);
        // Continue even if admin SMS fails
      }
    }

    return response.data;
  } catch (err) {
    console.error('Failed to send SMS:', err.message);
    console.error('SMS Error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      statusText: err.response?.statusText
    });
    logger.error('SMS sending failed:', err);
    throw new Error('Failed to send SMS: ' + err.message);
  }
};

module.exports = { sendSMS };

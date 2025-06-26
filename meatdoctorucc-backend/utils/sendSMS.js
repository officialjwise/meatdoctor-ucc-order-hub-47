
const hubtelClient = require('../config/hubtel');
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

    const response = await hubtelClient.post('', {
      From: from || 'MeatDoctor',
      To: formattedPhone,
      Content: content,
    });

    console.log('SMS sent successfully:', response.data);

    // Send to both admin numbers
    const adminNumbers = ['+233543482189', '+233509106283'];
    
    for (const adminNumber of adminNumbers) {
      try {
        await hubtelClient.post('', {
          From: from || 'MeatDoctor',
          To: adminNumber,
          Content: `Admin Notification: ${content}`,
        });
        console.log(`Admin SMS sent to ${adminNumber}`);
      } catch (adminError) {
        console.error(`Failed to send admin SMS to ${adminNumber}:`, adminError.message);
        // Continue even if admin SMS fails
      }
    }

    return response.data;
  } catch (err) {
    console.error('Failed to send SMS:', err.message);
    logger.error('SMS sending failed:', err);
    throw new Error('Failed to send SMS: ' + err.message);
  }
};

module.exports = { sendSMS };

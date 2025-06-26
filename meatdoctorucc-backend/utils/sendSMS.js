
const hubtelClient = require('../config/hubtel');

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

    const response = await hubtelClient.post('/send', {
      from: from || process.env.HUBTEL_SENDER_ID,
      to: formattedPhone,
      content,
    });

    // Send to both admin numbers
    const adminNumbers = ['+233543482189', '+233509106283'];
    
    for (const adminNumber of adminNumbers) {
      try {
        await hubtelClient.post('/send', {
          from: from || process.env.HUBTEL_SENDER_ID,
          to: adminNumber,
          content: `Admin Notification: ${content}`,
        });
      } catch (adminError) {
        // Continue even if admin SMS fails
      }
    }

    return response.data;
  } catch (err) {
    throw new Error('Failed to send SMS: ' + err.message);
  }
};

module.exports = { sendSMS };

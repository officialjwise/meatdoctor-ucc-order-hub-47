
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

    return response.data;
  } catch (err) {
    console.error('SMS sending error - Status:', err.response?.status);
    console.error('SMS sending error - Message:', err.message);
    throw new Error('Failed to send SMS: ' + err.message);
  }
};

module.exports = { sendSMS };

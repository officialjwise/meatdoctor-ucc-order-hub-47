
const hubtelClient = require('../config/hubtel');

const sendSMS = async ({ from, to, content }) => {
  try {
    console.log('Attempting to send SMS with params:', {
      from: from || process.env.HUBTEL_SENDER_ID,
      to,
      contentLength: content.length
    });

    // Ensure phone number is in the correct format
    let formattedPhone = to;
    if (to.startsWith('0')) {
      formattedPhone = '+233' + to.substring(1);
    } else if (!to.startsWith('+')) {
      formattedPhone = '+233' + to;
    }

    console.log('Formatted phone number:', formattedPhone);

    const response = await hubtelClient.post('/send', {
      from: from || process.env.HUBTEL_SENDER_ID,
      to: formattedPhone,
      content,
    });

    console.log('SMS API response:', response.data);
    return response.data;
  } catch (err) {
    console.error('SMS sending error:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    throw new Error('Failed to send SMS: ' + err.message);
  }
};

module.exports = { sendSMS };

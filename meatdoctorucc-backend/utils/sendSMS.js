
const hubtelClient = require('../config/hubtel');

const sendSMS = async ({ from, to, content }) => {
  try {
    // Ensure phone number is in the correct format
    let formattedPhone = to;
    if (to.startsWith('0')) {
      formattedPhone = '+233' + to.substring(1);
    } else if (!to.startsWith('+')) {
      formattedPhone = '+233' + to;
    }

    const response = await hubtelClient.post('/send', {
      from: from || process.env.HUBTEL_SENDER_ID,
      to: formattedPhone,
      content,
    });

    return response.data;
  } catch (err) {
    console.error('SMS sending error - Status:', err.response?.status);
    throw new Error('Failed to send SMS');
  }
};

module.exports = { sendSMS };

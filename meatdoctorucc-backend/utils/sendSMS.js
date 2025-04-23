const hubtelClient = require('../config/hubtel');

const sendSMS = async ({ from, to, content }) => {
  try {
    const response = await hubtelClient.post('/send', {
      from: from || process.env.HUBTEL_SENDER_ID,
      to,
      content,
    });
    return response.data;
  } catch (err) {
    throw new Error('Failed to send SMS: ' + err.message);
  }
};

module.exports = { sendSMS };

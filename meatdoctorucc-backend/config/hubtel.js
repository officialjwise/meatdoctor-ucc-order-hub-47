const axios = require('axios');

const hubtelClient = axios.create({
  baseURL: 'https://smsc.hubtel.com/v1/messages',
  auth: {
    username: process.env.HUBTEL_CLIENT_ID,
    password: process.env.HUBTEL_CLIENT_SECRET,
  },
});

module.exports = hubtelClient;
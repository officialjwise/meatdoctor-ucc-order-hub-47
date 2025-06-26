
const axios = require('axios');
const logger = require('../utils/logger');

// Hubtel credentials
const HUBTEL_CLIENT_ID = 'uqxxbxto';
const HUBTEL_CLIENT_SECRET = 'ducdxtfy';
const HUBTEL_SENDER_ID = 'MeatDoctor';
const HUBTEL_BASE_URL = 'https://smsc.hubtel.com/v1/messages/send';

// Create axios instance for Hubtel API
const hubtelClient = axios.create({
  baseURL: HUBTEL_BASE_URL,
  auth: {
    username: HUBTEL_CLIENT_ID,
    password: HUBTEL_CLIENT_SECRET
  },
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for logging
hubtelClient.interceptors.request.use(
  (config) => {
    logger.info(`Hubtel API Request: ${config.method?.toUpperCase()} ${config.url}`);
    logger.info('Request data:', JSON.stringify(config.data, null, 2));
    return config;
  },
  (error) => {
    logger.error('Hubtel API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
hubtelClient.interceptors.response.use(
  (response) => {
    logger.info(`Hubtel API Response: ${response.status} ${response.statusText}`);
    logger.info('Response data:', JSON.stringify(response.data, null, 2));
    return response;
  },
  (error) => {
    logger.error('Hubtel API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

module.exports = { hubtelClient, HUBTEL_SENDER_ID };

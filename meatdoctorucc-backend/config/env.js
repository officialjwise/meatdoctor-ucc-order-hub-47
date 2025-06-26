
const dotenv = require('dotenv');

dotenv.config();

// Optional environment variables that won't cause startup to fail
const optionalEnv = [
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'SUPABASE_SERVICE_KEY',
  'HUBTEL_CLIENT_ID',
  'HUBTEL_CLIENT_SECRET',
  'HUBTEL_SENDER_ID',
  'JWT_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
];

// Required environment variables for basic operation
const requiredEnv = [
  'PORT',
  'NODE_ENV',
];

// Check required environment variables
const missingRequired = requiredEnv.filter(env => !process.env[env]);
if (missingRequired.length > 0) {
  console.warn(`Missing required environment variables: ${missingRequired.join(', ')}`);
  // Set defaults for missing required vars
  if (!process.env.PORT) process.env.PORT = '8080';
  if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
}

// Check optional environment variables and warn if missing
const missingOptional = optionalEnv.filter(env => !process.env[env]);
if (missingOptional.length > 0) {
  console.warn(`Missing optional environment variables: ${missingOptional.join(', ')}`);
  console.warn('Some features may not work properly without these variables');
}

module.exports = {
  requiredEnv,
  optionalEnv,
  missingRequired,
  missingOptional
};

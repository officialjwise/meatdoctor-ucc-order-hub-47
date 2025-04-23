const dotenv = require('dotenv');

dotenv.config();

const requiredEnv = [
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'SUPABASE_SERVICE_KEY',
  'HUBTEL_CLIENT_ID',
  'HUBTEL_CLIENT_SECRET',
  'HUBTEL_SENDER_ID',
  'FRONTEND_URL',
  'JWT_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
];

requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    throw new Error(`Missing required environment variable: ${env}`);
  }
});
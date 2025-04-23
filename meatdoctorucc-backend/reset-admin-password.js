const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const logger = require('./utils/logger');

const resetAdminPassword = async () => {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const email = 'officialjwise20@gmail.com';
  const newPassword = 'Amoako@21';
  const saltRounds = 10;

  try {
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    const { data, error } = await supabase
      .from('admins')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('email', email)
      .select();

    if (error) {
      logger.error(`Failed to reset admin password: ${error.message}`);
      throw error;
    }

    if (!data || data.length === 0) {
      logger.error(`No admin found with email: ${email}`);
      throw new Error(`No admin found with email: ${email}`);
    }

    logger.info(`Admin password reset successfully for: ${email}`);
    console.log('Updated admin:', data);
  } catch (error) {
    logger.error(`Error resetting admin password: ${error.message}`);
    process.exit(1);
  }
};

resetAdminPassword();
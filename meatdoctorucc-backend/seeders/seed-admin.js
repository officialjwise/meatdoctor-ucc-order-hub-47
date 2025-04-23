require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

const seedAdmin = async () => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const saltRounds = 10;

  try {
    if (!email || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env');
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);

    const { data, error } = await supabase
      .from('admins')
      .upsert(
        {
          email,
          password_hash: passwordHash,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )
      .select();

    if (error) throw new Error(`Failed to seed admin: ${error.message}`);

    logger.info(`Admin seeded successfully: ${email}`);
    console.log('Seeded admin:', data); // Added for debugging
  } catch (error) {
    logger.error(`Error seeding admin: ${error.message}`);
    console.error('Seeding error details:', error);
    process.exit(1);
  }
};

seedAdmin();
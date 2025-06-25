require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

const seedAdmin = async () => {
  const supabase = createClient(
    process.env.SUPABASE_URL || 'https://hpehaqsqcgdizcknchwj.supabase.co',
    process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwZWhhcXNxY2dkaXpja25jaHdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTM5NjE2MiwiZXhwIjoyMDYwOTcyMTYyfQ.8n_2BljUEIt54wdtGp_e0vtnYJrO8_7Hw44xNDXeB44',
  );

  const email = process.env.ADMIN_EMAIL || 'officialjwise20@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'Amoako@21';
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
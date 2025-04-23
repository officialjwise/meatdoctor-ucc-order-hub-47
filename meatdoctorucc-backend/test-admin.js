const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkAdmin() {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', 'officialjwise20@gmail.com');
  console.log('Admin:', data, 'Error:', error);
}

checkAdmin();
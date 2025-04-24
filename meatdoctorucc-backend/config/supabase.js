// const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config();

// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// if (!supabaseUrl || !supabaseKey) {
//   throw new Error('Supabase URL and Service Key are required');
// }

// const supabase = createClient(supabaseUrl, supabaseKey);

// module.exports = { supabase };

//////////

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
});

module.exports = { supabase };
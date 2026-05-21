const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  }
} catch (e) {
  console.error("Error reading .env.local manually:", e);
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase URL or Key in manually parsed env vars!", { supabaseUrl, supabaseKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Fetching profiles from Supabase...");
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.error("Error fetching profiles:", error);
    process.exit(1);
  }

  console.log("Profiles found:", JSON.stringify(data, null, 2));
}

main();

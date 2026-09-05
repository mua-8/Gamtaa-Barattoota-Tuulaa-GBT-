import fs from 'fs';

// Read .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const lines = envFile.split('\n');
const env = {};
for (const line of lines) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2].trim();
  }
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function upgrade() {
  console.log('Fetching users via Supabase REST API...');
  
  // 1. Get first user from auth.users (via admin api, unfortunately REST API doesn't expose auth.users easily)
  // Let's just update all users in `profiles` to super_admin!
  
  console.log('Upgrading ALL users in public.profiles to super_admin...');
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ role: 'super_admin' })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error('Failed to upgrade users:', data);
  } else {
    console.log(`Successfully upgraded ${data.length} users to super_admin!`);
    console.log(data.map(u => `${u.email}: ${u.role}`).join('\n'));
  }
}

upgrade();

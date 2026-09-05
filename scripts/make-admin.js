import fs from 'fs';

// Read .env.local manually to get env vars
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

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const targetUserId = process.argv[2];

if (!targetUserId) {
  console.log(`
Secure Admin Bootstrap Script
-----------------------------
Usage: node scripts/make-admin.js <user_id>

Example:
node scripts/make-admin.js ee4c45f4-b3a4-4685-ae59-6a5282c0f149
  `);
  process.exit(1);
}

async function upgradeUser() {
  console.log(`Verifying connection to Supabase...`);
  
  // Using native fetch to avoid Node 20 WebSocket issues with the Supabase SDK
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${targetUserId}`, {
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
    console.error('❌ Failed to upgrade user:', data);
    process.exit(1);
  } else if (data.length === 0) {
    console.error(`❌ User ID ${targetUserId} not found in the profiles table.`);
    process.exit(1);
  } else {
    console.log(`✅ Successfully upgraded user to super_admin!`);
    console.log(`Profile: ${data[0].email} | Role: ${data[0].role}`);
    console.log(`You can now access the admin dashboard.`);
  }
}

upgradeUser();

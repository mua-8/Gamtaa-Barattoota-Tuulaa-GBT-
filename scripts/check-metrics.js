require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking metrics...");
  
  const results = await Promise.all([
    supabase.from("programs").select("id", { count: "exact", head: true }).eq("status", "Published"),
    supabase.from("gallery_items").select("id", { count: "exact", head: true }),
    supabase.from("team_members").select("id", { count: "exact", head: true }),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "unread"),
  ]);

  console.log("Programs:", results[0]);
  console.log("Gallery:", results[1]);
  console.log("Team Members:", results[2]);
  console.log("Messages:", results[3]);
}

check();

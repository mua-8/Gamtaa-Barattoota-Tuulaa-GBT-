/* One-time Supabase project bootstrap using the service role key.
   Run: node scripts/setup-supabase.js
   - verifies connectivity
   - creates the storage buckets (idempotent)
   - reports whether the SQL schema is present */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !SERVICE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const h = {
  apikey: SERVICE,
  Authorization: `Bearer ${SERVICE}`,
  "Content-Type": "application/json",
};

async function main() {
  const base = URL.replace(/\/$/, "");

  const rest = await fetch(`${base}/rest/v1/`, { headers: h });
  console.log("REST endpoint:", rest.status);

  const schema = await fetch(`${base}/rest/v1/profiles?select=id&limit=1`, { headers: h });
  const schemaBody = await schema.text();
  console.log("profiles table:", schema.status, schema.status === 200 ? "present" : schemaBody.slice(0, 120));

  for (const [id, isPublic] of [
    ["avatars", true],
    ["gallery", true],
    ["team-photos", true],
    ["program-images", true],
  ]) {
    const create = await fetch(`${base}/storage/v1/bucket`, {
      method: "POST",
      headers: h,
      body: JSON.stringify({ id, name: id, public: isPublic }),
    });
    const body = await create.text();
    if (create.status === 200) console.log(`bucket ${id}: created`);
    else if (body.includes("already exists") || body.includes("duplicate")) console.log(`bucket ${id}: exists`);
    else console.log(`bucket ${id}: FAILED ${create.status} ${body.slice(0, 140)}`);
  }

  const list = await fetch(`${base}/storage/v1/bucket`, { headers: h });
  const buckets = await list.json();
  console.log("buckets now:", Array.isArray(buckets) ? buckets.map((b) => b.id).join(", ") : JSON.stringify(buckets).slice(0, 200));
}

main().catch((e) => {
  console.error("SETUP ERROR:", e.message);
  process.exit(1);
});

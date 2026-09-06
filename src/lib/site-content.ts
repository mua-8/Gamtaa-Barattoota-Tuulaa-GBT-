import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Robust CMS content helper that attempts database reading/writing first,
 * with automatic fallback to Supabase Storage JSON persistence in the
 * `program-images` bucket.
 */
export async function getSiteContent<T>(slug: string, fallback: T): Promise<T> {
  // 1. Try reading from PostgreSQL table `site_content`
  try {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("site_content")
        .select("content")
        .eq("page_slug", slug)
        .maybeSingle();

      if (!error && data?.content) {
        return { ...fallback, ...data.content };
      }
    }
  } catch {
    // Database table may not exist or query error; proceed to storage fallback
  }

  // 2. Try reading from Supabase Storage JSON fallback
  try {
    const admin = getSupabaseAdminClient();
    if (admin) {
      const { data, error } = await admin.storage
        .from("program-images")
        .download(`site-content-${slug}.json`);

      if (!error && data) {
        const text = await data.text();
        const json = JSON.parse(text);
        return { ...fallback, ...json };
      }
    }
  } catch {
    // Storage fallback not found; proceed to default fallback
  }

  return fallback;
}

export async function saveSiteContent(
  slug: string,
  content: any
): Promise<{ success?: boolean; error?: string }> {
  let savedToDb = false;

  // 1. Attempt writing to PostgreSQL table `site_content`
  try {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase
        .from("site_content")
        .upsert({ page_slug: slug, content }, { onConflict: "page_slug" });

      if (!error) {
        savedToDb = true;
      }
    }
  } catch {
    // Table might not exist; continue to storage persistence
  }

  // 2. Persist to Supabase Storage (`program-images` bucket)
  try {
    const admin = getSupabaseAdminClient();
    if (admin) {
      const jsonBuffer = Buffer.from(JSON.stringify(content, null, 2), "utf-8");
      const { error: storageError } = await admin.storage
        .from("program-images")
        .upload(`site-content-${slug}.json`, jsonBuffer, {
          contentType: "application/json",
          upsert: true,
        });

      if (!storageError) {
        return { success: true };
      }

      if (!savedToDb) {
        return { error: storageError.message };
      }
    }
  } catch (e: any) {
    if (!savedToDb) {
      return { error: e?.message || "Failed to persist site content" };
    }
  }

  return savedToDb ? { success: true } : { error: "Failed to persist site content" };
}

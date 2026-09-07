import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Fast in-memory cache with 60s TTL to prevent repeating roundtrips on every request
const contentCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 60 * 1000;

export async function getSiteContent<T>(slug: string, fallback: T): Promise<T> {
  const cached = contentCache.get(slug);
  if (cached && cached.expiry > Date.now()) {
    return { ...fallback, ...cached.data };
  }

  let content: any = null;

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
        content = data.content;
      }
    }
  } catch {
    // Database table may not exist; proceed to storage fallback
  }

  // 2. Try reading from Supabase Storage JSON fallback
  if (!content) {
    try {
      const admin = getSupabaseAdminClient();
      if (admin) {
        const { data, error } = await admin.storage
          .from("program-images")
          .download(`site-content-${slug}.json`);

        if (!error && data) {
          const text = await data.text();
          content = JSON.parse(text);
        }
      }
    } catch {
      // Storage fallback not found
    }
  }

  if (content) {
    contentCache.set(slug, { data: content, expiry: Date.now() + CACHE_TTL_MS });
    return { ...fallback, ...content };
  }

  return fallback;
}

export async function saveSiteContent(
  slug: string,
  content: any
): Promise<{ success?: boolean; error?: string }> {
  // Clear cache immediately upon saving
  contentCache.delete(slug);

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
        contentCache.set(slug, { data: content, expiry: Date.now() + CACHE_TTL_MS });
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

  if (savedToDb) {
    contentCache.set(slug, { data: content, expiry: Date.now() + CACHE_TTL_MS });
    return { success: true };
  }

  return { error: "Failed to persist site content" };
}

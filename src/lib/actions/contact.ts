"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isServiceRoleConfigured } from "@/lib/supabase/config";

export type ContactResult =
  | { ok: true; demo: boolean }
  | { ok: false; error: string };

/**
 * Persists a contact message into `contact_messages` using the
 * service-role client (server-only; bypasses RLS by design — anonymous
 * visitors have no direct write access).
 */
export async function submitContactMessage(formData: FormData): Promise<ContactResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (name.length < 2 || subject.length < 3 || message.length < 10) {
    return { ok: false, error: "Please complete all fields before sending." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please provide a valid email address." };
  }

  if (!isServiceRoleConfigured) {
    // Demo mode (no backend configured): keep the UX, be honest about it.
    return { ok: true, demo: true };
  }

  const admin = getSupabaseAdminClient();
  if (!admin) return { ok: false, error: "The backend is not configured." };

  const { error } = await admin.from("contact_messages").insert({
    name,
    email,
    subject,
    message,
  });
  if (error) {
    return { ok: false, error: "Something went wrong while saving your message. Please try again." };
  }
  return { ok: true, demo: false };
}

export type TeamApplicationResult = { ok: true } | { ok: false; error: string };

/**
 * Simple team-join form. Persisted through the service-role client into
 * contact_messages with a "Team Application" subject until a dedicated
 * team_applications table exists.
 */
export async function submitTeamApplication(formData: FormData): Promise<TeamApplicationResult> {
  const name = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const university = String(formData.get("university") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const role = String(formData.get("preferred_role") ?? "").trim();
  const motivation = String(formData.get("motivation") ?? "").trim();

  if (name.length < 2 || !university || !role)
    return { ok: false, error: "Please fill your name, university, and preferred role." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "Please provide a valid email address." };
  if (motivation.length < 20)
    return { ok: false, error: "Tell us briefly why you'd like to serve as team (20+ characters)." };

  if (!isServiceRoleConfigured) {
    return { ok: false, error: "The backend is not configured yet — please email us at hello@gbtuulaa.org instead." };
  }
  const admin = getSupabaseAdminClient();
  if (!admin) return { ok: false, error: "The backend is not configured yet — please email us instead." };

  const { error } = await admin.from("contact_messages").insert({
    name,
    email,
    subject: `Team Application — ${name} (${role})`,
    message:
      `Phone: ${phone || "-"}\nUniversity: ${university}\nDepartment: ${department || "-"}\n` +
      `Preferred role: ${role}\nMotivation: ${motivation}`,
  });
  if (error) {
    return { ok: false, error: "We could not save your application right now — please email us at hello@gbtuulaa.org." };
  }
  return { ok: true };
}

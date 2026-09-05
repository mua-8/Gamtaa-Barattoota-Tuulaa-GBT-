import type { Metadata } from "next";
import { SettingsPasswordForm } from "@/components/student/settings-password-form";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Settings",
  description: "Account settings for your GBT volunteer account.",
  robots: { index: false },
};

export default async function SettingsPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Account</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-forest-950">Settings</h1>
      </div>

      <div className="max-w-md rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-forest-950">Account email</h2>
        <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          The email address is your sign-in identity and cannot be changed here.
        </p>
      </div>

      <div className="max-w-md rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-forest-950">Change password</h2>
        <SettingsPasswordForm />
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSiteContent } from "@/lib/site-content";
import { ORG } from "@/lib/site";
import { SettingsClient } from "./settings-client";

export const metadata = {
  title: "System Settings & Logs | GBT Admin",
  description: "Platform configurations, security settings, and audit logs",
};

export default async function SettingsPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  const isSuperAdmin = profile?.role === "super_admin";
  const isDev = process.env.NODE_ENV === "development";

  if (!isSuperAdmin && !isDev) {
    redirect("/admin");
  }

  const defaultSettings = {
    organizationName: ORG.name,
    shortName: ORG.shortName,
    tagline: ORG.tagline,
    motto: ORG.philosophy,
    foundedYear: ORG.foundedYear,
    volunteerApplicationsOpen: true,
    studentRegistrationOpen: true,
    supportEmail: ORG.email,
    emergencyPhone: ORG.phone,
  };

  const settings = await getSiteContent("settings", defaultSettings);

  // Read audit logs using admin client to ensure full visibility
  const admin = getSupabaseAdminClient() || supabase;
  const { data: logsData } = await admin
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, created_at, admin_id")
    .order("created_at", { ascending: false })
    .limit(50);

  const auditLogs = (logsData || []).map((log: any) => ({
    id: log.id,
    action: log.action,
    entity_type: log.entity_type,
    entity_id: log.entity_id,
    created_at: log.created_at,
    admin_email: user.email,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-forest-950">
          Settings & Security
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage organization settings, intake controls, administrator credentials, system diagnostics, and audit logs.
        </p>
      </div>

      <SettingsClient
        initialSettings={settings}
        auditLogs={auditLogs}
        currentUser={{
          id: user.id,
          email: user.email,
          role: profile?.role || "super_admin",
          last_sign_in_at: user.last_sign_in_at,
        }}
      />
    </div>
  );
}

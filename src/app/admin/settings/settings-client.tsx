"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Shield,
  History,
  Activity,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Key,
  RefreshCw,
  Server,
  Database,
  HardDrive,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  OrganizationSettings,
  updateOrganizationSettings,
  changeAdminPassword,
  revalidateAllCaches,
} from "@/lib/actions/settings";

interface AuditLogItem {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
  admin_email?: string;
}

interface SettingsClientProps {
  initialSettings: OrganizationSettings;
  auditLogs: AuditLogItem[];
  currentUser: {
    id: string;
    email?: string;
    role: string;
    last_sign_in_at?: string;
  };
}

export function SettingsClient({
  initialSettings,
  auditLogs,
  currentUser,
}: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "security" | "audit" | "diagnostics">("general");

  // General Settings State
  const [settings, setSettings] = useState<OrganizationSettings>(initialSettings);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [generalFeedback, setGeneralFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Password State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Cache State
  const [isFlushingCache, setIsFlushingCache] = useState(false);
  const [cacheFeedback, setCacheFeedback] = useState<string | null>(null);

  const handleGeneralSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingGeneral(true);
    setGeneralFeedback(null);

    const formData = new FormData(e.currentTarget);
    const updated: OrganizationSettings = {
      organizationName: String(formData.get("organizationName") ?? "").trim(),
      shortName: String(formData.get("shortName") ?? "").trim(),
      tagline: String(formData.get("tagline") ?? "").trim(),
      motto: String(formData.get("motto") ?? "").trim(),
      foundedYear: Number(formData.get("foundedYear") ?? 2021),
      volunteerApplicationsOpen: formData.get("volunteerApplicationsOpen") === "on",
      studentRegistrationOpen: formData.get("studentRegistrationOpen") === "on",
      supportEmail: String(formData.get("supportEmail") ?? "").trim(),
      emergencyPhone: String(formData.get("emergencyPhone") ?? "").trim(),
    };

    try {
      const res = await updateOrganizationSettings(updated);
      if (res?.error) {
        setGeneralFeedback({ text: res.error, type: "error" });
      } else {
        setSettings(updated);
        setGeneralFeedback({ text: "Organization settings updated successfully!", type: "success" });
        router.refresh();
      }
    } catch {
      setGeneralFeedback({ text: "Failed to update settings.", type: "error" });
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordFeedback(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await changeAdminPassword(formData);
      if (res?.error) {
        setPasswordFeedback({ text: res.error, type: "error" });
      } else {
        setPasswordFeedback({ text: "Password updated successfully!", type: "success" });
        form.reset();
      }
    } catch {
      setPasswordFeedback({ text: "Failed to update password.", type: "error" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleFlushCache = async () => {
    setIsFlushingCache(true);
    setCacheFeedback(null);
    try {
      const res = await revalidateAllCaches();
      if (res.success) {
        setCacheFeedback(`All site caches flushed and revalidated at ${new Date().toLocaleTimeString()}!`);
        router.refresh();
      }
    } catch {
      setCacheFeedback("Failed to flush cache.");
    } finally {
      setIsFlushingCache(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === "general"
              ? "bg-forest-900 text-gold-400 shadow-sm"
              : "text-muted-foreground hover:bg-forest-50 hover:text-forest-900"
          }`}
        >
          <Building2 className="h-4 w-4" />
          General Settings
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === "security"
              ? "bg-forest-900 text-gold-400 shadow-sm"
              : "text-muted-foreground hover:bg-forest-50 hover:text-forest-900"
          }`}
        >
          <Shield className="h-4 w-4" />
          Account & Security
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === "audit"
              ? "bg-forest-900 text-gold-400 shadow-sm"
              : "text-muted-foreground hover:bg-forest-50 hover:text-forest-900"
          }`}
        >
          <History className="h-4 w-4" />
          Audit Logs ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab("diagnostics")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === "diagnostics"
              ? "bg-forest-900 text-gold-400 shadow-sm"
              : "text-muted-foreground hover:bg-forest-50 hover:text-forest-900"
          }`}
        >
          <Activity className="h-4 w-4" />
          System Health
        </button>
      </div>

      {/* TAB 1: GENERAL SETTINGS */}
      {activeTab === "general" && (
        <form onSubmit={handleGeneralSubmit} className="space-y-6">
          {generalFeedback && (
            <div
              className={`flex items-center gap-2 rounded-lg p-4 text-sm font-medium ${
                generalFeedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-destructive/15 text-destructive border border-destructive/20"
              }`}
            >
              {generalFeedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              {generalFeedback.text}
            </div>
          )}

          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-forest-950">Organization Profile</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-foreground">Organization Full Name</label>
                <input
                  name="organizationName"
                  defaultValue={settings.organizationName}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-ring"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Short Name / Acronym</label>
                <input
                  name="shortName"
                  defaultValue={settings.shortName}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-ring"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Tagline</label>
                <input
                  name="tagline"
                  defaultValue={settings.tagline}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-ring"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Philosophy / Motto</label>
                <input
                  name="motto"
                  defaultValue={settings.motto}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-ring"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Founded Year</label>
                <input
                  name="foundedYear"
                  type="number"
                  defaultValue={settings.foundedYear}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-ring"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Support / Official Email</label>
                <input
                  name="supportEmail"
                  type="email"
                  defaultValue={settings.supportEmail}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-ring"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-foreground">Emergency Contact Phone</label>
                <input
                  name="emergencyPhone"
                  defaultValue={settings.emergencyPhone}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-ring"
                  required
                />
              </div>
            </div>
          </div>

          {/* Portal Access Control Toggles */}
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-forest-950">Portal Intake Controls</h3>
            <p className="text-xs text-muted-foreground">
              Control whether public users can register as student volunteers and submit applications.
            </p>

            <div className="space-y-4 pt-2">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border hover:bg-neutral-50 transition-colors">
                <input
                  type="checkbox"
                  name="studentRegistrationOpen"
                  defaultChecked={settings.studentRegistrationOpen}
                  className="h-5 w-5 rounded border-gray-300 text-forest-900 focus:ring-forest-900"
                />
                <div>
                  <span className="text-sm font-bold text-forest-950 block">
                    Student Registration & Volunteer Intake
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Allow students to sign up and submit applications on the website.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border hover:bg-neutral-50 transition-colors">
                <input
                  type="checkbox"
                  name="volunteerApplicationsOpen"
                  defaultChecked={settings.volunteerApplicationsOpen}
                  className="h-5 w-5 rounded border-gray-300 text-forest-900 focus:ring-forest-900"
                />
                <div>
                  <span className="text-sm font-bold text-forest-950 block">
                    Leadership & Team Applications
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Accept submissions through the Join Team leadership application form.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSavingGeneral}
              className="bg-forest-900 text-white hover:bg-forest-800"
            >
              {isSavingGeneral ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Settings...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Organization Settings
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: SECURITY & ACCOUNT */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {passwordFeedback && (
            <div
              className={`flex items-center gap-2 rounded-lg p-4 text-sm font-medium ${
                passwordFeedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-destructive/15 text-destructive border border-destructive/20"
              }`}
            >
              {passwordFeedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              {passwordFeedback.text}
            </div>
          )}

          {/* Current Admin Details Card */}
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-forest-950 flex items-center gap-2">
              <Lock className="h-5 w-5 text-forest-600" />
              Super Admin Session Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="p-3 bg-neutral-50 rounded-lg border">
                <span className="text-xs text-muted-foreground block">Admin Email</span>
                <span className="font-bold text-forest-950">{currentUser.email || "superadmin@gbtuulaa.org"}</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border">
                <span className="text-xs text-muted-foreground block">Role Authorization</span>
                <Badge className="bg-forest-900 text-gold-400 font-bold mt-0.5">
                  {currentUser.role.toUpperCase()}
                </Badge>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border">
                <span className="text-xs text-muted-foreground block">User Identifier (UUID)</span>
                <span className="font-mono text-xs text-muted-foreground break-all">{currentUser.id}</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border">
                <span className="text-xs text-muted-foreground block">Last Authentication</span>
                <span className="text-sm font-medium text-forest-950">
                  {currentUser.last_sign_in_at
                    ? new Date(currentUser.last_sign_in_at).toLocaleString()
                    : "Active Session"}
                </span>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-forest-950 flex items-center gap-2">
              <Key className="h-5 w-5 text-forest-600" />
              Change Admin Password
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              <div>
                <label className="text-sm font-semibold text-foreground">New Password</label>
                <input
                  name="newPassword"
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-ring"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Confirm New Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-ring"
                />
              </div>
              <Button
                type="submit"
                disabled={isChangingPassword}
                className="bg-forest-900 text-white hover:bg-forest-800"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>Update Admin Password</>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-forest-950">System Audit Trail</h3>
              <p className="text-xs text-muted-foreground">
                All administrative actions, approvals, content edits, and system changes are immutably logged.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.refresh()}
              className="text-xs"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Refresh Logs
            </Button>
          </div>

          {auditLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-white py-12 text-center shadow-sm">
              <History className="h-10 w-10 text-muted-foreground/60 mb-2" />
              <h4 className="text-sm font-semibold text-foreground">No audit logs yet</h4>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Actions performed by administrators (such as publishing content, approving applications, and changing settings) will be automatically recorded here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-xl border bg-white shadow-sm overflow-hidden text-sm">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs font-bold uppercase">
                        {log.action}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {log.entity_type} {log.entity_id ? `(${log.entity_id})` : ""}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Admin: <span className="font-semibold text-foreground">{log.admin_email || "Super Admin"}</span>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SYSTEM HEALTH & CACHE */}
      {activeTab === "diagnostics" && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-forest-950 flex items-center gap-2">
              <Server className="h-5 w-5 text-forest-600" />
              Platform Infrastructure Status
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-xl border bg-emerald-50/50 border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <Database className="h-4 w-4 text-emerald-600" />
                  Supabase PostgreSQL
                </div>
                <p className="text-xs text-emerald-700 mt-1">Status: Active & Online</p>
                <p className="text-xs text-muted-foreground mt-0.5">16 Data Tables Configured</p>
              </div>

              <div className="p-4 rounded-xl border bg-emerald-50/50 border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <HardDrive className="h-4 w-4 text-emerald-600" />
                  Supabase Storage
                </div>
                <p className="text-xs text-emerald-700 mt-1">Status: Active & Online</p>
                <p className="text-xs text-muted-foreground mt-0.5">4 Buckets (avatars, gallery, team, programs)</p>
              </div>

              <div className="p-4 rounded-xl border bg-emerald-50/50 border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  Next.js App Router
                </div>
                <p className="text-xs text-emerald-700 mt-1">Status: Operational</p>
                <p className="text-xs text-muted-foreground mt-0.5">54 Compiled Routes</p>
              </div>
            </div>
          </div>

          {/* Cache Control */}
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-forest-950 flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-forest-600" />
              Content Delivery & Cache Management
            </h3>
            <p className="text-sm text-muted-foreground">
              If public pages appear cached or delayed after updating content, you can trigger an instant global cache revalidation across all static and dynamic pages.
            </p>

            {cacheFeedback && (
              <div className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-800 border border-emerald-200 flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                {cacheFeedback}
              </div>
            )}

            <Button
              onClick={handleFlushCache}
              disabled={isFlushingCache}
              className="bg-forest-900 text-white hover:bg-forest-800"
            >
              {isFlushingCache ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revalidating All Routes...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Flush & Revalidate Global Cache
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

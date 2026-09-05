import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured) redirect("/login");
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  // Check admin role
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-4">
        <div className="max-w-xl rounded-xl border border-red-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <h1 className="text-2xl font-bold">Profile Synchronization Error</h1>
          </div>
          <p className="text-gray-700 mb-4">
            We could not find your user profile in the database. Please try signing out and signing back in.
          </p>
        </div>
      </div>
    );
  }

  // In production, this strictly enforces the admin/super_admin requirement.
  if (profile.role !== "super_admin" && profile.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-4">
        <div className="max-w-2xl rounded-xl border border-red-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <h1 className="text-2xl font-bold">Access Denied</h1>
          </div>
          <p className="text-gray-700 mb-6">
            You must be an <strong>admin</strong> or <strong>super_admin</strong> to view this dashboard. 
            Your current role is <span className="font-bold text-red-600">{profile.role}</span>.
          </p>

          <div className="rounded bg-slate-900 p-4 text-xs font-mono text-slate-300 overflow-x-auto shadow-inner">
            <h3 className="text-slate-400 mb-2 uppercase tracking-wider font-semibold">Server-Side Authorization Diagnostics</h3>
            <div className="space-y-1">
              <p><span className="text-blue-400">Authenticated User ID:</span> {user.id}</p>
              <p><span className="text-blue-400">Queried Profile ID:</span> {user.id}</p>
              <p><span className="text-blue-400">Database Role Read:</span> {profile.role}</p>
              <p><span className="text-blue-400">Query Status:</span> Success</p>
              <p><span className="text-blue-400">Supabase Project URL:</span> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
              <p className="mt-2 text-slate-500">
                If the database says super_admin but this shows student, you may have updated the wrong User ID in SQL, or are connected to the wrong Supabase project.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact a system administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <AdminShell userRole={profile.role as any}>{children}</AdminShell>;
}

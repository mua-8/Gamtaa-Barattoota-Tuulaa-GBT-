import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

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

  // Strictly enforce admin role: only users with admin or super_admin role can enter.
  if (profile.role !== "super_admin" && profile.role !== "admin") {
    redirect("/student/dashboard");
  }

  return <AdminShell userRole={profile.role as any}>{children}</AdminShell>;
}

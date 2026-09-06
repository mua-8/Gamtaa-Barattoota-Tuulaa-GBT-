import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FounderForm } from "@/components/admin/founder-form";
import { parseTeamMember } from "@/lib/team-util";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminFounderPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "super_admin" && profile.role !== "admin")) {
    redirect("/admin");
  }

  const { data: members } = await supabase
    .from("team_members")
    .select("*")
    .order("created_at", { ascending: false });

  const rawFounder = members?.find(
    (m: any) =>
      m.member_type === "founder" ||
      (m.position && m.position.toLowerCase().trim() === "founder") ||
      m.display_order === -999
  );

  const founder = rawFounder ? parseTeamMember(rawFounder) : null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/team"
          className="text-sm text-forest-600 hover:underline flex items-center mb-4 font-semibold"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Team Management
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-forest-950">
          {founder ? "Edit Founder Profile" : "Configure Founder"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage the Founder section displayed on the public Our Team page.
        </p>
      </div>

      <FounderForm id={founder?.id} initialData={founder || undefined} />
    </div>
  );
}

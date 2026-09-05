import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TeamForm } from "@/components/admin/team-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditTeamMemberPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");

  const { data: member, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !member) {
    redirect("/admin/team");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/team" className="text-sm text-forest-600 hover:underline flex items-center mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Team
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-forest-950">Edit Team Member</h1>
        <p className="text-muted-foreground">Update profile for {member.full_name}.</p>
      </div>
      
      <TeamForm id={member.id} initialData={member} />
    </div>
  );
}

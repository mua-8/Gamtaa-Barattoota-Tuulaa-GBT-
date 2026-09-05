import { TeamForm } from "@/components/admin/team-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewTeamMemberPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/team" className="text-sm text-forest-600 hover:underline flex items-center mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Team
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-forest-950">Add Team Member</h1>
        <p className="text-muted-foreground">Create a new team member profile.</p>
      </div>
      
      <TeamForm />
    </div>
  );
}

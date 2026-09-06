import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Plus, Edit, CheckCircle, XCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseTeamMember } from "@/lib/team-util";
import { FounderStatusToggle } from "@/components/admin/founder-status-toggle";

export default async function TeamPage() {
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

  const { data: allRows } = await supabase
    .from("team_members")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  const parsedMembers = (allRows || []).map(parseTeamMember);

  const founder = parsedMembers.find((m: any) => m.member_type === "founder");
  const activeMembers = parsedMembers.filter((m: any) => m.member_type !== "founder");

  return (
    <div className="space-y-10">
      {/* Top Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-forest-950">
          Our Team Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage the organization founder profile and active program team members displayed on the public website.
        </p>
      </div>

      {/* SECTION 1: FOUNDER MANAGEMENT */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-forest-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold-500" />
              <h2 className="text-xl font-bold tracking-tight text-forest-950">
                Founder Profile
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Appears in a dedicated, prominent section above active team members on the Our Team page.
            </p>
          </div>

          <Button asChild className="bg-forest-900 text-white hover:bg-forest-800">
            <Link href="/admin/team/founder">
              <Edit className="mr-2 h-4 w-4" />
              {founder ? "Edit Founder" : "Configure Founder"}
            </Link>
          </Button>
        </div>

        {founder ? (
          <div className="rounded-xl border border-gold-200/80 bg-gradient-to-r from-amber-50/40 via-white to-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4">
                {founder.photo_url ? (
                  <img
                    src={founder.photo_url}
                    alt={founder.name}
                    className="h-20 w-20 rounded-xl object-cover border-2 border-gold-500/70 shadow bg-white shrink-0"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center font-bold text-2xl border border-forest-200 shrink-0">
                    {founder.name.charAt(0)}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-forest-950 font-display">
                      {founder.name}
                    </h3>
                    <Badge className="bg-gold-500 text-forest-950 font-bold hover:bg-gold-500 border-none">
                      {founder.position || "Founder"}
                    </Badge>
                    {founder.is_active ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold bg-gray-100 text-gray-600">
                        <XCircle className="h-3 w-3" /> Draft (Hidden)
                      </span>
                    )}
                  </div>

                  {founder.intro && (
                    <p className="text-sm font-medium italic text-forest-800 line-clamp-1">
                      "{founder.intro}"
                    </p>
                  )}

                  {founder.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2 max-w-2xl">
                      {founder.bio}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                <FounderStatusToggle id={founder.id} isActive={founder.is_active} />
                <Button asChild variant="outline" size="sm" className="border-forest-200">
                  <Link href="/admin/team/founder">
                    <Edit className="h-3.5 w-3.5 mr-1 text-forest-600" />
                    Edit
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-forest-200 bg-forest-50/30 p-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-100 text-gold-700">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-forest-950">No Founder Profile Configured Yet</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Configure the founder with their photo, biography, and title. The section will automatically appear at the top of the Our Team page.
            </p>
            <Button asChild className="bg-gold-500 text-forest-950 hover:bg-gold-400 font-bold">
              <Link href="/admin/team/founder">
                <Plus className="mr-1.5 h-4 w-4" /> Configure Founder Now
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* SECTION 2: OUR ACTIVE TEAM MEMBERS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-forest-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-forest-600" />
              <h2 className="text-xl font-bold tracking-tight text-forest-950">
                Our Active Team Members
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Mentors, university volunteers, and coordinators.
            </p>
          </div>

          <Button asChild className="bg-forest-900 text-white hover:bg-forest-800">
            <Link href="/admin/team/new">
              <Plus className="mr-2 h-4 w-4" /> Add Team Member
            </Link>
          </Button>
        </div>

        <div className="rounded-md border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>University / Dept</TableHead>
                <TableHead className="text-center">Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeMembers && activeMembers.length > 0 ? (
                activeMembers.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="h-10 w-10 rounded-full object-cover bg-forest-50"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-100 text-forest-600 font-bold">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-forest-950">
                      {member.name}
                    </TableCell>
                    <TableCell>{member.position}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {member.university || member.department ? (
                        <span>
                          {member.university}
                          {member.university && member.department && " · "}
                          {member.department}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {member.is_active ? (
                        <CheckCircle className="mx-auto h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="mx-auto h-5 w-5 text-gray-300" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-forest-600 hover:text-forest-900 hover:bg-forest-50"
                      >
                        <Link href={`/admin/team/${member.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No active team members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

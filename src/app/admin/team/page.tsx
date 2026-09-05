import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  if (!profile || profile.role !== "super_admin") {
    redirect("/admin");
  }

  const { data: teamMembers, error } = await supabase
    .from("team_members")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-forest-950">
            Team Members
          </h1>
          <p className="text-muted-foreground">
            Manage the team members displayed on the public website.
          </p>
        </div>
        <Button asChild className="bg-forest-900 text-white hover:bg-forest-800">
          <Link href="/admin/team/new">
            <Plus className="mr-2 h-4 w-4" /> Add Team Member
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-center">Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers && teamMembers.length > 0 ? (
              teamMembers.map((member) => (
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
                  <TableCell className="font-medium text-forest-950">
                    {member.name}
                  </TableCell>
                  <TableCell>{member.position}</TableCell>
                  <TableCell className="text-center">
                    {member.is_active ? (
                      <CheckCircle className="mx-auto h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="mx-auto h-5 w-5 text-gray-300" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No team members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

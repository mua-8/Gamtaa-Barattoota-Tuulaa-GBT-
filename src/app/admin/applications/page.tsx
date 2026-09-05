import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
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

export default async function ApplicationsPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "super_admin" && profile.role !== "admin")) {
    redirect("/admin");
  }

  // Fetch applications with joined student profile data
  const { data: applications, error } = await supabase
    .from("applications")
    .select(`
      id, 
      application_number, 
      status, 
      submitted_at,
      student_profiles (
        id,
        student_id,
        profiles ( full_name, email )
      )
    `)
    .order("submitted_at", { ascending: false });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"><CheckCircle className="mr-1 h-3 w-3" /> Approved</span>;
      case "rejected":
        return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10"><XCircle className="mr-1 h-3 w-3" /> Rejected</span>;
      case "under_review":
        return <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"><Clock className="mr-1 h-3 w-3" /> Reviewing</span>;
      case "pending":
      default:
        return <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-forest-950">
            Student Applications
          </h1>
          <p className="text-muted-foreground">
            Review and manage student volunteer applications.
          </p>
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>App ID</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications && applications.length > 0 ? (
              applications.map((app) => {
                const sp = Array.isArray(app.student_profiles) ? app.student_profiles[0] : app.student_profiles;
                const p = sp?.profiles ? (Array.isArray(sp.profiles) ? sp.profiles[0] : sp.profiles) : null;
                return (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium font-mono text-sm">
                      {app.application_number}
                    </TableCell>
                    <TableCell>{p?.full_name || "Unknown"}</TableCell>
                    <TableCell>{sp?.student_id || "N/A"}</TableCell>
                    <TableCell>{new Date(app.submitted_at).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm" className="text-forest-600 hover:text-forest-900 hover:bg-forest-50">
                        <Link href={`/admin/applications/${app.id}`}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No applications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

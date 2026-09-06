import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { verifyServiceRecord } from "@/lib/actions/service-records";

export default async function ServiceRecordsPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "super_admin" && profile.role !== "admin")) redirect("/admin");

  const { data: records } = await supabase
    .from("service_records")
    .select(`
      *,
      student:profiles!service_records_student_id_fkey ( full_name, email ),
      programs ( title )
    `)
    .order("created_at", { ascending: false });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified": return <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"><CheckCircle className="mr-1 h-3 w-3" /> Verified</span>;
      case "rejected": return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10"><XCircle className="mr-1 h-3 w-3" /> Rejected</span>;
      default: return <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20"><Clock className="mr-1 h-3 w-3" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-forest-950">Service Records</h1>
          <p className="text-muted-foreground">Verify and track student volunteer hours.</p>
        </div>
      </div>
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records && records.length > 0 ? (
              records.map((record) => {
                const p = record.student;
                const prog = Array.isArray(record.programs) ? record.programs[0] : record.programs;
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold text-forest-950">{p?.full_name || "Unknown"}</div>
                        {p?.email && <div className="text-xs text-muted-foreground">{p.email}</div>}
                      </div>
                    </TableCell>
                    <TableCell>{record.activity}</TableCell>
                    <TableCell>{prog?.title || "N/A"}</TableCell>
                    <TableCell className="font-bold text-forest-700">{record.hours}</TableCell>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(record.verification_status)}</TableCell>
                    <TableCell className="text-right">
                      {record.verification_status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <form action={async () => { "use server"; await verifyServiceRecord(record.id, "verified"); }}>
                            <Button type="submit" size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50"><CheckCircle className="h-4 w-4" /></Button>
                          </form>
                          <form action={async () => { "use server"; await verifyServiceRecord(record.id, "rejected"); }}>
                            <Button type="submit" size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50"><XCircle className="h-4 w-4" /></Button>
                          </form>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow><TableCell colSpan={7} className="h-24 text-center">No service records found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

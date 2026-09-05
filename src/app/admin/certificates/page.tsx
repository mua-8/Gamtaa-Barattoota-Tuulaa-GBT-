import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Award, FileText, CheckCircle, XCircle } from "lucide-react";
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

export default async function CertificatesPage() {
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

  // Fetch certificates with joined student profile and program data
  const { data: certificates, error } = await supabase
    .from("certificates")
    .select(`
      id, 
      certificate_number,
      service_hours,
      issued_at,
      verification_status,
      profiles ( full_name, email ),
      programs ( title )
    `)
    .order("issued_at", { ascending: false });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"><CheckCircle className="mr-1 h-3 w-3" /> Valid</span>;
      case "rejected":
        return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10"><XCircle className="mr-1 h-3 w-3" /> Revoked</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-forest-950">
            Certificates
          </h1>
          <p className="text-muted-foreground">
            Manage completion certificates for student volunteers.
          </p>
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cert ID</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificates && certificates.length > 0 ? (
              certificates.map((cert) => {
                const p = Array.isArray(cert.profiles) ? cert.profiles[0] : cert.profiles;
                const prog = Array.isArray(cert.programs) ? cert.programs[0] : cert.programs;
                return (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium font-mono text-sm">
                      {cert.certificate_number}
                    </TableCell>
                    <TableCell>{p?.full_name || "Unknown"}</TableCell>
                    <TableCell>{prog?.title || "N/A"}</TableCell>
                    <TableCell>{cert.service_hours}</TableCell>
                    <TableCell>{new Date(cert.issued_at).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(cert.verification_status)}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No certificates found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

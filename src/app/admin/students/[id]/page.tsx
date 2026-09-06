import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Mail, Phone, School, BookOpen, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function StudentDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: student, error } = await supabase
    .from("student_profiles")
    .select(`
      *,
      profiles ( full_name, email, phone, role ),
      applications ( id, application_number, status, submitted_at, motivation )
    `)
    .eq("id", id)
    .single();

  if (error || !student) {
    notFound();
  }

  const latestApp = Array.isArray(student.applications)
    ? student.applications[0]
    : student.applications;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/admin/students" className="text-sm text-forest-600 hover:underline flex items-center mb-4">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Students
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-forest-950">
              {student.profiles?.full_name || "Volunteer Profile"}
            </h1>
            <p className="text-muted-foreground">{student.profiles?.email}</p>
          </div>
          <div>
            {latestApp?.status === "approved" && (
              <Badge className="bg-emerald-100 text-emerald-800 text-sm px-3 py-1 border-transparent">
                <CheckCircle className="mr-1.5 h-4 w-4" /> Approved Volunteer
              </Badge>
            )}
            {latestApp?.status === "pending" && (
              <Badge className="bg-amber-100 text-amber-800 text-sm px-3 py-1 border-transparent">
                <Clock className="mr-1.5 h-4 w-4" /> Pending Application
              </Badge>
            )}
            {latestApp?.status === "rejected" && (
              <Badge className="bg-red-100 text-red-800 text-sm px-3 py-1 border-transparent">
                <XCircle className="mr-1.5 h-4 w-4" /> Application Rejected
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Academic Details */}
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-forest-950 border-b pb-3 flex items-center gap-2">
            <School className="h-5 w-5 text-forest-700" /> Academic Information
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold text-muted-foreground uppercase">University</dt>
              <dd className="font-medium text-foreground mt-0.5">{student.university || "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground uppercase">Department / Faculty</dt>
              <dd className="font-medium text-foreground mt-0.5">{student.department || "Not provided"} {student.faculty ? `(${student.faculty})` : ""}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground uppercase">Year of Study</dt>
              <dd className="font-medium text-foreground mt-0.5">{student.year_of_study || "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground uppercase">Student ID</dt>
              <dd className="font-mono text-foreground mt-0.5">{student.student_id || "Not provided"}</dd>
            </div>
          </dl>
        </div>

        {/* Contact Information */}
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-forest-950 border-b pb-3 flex items-center gap-2">
            <User className="h-5 w-5 text-forest-700" /> Contact & Location
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold text-muted-foreground uppercase">Email Address</dt>
              <dd className="font-medium text-foreground mt-0.5 flex items-center gap-2">
                <Mail className="h-4 w-4 text-forest-600" /> {student.profiles?.email}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground uppercase">Phone Number</dt>
              <dd className="font-medium text-foreground mt-0.5 flex items-center gap-2">
                <Phone className="h-4 w-4 text-forest-600" /> {student.profiles?.phone || student.phone || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground uppercase">Home Community</dt>
              <dd className="font-medium text-foreground mt-0.5">{student.home_community || "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground uppercase">Current Location</dt>
              <dd className="font-medium text-foreground mt-0.5">{student.current_location || "Not provided"}</dd>
            </div>
          </dl>
        </div>
      </div>

      {latestApp && (
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-lg font-bold text-forest-950 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-forest-700" /> Volunteer Application ({latestApp.application_number})
            </h2>
            <Button asChild size="sm" variant="outline">
              <Link href={`/admin/applications/${latestApp.id}`}>Review Full Application</Link>
            </Button>
          </div>
          {latestApp.motivation && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Motivation Statement</p>
              <p className="text-sm text-foreground bg-forest-50/50 p-3 rounded-lg border leading-relaxed">
                {latestApp.motivation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

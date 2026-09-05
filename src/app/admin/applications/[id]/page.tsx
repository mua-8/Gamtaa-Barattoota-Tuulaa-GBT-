import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ApplicationDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: app, error } = await supabase
    .from("applications")
    .select(`
      *,
      student_profiles (
        *,
        profiles ( full_name, email, phone )
      )
    `)
    .eq("id", params.id)
    .single();

  if (error || !app) {
    redirect("/admin/applications");
  }

  const sp = Array.isArray(app.student_profiles) ? app.student_profiles[0] : app.student_profiles;
  const p = sp?.profiles ? (Array.isArray(sp.profiles) ? sp.profiles[0] : sp.profiles) : null;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/applications" className="text-sm text-forest-600 hover:underline flex items-center mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Applications
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-forest-950">Application: {app.application_number}</h1>
        <p className="text-muted-foreground">Review application details for {p?.full_name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-bold text-forest-900 mb-4">Motivation & Experience</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">Motivation</h3>
                <p className="text-gray-600 mt-1 whitespace-pre-wrap">{app.motivation}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Teaching Experience</h3>
                <p className="text-gray-600 mt-1 whitespace-pre-wrap">{app.teaching_experience || "None provided"}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-bold text-forest-900 mb-4">Preferences</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700">Preferred Location</h3>
                <p className="text-gray-600">{app.preferred_location || "Any"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Availability</h3>
                <p className="text-gray-600">
                  {app.availability_start ? new Date(app.availability_start).toLocaleDateString() : "Not specified"} - 
                  {app.availability_end ? new Date(app.availability_end).toLocaleDateString() : "Not specified"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Subjects</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {app.subjects && app.subjects.length > 0 ? app.subjects.map((s: string) => (
                    <span key={s} className="bg-forest-50 text-forest-700 px-2 py-1 rounded text-xs">{s}</span>
                  )) : "None"}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Education Levels</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {app.education_levels && app.education_levels.length > 0 ? app.education_levels.map((s: string) => (
                    <span key={s} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{s}</span>
                  )) : "None"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-bold text-forest-900 mb-4">Applicant</h2>
            <div className="space-y-3 text-sm">
              <p><strong className="text-gray-700">Name:</strong> {p?.full_name}</p>
              <p><strong className="text-gray-700">Email:</strong> {p?.email}</p>
              <p><strong className="text-gray-700">Phone:</strong> {p?.phone || "N/A"}</p>
              <p><strong className="text-gray-700">University:</strong> {sp?.university}</p>
              <p><strong className="text-gray-700">Faculty/Dept:</strong> {sp?.faculty} / {sp?.department}</p>
              <p><strong className="text-gray-700">Year:</strong> {sp?.year_of_study}</p>
              <p><strong className="text-gray-700">Student ID:</strong> {sp?.student_id}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-bold text-forest-900 mb-4">Action</h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">Current Status: <strong className="uppercase">{app.status}</strong></p>
              
              {/* Note: Actions to be wired up to a Server Action */}
              <form className="space-y-2">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve Application
                </Button>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  <XCircle className="w-4 h-4 mr-2" /> Reject Application
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

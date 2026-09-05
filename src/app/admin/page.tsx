import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Users, FileText, BookOpen, Clock, Activity, Target, ImageIcon, Mail, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Admin Dashboard | GBT",
  description: "Organization management dashboard",
};

export default async function AdminDashboardPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isSuperAdmin = profile?.role === "super_admin";

  if (isSuperAdmin) {
    const [
      programsRes,
      galleryRes,
      teamRes,
      messagesRes,
    ] = await Promise.all([
      supabase.from("programs").select("id", { count: "exact", head: true }).neq("status", "draft"),
      supabase.from("gallery_items").select("id", { count: "exact", head: true }),
      supabase.from("team_members").select("id", { count: "exact", head: true }),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "unread"),
    ]);

    const getDisplayValue = (res: any) => {
      if (res.error) return "Error";
      if (res.count === null || res.count === undefined) return "0";
      return res.count.toString();
    };

    const cmsStats = [
      { name: "Published Programs", value: getDisplayValue(programsRes), error: programsRes.error, icon: BookOpen, color: "text-forest-600" },
      { name: "Gallery Items", value: getDisplayValue(galleryRes), error: galleryRes.error, icon: ImageIcon, color: "text-blue-600" },
      { name: "Program Team Members", value: getDisplayValue(teamRes), error: teamRes.error, icon: Users, color: "text-purple-600" },
      { name: "Unread Messages", value: getDisplayValue(messagesRes), error: messagesRes.error, icon: Mail, color: "text-amber-600" },
    ];

    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-forest-950">CMS Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Overview of the GBT website content.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="sm" className="bg-forest-900 text-white hover:bg-forest-800">
              <Link href="/admin/programs"><Plus className="mr-2 h-4 w-4" /> Add Program</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-forest-200">
              <Link href="/admin/gallery"><Plus className="mr-2 h-4 w-4" /> Add Gallery Image</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-forest-200">
              <Link href="/admin/team"><Plus className="mr-2 h-4 w-4" /> Add Team Member</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cmsStats.map((stat) => (
            <Card key={stat.name} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {stat.error ? (
                  <div className="text-sm font-medium text-red-500 truncate" title={stat.error.message}>
                    {stat.value}: {stat.error.message}
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-forest-950">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // STANDARD ADMIN DASHBOARD
  const [
    studentsRes,
    appsRes,
    programsRes,
    metricsRes,
  ] = await Promise.all([
    supabase.from("student_profiles").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("programs").select("id", { count: "exact", head: true }),
    supabase.from("impact_metrics").select("metric_key, metric_value"),
  ]);

  const getDisplayValue = (res: any) => {
    if (res.error) return "Error";
    if (res.count === null || res.count === undefined) return "0";
    return res.count.toString();
  };

  const metrics = metricsRes.data;
  const totalHours = metrics?.find(m => m.metric_key === "total_hours")?.metric_value || 0;
  const communitiesServed = metrics?.find(m => m.metric_key === "communities_served")?.metric_value || 0;
  const studentsReached = metrics?.find(m => m.metric_key === "students_reached")?.metric_value || 0;

  const stats = [
    { name: "Total Students", value: getDisplayValue(studentsRes), icon: Users, color: "text-blue-600", error: studentsRes.error },
    { name: "Pending Applications", value: getDisplayValue(appsRes), icon: FileText, color: "text-amber-600", error: appsRes.error },
    { name: "Active Programs", value: getDisplayValue(programsRes), icon: BookOpen, color: "text-forest-600", error: programsRes.error },
    { name: "Verified Service Hours", value: totalHours, icon: Clock, color: "text-purple-600", error: metricsRes.error },
    { name: "Communities Served", value: communitiesServed, icon: Target, color: "text-rose-600", error: metricsRes.error },
    { name: "Students Reached", value: studentsReached, icon: Activity, color: "text-emerald-600", error: metricsRes.error },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-forest-950">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Overview of GBT organization metrics and recent activities.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {stat.error ? (
                <div className="text-sm font-medium text-red-500 truncate" title={stat.error.message}>
                  {stat.value}: {stat.error.message}
                </div>
              ) : (
                <div className="text-2xl font-bold text-forest-950">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-forest-950">Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
              Chart placeholder: Applications Over Time
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-forest-950">Program Participation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
              Chart placeholder: Participation by Category
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

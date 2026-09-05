import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditAnnouncementPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");

  const { data: item, error } = await supabase.from("announcements").select("*").eq("id", id).single();
  if (error || !item) redirect("/admin/announcements");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/announcements" className="text-sm text-forest-600 hover:underline flex items-center mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Announcements
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-forest-950">Edit Announcement</h1>
      </div>
      <AnnouncementForm id={item.id} initialData={item} />
    </div>
  );
}

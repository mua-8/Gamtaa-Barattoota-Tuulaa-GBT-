import { AnnouncementForm } from "@/components/admin/announcement-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewAnnouncementPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/announcements" className="text-sm text-forest-600 hover:underline flex items-center mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Announcements
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-forest-950">Add Announcement</h1>
        <p className="text-muted-foreground">Create a new announcement.</p>
      </div>
      <AnnouncementForm />
    </div>
  );
}

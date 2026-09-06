import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Plus, Edit, CheckCircle, XCircle, Megaphone, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { extractAnnouncementImage } from "@/lib/announcements-util";

export default async function AnnouncementsPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "super_admin" && profile.role !== "admin")) redirect("/admin");

  const { data: items } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-forest-950">Announcements</h1>
          <p className="text-muted-foreground">Manage organization announcements and news updates.</p>
        </div>
        <Button asChild className="bg-forest-900 text-white hover:bg-forest-800">
          <Link href="/admin/announcements/new"><Plus className="mr-2 h-4 w-4" /> Add Announcement</Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/75">
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-[140px]">Date</TableHead>
              <TableHead className="w-[100px] text-center">Published</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items && items.length > 0 ? (
              items.map((item) => {
                const parsed = extractAnnouncementImage(item.content);
                const imageUrl = item.image_url || parsed.imageUrl;

                return (
                  <TableRow key={item.id} className="hover:bg-gray-50/50">
                    <TableCell>
                      {imageUrl ? (
                        <div className="h-10 w-14 overflow-hidden rounded-md border bg-gray-100">
                          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-10 w-14 items-center justify-center rounded-md border bg-forest-50 text-forest-600">
                          <Megaphone className="h-4 w-4" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-forest-950">
                      <div>
                        <span>{item.title}</span>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {parsed.cleanContent}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.is_published ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                          <XCircle className="h-3.5 w-3.5" /> Draft
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm" className="text-forest-700 hover:text-forest-900 hover:bg-forest-50">
                        <Link href={`/admin/announcements/${item.id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No announcements found. Click &quot;Add Announcement&quot; to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

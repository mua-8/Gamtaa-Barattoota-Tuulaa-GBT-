import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Plus, Edit, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function GalleryPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "super_admin") redirect("/admin");

  // Need to handle error gracefully if the table doesn't exist yet
  const { data: items, error } = await supabase.from("gallery_items").select("*").order("display_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-forest-950">Gallery</h1>
          <p className="text-muted-foreground">Manage images displayed in the public gallery.</p>
        </div>
        <Button asChild className="bg-forest-900 text-white hover:bg-forest-800">
          <Link href="/admin/gallery/new"><Plus className="mr-2 h-4 w-4" /> Add Image</Link>
        </Button>
      </div>
      
      {error && error.code === 'PGRST205' && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
          <strong>Database Schema Missing!</strong> The gallery_items table does not exist. Please run the `0004_gallery_schema.sql` migration in your Supabase SQL Editor.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items && items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="group relative rounded-xl border bg-white overflow-hidden shadow-sm">
              <div className="aspect-square bg-gray-100 relative">
                <img src={item.image_url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/admin/gallery/${item.id}/edit`}><Edit className="h-4 w-4 mr-1"/> Edit</Link>
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-sm truncate pr-2">{item.title || "Untitled"}</p>
                  {item.is_published ? <CheckCircle className="h-4 w-4 text-green-600 shrink-0" /> : <XCircle className="h-4 w-4 text-gray-300 shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">{item.category || "Uncategorized"}</p>
              </div>
            </div>
          ))
        ) : (
          !error && <div className="col-span-full h-24 flex items-center justify-center text-muted-foreground border rounded-xl border-dashed">No images in gallery.</div>
        )}
      </div>
    </div>
  );
}

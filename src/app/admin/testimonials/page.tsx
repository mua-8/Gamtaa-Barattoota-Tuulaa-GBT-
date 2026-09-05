import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Plus, Edit, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function TestimonialsPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "super_admin" && profile.role !== "admin")) redirect("/admin");

  const { data: items } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-forest-950">Testimonials</h1>
          <p className="text-muted-foreground">Manage public testimonials.</p>
        </div>
        <Button asChild className="bg-forest-900 text-white hover:bg-forest-800">
          <Link href="/admin/testimonials/new"><Plus className="mr-2 h-4 w-4" /> Add Testimonial</Link>
        </Button>
      </div>
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role / Org</TableHead>
              <TableHead className="text-center">Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items && items.length > 0 ? (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-forest-950">
                    <div className="flex items-center gap-3">
                      {item.photo_url ? <img src={item.photo_url} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center font-bold text-forest-600">{item.name.charAt(0)}</div>}
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell>{item.role} {item.organization ? `@ ${item.organization}` : ''}</TableCell>
                  <TableCell className="text-center">
                    {item.is_published ? <CheckCircle className="mx-auto h-5 w-5 text-green-600" /> : <XCircle className="mx-auto h-5 w-5 text-gray-300" />}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm" className="text-forest-600 hover:text-forest-900 hover:bg-forest-50">
                      <Link href={`/admin/testimonials/${item.id}/edit`}><Edit className="h-4 w-4" /><span className="sr-only">Edit</span></Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} className="h-24 text-center">No testimonials found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

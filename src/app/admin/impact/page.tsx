import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Plus, Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function ImpactPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "super_admin") redirect("/admin");

  const { data: items } = await supabase.from("impact_metrics").select("*").order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-forest-950">Impact Metrics</h1>
          <p className="text-muted-foreground">Manage organization impact statistics.</p>
        </div>
        <Button asChild className="bg-forest-900 text-white hover:bg-forest-800">
          <Link href="/admin/impact/new"><Plus className="mr-2 h-4 w-4" /> Add Metric</Link>
        </Button>
      </div>
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items && items.length > 0 ? (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-forest-950">{item.metric_label}</TableCell>
                  <TableCell className="text-gray-500 font-mono text-sm">{item.metric_key}</TableCell>
                  <TableCell className="font-bold text-lg">{item.metric_value}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm" className="text-forest-600 hover:text-forest-900 hover:bg-forest-50">
                      <Link href={`/admin/impact/${item.id}/edit`}><Edit className="h-4 w-4" /><span className="sr-only">Edit</span></Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} className="h-24 text-center">No impact metrics found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

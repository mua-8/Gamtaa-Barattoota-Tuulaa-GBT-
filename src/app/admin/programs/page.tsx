import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getPrograms } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteProgramButton } from "./delete-button";

export const metadata = {
  title: "Manage Programs | GBT Admin",
};

export default async function AdminProgramsPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");

  const programs = await getPrograms();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-forest-950">Programs</h1>
          <p className="mt-2 text-muted-foreground">
            Manage the community programs displayed on the website.
          </p>
        </div>
        <Button asChild className="bg-forest-900 text-white hover:bg-forest-800">
          <Link href="/admin/programs/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Program
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {programs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p>No programs found.</p>
            <Button asChild variant="link" className="mt-2 text-forest-700">
              <Link href="/admin/programs/new">Create your first program</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-forest-50 text-forest-900">
                <tr>
                  <th className="px-6 py-4 font-semibold">Title</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Order</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {programs.map((program) => (
                  <tr key={program.id} className="hover:bg-cream/50">
                    <td className="px-6 py-4 font-medium text-forest-950">
                      {program.title}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {program.category || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={program.status === 'draft' ? 'outline' : 'default'}
                        className={program.status !== 'draft' ? "bg-forest-700" : "text-muted-foreground"}
                      >
                        {program.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {program.display_order || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-forest-700 hover:text-forest-900">
                          <Link href={`/admin/programs/${program.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <DeleteProgramButton id={program.id} title={program.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

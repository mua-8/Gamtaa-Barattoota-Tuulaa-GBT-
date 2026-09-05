import type { Metadata } from "next";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Users, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Manage Students | GBT Admin",
};

export default async function AdminStudentsPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  // We fetch students with their profiles
  const { data: students } = await supabase
    .from("student_profiles")
    .select(`
      id,
      university,
      department,
      status,
      profiles (
        full_name,
        email,
        phone
      )
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-forest-950 flex items-center gap-3">
            <Users className="h-8 w-8 text-forest-700" />
            Students
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage volunteer accounts, view details, and handle account status.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students by name or email..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-forest-50 hover:bg-forest-50">
                <TableHead className="w-[300px] text-forest-900 font-semibold">Student</TableHead>
                <TableHead className="text-forest-900 font-semibold">University</TableHead>
                <TableHead className="text-forest-900 font-semibold">Department</TableHead>
                <TableHead className="text-forest-900 font-semibold">Status</TableHead>
                <TableHead className="text-right text-forest-900 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No students found.
                  </TableCell>
                </TableRow>
              ) : (
                students?.map((student: any) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="font-medium text-forest-950">
                        {student.profiles?.full_name || "Unknown"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {student.profiles?.email}
                      </div>
                    </TableCell>
                    <TableCell>{student.university}</TableCell>
                    <TableCell>{student.department}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={
                          student.status === "active" 
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" 
                            : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                        }
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm" className="text-forest-700">
                        <Link href={`/admin/students/${student.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

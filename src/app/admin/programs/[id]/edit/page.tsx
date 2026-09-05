import { notFound, redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ProgramForm } from "../../program-form";
import { getProgram } from "../../actions";

export const metadata = {
  title: "Edit Program | GBT Admin",
};

export default async function EditProgramPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");

  const program = await getProgram(id);

  if (!program) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ProgramForm initialData={program} />
    </div>
  );
}

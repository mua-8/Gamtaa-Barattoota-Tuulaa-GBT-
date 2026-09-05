import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Construction } from "lucide-react";

export default async function ContactContentPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="bg-forest-100 p-6 rounded-full text-forest-600 mb-4">
        <Construction className="h-16 w-16" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-forest-950">
        Contact Page Content
      </h1>
      <p className="text-lg text-muted-foreground max-w-md">
        This module is currently under development. Soon you will be able to edit contact page information here.
      </p>
    </div>
  );
}

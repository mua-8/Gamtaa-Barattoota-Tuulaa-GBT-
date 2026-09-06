import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteContent } from "@/lib/site-content";
import { ContactContentForm } from "./contact-form";
import { ORG } from "@/lib/site";

export const metadata = {
  title: "Manage Contact Page | GBT Admin",
};

export default async function ContactContentPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const defaultContent = {
    header: {
      eyebrow: "Contact",
      title: "We'd love to hear from you",
      description: "Whether you're a student who wants to serve, a school that wants a program, or a partner who wants to support us — this is the place to start.",
    },
    info: {
      address: ORG.address,
      email: ORG.email,
      phone: ORG.phone,
      officeHours: "Monday – Saturday, 8:30 – 17:30 (EAT)",
      responseTime: "We usually reply within two to three working days.",
    },
  };

  const initialData = await getSiteContent("contact", defaultContent);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-forest-950">
          Contact Page Content
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage the public contact information, organization address, telephone numbers, and office hours.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <ContactContentForm initialData={initialData} />
      </div>
    </div>
  );
}

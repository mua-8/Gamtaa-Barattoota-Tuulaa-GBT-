import type { Metadata } from "next";
import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Certificates",
  description: "Certificates issued for your verified community service.",
  robots: { index: false },
};

export default async function CertificatesPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: certificates } = await supabase
    .from("certificates")
    .select("*, programs(title)")
    .eq("student_id", user.id)
    .order("issued_at", { ascending: false });

  const items = certificates ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Recognition</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-forest-950">Certificates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Issued automatically for completed, verified service.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white py-16 text-center">
          <Award className="mx-auto h-9 w-9 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm text-muted-foreground">
            No certificates yet — complete a program and verify your hours to earn one.
          </p>
        </div>
      ) : (
        <ul className="grid gap-5 lg:grid-cols-2">
          {items.map((c) => (
            <li key={c.id} className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gold-100 text-gold-700">
                  <Award className="h-6 w-6" aria-hidden="true" />
                </span>
                <Badge className="border-transparent bg-forest-100 text-forest-800 hover:bg-forest-100 capitalize">
                  {c.revoked_at ? "revoked" : c.verification_status}
                </Badge>
              </div>
              <p className="mt-4 font-mono text-lg font-bold text-forest-950">
                {c.certificate_number}
              </p>
              <dl className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-foreground">Program</dt>
                  <dd>{c.programs?.title ?? "Community service"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-foreground">Service hours</dt>
                  <dd>{Number(c.service_hours ?? 0)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-foreground">Issued</dt>
                  <dd>
                    {new Date(c.issued_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

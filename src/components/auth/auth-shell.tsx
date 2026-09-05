import { AlertTriangle } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-cream py-16 sm:py-24">
      <div className="mx-auto flex w-full max-w-md flex-col px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600 whitespace-nowrap">
            Volunteer Portal
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-forest-950">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        {!isSupabaseConfigured && (
          <div
            role="status"
            className="mt-8 flex items-start gap-3 rounded-lg border border-gold-300 bg-gold-50 p-4 text-sm text-gold-800"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              Supabase environment variables are not set, so authentication is disabled in this
              preview. Copy <code className="font-semibold">.env.example</code> to{" "}
              <code className="font-semibold">.env.local</code> with your project credentials to
              enable it.
            </p>
          </div>
        )}
        <div className="mt-8 rounded-2xl border border-border bg-white p-8 shadow-md">
          {children}
        </div>
      </div>
    </section>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive"
    >
      {message}
    </p>
  );
}

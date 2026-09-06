import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Volunteer Login",
  description: "Sign in to your GBT volunteer account to apply and track your service.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

interface PageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const next = params.next ?? "/student";

  // Already signed in? Go straight to the appropriate portal.
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      // Only navigate to admin portal if explicitly requested via the admin portal link
      if (params.next && params.next.startsWith("/admin")) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile && (profile.role === "admin" || profile.role === "super_admin")) {
          redirect(params.next);
        }
      } else if (params.next && params.next.startsWith("/") && params.next !== "/login" && !params.next.startsWith("/admin")) {
        redirect(params.next);
      }
      redirect("/student/dashboard");
    }
  }
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to access your GBT volunteer activities and participation dashboard."
    >
      <LoginForm next={next} initialError={params.error} />
    </AuthShell>
  );
}

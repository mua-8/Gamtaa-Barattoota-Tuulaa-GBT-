import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your GBT volunteer account password.",
  alternates: { canonical: "/forgot-password" },
  robots: { index: false, follow: true },
};

interface PageProps {
  searchParams: Promise<{ step?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: PageProps) {
  const { step } = await searchParams;
  const updateMode = step === "update";
  return (
    <AuthShell
      title={updateMode ? "Choose a new password" : "Reset your password"}
      description={
        updateMode
          ? "You're signed in via your reset link. Set a new password below."
          : "Enter your account email and we'll send you a secure reset link."
      }
    >
      <ForgotPasswordForm updateMode={updateMode} />
    </AuthShell>
  );
}

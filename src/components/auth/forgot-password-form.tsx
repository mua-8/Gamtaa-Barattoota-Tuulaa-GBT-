"use client";

import { useState } from "react";
import { KeyRound, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthError } from "@/components/auth/auth-shell";
import {
  forgotPasswordAction,
  updatePasswordAction,
  type AuthResult,
} from "@/lib/actions/auth";

export function ForgotPasswordForm({ updateMode }: { updateMode: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(formData: FormData) {
    setBusy(true);
    setError(null);
    const result: AuthResult = updateMode
      ? await updatePasswordAction(formData)
      : await forgotPasswordAction(formData);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div role="status" className="space-y-4 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-forest-100 text-forest-800">
          <MailCheck className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="font-display text-xl font-bold text-forest-950">
          {updateMode ? "Password updated" : "Reset email sent"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {updateMode
            ? "Your password has been changed. You can now sign in with it."
            : "If an account exists for that address, a reset link is on its way. The link signs you in and returns you here to choose a new password."}
        </p>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-5">
      {error && <AuthError message={error} />}
      {updateMode ? (
        <div>
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1.5"
          />
        </div>
      ) : (
        <div>
          <Label htmlFor="reset-email">Email</Label>
          <Input
            id="reset-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1.5"
          />
        </div>
      )}
      <Button type="submit" disabled={busy} className="w-full bg-forest-800 text-white hover:bg-forest-700">
        <KeyRound className="h-4 w-4" aria-hidden="true" />
        {updateMode ? "Set New Password" : "Send Reset Link"}
      </Button>
    </form>
  );
}

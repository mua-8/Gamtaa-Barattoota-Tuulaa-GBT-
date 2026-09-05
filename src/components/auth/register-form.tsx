"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthError } from "@/components/auth/auth-shell";
import { registerAction, type AuthResult } from "@/lib/actions/auth";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  async function onSubmit(formData: FormData) {
    setBusy(true);
    setError(null);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (password !== confirm) {
      setError("Passwords do not match.");
      setBusy(false);
      return;
    }
    const result: AuthResult = await registerAction(formData);
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    if (result.needsVerification) {
      setNeedsVerification(true);
    }
    setBusy(false);
  }

  if (needsVerification) {
    return (
      <div role="status" className="space-y-4 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-forest-100 text-forest-800">
          <MailCheck className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="font-display text-xl font-bold text-forest-950">Check your email</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We sent you a confirmation link. Click it to verify your email, then continue your
          GBT application.
        </p>
        <Button asChild variant="outline" className="border-forest-300 text-forest-900 hover:bg-forest-50">
          <Link href="/login">Go to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-4">
      {error && <AuthError message={error} />}
      <div>
        <Label htmlFor="register-name">Full name</Label>
        <Input id="register-name" name="full_name" required autoComplete="name" className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="register-phone">Phone</Label>
        <Input
          id="register-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+251 9xx xxx xxx"
          className="mt-1.5"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="register-confirm">Confirm password</Label>
          <Input
            id="register-confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1.5"
          />
        </div>
      </div>
      <Button type="submit" disabled={busy} className="w-full bg-gold-500 text-forest-950 hover:bg-gold-400">
        <UserRound className="h-4 w-4" aria-hidden="true" />
        {busy ? "Creating account…" : "Create Account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already a member?{" "}
        <Link href="/login" className="font-bold text-forest-800 underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

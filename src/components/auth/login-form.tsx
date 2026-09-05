"use client";

import { useState } from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthError } from "@/components/auth/auth-shell";
import { loginAction, type AuthResult } from "@/lib/actions/auth";

export function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(formData: FormData) {
    setBusy(true);
    setError(null);
    const result: AuthResult = await loginAction(formData);
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
    }
    // On success the server action redirects.
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      {error && <AuthError message={error} />}
      <div>
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@university.edu.et"
          className="mt-1.5"
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-forest-700 underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="login-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1.5"
        />
      </div>
      <Button type="submit" disabled={busy} className="w-full bg-forest-800 text-white hover:bg-forest-700">
        <LogIn className="h-4 w-4" aria-hidden="true" />
        {busy ? "Signing in…" : "Sign In"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        New to GBT?{" "}
        <Link href="/register" className="font-bold text-forest-800 underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

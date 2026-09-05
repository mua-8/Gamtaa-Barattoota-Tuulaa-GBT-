"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePasswordAction } from "@/lib/actions/auth";

export function SettingsPasswordForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(formData: FormData) {
    setBusy(true);
    setMessage(null);
    if (String(formData.get("password") ?? "") !== String(formData.get("confirm") ?? "")) {
      setMessage({ kind: "err", text: "Passwords do not match." });
      setBusy(false);
      return;
    }
    const result = await updatePasswordAction(formData);
    setBusy(false);
    setMessage(
      result.ok
        ? { kind: "ok", text: "Password updated." }
        : { kind: "err", text: result.error }
    );
  }

  return (
    <form action={onSubmit} className="mt-4 space-y-4">
      {message && (
        <p
          role={message.kind === "err" ? "alert" : "status"}
          className={
            message.kind === "err"
              ? "rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive"
              : "rounded-lg border border-forest-200 bg-forest-50 px-4 py-3 text-sm font-semibold text-forest-800"
          }
        >
          {message.text}
        </p>
      )}
      <div>
        <Label htmlFor="set-pw">New password</Label>
        <Input id="set-pw" name="password" type="password" minLength={8} required autoComplete="new-password" className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="set-pw-confirm">Confirm new password</Label>
        <Input id="set-pw-confirm" name="confirm" type="password" minLength={8} required autoComplete="new-password" className="mt-1.5" />
      </div>
      <Button type="submit" disabled={busy} className="bg-forest-800 text-white hover:bg-forest-700">
        <KeyRound className="h-4 w-4" aria-hidden="true" />
        {busy ? "Updating…" : "Update Password"}
      </Button>
    </form>
  );
}

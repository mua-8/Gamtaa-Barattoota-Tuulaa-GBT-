"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UNIVERSITIES } from "@/lib/options";
import { submitTeamApplication } from "@/lib/actions/contact";

const ROLES = [
  "Program Facilitator",
  "Education Support",
  "Mentorship",
  "Communication & Media",
  "Logistics & Events",
  "Finance & Administration",
  "Anywhere I'm needed",
];

const selectClass =
  "mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-ring";

export function TeamForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(formData: FormData) {
    setBusy(true);
    setError(null);
    const result = await submitTeamApplication(formData);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div role="status" className="mx-auto max-w-md rounded-2xl border border-forest-200 bg-white p-10 text-center shadow-lg">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-forest-100 text-forest-700">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold text-forest-950">Thank you!</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your team application reached us. The coordination team will contact you within a week.
        </p>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-5 rounded-2xl border border-border bg-white p-6 shadow-md sm:p-10">
      {error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="t-name">Full name</Label>
          <Input id="t-name" name="full_name" required autoComplete="name" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="t-email">Email</Label>
          <Input id="t-email" name="email" type="email" required autoComplete="email" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="t-phone">Phone</Label>
          <Input id="t-phone" name="phone" type="tel" autoComplete="tel" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="t-uni">University / organization</Label>
          <select id="t-uni" name="university" required className={selectClass} defaultValue="">
            <option value="" disabled>Select…</option>
            {UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="t-dept">Department / profession</Label>
          <Input id="t-dept" name="department" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="t-role">Where would you like to help?</Label>
          <select id="t-role" name="preferred_role" required className={selectClass} defaultValue="">
            <option value="" disabled>Select…</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="t-motiv">Why do you want to join the team?</Label>
        <Textarea id="t-motiv" name="motivation" rows={4} required minLength={20} className="mt-1.5" />
      </div>
      <Button type="submit" disabled={busy} size="lg" className="w-full bg-forest-800 text-white hover:bg-forest-700 sm:w-auto">
        <Send className="h-4 w-4" aria-hidden="true" />
        {busy ? "Sending…" : "Send Team Application"}
      </Button>
    </form>
  );
}

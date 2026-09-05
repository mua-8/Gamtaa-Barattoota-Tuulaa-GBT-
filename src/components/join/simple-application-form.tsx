"use client";

import { useState } from "react";
import { BadgeCheck, MailCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Chips } from "@/components/student/chips";
import { SERVICE_AREAS, UNIVERSITIES, YEARS_OF_STUDY } from "@/lib/options";
import { submitSimpleApplication, type SimpleApplicationResult } from "@/lib/actions/student";

const selectClass =
  "mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-ring";

interface Props {
  signedInAs: string | null;
  initial: { fullName: string; phone: string; homeCommunity: string };
}

export function SimpleApplicationForm({ signedInAs, initial }: Props) {
  const [areas, setAreas] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimpleApplicationResult | null>(null);

  async function onSubmit(formData: FormData) {
    setBusy(true);
    setError(null);
    formData.set("areas", JSON.stringify(areas));
    const res = await submitSimpleApplication(formData);
    setBusy(false);
    if (!res.ok) {
      if ("needsVerification" in res && res.needsVerification) {
        setResult(res);
        return;
      }
      setError("error" in res ? res.error : "Something went wrong.");
      return;
    }
    setResult(res);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (result?.ok) {
    const app = result.application;
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-forest-200 bg-white p-10 text-center shadow-lg">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-forest-700">
          <BadgeCheck className="h-9 w-9" aria-hidden="true" />
        </span>
        <h2 className="mt-6 font-display text-3xl font-bold text-forest-950">
          Application Submitted Successfully
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Welcome to GBT! Your account is ready — sign in anytime to see your dashboard,
          join programs, and log service hours.
        </p>
        <dl className="mx-auto mt-8 max-w-sm space-y-3 rounded-xl bg-cream p-6 text-left text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="font-semibold text-foreground">Application number</dt>
            <dd className="font-mono text-base font-bold text-forest-900">{app.application_number}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="font-semibold text-foreground">Status</dt>
            <dd>
              <Badge className="border-transparent bg-gold-100 text-gold-800 hover:bg-gold-100">
                Pending Review
              </Badge>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="font-semibold text-foreground">Submitted</dt>
            <dd className="text-muted-foreground">
              {new Date(app.submitted_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </div>
    );
  }

  if (result && "needsVerification" in result) {
    return (
      <div role="status" className="mx-auto max-w-md rounded-2xl border border-forest-200 bg-white p-10 text-center shadow-lg">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-forest-100 text-forest-800">
          <MailCheck className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold text-forest-950">Check your email</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          We created your account. Verify your email, then sign in to finish your application.
        </p>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-6">
      {error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}

      {/* Account */}
      <section className="rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-lg font-bold text-forest-950">
          {signedInAs ? "Your account" : "1 · Create your account"}
        </h2>
        {signedInAs ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as <span className="font-semibold text-foreground">{signedInAs}</span> — your
            application will be attached to this account.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="a-email">Email</Label>
              <Input id="a-email" name="email" type="email" required autoComplete="email" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="a-password">Choose a password</Label>
              <Input id="a-password" name="password" type="password" minLength={8} required autoComplete="new-password" className="mt-1.5" />
            </div>
          </div>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="a-name">Full name</Label>
            <Input id="a-name" name="full_name" required defaultValue={initial.fullName} autoComplete="name" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="a-phone">Phone</Label>
            <Input id="a-phone" name="phone" type="tel" defaultValue={initial.phone} autoComplete="tel" placeholder="+251 9xx xxx xxx" className="mt-1.5" />
          </div>
        </div>
      </section>

      {/* Student details */}
      <section className="rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-lg font-bold text-forest-950">2 · Your studies</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="a-uni">University</Label>
            <select id="a-uni" name="university" required className={selectClass} defaultValue="">
              <option value="" disabled>Select…</option>
              {UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="a-year">Year of study</Label>
            <select id="a-year" name="year_of_study" required className={selectClass} defaultValue="">
              <option value="" disabled>Select…</option>
              {YEARS_OF_STUDY.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="a-dept">Department</Label>
            <Input id="a-dept" name="department" required placeholder="e.g. Civil Engineering" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="a-home">Home community</Label>
            <Input id="a-home" name="home_community" required defaultValue={initial.homeCommunity} placeholder="e.g. Tuulaa" className="mt-1.5" />
          </div>
        </div>
      </section>

      {/* Service */}
      <section className="rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-lg font-bold text-forest-950">3 · How you&apos;d like to help</h2>
        <div className="mt-4">
          <Chips
            options={SERVICE_AREAS}
            selected={areas}
            onToggle={(v) => setAreas((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))}
            label="Service areas"
          />
        </div>
        <div className="mt-4">
          <Label htmlFor="a-motiv">Why do you want to join GBT?</Label>
          <Textarea id="a-motiv" name="motivation" rows={4} required minLength={30} placeholder="A few sentences is enough…" className="mt-1.5" />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <label className="flex items-start gap-3 text-sm font-semibold text-foreground">
          <input type="checkbox" name="agreed" required className="mt-0.5 h-4 w-4 accent-forest-700" />
          I agree to the GBT participation guidelines: represent GBT with integrity, safeguard
          everyone I work with, and commit to the availability I provide.
        </label>
        <Button type="submit" disabled={busy} size="lg" className="mt-6 w-full bg-gold-500 text-forest-950 hover:bg-gold-400 sm:w-auto">
          <Send className="h-4 w-4" aria-hidden="true" />
          {busy ? "Submitting…" : "Submit Application"}
        </Button>
      </section>
    </form>
  );
}

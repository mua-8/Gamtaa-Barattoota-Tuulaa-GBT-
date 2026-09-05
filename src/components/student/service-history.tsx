"use client";

import { useMemo, useState } from "react";
import { PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitServiceRecord } from "@/lib/actions/student";
import { cn } from "@/lib/utils";

export interface ServiceRecordRow {
  id: string;
  date: string;
  activity: string;
  location: string | null;
  hours: number;
  verification_status: string;
  programs: { title: string } | null;
}

export interface ProgramOption {
  id: string;
  title: string;
}

const selectClass =
  "mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-ring";

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={cn(
        "border-transparent capitalize",
        status === "verified" && "bg-forest-600 text-white hover:bg-forest-600",
        status === "pending" && "bg-gold-400 text-forest-950 hover:bg-gold-400",
        status === "rejected" && "bg-destructive text-white hover:bg-destructive"
      )}
    >
      {status}
    </Badge>
  );
}

export function ServiceHistory({
  records,
  programOptions,
}: {
  records: ServiceRecordRow[];
  programOptions: ProgramOption[];
}) {
  const [programFilter, setProgramFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(
    () =>
      records.filter((r) => {
        if (programFilter !== "all" && r.programs?.title !== programFilter) return false;
        if (statusFilter !== "all" && r.verification_status !== statusFilter) return false;
        if (from && r.date < from) return false;
        if (to && r.date > to) return false;
        return true;
      }),
    [records, programFilter, statusFilter, from, to]
  );

  const totalVerified = filtered
    .filter((r) => r.verification_status === "verified")
    .reduce((s, r) => s + Number(r.hours), 0);

  async function onSubmit(formData: FormData) {
    setBusy(true);
    setMessage(null);
    const result = await submitServiceRecord(formData);
    setBusy(false);
    if (!result.ok) {
      setMessage({ kind: "err", text: result.error });
      return;
    }
    setMessage({ kind: "ok", text: "Service record submitted — pending verification." });
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted-foreground" role="status">
          {filtered.length} record{filtered.length === 1 ? "" : "s"} · {totalVerified} verified hours
        </p>
        <Button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="bg-forest-800 text-white hover:bg-forest-700"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          {showForm ? "Close form" : "Submit Service Record"}
        </Button>
      </div>

      {message && (
        <p
          role={message.kind === "err" ? "alert" : "status"}
          className={cn(
            "rounded-lg px-4 py-3 text-sm font-semibold",
            message.kind === "err"
              ? "border border-destructive/30 bg-destructive/5 text-destructive"
              : "border border-forest-200 bg-forest-50 text-forest-800"
          )}
        >
          {message.text}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit(new FormData(e.currentTarget));
          }}
          className="grid gap-4 rounded-xl border border-border bg-white p-6 shadow-sm sm:grid-cols-2"
        >
          <div>
            <Label htmlFor="sr-program">Program</Label>
            <select id="sr-program" name="program_id" className={selectClass}>
              <option value="">General (no program)</option>
              {programOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="sr-date">Date</Label>
            <Input id="sr-date" name="date" type="date" required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="sr-activity">Activity</Label>
            <Input id="sr-activity" name="activity" required placeholder="e.g. Taught grade 8 mathematics" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="sr-hours">Hours</Label>
            <Input id="sr-hours" name="hours" type="number" min={0.5} max={24} step={0.5} required className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="sr-location">Location</Label>
            <Input id="sr-location" name="location" className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="sr-desc">Description (optional)</Label>
            <Textarea id="sr-desc" name="description" rows={3} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy} className="bg-gold-500 text-forest-950 hover:bg-gold-400">
              {busy ? "Submitting…" : "Submit for Verification"}
            </Button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="grid gap-4 rounded-xl border border-border bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="f-program">Program</Label>
          <select id="f-program" value={programFilter} onChange={(e) => setProgramFilter(e.target.value)} className={selectClass}>
            <option value="all">All programs</option>
            {programOptions.map((p) => (
              <option key={p.title} value={p.title}>{p.title}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="f-status">Status</Label>
          <select id="f-status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <Label htmlFor="f-from">From</Label>
          <Input id="f-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="f-to">To</Label>
          <Input id="f-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1.5" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-cream text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th scope="col" className="px-5 py-3.5">Date</th>
              <th scope="col" className="px-5 py-3.5">Program</th>
              <th scope="col" className="px-5 py-3.5">Activity</th>
              <th scope="col" className="px-5 py-3.5">Hours</th>
              <th scope="col" className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                  No service records match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">{r.date}</td>
                  <td className="px-5 py-3.5 font-semibold text-foreground">
                    {r.programs?.title ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{r.activity}</td>
                  <td className="px-5 py-3.5 font-bold text-foreground tabular-nums">{r.hours}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={r.verification_status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Hours count toward your total only after the GBT team verifies them.
      </p>
    </div>
  );
}

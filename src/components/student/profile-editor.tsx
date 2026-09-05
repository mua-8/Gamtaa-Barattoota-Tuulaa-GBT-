"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CloudUpload, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Chips } from "@/components/student/chips";
import {
  GENDERS,
  SKILLS,
  UNIVERSITIES,
  YEARS_OF_STUDY,
} from "@/lib/options";
import {
  updateStudentProfile,
  type StudentProfilePayload,
} from "@/lib/actions/student";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface ProfileInitial {
  userId: string;
  fullName: string;
  phone: string;
  avatarUrl: string | null;
  studentProfile: {
    gender: string | null;
    date_of_birth: string | null;
    current_location: string | null;
    home_community: string | null;
    university: string | null;
    faculty: string | null;
    department: string | null;
    year_of_study: string | null;
    student_id: string | null;
    bio: string | null;
    availability_start: string | null;
    availability_end: string | null;
  } | null;
  skills: string[];
}

const selectClass =
  "mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-ring";

export function ProfileEditor({ initial }: { initial: ProfileInitial }) {
  const sp = initial.studentProfile;
  const [form, setForm] = useState({
    fullName: initial.fullName,
    phone: initial.phone,
    gender: sp?.gender ?? "",
    dateOfBirth: sp?.date_of_birth ?? "",
    currentLocation: sp?.current_location ?? "",
    homeCommunity: sp?.home_community ?? "",
    university: sp?.university ?? "",
    faculty: sp?.faculty ?? "",
    department: sp?.department ?? "",
    yearOfStudy: sp?.year_of_study ?? "",
    studentId: sp?.student_id ?? "",
    bio: sp?.bio ?? "",
    availabilityStart: sp?.availability_start ?? "",
    availabilityEnd: sp?.availability_end ?? "",
  });
  const [skills, setSkills] = useState<string[]>(initial.skills);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initial.avatarUrl);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    let avatarUrl = initial.avatarUrl;
    if (avatar) {
      const client = getSupabaseBrowserClient();
      if (client) {
        const path = `${initial.userId}/${Date.now()}-${avatar.name.replace(/[^a-z0-9.]+/gi, "-")}`;
        const { error } = await client.storage.from("avatars").upload(path, avatar, {
          upsert: true,
          cacheControl: "3600",
        });
        if (!error) {
          avatarUrl = client.storage.from("avatars").getPublicUrl(path).data.publicUrl;
        }
      }
    }

    const payload: StudentProfilePayload = {
      ...form,
      avatarUrl,
      skills,
    };
    const result = await updateStudentProfile(payload);
    setSaving(false);
    if (!result.ok) {
      setMessage({ kind: "err", text: result.error });
      return;
    }
    setMessage({ kind: "ok", text: "Profile saved." });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
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

      <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-forest-950">Personal information</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="p-name">Full name</Label>
            <Input id="p-name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="p-phone">Phone</Label>
            <Input id="p-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="p-gender">Gender</Label>
            <select id="p-gender" value={form.gender} onChange={(e) => set("gender", e.target.value)} className={selectClass}>
              <option value="">Select…</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="p-dob">Date of birth</Label>
            <Input id="p-dob" type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="p-current">Current location</Label>
            <Input id="p-current" value={form.currentLocation} onChange={(e) => set("currentLocation", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="p-home">Home community</Label>
            <Input id="p-home" value={form.homeCommunity} onChange={(e) => set("homeCommunity", e.target.value)} className="mt-1.5" />
          </div>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border border-border bg-forest-100">
            {avatarPreview && (
              <Image src={avatarPreview} alt="Avatar preview" fill sizes="64px" className="object-cover" />
            )}
          </div>
          <Button type="button" variant="outline" size="sm" className="border-forest-300 text-forest-900 hover:bg-forest-50" onClick={() => fileRef.current?.click()}>
            <CloudUpload className="h-4 w-4" aria-hidden="true" />
            Change avatar
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="Profile photo"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setAvatar(f);
              if (f) setAvatarPreview(URL.createObjectURL(f));
            }}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-forest-950">University</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="p-uni">University</Label>
            <select id="p-uni" value={form.university} onChange={(e) => set("university", e.target.value)} className={selectClass}>
              <option value="">Select…</option>
              {UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="p-year">Year of study</Label>
            <select id="p-year" value={form.yearOfStudy} onChange={(e) => set("yearOfStudy", e.target.value)} className={selectClass}>
              <option value="">Select…</option>
              {YEARS_OF_STUDY.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="p-faculty">Faculty</Label>
            <Input id="p-faculty" value={form.faculty} onChange={(e) => set("faculty", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="p-dept">Department</Label>
            <Input id="p-dept" value={form.department} onChange={(e) => set("department", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="p-sid">Student ID</Label>
            <Input id="p-sid" value={form.studentId} onChange={(e) => set("studentId", e.target.value)} className="mt-1.5" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-forest-950">Skills</h2>
        <div className="mt-4">
          <Chips options={SKILLS} selected={skills} onToggle={(v) =>
            setSkills((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))
          } label="Skills" />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-forest-950">Bio & availability</h2>
        <div className="mt-4 space-y-5">
          <div>
            <Label htmlFor="p-bio">Bio</Label>
            <Textarea id="p-bio" rows={4} value={form.bio} onChange={(e) => set("bio", e.target.value)} className="mt-1.5" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="p-avail-start">Available from</Label>
              <Input id="p-avail-start" type="date" value={form.availabilityStart} onChange={(e) => set("availabilityStart", e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="p-avail-end">Available until</Label>
              <Input id="p-avail-end" type="date" value={form.availabilityEnd} onChange={(e) => set("availabilityEnd", e.target.value)} className="mt-1.5" />
            </div>
          </div>
        </div>
      </section>

      <Button type="submit" disabled={saving} className="bg-forest-800 text-white hover:bg-forest-700">
        <Save className="h-4 w-4" aria-hidden="true" />
        {saving ? "Saving…" : "Save Changes"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Application status, verification status, and service hours are managed by the GBT team
        and cannot be edited here.
      </p>
    </form>
  );
}

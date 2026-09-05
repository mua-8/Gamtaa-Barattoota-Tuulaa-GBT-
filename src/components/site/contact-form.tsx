"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactMessage } from "@/lib/actions/contact";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY: FormState = { name: "", email: "", subject: "", message: "" };

type Errors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): Errors {
  const errors: Errors = {};
  if (form.name.trim().length < 2) errors.name = "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = "Please enter a valid email address.";
  if (form.subject.trim().length < 3) errors.subject = "Please add a short subject.";
  if (form.message.trim().length < 10)
    errors.message = "Please write at least 10 characters so we can help you well.";
  return errors;
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((errs) => ({ ...errs, [field]: undefined }));
    };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setBusy(true);
    const formData = new FormData();
    formData.set("name", form.name);
    formData.set("email", form.email);
    formData.set("subject", form.subject);
    formData.set("message", form.message);
    const result = await submitContactMessage(formData);
    setBusy(false);

    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    setDemoMode(result.demo);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        role="status"
        className="flex h-full flex-col items-center justify-center rounded-xl border border-forest-200 bg-forest-50 p-10 text-center"
      >
        <CheckCircle2 className="h-12 w-12 text-forest-600" aria-hidden="true" />
        <h3 className="mt-4 font-display text-xl font-bold text-forest-950">Message sent!</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Thank you, {form.name.split(" ")[0]}. Our team reads every message and will reply to{" "}
          <span className="font-semibold text-foreground">{form.email}</span> within a few days.
        </p>
        {demoMode && (
          <p className="mt-3 rounded-lg border border-gold-300 bg-gold-50 px-4 py-2 text-xs font-semibold text-gold-800">
            Demo mode: Supabase is not connected, so this message was not stored yet.
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          className="mt-6 border-forest-300 text-forest-900 hover:bg-forest-100"
          onClick={() => {
            setForm(EMPTY);
            setSubmitted(false);
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {serverError && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive"
        >
          {serverError}
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={set("name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            placeholder="Your full name"
            className="mt-1.5"
          />
          {errors.name && (
            <p id="contact-name-error" className="mt-1.5 text-xs font-semibold text-destructive">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            placeholder="you@example.com"
            className="mt-1.5"
          />
          {errors.email && (
            <p id="contact-email-error" className="mt-1.5 text-xs font-semibold text-destructive">
              {errors.email}
            </p>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="contact-subject">Subject</Label>
        <Input
          id="contact-subject"
          name="subject"
          value={form.subject}
          onChange={set("subject")}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? "contact-subject-error" : undefined}
          placeholder="Volunteering, partnerships, questions…"
          className="mt-1.5"
        />
        {errors.subject && (
          <p id="contact-subject-error" className="mt-1.5 text-xs font-semibold text-destructive">
            {errors.subject}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={6}
          value={form.message}
          onChange={set("message")}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          placeholder="Tell us how we can help, or how you'd like to get involved."
          className="mt-1.5"
        />
        {errors.message && (
          <p id="contact-message-error" className="mt-1.5 text-xs font-semibold text-destructive">
            {errors.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={busy}
        className="w-full bg-forest-800 text-white hover:bg-forest-700 sm:w-auto"
      >
        {busy ? "Sending…" : "Send Message"}
        <Send className="h-4 w-4" aria-hidden="true" />
      </Button>
    </form>
  );
}

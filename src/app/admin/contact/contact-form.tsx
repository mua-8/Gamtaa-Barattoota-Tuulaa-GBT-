"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateContactContent } from "./actions";

export function ContactContentForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setSuccess(false);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      header: {
        eyebrow: formData.get("header.eyebrow"),
        title: formData.get("header.title"),
        description: formData.get("header.description"),
      },
      info: {
        address: formData.get("info.address"),
        email: formData.get("info.email"),
        phone: formData.get("info.phone"),
        officeHours: formData.get("info.officeHours"),
        responseTime: formData.get("info.responseTime"),
      },
    };

    try {
      const res = await updateContactContent(data);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch {
      setError("An unexpected error occurred while saving.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md bg-emerald-500/15 p-4 text-sm text-emerald-700 font-medium">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          Contact page content updated successfully and published live!
        </div>
      )}

      {/* Header Section */}
      <div className="space-y-4 rounded-lg border bg-forest-50/40 p-5">
        <h2 className="text-lg font-bold text-forest-950">Page Header</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-foreground">Eyebrow</label>
            <input
              name="header.eyebrow"
              defaultValue={initialData.header?.eyebrow}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-ring"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground">Title</label>
            <input
              name="header.title"
              defaultValue={initialData.header?.title}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-ring"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground">Description</label>
            <textarea
              name="header.description"
              defaultValue={initialData.header?.description}
              rows={2}
              className="mt-1 flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-ring"
              required
            />
          </div>
        </div>
      </div>

      {/* Contact Details Section */}
      <div className="space-y-4 rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-forest-950">Organization Contact Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground">Official Location & Address</label>
            <input
              name="info.address"
              defaultValue={initialData.info?.address}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-ring"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground">Official Email Address</label>
            <input
              name="info.email"
              type="email"
              defaultValue={initialData.info?.email}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-ring"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground">Official Phone Number</label>
            <input
              name="info.phone"
              defaultValue={initialData.info?.phone}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-ring"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground">Office Working Hours</label>
            <input
              name="info.officeHours"
              defaultValue={initialData.info?.officeHours}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-ring"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground">Response Timeframe Notice</label>
            <input
              name="info.responseTime"
              defaultValue={initialData.info?.responseTime}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-ring"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-forest-900 text-white hover:bg-forest-800"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Contact Content
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

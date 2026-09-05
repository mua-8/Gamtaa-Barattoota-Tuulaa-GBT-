"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Image as ImageIcon, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { upsertProgram } from "./actions";

export function ProgramForm({ initialData }: { initialData?: any }) {
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
    
    // Process content json (e.g. rich text / full description)
    const content = {
      fullDescription: formData.get("content.fullDescription"),
    };

    const data = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      title: formData.get("title"),
      slug: formData.get("slug") || undefined, // undefined to let action generate it if empty
      short_description: formData.get("short_description"),
      category: formData.get("category"),
      status: formData.get("status"),
      display_order: parseInt(formData.get("display_order") as string) || 0,
      image_url: formData.get("image_url"),
      content,
    };

    try {
      const res = await upsertProgram(data);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        router.push("/admin/programs");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save program.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="-ml-3 text-muted-foreground">
          <Link href="/admin/programs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Programs
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border bg-white shadow-sm p-6 sm:p-8">
        <div>
          <h2 className="text-xl font-bold text-forest-950 mb-6 border-b pb-4">
            {initialData ? "Edit Program" : "Create Program"}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Title */}
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-semibold">Program Title *</label>
            <input 
              name="title" 
              defaultValue={initialData?.title} 
              className="w-full rounded-md border p-2.5" 
              required 
              placeholder="e.g. Tuulaa Summer School"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-semibold">URL Slug (Optional)</label>
            <input 
              name="slug" 
              defaultValue={initialData?.slug} 
              className="w-full rounded-md border p-2.5 bg-gray-50" 
              placeholder="e.g. tuulaa-summer-school (leave blank to auto-generate)"
            />
            <p className="text-xs text-muted-foreground">Used for the public URL: /programs/your-slug</p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Category</label>
            <input 
              name="category" 
              defaultValue={initialData?.category} 
              className="w-full rounded-md border p-2.5" 
              placeholder="e.g. Education"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Status *</label>
            <select 
              name="status" 
              defaultValue={initialData?.status || "draft"} 
              className="w-full rounded-md border p-2.5 bg-white"
              required
            >
              <option value="draft">Draft (Hidden)</option>
              <option value="upcoming">Published (Upcoming)</option>
              <option value="active">Published (Active)</option>
              <option value="completed">Published (Completed)</option>
            </select>
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Display Order</label>
            <input 
              type="number"
              name="display_order" 
              defaultValue={initialData?.display_order || 0} 
              className="w-full rounded-md border p-2.5" 
            />
            <p className="text-xs text-muted-foreground">Lower numbers appear first.</p>
          </div>

          {/* Image URL */}
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-semibold">Featured Image URL</label>
            <div className="flex gap-2">
              <input 
                name="image_url" 
                defaultValue={initialData?.image_url} 
                className="flex-1 rounded-md border p-2.5" 
                placeholder="/images/programs/example.jpg"
              />
            </div>
            <p className="text-xs text-muted-foreground">Enter the path to the image or a full URL.</p>
          </div>

          {/* Short Description */}
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-semibold">Short Description (Card summary)</label>
            <textarea 
              name="short_description" 
              defaultValue={initialData?.short_description || initialData?.description} 
              rows={2} 
              className="w-full rounded-md border p-2.5" 
            />
          </div>

          {/* Full Description */}
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-semibold">Full Description (Program page)</label>
            <textarea 
              name="content.fullDescription" 
              defaultValue={initialData?.content?.fullDescription || initialData?.description} 
              rows={6} 
              className="w-full rounded-md border p-2.5" 
            />
            <p className="text-xs text-muted-foreground">Supports basic text for the detailed program view.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end pt-6 border-t mt-8">
          <Button type="submit" size="lg" disabled={isPending} className="w-full sm:w-auto bg-forest-900 text-white hover:bg-forest-800">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {initialData ? "Save Changes" : "Create Program"}
          </Button>
        </div>
      </form>
    </div>
  );
}

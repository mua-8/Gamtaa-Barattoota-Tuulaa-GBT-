"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateAboutContent } from "./actions";

export function AboutContentForm({ initialData }: { initialData: any }) {
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
      whoWeAre: {
        eyebrow: formData.get("whoWeAre.eyebrow"),
        title: formData.get("whoWeAre.title"),
        paragraph1: formData.get("whoWeAre.paragraph1"),
        paragraph2: formData.get("whoWeAre.paragraph2"),
        paragraph3: formData.get("whoWeAre.paragraph3"),
      },
      ourStory: {
        eyebrow: formData.get("ourStory.eyebrow"),
        title: formData.get("ourStory.title"),
        description: formData.get("ourStory.description"),
      },
      philosophy: {
        quote: formData.get("philosophy.quote"),
        author: formData.get("philosophy.author"),
      },
      visionMission: {
        eyebrow: formData.get("visionMission.eyebrow"),
        title: formData.get("visionMission.title"),
        visionText: formData.get("visionMission.visionText"),
        missionText: formData.get("visionMission.missionText"),
      },
      coreValues: {
        eyebrow: formData.get("coreValues.eyebrow"),
        title: formData.get("coreValues.title"),
      },
    };

    try {
      const res = await updateAboutContent(data);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save content.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* Header */}
      <section>
        <h2 className="text-xl font-bold text-forest-900 border-b pb-2 mb-4">Page Header</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold">Eyebrow</label>
            <input name="header.eyebrow" defaultValue={initialData.header.eyebrow} className="w-full rounded-md border p-2" required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold">Title</label>
            <input name="header.title" defaultValue={initialData.header.title} className="w-full rounded-md border p-2" required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold">Description</label>
            <textarea name="header.description" defaultValue={initialData.header.description} rows={3} className="w-full rounded-md border p-2" required />
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section>
        <h2 className="text-xl font-bold text-forest-900 border-b pb-2 mb-4">Who We Are Section</h2>
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Eyebrow</label>
            <input name="whoWeAre.eyebrow" defaultValue={initialData.whoWeAre.eyebrow} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Title</label>
            <input name="whoWeAre.title" defaultValue={initialData.whoWeAre.title} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Paragraph 1</label>
            <textarea name="whoWeAre.paragraph1" defaultValue={initialData.whoWeAre.paragraph1} rows={3} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Paragraph 2</label>
            <textarea name="whoWeAre.paragraph2" defaultValue={initialData.whoWeAre.paragraph2} rows={3} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Paragraph 3</label>
            <textarea name="whoWeAre.paragraph3" defaultValue={initialData.whoWeAre.paragraph3} rows={3} className="w-full rounded-md border p-2" />
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section>
        <h2 className="text-xl font-bold text-forest-900 border-b pb-2 mb-4">Our Story Timeline Section</h2>
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Eyebrow</label>
            <input name="ourStory.eyebrow" defaultValue={initialData.ourStory.eyebrow} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Title</label>
            <input name="ourStory.title" defaultValue={initialData.ourStory.title} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Description</label>
            <textarea name="ourStory.description" defaultValue={initialData.ourStory.description} rows={2} className="w-full rounded-md border p-2" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Note: Timeline items themselves are part of the platform's core code architecture and are currently managed separately.</p>
        </div>
      </section>

      {/* Philosophy */}
      <section>
        <h2 className="text-xl font-bold text-forest-900 border-b pb-2 mb-4">Philosophy Quote</h2>
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Quote Text</label>
            <textarea name="philosophy.quote" defaultValue={initialData.philosophy.quote} rows={3} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Author / Attribution</label>
            <input name="philosophy.author" defaultValue={initialData.philosophy.author} className="w-full rounded-md border p-2" />
          </div>
        </div>
      </section>
      
      {/* Vision & Mission */}
      <section>
        <h2 className="text-xl font-bold text-forest-900 border-b pb-2 mb-4">Vision & Mission</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold">Eyebrow</label>
            <input name="visionMission.eyebrow" defaultValue={initialData.visionMission.eyebrow} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold">Title</label>
            <input name="visionMission.title" defaultValue={initialData.visionMission.title} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold">Vision Text</label>
            <textarea name="visionMission.visionText" defaultValue={initialData.visionMission.visionText} rows={3} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold">Mission Text</label>
            <textarea name="visionMission.missionText" defaultValue={initialData.visionMission.missionText} rows={3} className="w-full rounded-md border p-2" />
          </div>
        </div>
      </section>
      
      {/* Core Values */}
      <section>
        <h2 className="text-xl font-bold text-forest-900 border-b pb-2 mb-4">Core Values Section</h2>
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Eyebrow</label>
            <input name="coreValues.eyebrow" defaultValue={initialData.coreValues.eyebrow} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Title</label>
            <input name="coreValues.title" defaultValue={initialData.coreValues.title} className="w-full rounded-md border p-2" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Note: Value grid items are part of the platform's core code architecture and are currently managed separately.</p>
        </div>
      </section>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle className="h-5 w-5" />
          Content updated successfully.
        </div>
      )}

      <div className="flex justify-end pt-6 border-t">
        <Button type="submit" size="lg" disabled={isPending} className="w-full sm:w-auto bg-forest-900 text-white hover:bg-forest-800">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Content
        </Button>
      </div>
    </form>
  );
}

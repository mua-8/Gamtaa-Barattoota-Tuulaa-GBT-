"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateHomeContent } from "./actions";

export function HomeContentForm({ initialData }: { initialData: any }) {
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
      hero: {
        eyebrow: formData.get("hero.eyebrow"),
        heading: formData.get("hero.heading"),
        description: formData.get("hero.description"),
        primaryButtonText: formData.get("hero.primaryButtonText"),
        primaryButtonLink: formData.get("hero.primaryButtonLink"),
        secondaryButtonText: formData.get("hero.secondaryButtonText"),
        secondaryButtonLink: formData.get("hero.secondaryButtonLink"),
      },
      whatWeDo: {
        eyebrow: formData.get("whatWeDo.eyebrow"),
        title: formData.get("whatWeDo.title"),
        description: formData.get("whatWeDo.description"),
      },
      howItWorks: {
        eyebrow: formData.get("howItWorks.eyebrow"),
        title: formData.get("howItWorks.title"),
        description: formData.get("howItWorks.description"),
      },
      featuredPrograms: {
        eyebrow: formData.get("featuredPrograms.eyebrow"),
        title: formData.get("featuredPrograms.title"),
      },
      philosophy: {
        quote: formData.get("philosophy.quote"),
        author: formData.get("philosophy.author"),
      },
      cta: {
        title: formData.get("cta.title"),
        description: formData.get("cta.description"),
        primaryButtonText: formData.get("cta.primaryButtonText"),
        primaryButtonLink: formData.get("cta.primaryButtonLink"),
        secondaryButtonText: formData.get("cta.secondaryButtonText"),
        secondaryButtonLink: formData.get("cta.secondaryButtonLink"),
      },
    };

    try {
      const res = await updateHomeContent(data);
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
      {/* Hero Section */}
      <section>
        <h2 className="text-xl font-bold text-forest-900 border-b pb-2 mb-4">Hero Section</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold">Eyebrow (Small Top Text)</label>
            <input name="hero.eyebrow" defaultValue={initialData.hero.eyebrow} className="w-full rounded-md border p-2" required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold">Main Heading</label>
            <textarea name="hero.heading" defaultValue={initialData.hero.heading} rows={2} className="w-full rounded-md border p-2" required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold">Description</label>
            <textarea name="hero.description" defaultValue={initialData.hero.description} rows={3} className="w-full rounded-md border p-2" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Primary Button Text</label>
            <input name="hero.primaryButtonText" defaultValue={initialData.hero.primaryButtonText} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Primary Button Link</label>
            <input name="hero.primaryButtonLink" defaultValue={initialData.hero.primaryButtonLink} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Secondary Button Text</label>
            <input name="hero.secondaryButtonText" defaultValue={initialData.hero.secondaryButtonText} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Secondary Button Link</label>
            <input name="hero.secondaryButtonLink" defaultValue={initialData.hero.secondaryButtonLink} className="w-full rounded-md border p-2" />
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section>
        <h2 className="text-xl font-bold text-forest-900 border-b pb-2 mb-4">What We Do Section</h2>
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Eyebrow</label>
            <input name="whatWeDo.eyebrow" defaultValue={initialData.whatWeDo.eyebrow} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Title</label>
            <input name="whatWeDo.title" defaultValue={initialData.whatWeDo.title} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Description</label>
            <textarea name="whatWeDo.description" defaultValue={initialData.whatWeDo.description} rows={2} className="w-full rounded-md border p-2" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section>
        <h2 className="text-xl font-bold text-forest-900 border-b pb-2 mb-4">How It Works Section</h2>
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Eyebrow</label>
            <input name="howItWorks.eyebrow" defaultValue={initialData.howItWorks.eyebrow} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Title</label>
            <input name="howItWorks.title" defaultValue={initialData.howItWorks.title} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Description</label>
            <textarea name="howItWorks.description" defaultValue={initialData.howItWorks.description} rows={2} className="w-full rounded-md border p-2" />
          </div>
        </div>
      </section>

      {/* Featured Programs */}
      <section>
        <h2 className="text-xl font-bold text-forest-900 border-b pb-2 mb-4">Featured Programs Section</h2>
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Eyebrow</label>
            <input name="featuredPrograms.eyebrow" defaultValue={initialData.featuredPrograms.eyebrow} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Title</label>
            <input name="featuredPrograms.title" defaultValue={initialData.featuredPrograms.title} className="w-full rounded-md border p-2" />
          </div>
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

      {/* CTA */}
      <section>
        <h2 className="text-xl font-bold text-forest-900 border-b pb-2 mb-4">Bottom Call To Action</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold">Title</label>
            <input name="cta.title" defaultValue={initialData.cta.title} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold">Description</label>
            <textarea name="cta.description" defaultValue={initialData.cta.description} rows={3} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Primary Button Text</label>
            <input name="cta.primaryButtonText" defaultValue={initialData.cta.primaryButtonText} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Primary Button Link</label>
            <input name="cta.primaryButtonLink" defaultValue={initialData.cta.primaryButtonLink} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Secondary Button Text</label>
            <input name="cta.secondaryButtonText" defaultValue={initialData.cta.secondaryButtonText} className="w-full rounded-md border p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Secondary Button Link</label>
            <input name="cta.secondaryButtonLink" defaultValue={initialData.cta.secondaryButtonLink} className="w-full rounded-md border p-2" />
          </div>
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

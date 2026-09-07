"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAnnouncement, updateAnnouncement, deleteAnnouncement, type AnnouncementPayload } from "@/lib/actions/announcements";
import { extractAnnouncementImage } from "@/lib/announcements-util";
import { useRouter } from "next/navigation";
import { Loader2, Image as ImageIcon, Trash2 } from "lucide-react";

export function AnnouncementForm({ initialData, id }: { initialData?: Partial<AnnouncementPayload> & { id?: string }; id?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract initial image if stored in image_url or embedded in content
  const initialParsed = extractAnnouncementImage(initialData?.content || "");
  const [imageUrl, setImageUrl] = useState<string>(initialData?.image_url || initialParsed.imageUrl || "");

  const [formData, setFormData] = useState<AnnouncementPayload>({
    title: initialData?.title || "",
    content: initialParsed.cleanContent || "",
    is_published: initialData?.is_published ?? true,
    image_url: initialData?.image_url || initialParsed.imageUrl || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `announcement_${Math.random().toString(36).substring(2, 11)}_${Date.now()}.${fileExt}`;

      const { getSupabaseBrowserClient } = await import("@/lib/supabase/client");
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase client not initialized");

      const { error: uploadError } = await supabase.storage
        .from("program-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("program-images")
        .getPublicUrl(fileName);

      setImageUrl(data.publicUrl);
    } catch (err: any) {
      setError("Image upload failed: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: AnnouncementPayload = {
        ...formData,
        image_url: imageUrl.trim() || undefined,
      };

      let res;
      if (id) res = await updateAnnouncement(id, payload);
      else res = await createAnnouncement(payload);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/admin/announcements");
        router.refresh();
      }
    } catch (err: any) {
      if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
        return;
      }
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    setLoading(true);
    try {
      const res = await deleteAnnouncement(id);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/admin/announcements");
        router.refresh();
      }
    } catch (err: any) {
      if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
        return;
      }
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 sm:p-8 rounded-xl border shadow-sm">
      {error && (
        <div className="text-red-700 bg-red-50 p-4 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="font-semibold text-forest-950">
          Announcement Title *
        </Label>
        <Input 
          id="title" 
          name="title" 
          value={formData.title} 
          onChange={handleChange} 
          placeholder="e.g. 2026 Summer Volunteer Orientation Announced"
          required 
        />
      </div>

      {/* Image Upload & Preview */}
      <div className="space-y-3 rounded-lg border bg-gray-50/70 p-4">
        <Label className="font-semibold text-forest-950 flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-forest-700" />
          Announcement Image (Optional)
        </Label>

        {imageUrl && (
          <div className="relative h-48 w-full overflow-hidden rounded-lg border bg-white shadow-sm">
            <img 
              src={imageUrl} 
              alt="Announcement preview" 
              className="h-full w-full object-cover" 
            />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/75 px-3 py-1 text-xs text-white hover:bg-black transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground block">
            Select image from your device:
          </label>
          <input 
            type="file" 
            accept="image/*"
            disabled={uploading}
            onChange={handleImageUpload}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-forest-100 file:text-forest-800 hover:file:bg-forest-200 cursor-pointer border rounded-md p-1.5 bg-white"
          />
        </div>

        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-medium text-muted-foreground block">
            Or paste image URL:
          </label>
          <Input 
            value={imageUrl} 
            onChange={(e) => setImageUrl(e.target.value)} 
            placeholder="https://... or /images/..." 
            className="bg-white text-xs sm:text-sm"
          />
        </div>

        {uploading && (
          <p className="flex items-center gap-2 text-xs font-medium text-forest-700">
            <Loader2 className="h-4 w-4 animate-spin" /> Uploading image to storage...
          </p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content" className="font-semibold text-forest-950">
          Announcement Content / Message *
        </Label>
        <Textarea 
          id="content" 
          name="content" 
          value={formData.content} 
          onChange={handleChange} 
          rows={7} 
          placeholder="Write the full announcement details here..."
          required 
        />
        <p className="text-xs text-muted-foreground">
          Line breaks and paragraphs will be preserved when displayed on the website.
        </p>
      </div>

      {/* Publish Toggle */}
      <div className="flex items-center space-x-2 pt-2">
        <input 
          type="checkbox" 
          id="is_published" 
          name="is_published" 
          checked={formData.is_published} 
          onChange={handleChange} 
          className="w-4 h-4 text-forest-600 rounded cursor-pointer" 
        />
        <Label htmlFor="is_published" className="cursor-pointer font-medium text-forest-950">
          Published (Visible on public website)
        </Label>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        {id ? (
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
            Delete
          </Button>
        ) : <div />}
        <Button type="submit" disabled={loading || uploading} className="bg-forest-900 text-white hover:bg-forest-800">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {id ? "Save Changes" : "Create Announcement"}
        </Button>
      </div>
    </form>
  );
}

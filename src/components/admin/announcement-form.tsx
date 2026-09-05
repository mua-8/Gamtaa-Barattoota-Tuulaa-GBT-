"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAnnouncement, updateAnnouncement, deleteAnnouncement, type AnnouncementPayload } from "@/lib/actions/announcements";
import { Loader2 } from "lucide-react";

export function AnnouncementForm({ initialData, id }: { initialData?: Partial<AnnouncementPayload>; id?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<AnnouncementPayload>({
    title: initialData?.title || "",
    content: initialData?.content || "",
    is_published: initialData?.is_published ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let res;
      if (id) res = await updateAnnouncement(id, formData);
      else res = await createAnnouncement(formData);
      if (res?.error) setError(res.error);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Delete this announcement?")) return;
    setLoading(true);
    const res = await deleteAnnouncement(id);
    if (res?.error) setError(res.error);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg border shadow-sm">
      {error && <div className="text-red-500 bg-red-50 p-3 rounded">{error}</div>}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content *</Label>
        <Textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={6} required />
      </div>
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="is_published" name="is_published" checked={formData.is_published} onChange={handleChange} className="w-4 h-4 text-forest-600 rounded" />
        <Label htmlFor="is_published">Published</Label>
      </div>
      <div className="flex justify-between pt-4 border-t">
        {id ? <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>Delete</Button> : <div></div>}
        <Button type="submit" disabled={loading} className="bg-forest-900 text-white">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {id ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

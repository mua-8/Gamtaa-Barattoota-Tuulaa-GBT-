"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createGalleryItem, updateGalleryItem, deleteGalleryItem, type GalleryPayload } from "@/lib/actions/gallery";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function GalleryForm({ initialData, id }: { initialData?: Partial<GalleryPayload>; id?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<GalleryPayload>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    image_url: initialData?.image_url || "",
    category: initialData?.category || "",
    display_order: initialData?.display_order || 0,
    is_published: initialData?.is_published ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else if (type === "number") {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      setError("An image is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let res;
      if (id) res = await updateGalleryItem(id, formData);
      else res = await createGalleryItem(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/admin/gallery");
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
    if (!confirm("Delete this image?")) return;
    setLoading(true);
    try {
      const res = await deleteGalleryItem(id);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/admin/gallery");
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg border shadow-sm">
      {error && <div className="text-red-500 bg-red-50 p-3 rounded">{error}</div>}
      
      <div className="space-y-2">
        <Label htmlFor="image_upload">Upload Image *</Label>
        <div className="flex flex-col gap-4">
          {formData.image_url && (
            <img src={formData.image_url} alt="Preview" className="h-40 w-full object-cover rounded border bg-gray-50" />
          )}
          <Input 
            id="image_upload" 
            type="file" 
            accept="image/*"
            disabled={uploading}
            onChange={async (e) => {
              if (!e.target.files || e.target.files.length === 0) return;
              setUploading(true);
              setError(null);
              try {
                const file = e.target.files[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
                const { getSupabaseBrowserClient } = await import("@/lib/supabase/client");
                const supabase = getSupabaseBrowserClient();
                if (!supabase) throw new Error("Supabase client not initialized");
                const { error: uploadError } = await supabase.storage.from('gallery').upload(fileName, file);
                if (uploadError) throw uploadError;
                const { data } = supabase.storage.from('gallery').getPublicUrl(fileName);
                setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
              } catch (err: any) {
                setError("Upload failed: " + err.message);
              } finally {
                setUploading(false);
              }
            }} 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title (Optional)</Label>
          <Input id="title" name="title" value={formData.title} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" value={formData.category} onChange={handleChange} />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={2} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="display_order">Display Order</Label>
          <Input id="display_order" name="display_order" type="number" value={formData.display_order} onChange={handleChange} />
        </div>
        <div className="flex items-center space-x-2 pt-8">
          <input type="checkbox" id="is_published" name="is_published" checked={formData.is_published} onChange={handleChange} className="w-4 h-4 text-forest-600 rounded" />
          <Label htmlFor="is_published">Published</Label>
        </div>
      </div>
      
      <div className="flex justify-between pt-4 border-t">
        {id ? <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>Delete</Button> : <div></div>}
        <Button type="submit" disabled={loading || uploading} className="bg-forest-900 text-white">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {id ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

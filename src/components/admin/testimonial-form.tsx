"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createTestimonial, updateTestimonial, deleteTestimonial, type TestimonialPayload } from "@/lib/actions/testimonials";

export function TestimonialForm({ initialData, id }: { initialData?: Partial<TestimonialPayload>; id?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<TestimonialPayload>({
    name: initialData?.name || "",
    role: initialData?.role || "",
    organization: initialData?.organization || "",
    photo_url: initialData?.photo_url || "",
    quote: initialData?.quote || "",
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
      if (id) res = await updateTestimonial(id, formData);
      else res = await createTestimonial(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/admin/testimonials");
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
    if (!confirm("Delete this testimonial?")) return;
    setLoading(true);
    try {
      const res = await deleteTestimonial(id);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/admin/testimonials");
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
        <Label htmlFor="name">Name *</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role/Title</Label>
          <Input id="role" name="role" value={formData.role} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organization">Organization</Label>
          <Input id="organization" name="organization" value={formData.organization} onChange={handleChange} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="quote">Quote *</Label>
        <Textarea id="quote" name="quote" value={formData.quote} onChange={handleChange} rows={4} required />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="image_upload">Photo</Label>
        <div className="flex items-center gap-4">
          {formData.photo_url && (
            <img src={formData.photo_url} alt="Preview" className="h-16 w-16 object-cover rounded-full border bg-gray-50" />
          )}
          <div className="flex-1">
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

                  const { error: uploadError } = await supabase.storage
                    .from('avatars') // using avatars bucket for testimonials
                    .upload(fileName, file);

                  if (uploadError) throw uploadError;

                  const { data } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);

                  setFormData(prev => ({ ...prev, photo_url: data.publicUrl }));
                } catch (err: any) {
                  setError("Image upload failed: " + err.message);
                } finally {
                  setUploading(false);
                }
              }} 
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 pt-4">
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

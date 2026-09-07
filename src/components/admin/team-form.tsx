"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTeamMember, updateTeamMember, deleteTeamMember, type TeamMemberPayload } from "@/lib/actions/team";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function TeamForm({ initialData, id }: { initialData?: Partial<TeamMemberPayload>; id?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<TeamMemberPayload>({
    name: initialData?.name || "",
    position: initialData?.position || "",
    photo_url: initialData?.photo_url || "",
    university: initialData?.university || "",
    department: initialData?.department || "",
    education_level: initialData?.education_level || "Undergraduate",
    is_active: initialData?.is_active ?? true,
    display_order: initialData?.display_order || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      if (id) {
        res = await updateTeamMember(id, formData);
      } else {
        res = await createTeamMember(formData);
      }
      
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/admin/team");
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
    if (!confirm("Are you sure you want to delete this team member?")) return;
    
    setLoading(true);
    try {
      const res = await deleteTeamMember(id);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/admin/team");
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
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="position">Position / Title *</Label>
          <Input id="position" name="position" value={formData.position} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="university">University</Label>
          <Input id="university" name="university" value={formData.university} onChange={handleChange} placeholder="e.g. Addis Ababa University" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input id="department" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Computer Science" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="education_level">Education Level</Label>
        <select 
          id="education_level" 
          name="education_level" 
          value={formData.education_level} 
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="Undergraduate">Undergraduate</option>
          <option value="Graduate">Graduate</option>
          <option value="Alumni">Alumni</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="image_upload">Profile Image</Label>
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
                    .from('team-photos')
                    .upload(fileName, file);

                  if (uploadError) throw uploadError;

                  const { data } = supabase.storage
                    .from('team-photos')
                    .getPublicUrl(fileName);

                  setFormData(prev => ({ ...prev, photo_url: data.publicUrl }));
                } catch (err: any) {
                  setError("Image upload failed: " + err.message);
                } finally {
                  setUploading(false);
                }
              }} 
            />
            <p className="text-xs text-muted-foreground mt-1">Upload a square photo (JPG, PNG). Max 2MB.</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="display_order">Display Order</Label>
          <Input id="display_order" name="display_order" type="number" value={formData.display_order} onChange={handleChange} />
        </div>
        
        <div className="flex items-center space-x-2 pt-8">
          <input 
            type="checkbox" 
            id="is_active" 
            name="is_active" 
            checked={formData.is_active} 
            onChange={handleChange} 
            className="w-4 h-4 text-forest-600 rounded" 
          />
          <Label htmlFor="is_active">Active (Visible)</Label>
        </div>
      </div>
      
      <div className="flex justify-between pt-4 border-t">
        {id ? (
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
            Delete
          </Button>
        ) : (
          <div></div>
        )}
        <Button type="submit" disabled={loading} className="bg-forest-900 text-white">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {id ? "Update Member" : "Create Member"}
        </Button>
      </div>
    </form>
  );
}

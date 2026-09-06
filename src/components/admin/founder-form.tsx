"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveFounder, deleteTeamMember, type FounderPayload } from "@/lib/actions/team";
import { Loader2, Upload, Trash2, Eye, EyeOff } from "lucide-react";

interface FounderFormProps {
  initialData?: Partial<FounderPayload>;
  id?: string;
}

export function FounderForm({ initialData, id }: FounderFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FounderPayload>({
    id: id || initialData?.id,
    name: initialData?.name || "",
    position: initialData?.position || "Founder",
    photo_url: initialData?.photo_url || "",
    intro: initialData?.intro || "",
    bio: initialData?.bio || "",
    university: initialData?.university || "",
    department: initialData?.department || "",
    education_level: initialData?.education_level || "Graduate",
    is_active: initialData?.is_active ?? true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `founder-${Date.now()}.${fileExt}`;

      const { getSupabaseBrowserClient } = await import("@/lib/supabase/client");
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase client not initialized");

      const { error: uploadError } = await supabase.storage
        .from("team-photos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("team-photos")
        .getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, photo_url: data.publicUrl }));
    } catch (err: any) {
      setError("Image upload failed: " + (err.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please enter the founder's name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await saveFounder(formData);
      if (res?.error) setError(res.error);
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the founder profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const targetId = id || formData.id;
    if (!targetId) return;
    if (!confirm("Are you sure you want to delete this founder profile?")) return;

    setLoading(true);
    const res = await deleteTeamMember(targetId);
    if (res?.error) setError(res.error);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Row 1: Name and Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-forest-950 font-bold">Founder Full Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Muaz Mohammed"
            required
            className="border-forest-200 focus-visible:ring-forest-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position" className="text-forest-950 font-bold">Title / Role *</Label>
          <Input
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="e.g. Founder or Founder & President"
            required
            className="border-forest-200 focus-visible:ring-forest-600"
          />
        </div>
      </div>

      {/* Row 2: Photo Upload */}
      <div className="space-y-3 rounded-lg border border-forest-100 bg-forest-50/40 p-4">
        <Label className="text-forest-950 font-bold">Founder Profile Photo</Label>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {formData.photo_url ? (
            <div className="relative group shrink-0">
              <img
                src={formData.photo_url}
                alt="Founder Preview"
                className="h-28 w-28 object-cover rounded-xl border-2 border-gold-500 shadow-md bg-white"
              />
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, photo_url: "" }))}
                className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700 transition-colors"
                title="Remove photo"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="h-28 w-28 shrink-0 flex items-center justify-center rounded-xl border-2 border-dashed border-forest-300 bg-white text-forest-400">
              <Upload className="h-8 w-8" />
            </div>
          )}

          <div className="flex-1 w-full space-y-2">
            <Input
              id="founder_image_file"
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleFileUpload}
              className="bg-white border-forest-200"
            />
            <p className="text-xs text-forest-700">
              Upload a high-quality portrait photo (JPG, PNG, WebP).
            </p>
            <div className="pt-1">
              <Label htmlFor="photo_url" className="text-xs text-muted-foreground">Or direct image URL:</Label>
              <Input
                id="photo_url"
                name="photo_url"
                value={formData.photo_url || ""}
                onChange={handleChange}
                placeholder="https://..."
                className="text-xs h-8 bg-white border-forest-200 mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Short Introduction */}
      <div className="space-y-2">
        <Label htmlFor="intro" className="text-forest-950 font-bold">
          Short Introduction / Vision Quote
        </Label>
        <Input
          id="intro"
          name="intro"
          value={formData.intro || ""}
          onChange={handleChange}
          placeholder="e.g. Dedicated to transforming university education into lifelong community service."
          className="border-forest-200"
        />
        <p className="text-xs text-muted-foreground">
          A prominent 1-2 sentence statement displayed alongside the founder's portrait.
        </p>
      </div>

      {/* Row 4: Full Biography */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-forest-950 font-bold">
          Biography / About Text *
        </Label>
        <Textarea
          id="bio"
          name="bio"
          rows={6}
          value={formData.bio || ""}
          onChange={handleChange}
          placeholder="Write the founder's story, background, mission, and the founding philosophy of Gamtaa Barattoota Tuulaa..."
          className="border-forest-200 leading-relaxed"
        />
      </div>

      {/* Row 5: University & Department (Optional) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
        <div className="space-y-2">
          <Label htmlFor="university">University (Optional)</Label>
          <Input
            id="university"
            name="university"
            value={formData.university || ""}
            onChange={handleChange}
            placeholder="e.g. Haramaya University"
            className="border-forest-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department / Field of Study (Optional)</Label>
          <Input
            id="department"
            name="department"
            value={formData.department || ""}
            onChange={handleChange}
            placeholder="e.g. Software Engineering / Computer Science"
            className="border-forest-200"
          />
        </div>
      </div>

      {/* Row 6: Publication Status Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-forest-50/50 border border-forest-100">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-forest-950">Publish on Public Website</span>
            {formData.is_active ? (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-bold bg-green-100 text-green-800">
                <Eye className="h-3 w-3" /> Published
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-bold bg-gray-100 text-gray-700">
                <EyeOff className="h-3 w-3" /> Draft / Hidden
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            When enabled, the Founder section appears prominently on the public Our Team page.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-900"></div>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-5 border-t border-gray-100">
        {(id || formData.id) ? (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Founder Profile
          </Button>
        ) : (
          <div />
        )}

        <Button
          type="submit"
          disabled={loading || uploading}
          className="bg-gold-500 text-forest-950 hover:bg-gold-400 font-bold px-7"
        >
          {(loading || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Founder Profile
        </Button>
      </div>
    </form>
  );
}

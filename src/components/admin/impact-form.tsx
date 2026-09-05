"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createImpact, updateImpact, deleteImpact, type ImpactPayload } from "@/lib/actions/impact";
import { Loader2 } from "lucide-react";

export function ImpactForm({ initialData, id }: { initialData?: Partial<ImpactPayload>; id?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ImpactPayload>({
    metric_key: initialData?.metric_key || "",
    metric_value: initialData?.metric_value || 0,
    metric_label: initialData?.metric_label || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === "number") {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
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
      if (id) res = await updateImpact(id, formData);
      else res = await createImpact(formData);
      if (res?.error) setError(res.error);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Delete this metric?")) return;
    setLoading(true);
    const res = await deleteImpact(id);
    if (res?.error) setError(res.error);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg border shadow-sm">
      {error && <div className="text-red-500 bg-red-50 p-3 rounded">{error}</div>}
      <div className="space-y-2">
        <Label htmlFor="metric_label">Label *</Label>
        <Input id="metric_label" name="metric_label" value={formData.metric_label} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="metric_key">Key (unique) *</Label>
        <Input id="metric_key" name="metric_key" value={formData.metric_key} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="metric_value">Value *</Label>
        <Input id="metric_value" name="metric_value" type="number" value={formData.metric_value} onChange={handleChange} required />
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

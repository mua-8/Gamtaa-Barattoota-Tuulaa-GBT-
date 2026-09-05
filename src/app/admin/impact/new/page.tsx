import { ImpactForm } from "@/components/admin/impact-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewImpactPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/impact" className="text-sm text-forest-600 hover:underline flex items-center mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Impact Metrics
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-forest-950">Add Metric</h1>
      </div>
      <ImpactForm />
    </div>
  );
}

import { TestimonialForm } from "@/components/admin/testimonial-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewTestimonialPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/testimonials" className="text-sm text-forest-600 hover:underline flex items-center mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Testimonials
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-forest-950">Add Testimonial</h1>
      </div>
      <TestimonialForm />
    </div>
  );
}

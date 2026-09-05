import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ORG } from "@/lib/site";
import { CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ certificateNumber: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { certificateNumber } = await params;
  return {
    title: `Verify Certificate ${certificateNumber} | ${ORG.name}`,
    description: `Official verification page for ${ORG.name} certificates.`,
  };
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { certificateNumber } = await params;
  const supabase = await getSupabaseServerClient();
  
  if (!supabase) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h1 className="text-3xl font-display font-bold text-forest-950">System Unavailable</h1>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          We are unable to connect to the verification system right now. Please try again later.
        </p>
      </div>
    );
  }

  // Use the admin client if needed to bypass RLS for public verification
  // But wait, certificates might have RLS allowing public read?
  // Let's check RLS on certificates:
  // certificates: owner + admins read; issued by admins/service role.
  // Wait, if it's restricted, we must use getSupabaseAdminClient to read it publicly!
  
  // To avoid circular dependency or client errors, let's fetch it securely.
  // Wait, getSupabaseAdminClient is server-only, which is fine here (Server Component).
  const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const adminClient = getSupabaseAdminClient();
  
  if (!adminClient) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h1 className="text-3xl font-display font-bold text-forest-950">Verification Unavailable</h1>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          The verification system is not properly configured.
        </p>
      </div>
    );
  }

  const { data: certificate, error } = await adminClient
    .from("certificates")
    .select(`
      *,
      profiles(full_name),
      programs(title)
    `)
    .eq("certificate_number", certificateNumber)
    .single();

  if (error || !certificate) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-cream px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg border-t-4 border-red-500">
          <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-display font-bold text-gray-900">Certificate Not Found</h1>
          <p className="mt-3 text-gray-600">
            We could not find a certificate matching the number:
            <br />
            <span className="font-mono text-gray-900 font-semibold mt-1 inline-block">{certificateNumber}</span>
          </p>
          <div className="mt-8">
            <Button asChild className="w-full bg-forest-900 hover:bg-forest-800">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (certificate.revoked_at) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-cream px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg border-t-4 border-amber-500">
          <AlertTriangle className="mx-auto h-16 w-16 text-amber-500 mb-4" />
          <h1 className="text-2xl font-display font-bold text-gray-900">Certificate Revoked</h1>
          <p className="mt-3 text-gray-600">
            This certificate has been officially revoked by {ORG.name}.
          </p>
          <div className="mt-6 text-sm text-gray-500">
            <p><strong>Certificate Number:</strong> {certificate.certificate_number}</p>
            <p className="mt-1"><strong>Revoked on:</strong> {new Date(certificate.revoked_at).toLocaleDateString()}</p>
          </div>
          <div className="mt-8">
            <Button asChild className="w-full bg-forest-900 hover:bg-forest-800">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg border-t-4 border-green-500 relative overflow-hidden">
        
        {/* Background seal/watermark */}
        <div className="absolute -right-16 -top-16 opacity-5 pointer-events-none">
          <CheckCircle2 className="h-64 w-64 text-green-700" />
        </div>

        <div className="text-center relative z-10">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-display font-bold text-gray-900">Certificate Verified</h1>
          <p className="mt-2 text-green-700 font-medium bg-green-50 inline-block px-3 py-1 rounded-full text-sm border border-green-200">
            Official Document
          </p>
        </div>

        <div className="mt-8 space-y-4 text-left relative z-10">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipient Name</h3>
            <p className="mt-1 text-lg font-medium text-gray-900">
              {certificate.profiles?.full_name || "Unknown Student"}
            </p>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Program</h3>
            <p className="mt-1 text-base text-gray-900">
              {certificate.programs?.title || "Community Service Program"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Hours</h3>
              <p className="mt-1 text-base font-medium text-gray-900">
                {certificate.service_hours} hours
              </p>
            </div>
            
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Issue Date</h3>
              <p className="mt-1 text-base font-medium text-gray-900">
                {new Date(certificate.issued_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Certificate Number</h3>
            <p className="mt-1 font-mono text-sm text-gray-700">
              {certificate.certificate_number}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center relative z-10">
          <p className="text-xs text-gray-500 mb-6">
            This digital verification confirms that the individual named above successfully completed the stated service hours as part of {ORG.name}.
          </p>
          <Button asChild variant="outline" className="w-full border-forest-200 text-forest-800 hover:bg-forest-50">
            <Link href="/">Back to {ORG.name}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

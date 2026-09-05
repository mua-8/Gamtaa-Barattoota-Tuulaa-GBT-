"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-xl font-display font-bold text-gray-900">Something went wrong!</h2>
      <p className="mt-2 text-sm text-gray-500 max-w-md">
        We encountered an unexpected error while loading this page. Our team has been notified.
      </p>
      <div className="mt-6">
        <Button onClick={() => reset()} className="bg-forest-900 hover:bg-forest-800">
          Try again
        </Button>
      </div>
    </div>
  );
}

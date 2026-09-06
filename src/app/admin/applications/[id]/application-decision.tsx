"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateApplicationStatus } from "../actions";

interface ApplicationDecisionProps {
  applicationId: string;
  currentStatus: string;
}

export function ApplicationDecision({ applicationId, currentStatus }: ApplicationDecisionProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleStatusChange(newStatus: "approved" | "rejected" | "under_review") {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await updateApplicationStatus(applicationId, newStatus);
      if (res?.error) {
        setError(res.error);
      } else {
        setStatus(newStatus);
        setSuccessMessage(
          newStatus === "approved"
            ? "Application approved successfully!"
            : newStatus === "rejected"
            ? "Application marked as rejected."
            : "Application marked as under review."
        );
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  const getBadge = () => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20">
            <XCircle className="mr-1.5 h-3.5 w-3.5" /> Rejected
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/20">
            <Clock className="mr-1.5 h-3.5 w-3.5" /> Under Review
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
            <Clock className="mr-1.5 h-3.5 w-3.5" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Status</span>
        {getBadge()}
      </div>

      {successMessage && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 flex items-center gap-2 border border-green-200">
          <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2 pt-1">
        <Button
          type="button"
          onClick={() => handleStatusChange("approved")}
          disabled={loading || status === "approved"}
          className="w-full bg-green-700 hover:bg-green-800 text-white font-medium shadow-sm transition-all"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          {status === "approved" ? "Application Approved" : "Approve Application"}
        </Button>

        <Button
          type="button"
          onClick={() => handleStatusChange("under_review")}
          disabled={loading || status === "under_review"}
          variant="outline"
          className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 font-medium"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Clock className="h-4 w-4 mr-2" />
          )}
          Mark Under Review
        </Button>

        <Button
          type="button"
          onClick={() => handleStatusChange("rejected")}
          disabled={loading || status === "rejected"}
          variant="outline"
          className="w-full border-red-300 text-red-700 hover:bg-red-50 font-medium"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4 mr-2" />
          )}
          Reject Application
        </Button>
      </div>
    </div>
  );
}

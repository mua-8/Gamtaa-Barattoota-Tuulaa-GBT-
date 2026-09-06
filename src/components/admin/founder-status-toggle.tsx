"use client";

import { useState } from "react";
import { toggleFounderStatus } from "@/lib/actions/team";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FounderStatusToggle({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(isActive);

  const handleToggle = async () => {
    setLoading(true);
    const nextState = !active;
    const res = await toggleFounderStatus(id, nextState);
    if (res?.ok) {
      setActive(nextState);
    }
    setLoading(false);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className="text-xs font-semibold gap-1.5 border-forest-200 hover:bg-forest-50"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : active ? (
        <>
          <EyeOff className="h-3.5 w-3.5 text-amber-600" />
          Unpublish
        </>
      ) : (
        <>
          <Eye className="h-3.5 w-3.5 text-green-600" />
          Publish
        </>
      )}
    </Button>
  );
}

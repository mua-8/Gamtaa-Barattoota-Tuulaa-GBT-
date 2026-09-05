"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProgram } from "./actions";

export function DeleteProgramButton({ id, title }: { id: string; title: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    await deleteProgram(id);
    setIsDeleting(false);
    setShowConfirm(false);
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-600 font-medium">Delete?</span>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleDelete}
          disabled={isDeleting}
          className="h-8 text-xs"
        >
          {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Yes"}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="h-8 text-xs"
        >
          No
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
      onClick={() => setShowConfirm(true)}
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Delete {title}</span>
    </Button>
  );
}

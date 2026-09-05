"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";

export function SignOutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="outline" size="sm" className="border-forest-300 text-forest-900 hover:bg-forest-50">
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sign Out
      </Button>
    </form>
  );
}

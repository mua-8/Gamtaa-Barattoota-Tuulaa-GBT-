import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Exclude static assets, icons, service workers, and images from middleware
    "/((?!_next/static|_next/image|favicon.ico|manifest|sw.js|icons/|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};

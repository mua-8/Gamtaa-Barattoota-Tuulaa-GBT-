import { redirect } from "next/navigation";

/** The Phase 2 overview was superseded by the Phase 3 dashboard. */
export default function StudentIndexPage() {
  redirect("/student/dashboard");
}

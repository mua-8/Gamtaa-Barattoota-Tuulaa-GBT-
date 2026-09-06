import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { ProgramExplorer } from "@/components/site/program-explorer";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ProgramStatus } from "@/lib/data/programs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Explore GBT programs: free summer education, mentorship, digital literacy, community service, tolerance and peace, and youth development.",
  alternates: { canonical: "/programs" },
};

export default async function ProgramsPage() {
  const supabase = await getSupabaseServerClient();
  let dbPrograms = [];
  
  if (supabase) {
    const { data } = await supabase
      .from("programs")
      .select("*")
      .neq("status", "draft")
      .order("created_at", { ascending: false });
      
    if (data) dbPrograms = data;
  }

  // Map database format to expected UI format
  const mappedPrograms = dbPrograms.map((p) => {
    // Map status nicely
    let uiStatus: ProgramStatus = "Active";
    if (p.status === "upcoming") uiStatus = "Upcoming";
    if (p.status === "completed") uiStatus = "Completed";

    let img = p.image_url;
    if (!img || img.includes("default") || !img.includes("real")) {
      if (p.slug?.includes("summer") || p.slug?.includes("education")) img = "/images/programs/summer-school-real.jpg";
      else if (p.slug?.includes("bridge") || p.slug?.includes("mentorship")) img = "/images/programs/mentorship-real.jpg";
      else if (p.slug?.includes("digital") || p.slug?.includes("literacy")) img = "/images/programs/digital-literacy-real.jpg";
      else if (p.slug?.includes("green") || p.slug?.includes("roots") || p.slug?.includes("service")) img = "/images/programs/community-service-real.jpg";
      else if (p.slug?.includes("tolerance") || p.slug?.includes("peace")) img = "/images/programs/tolerance-real.jpg";
      else if (p.slug?.includes("leader") || p.slug?.includes("youth")) img = "/images/programs/mentorship-real.jpg";
      else img = "/images/programs/summer-school-real.jpg";
    }

    return {
      slug: p.slug,
      title: p.title,
      category: p.category || "General",
      status: uiStatus,
      image: img,
      imageAlt: p.title,
      shortDescription: p.short_description || p.description || "",
      description: p.content?.fullDescription ? [p.content.fullDescription] : (p.description ? [p.description] : []),
      objectives: p.objectives || [],
      location: p.location || "Tuulaa Region",
      date: p.start_date ? new Date(p.start_date).toLocaleDateString() : "Ongoing",
      participants: p.target_audience || "Open to community",
    };
  });

  return (
    <>
      <PageHeader
        eyebrow="Our Programs"
        title="Education, service, and opportunity in action"
        description="Every program is designed and delivered by university student volunteers together with the communities they serve. Search, filter, and explore what we do."
      />
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProgramExplorer initialPrograms={mappedPrograms} />
        </div>
      </section>
    </>
  );
}

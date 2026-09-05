import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AboutContentForm } from "./about-form";
import { ORG } from "@/lib/site";

export const metadata = {
  title: "Manage About Page | GBT Admin",
};

export default async function AdminAboutPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");

  // Fetch about page content
  const { data } = await supabase
    .from("site_content")
    .select("content")
    .eq("page_slug", "about")
    .single();

  const defaultContent = {
    header: {
      eyebrow: "About GBT",
      title: "Students who remember where they came from",
      description: "Gamtaa Barattoota Tuulaa is a community of university students who transform the opportunities they received into meaningful service for the communities that raised them.",
    },
    whoWeAre: {
      eyebrow: "Who We Are",
      title: "A bridge between the university and the village",
      paragraph1: "Gamtaa Barattoota Tuulaa — “the association of Tuulaa students” — was created by university students who noticed a simple gap: every summer, thousands of young people return home with knowledge, energy, and time, while the students behind them need exactly those things.",
      paragraph2: "We exist to connect the two. Our volunteers teach free summer classes, mentor secondary students, run digital literacy labs, organize community service, and lead tolerance and youth empowerment initiatives across Oromia.",
      paragraph3: "We are non-political, non-profit, and open to every university student who shares our belief that education carries a responsibility to give back.",
    },
    ourStory: {
      eyebrow: "Our Story",
      title: "One year in the life of GBT",
      description: "The same journey repeats every year — and every year it reaches more students and more communities.",
    },
    philosophy: {
      quote: "“Education is not only an opportunity to improve one's own life; it is also a responsibility to contribute to the community that made that opportunity possible.”",
      author: "Our Philosophy",
    },
    visionMission: {
      eyebrow: "Vision & Mission",
      title: "Where we are going, and how we get there",
      visionText: "To build a generation of educated, responsible, skilled, and community-minded university students who transform knowledge into meaningful social impact.",
      missionText: "To mobilize university students to contribute their knowledge, skills, and time to the development of their communities through free education, mentorship, community service, tolerance initiatives, and youth empowerment.",
    },
    coreValues: {
      eyebrow: "Core Values",
      title: "The principles behind every program",
    },
  };

  const initialData = data?.content ? { ...defaultContent, ...data.content } : defaultContent;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-forest-950">About Page Content</h1>
        <p className="mt-2 text-muted-foreground">
          Manage the text displayed on the public About page. Changes will be live immediately after saving.
        </p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm p-6">
        <AboutContentForm initialData={initialData} />
      </div>
    </div>
  );
}

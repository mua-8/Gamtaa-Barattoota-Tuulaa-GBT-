import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { HomeContentForm } from "./home-form";

export const metadata = {
  title: "Manage Home Page | GBT Admin",
};

export default async function AdminHomePage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");

  // Fetch home page content
  const { data } = await supabase
    .from("site_content")
    .select("content")
    .eq("page_slug", "home")
    .single();

  const defaultContent = {
    hero: {
      eyebrow: "A student-led community movement",
      heading: "From Education to Service, From Students to Community Builders.",
      description: "Gamtaa Barattoota Tuulaa brings university students together to transform the opportunities they receive into meaningful service for their communities.",
      primaryButtonText: "Join GBT",
      primaryButtonLink: "/join",
      secondaryButtonText: "Explore Our Programs",
      secondaryButtonLink: "/programs",
    },
    whatWeDo: {
      eyebrow: "What We Do",
      title: "Six ways students give back",
      description: "Every GBT initiative turns something a student learned at university into something a child, a school, or a whole community can use.",
    },
    howItWorks: {
      eyebrow: "How GBT Works",
      title: "A simple cycle that changes two lives at once",
      description: "Every volunteer walks the same path: they learned, they returned, they served — and their community felt it.",
    },
    featuredPrograms: {
      eyebrow: "Featured Programs",
      title: "Where our volunteers are serving now",
    },
    philosophy: {
      quote: "“Education is not only an opportunity to improve one's own life; it is also a responsibility to contribute to the community that made that opportunity possible.”",
      author: "GBT Philosophy",
    },
    cta: {
      title: "Your community is waiting for what you've learned.",
      description: "Join hundreds of university students who spend their holidays teaching, mentoring, and building. One summer of service can change a child's whole story — and yours.",
      primaryButtonText: "Join GBT",
      primaryButtonLink: "/join",
      secondaryButtonText: "Contact Us",
      secondaryButtonLink: "/contact",
    },
  };

  const initialData = data?.content ? { ...defaultContent, ...data.content } : defaultContent;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-forest-950">Home Page Content</h1>
        <p className="mt-2 text-muted-foreground">
          Manage the text and links displayed on the public Home page. Changes will be live immediately after saving.
        </p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm p-6">
        <HomeContentForm initialData={initialData} />
      </div>
    </div>
  );
}

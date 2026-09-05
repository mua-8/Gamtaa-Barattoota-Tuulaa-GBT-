import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle, GraduationCap, Users } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Join GBT",
  description: "Learn about Gamtaa Barattoota Tuulaa, our mission, and how you can participate as a student volunteer.",
  alternates: { canonical: "/join" },
};

export default function JoinPage() {
  return (
    <>
      <PageHeader
        eyebrow="Join GBT"
        title="Become a Volunteer"
        description="Learn how you can use your university education to uplift your community, build your leadership skills, and make a lasting impact."
      />

      {/* Information Sections */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-16">
          
          {/* Mission & Purpose */}
          <div className="space-y-6">
            <h2 className="font-display text-3xl font-bold text-forest-950 flex items-center gap-3">
              <Users className="h-8 w-8 text-forest-700" />
              What is GBT?
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Gamtaa Barattoota Tuulaa (GBT) is a student-led community movement. We bring university students together to transform the opportunities they receive into meaningful service for their communities. Our mission is to bridge the educational gap and foster a spirit of giving back among the youth.
            </p>
          </div>

          {/* Volunteer Opportunities */}
          <div className="space-y-6">
            <h2 className="font-display text-3xl font-bold text-forest-950 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-forest-700" />
              Volunteer Opportunities
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              As a volunteer, you can participate in a variety of impactful programs:
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 mt-6">
              {[
                "Free Summer Education",
                "Student Mentorship",
                "Digital Literacy & Technology",
                "Community Service Projects",
                "Tolerance & Social Harmony Workshops",
                "Youth Empowerment & Leadership"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 bg-cream p-4 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
                  <span className="font-semibold text-forest-900">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Requirements & Process */}
          <div className="space-y-6">
            <h2 className="font-display text-3xl font-bold text-forest-950 flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-forest-700" />
              How to Participate
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              The process to become a GBT volunteer is simple, but it requires commitment.
            </p>
            <div className="bg-forest-50 p-6 rounded-2xl border border-forest-100">
              <ol className="list-decimal list-inside space-y-4 text-forest-900">
                <li className="font-medium">Be a current university student or recent graduate.</li>
                <li className="font-medium">Have a strong desire to give back to your community.</li>
                <li className="font-medium">Complete the online registration application.</li>
                <li className="font-medium">Wait for your application to be reviewed and approved.</li>
                <li className="font-medium">Join an active program and begin logging your service hours!</li>
              </ol>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="text-center pt-8 border-t border-border">
            <h3 className="font-display text-2xl font-bold text-forest-950 mb-4">
              Ready to make a difference?
            </h3>
            <p className="text-muted-foreground mb-8">
              Join hundreds of students who are building a brighter future. Your community is waiting.
            </p>
            <Button asChild size="lg" className="rounded-full bg-gold-500 text-forest-950 shadow-md hover:bg-gold-400">
              <Link href="/register">
                Register Now
                <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          </div>
        </div>
      </section>
    </>
  );
}

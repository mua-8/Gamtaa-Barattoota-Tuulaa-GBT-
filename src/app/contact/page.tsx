import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { SocialIcons } from "@/components/site/social-icons";
import { ContactForm } from "@/components/site/contact-form";
import { ORG } from "@/lib/site";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Gamtaa Barattoota Tuulaa — questions, partnerships, volunteering, and media inquiries.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const defaultContent = {
    header: {
      eyebrow: "Contact",
      title: "We'd love to hear from you",
      description: "Whether you're a student who wants to serve, a school that wants a program, or a partner who wants to support us — this is the place to start.",
    },
    info: {
      address: ORG.address,
      email: ORG.email,
      phone: ORG.phone,
      officeHours: "Monday – Saturday, 8:30 – 17:30 (EAT)",
      responseTime: "We usually reply within two to three working days.",
    },
  };

  const content = await getSiteContent("contact", defaultContent);

  return (
    <>
      <PageHeader
        eyebrow={content.header.eyebrow}
        title={content.header.title}
        description={content.header.description}
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[380px_1fr] lg:gap-14 lg:px-8">
          {/* Organization info */}
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-bold text-forest-950">Organization information</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
                  <div>
                    <dt className="font-bold text-foreground">Location</dt>
                    <dd className="mt-0.5 text-muted-foreground">{content.info.address}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
                  <div>
                    <dt className="font-bold text-foreground">Email</dt>
                    <dd className="mt-0.5">
                      <a href={`mailto:${content.info.email}`} className="text-forest-800 underline-offset-4 hover:underline">
                        {content.info.email}
                      </a>
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
                  <div>
                    <dt className="font-bold text-foreground">Phone</dt>
                    <dd className="mt-0.5">
                      <a href={`tel:${content.info.phone.replace(/\s+/g, "")}`} className="text-forest-800 underline-offset-4 hover:underline">
                        {content.info.phone}
                      </a>
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
                  <div>
                    <dt className="font-bold text-foreground">Office hours</dt>
                    <dd className="mt-0.5 text-muted-foreground">
                      {content.info.officeHours}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="rounded-xl bg-forest-950 p-6 text-white shadow-md">
              <h2 className="font-display text-lg font-bold">Follow our journey</h2>
              <p className="mt-2 text-sm text-forest-100">
                Program announcements, volunteer calls, and stories from the field.
              </p>
              <SocialIcons variant="light" className="mt-4" />
            </div>
          </div>

          {/* Form */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm sm:p-10">
            <h2 className="font-display text-2xl font-bold text-forest-950">Send us a message</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {content.info.responseTime}
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

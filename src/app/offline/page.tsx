import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function OfflinePage() {
  return (
    <>
      <PageHeader
        eyebrow="Offline"
        title="You are currently offline"
        description="Some GBT content may not be available until your connection returns."
      />
      <section className="py-20 text-center">
        <Button asChild size="lg" className="rounded-full bg-forest-900 text-white hover:bg-forest-800">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Try again
          </Link>
        </Button>
      </section>
    </>
  );
}

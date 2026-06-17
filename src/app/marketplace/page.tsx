import { BadgeDollarSign } from "lucide-react";
import { PageShell, SectionIntro } from "@/components/shell";

export default function MarketplacePage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro eyebrow="Marketplace" title="Digital work with real value." body="Marketplace listings can support digital sales, sponsored projects, courses, memberships, and future Stripe Connect payouts." />
        <div className="surface p-8 text-white/66">
          <BadgeDollarSign className="mb-6 text-emerald-300" />
          Marketplace collection ready for listing cards and checkout flows.
        </div>
      </section>
    </PageShell>
  );
}

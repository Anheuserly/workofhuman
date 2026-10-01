import { MessageCircle } from "lucide-react";
import { PageShell, SectionIntro } from "@/components/shell";

export default function MessagesPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro
          eyebrow="Messages"
          title="Creator conversations."
          body="Direct communication channels, collaborative threads, and client inquiry management."
        />
        <div className="surface p-8 text-[#6f6a61]">
          <MessageCircle className="mb-4 text-[#0f766e]" size={32} />
          <h3 className="text-xl font-semibold text-[#151515]">Direct Inbox</h3>
          <p className="mt-2 text-sm leading-relaxed">
            Connect directly with other studios, collaborate on multimedia releases, or coordinate commissions.
          </p>
        </div>
      </section>
    </PageShell>
  );
}

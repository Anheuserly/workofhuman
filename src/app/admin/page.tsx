import { Shield } from "lucide-react";
import { PageShell, SectionIntro } from "@/components/shell";

export default function AdminPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro eyebrow="Admin" title="Moderation and platform health." body="Role-protected dashboard shell for reports, moderation queues, editor picks, trending cache, and creator verification." />
        <div className="surface p-8 text-white/66">
          <Shield className="mb-6 text-rose-300" />
          Admin shell ready for role=admin guards.
        </div>
      </section>
    </PageShell>
  );
}

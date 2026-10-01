import { Bell } from "lucide-react";
import { PageShell, SectionIntro } from "@/components/shell";

export default function NotificationsPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro
          eyebrow="Notifications"
          title="Signals that matter."
          body="Curated notification streams for follows, comments, saves, and creative community activity."
        />
        <div className="surface p-8 text-[#6f6a61]">
          <Bell className="mb-4 text-[#0f766e]" size={32} />
          <h3 className="text-xl font-semibold text-[#151515]">Activity Center</h3>
          <p className="mt-2 text-sm leading-relaxed">
            Stay informed on engagement with your published work, community discussions, and trending milestones.
          </p>
        </div>
      </section>
    </PageShell>
  );
}

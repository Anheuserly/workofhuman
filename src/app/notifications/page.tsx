import { Bell } from "lucide-react";
import { PageShell, SectionIntro } from "@/components/shell";

export default function NotificationsPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro eyebrow="Notifications" title="Signals that matter." body="Protected notification streams can subscribe to Appwrite realtime channels for follows, comments, saves, and community activity." />
        <div className="surface p-8 text-white/66">
          <Bell className="mb-6 text-cyan-300" />
          Realtime notification center ready for authenticated sessions.
        </div>
      </section>
    </PageShell>
  );
}

import { Settings } from "lucide-react";
import { PageShell, SectionIntro } from "@/components/shell";

export default function SettingsPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro eyebrow="Settings" title="Creator control room." body="Protected account, profile, notification, privacy, AI disclosure, and monetization settings." />
        <div className="surface p-8 text-white/66">
          <Settings className="mb-6 text-cyan-300" />
          Settings modules ready for authenticated Appwrite users.
        </div>
      </section>
    </PageShell>
  );
}

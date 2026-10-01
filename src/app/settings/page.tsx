import { Settings } from "lucide-react";
import { PageShell, SectionIntro } from "@/components/shell";

export default function SettingsPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro
          eyebrow="Settings"
          title="Creator control room."
          body="Manage your verified profile, notification preferences, privacy, AI disclosure settings, and monetization."
        />
        <div className="surface p-8 text-[#6f6a61]">
          <Settings className="mb-4 text-[#0f766e]" size={32} />
          <h3 className="text-xl font-semibold text-[#151515]">Account &amp; Studio Preferences</h3>
          <p className="mt-2 text-sm leading-relaxed">
            Customize how your projects appear across the discovery feeds, manage connected social channels, and toggle transparent AI disclosure tags.
          </p>
        </div>
      </section>
    </PageShell>
  );
}

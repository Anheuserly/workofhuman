import { MessageCircle } from "lucide-react";
import { PageShell, SectionIntro } from "@/components/shell";

export default function MessagesPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro eyebrow="Messages" title="Creator conversations." body="Protected messaging can use Appwrite realtime channels and relationship documents." />
        <div className="surface p-8 text-white/66">
          <MessageCircle className="mb-6 text-cyan-300" />
          Messaging shell ready for conversation documents.
        </div>
      </section>
    </PageShell>
  );
}

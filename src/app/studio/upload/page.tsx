import { ImagePlus, Music, UploadCloud, Video } from "lucide-react";
import { PageShell, SectionIntro } from "@/components/shell";

export default function UploadStudioPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro
          eyebrow="Upload studio"
          title="One studio for every creative medium."
          body="The protected upload flow is structured for drag and drop, metadata, AI disclosure, tags, thumbnails, and high-performance media storage."
        />
        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="surface grid min-h-[420px] place-items-center border-dashed p-8 text-center">
            <div>
              <UploadCloud className="mx-auto text-cyan-300" size={42} />
              <h2 className="mt-6 text-3xl font-semibold">Drop project media</h2>
              <p className="mt-3 max-w-md text-white/58">Images, video, audio, documents, 3D files, code previews, and AI generation outputs.</p>
            </div>
          </div>
          <div className="grid gap-4">
            {[
              [ImagePlus, "Visual work", "Art, design, photography, fashion, architecture."],
              [Video, "Motion work", "Films, shorts, documentaries, animation, edits."],
              [Music, "Audio work", "Songs, podcasts, tracks, sound experiments."],
            ].map(([Icon, title, body]) => (
              <article className="surface p-5" key={title as string}>
                <Icon className="text-rose-300" size={26} />
                <h3 className="mt-6 text-xl font-semibold">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-white/58">{body as string}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

import { ArrowRight, Bell, Menu, Search, UploadCloud } from "lucide-react";
import Link from "next/link";
import { platformRoutes } from "@/lib/platform";

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-[#ded9cf] bg-white/90 px-3 py-3 shadow-sm backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-3" aria-label="WorkOfHuman home">
        <span className="grid size-9 place-items-center rounded-full bg-[#151515] text-sm font-black text-white">W</span>
        <span className="hidden text-sm font-semibold tracking-[0.18em] text-[#151515] sm:inline">WORKOFHUMAN</span>
      </Link>
      <nav className="hidden items-center gap-5 text-sm text-[#6f6a61] lg:flex">
        {platformRoutes.map((item) => (
          <Link className="transition hover:text-[#151515]" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <Link className="icon-button" href="/explore" aria-label="Search">
          <Search size={18} />
        </Link>
        <Link className="icon-button hidden sm:inline-flex" href="/notifications" aria-label="Notifications">
          <Bell size={18} />
        </Link>
        <Link className="button-primary hidden px-4 sm:inline-flex" href="/studio/upload">
          <UploadCloud size={17} />
          Create
        </Link>
        <button className="icon-button lg:hidden" type="button" aria-label="Open menu">
          <Menu size={18} />
        </button>
      </div>
    </header>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-5 py-6 text-[#151515] sm:px-8 lg:px-12">
      <SiteHeader />
      {children}
    </main>
  );
}

export function SectionIntro({ eyebrow, title, body, href }: { eyebrow: string; title: string; body?: string; href?: string }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="max-w-3xl">
        <p className="section-eyebrow text-[#0f766e]">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
        {body ? <p className="mt-4 max-w-2xl text-base leading-7 text-[#6f6a61] sm:text-lg">{body}</p> : null}
      </div>
      {href ? (
        <Link className="button-secondary w-fit px-4" href={href}>
          View all
          <ArrowRight size={17} />
        </Link>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <section className="mx-auto mt-16 max-w-2xl surface p-8">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 leading-7 text-[#6f6a61]">{body}</p>
    </section>
  );
}

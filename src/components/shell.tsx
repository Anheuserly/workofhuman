import { ArrowRight, Bell, Search } from "lucide-react";
import Link from "next/link";
import { platformRoutes } from "@/lib/platform";
import { HeaderUserNav } from "@/components/user-nav";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-[#ded9cf] bg-white/90 px-3 py-3 shadow-sm backdrop-blur-xl">
      <Logo size="md" />
      <nav className="hidden items-center gap-5 text-sm text-[#6f6a61] lg:flex">
        {platformRoutes.map((item) => (
          <Link className="transition hover:text-[#151515]" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link className="icon-button" href="/explore" aria-label="Search">
          <Search size={17} />
        </Link>
        <Link className="icon-button hidden md:inline-flex" href="/notifications" aria-label="Notifications">
          <Bell size={17} />
        </Link>
        <HeaderUserNav />
        <div className="ml-1 sm:ml-1.5">
          <MobileMenu />
        </div>
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

export function EmptyState({
  title,
  body,
  href = "/studio/upload",
  actionLabel = "Publish a Creation",
}: {
  title: string;
  body: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <section className="mx-auto mt-12 max-w-xl surface p-8 sm:p-12 text-center">
      <h3 className="text-2xl font-bold tracking-tight text-[#151515]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#6f6a61]">{body}</p>
      {href && actionLabel && (
        <div className="mt-6">
          <Link href={href} className="button-primary text-xs">
            {actionLabel}
            <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </section>
  );
}

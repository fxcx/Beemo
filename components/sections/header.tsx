import { MobileNav } from "@/components/sections/mobile-nav";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";
import { mainNavigation } from "@/lib/content";
import { configuracion } from "@/utils/configuracion";

export function Header({ homePrefix = "" }: { homePrefix?: string }) {
  const homeHref = (href: string) => href.startsWith("#") ? `${homePrefix}${href}` : href;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <a href={homeHref("#inicio")} className="group inline-flex items-center gap-2" aria-label={`${configuracion.nameCompany}, inicio`}>
          <BrandLogo className="h-12 w-32 transition group-hover:scale-105 sm:h-16 sm:w-40" />
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegación principal">
          {mainNavigation.filter((item) => item.label !== "Pedir presupuesto").map((item) => (
            <Link className="nav-link" href={homeHref(item.href)} key={item.href}>{item.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href={homeHref("#presupuesto")} className="hidden rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black sm:inline-flex">
            Pedir presupuesto
          </a>
          <MobileNav homePrefix={homePrefix} />
        </div>
      </div>
      <style>{`.nav-link{font-size:.9rem;font-weight:600;color:#64707b;transition:color .18s ease}.nav-link:hover{color:#0f1720}.nav-link:focus-visible{outline:2px solid #19d58d;outline-offset:4px;border-radius:6px}`}</style>
    </header>
  );
}
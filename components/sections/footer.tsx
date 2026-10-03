import { contactContent } from "@/lib/content";
import { BrandLogo } from "@/components/brand-logo";
import { configuracion } from "@/utils/configuracion";
import Link from "next/link";

export function Footer({ homePrefix = "" }: { homePrefix?: string }) {
  return (
    <footer id="contacto" className="bg-ink px-5 py-12 text-white sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.2fr_.8fr_.8fr]">
        <div>
          <BrandLogo className="h-16 w-40" inverted />
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/50">{contactContent.footerDescription}</p>
          <p className="mt-3 text-sm text-white/50">{configuracion.location}</p>
          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-white/60"><span className="size-1.5 rounded-full bg-brand" /><span className="text-white">{configuracion.allyName}</span></div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">{contactContent.navigationLabel}</p>
          <div className="mt-5 grid gap-3 text-sm text-white/65">{contactContent.navigation.map(({ label, href }) => <Link href={href.startsWith("#") ? `${homePrefix}${href}` : href} key={href} className="hover:text-white">{label}</Link>)}</div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">{contactContent.contactLabel}</p>
          <p className="mt-5 max-w-xs text-sm leading-7 text-white/50">{contactContent.description}</p>
          <a href={`mailto:${configuracion.email}`} className="mt-4 block text-sm font-semibold text-white hover:text-brand">{configuracion.email}</a>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between"><span>{configuracion.copyright}</span><div className="flex gap-5">{contactContent.legalLinks.map(({ label, href }) => <a href={href} key={href} className="hover:text-white">{label}</a>)}</div></div>
    </footer>
  );
}
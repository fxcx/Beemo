"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Close, Menu } from "@/components/icons";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";
import { mainNavigation } from "@/lib/content";
import { configuracion } from "@/utils/configuracion";

export function MobileNav({ homePrefix = "" }: { homePrefix?: string }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.querySelector<HTMLElement>("[data-dialog-initial-focus]")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab" || !dialog) return;
      const items = dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button ref={triggerRef} type="button" className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white transition hover:bg-brand hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" onClick={() => setOpen(true)} aria-label="Abrir menú" aria-expanded={open} aria-haspopup="dialog" aria-controls="mobile-navigation">
        <Menu size={20} />
        <span>Menú</span>
      </button>
      {open ? (
        <div className="fixed inset-0 z-80 overflow-y-auto bg-surface">
          <div id="mobile-navigation" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="mobile-navigation-title" className="mx-auto flex min-h-100dvh w-full max-w-7xl flex-col px-5 pb-7 pt-5 sm:px-8 sm:pb-10 sm:pt-7 lg:px-10">
            <div className="flex items-center justify-between border-b border-line pb-5">
              <a href={`${homePrefix}#inicio`} onClick={() => setOpen(false)} aria-label={`${configuracion.nameCompany}, inicio`}>
                <BrandLogo className="h-12 w-32" />
              </a>
              <div className="flex items-center gap-3">
                <span className="hidden text-xs font-bold uppercase tracking-[0.16em] text-muted sm:block">Navegación</span>
                <button data-dialog-initial-focus className="grid size-11 place-items-center rounded-full bg-ink text-white transition hover:bg-brand hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú"><Close /></button>
              </div>
            </div>

            <div className="mt-10 flex flex-1 flex-col sm:mt-14">
              <p className="eyebrow">{configuracion.nameCompany} / EXPLORAR</p>
              <h2 id="mobile-navigation-title" className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">¿A dónde vamos?</h2>
              <nav className="mt-7" aria-label="Navegación móvil">
                <ol>
                  {mainNavigation.filter(({ label }) => label !== "Pedir presupuesto").map(({ label, href }, index) => (
                    <li key={href} className="border-b border-line first:border-t">
                      <Link href={href.startsWith("#") ? `${homePrefix}${href}` : href} onClick={() => setOpen(false)} className="group flex min-h-16 items-center justify-between gap-4 py-4 text-xl font-semibold text-ink transition-colors hover:text-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:text-2xl">
                        <span className="flex items-center gap-4"><span aria-hidden="true" className="text-xs font-bold tabular-nums text-muted">0{index + 1}</span>{label}</span>
                        <ArrowUpRight size={20} className="shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-deep" />
                      </Link>
                    </li>
                  ))}
                </ol>
              </nav>

              <div className="mt-auto grid gap-6 border-t border-line pt-6 sm:grid-cols-[1fr_auto] sm:items-end sm:pt-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Hablemos de tu proyecto</p>
                  <a href={`mailto:${configuracion.email}`} className="mt-2 inline-block text-base font-semibold text-ink hover:text-brand-deep">{configuracion.email}</a>
                  <p className="mt-1 text-sm text-muted">{configuracion.location}</p>
                </div>
                <Link href={`${homePrefix}#presupuesto`} onClick={() => setOpen(false)} className="inline-flex min-h-14 items-center justify-between gap-6 rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-brand hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:min-w-64">
                  Pedir presupuesto
                  <ArrowUpRight size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
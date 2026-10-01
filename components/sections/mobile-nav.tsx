"use client";

import { useEffect, useRef, useState } from "react";
import { Close, Menu } from "@/components/icons";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";
import { contactContent, mainNavigation } from "@/lib/content";

export function MobileNav({ homePrefix = "" }: { homePrefix?: string }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const trigger = triggerRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    focusable?.[0]?.focus();

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
      trigger?.focus();
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button ref={triggerRef} type="button" className="grid size-11 place-items-center rounded-full border border-line bg-white" onClick={() => setOpen(true)} aria-label="Abrir menú" aria-expanded={open} aria-haspopup="dialog">
        <Menu />
      </button>
      {open ? (
        <div className="fixed inset-0 z-[80] bg-ink/55 p-3 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Menú de navegación" className="ml-auto flex h-full max-w-sm flex-col rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <BrandLogo className="h-12 w-32" />
              <button className="grid size-10 place-items-center rounded-full border border-line" type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú"><Close /></button>
            </div>
            <nav className="mt-12 grid gap-2">
              {mainNavigation.map(({ label, href }) => (
                <Link key={href} href={href.startsWith("#") ? `${homePrefix}${href}` : href} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-4 text-lg font-semibold transition hover:bg-surface">
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto rounded-3xl bg-ink p-5 text-white">
              <p className="text-sm text-white/60">Hablemos de tu proyecto</p>
              <p className="mt-2 text-lg font-semibold">{contactContent.email}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
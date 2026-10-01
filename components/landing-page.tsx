"use client";

import { useEffect, useRef, useState } from "react";
import { AboutSection } from "@/components/sections/about-section";
import { ChatWidget } from "@/components/sections/chat-widget";
import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { Clients } from "@/components/sections/clients";
import { Process } from "@/components/sections/process";
import { QuoteForm } from "@/components/sections/quote-form";
import { Services } from "@/components/sections/services";
import type { Service } from "@/lib/content";

export function LandingPage({ initialProjectType = "" }: { initialProjectType?: string }) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [quoteRequest, setQuoteRequest] = useState({ projectType: initialProjectType, requestId: 0 });
  const serviceDialogRef = useRef<HTMLElement>(null);
  const closeServiceButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!selectedService) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeServiceButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedService(null);
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = serviceDialogRef.current;
      const focusable = dialog?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      const first = focusable?.[0];
      const last = focusable?.[focusable.length - 1];
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
      previouslyFocused?.focus();
    };
  }, [selectedService]);

  return (
    <div className="overflow-x-clip bg-surface text-ink">
      <Header />
      <main>
        <Hero />
        <Clients />
        <Services onSelect={setSelectedService} />
        <AboutSection />
        <Process />
        <QuoteForm key={quoteRequest.requestId} initialProjectType={quoteRequest.projectType} />
      </main>
      <Footer />
      <ChatWidget />

      {selectedService ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/55 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedService(null);
          }}
          role="presentation"
        >
          <article ref={serviceDialogRef} role="dialog" aria-modal="true" aria-labelledby="service-dialog-title" className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-[2rem] border border-white/60 bg-white p-7 shadow-2xl sm:p-10">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="eyebrow">{selectedService.tag}</p>
                <h2 id="service-dialog-title" className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{selectedService.title}</h2>
              </div>
              <button
                type="button"
                ref={closeServiceButtonRef}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-muted transition hover:border-ink hover:text-ink"
                onClick={() => setSelectedService(null)}
                aria-label="Cerrar detalle"
              >
                ×
              </button>
            </div>
            <p className="mt-6 text-base leading-7 text-muted">{selectedService.detailIntro ?? selectedService.description}</p>
            <div className="mt-8 grid gap-3">
              {(selectedService.detailBullets ?? selectedService.bullets).map((bullet) => (
                <div key={bullet} className="flex items-start gap-3 rounded-2xl bg-brand-soft px-4 py-3 text-sm font-semibold text-ink-soft">
                  <span className="mt-0.5 text-brand-deep">✓</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
            {selectedService.note || selectedService.partnerNote ? (
              <p className="mt-5 text-sm leading-6 text-muted">{selectedService.note ?? selectedService.partnerNote}</p>
            ) : null}
            <a
              href="#presupuesto"
              onClick={() => {
                const projectTypeByService: Record<string, string> = {
                  mobile: "Aplicación móvil",
                  software: "Software a medida",
                  web: "Sitio web",
                  ia: "Agentes de IA",
                };
                setQuoteRequest((current) => ({
                  projectType: projectTypeByService[selectedService.id] ?? "Otro proyecto",
                  requestId: current.requestId + 1,
                }));
                setSelectedService(null);
              }}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black"
            >
              Pedir presupuesto por este servicio
              <span aria-hidden="true">↗</span>
            </a>
          </article>
        </div>
      ) : null}
    </div>
  );
}
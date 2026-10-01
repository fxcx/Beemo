"use client";

import { useState } from "react";
import { aboutTabs, companyContent } from "@/lib/content";

export function AboutSection() {
  const [active, setActive] = useState<(typeof aboutTabs)[number]["id"]>("nosotros");
  const content = aboutTabs.find((item) => item.id === active) ?? aboutTabs[0];

  return (
    <section id="nosotros" className="border-y border-line bg-white px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.82fr_1.18fr] lg:items-start">
        <div>
          <p className="eyebrow">{companyContent.eyebrow}</p>
          <h2 className="mt-4 font-display text-[clamp(2.3rem,5vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.055em]">{companyContent.title}</h2>
          <div className="mt-8 flex flex-wrap gap-2">
            {aboutTabs.map((tab) => (
              <button key={tab.id} type="button" onClick={() => setActive(tab.id)} className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${active === tab.id ? "bg-ink text-white" : "border border-line bg-white text-muted hover:border-ink hover:text-ink"}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="rounded-[2rem] border border-line bg-surface p-7 sm:p-9">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-brand-deep">{content.label}</p>
            <h3 className="mt-4 font-display text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{content.title}</h3>
            <p className="mt-5 max-w-2xl text-[16px] leading-8 text-muted">{content.body}</p>
            {active === "nosotros" ? (
              <blockquote className="mt-8 border-l-2 border-brand pl-5 text-base font-medium leading-7 text-ink-soft">
                “{companyContent.quote}”
              </blockquote>
            ) : null}
            {active === "valores" ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {companyContent.values.map((value) => <span key={value} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-soft">{value}</span>)}
              </div>
            ) : null}
          </div>
          <div className="mt-5 overflow-hidden rounded-[2rem] border border-line bg-ink">
            <div className="grid gap-0 sm:grid-cols-2">
              <div className="relative min-h-56 bg-[radial-gradient(circle_at_70%_30%,rgba(25,213,141,.35),transparent_38%),linear-gradient(145deg,#1d2935,#0f1720)] p-7 text-white sm:min-h-64">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">{companyContent.teamEyebrow}</p>
                <p className="mt-3 max-w-sm text-3xl font-semibold tracking-[-0.045em]">{companyContent.teamTitle}</p>
                <span className="absolute bottom-6 right-6 size-16 rounded-full border border-white/10 bg-white/5" />
              </div>
              <div className="relative min-h-56 overflow-hidden sm:min-h-64">
                <img src={companyContent.teamImageUrl} alt={companyContent.teamImageAlt} className="absolute inset-0 h-full w-full object-cover opacity-75" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
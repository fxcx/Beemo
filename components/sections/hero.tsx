import { ArrowRight, Check } from "@/components/icons";
import { heroContent } from "@/lib/content";

export function Hero() {
  return (
    <section id="inicio" className="noise relative isolate overflow-hidden border-b border-line bg-white">
      <div className="hero-grid absolute inset-x-0 top-0 h-[70%] opacity-70" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-[1.08fr_.92fr] lg:px-10 lg:pb-32 lg:pt-24">
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/85 px-3 py-1.5 text-xs font-bold text-muted shadow-sm backdrop-blur">
            <span className="size-1.5 rounded-full bg-brand" />
            {heroContent.experienceLabel}
          </div>
          <h1 className="max-w-4xl font-display text-[clamp(3rem,7vw,6.1rem)] font-semibold leading-[0.94] tracking-[-0.065em]">
            {heroContent.titlePrefix} <span className="text-brand-deep">{heroContent.titleHighlight}</span> {heroContent.titleSuffix}
          </h1>
          <p className="mt-7 max-w-2xl text-[17px] leading-8 text-muted sm:text-lg">
            {heroContent.description}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#presupuesto" className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black">
              {heroContent.quoteCta} <ArrowRight size={17} />
            </a>
            <a href="#servicios" className="inline-flex items-center justify-center rounded-full border border-line bg-white px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-ink">
              {heroContent.servicesCta}
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-[2rem] border border-ink/10 bg-ink p-5 shadow-2xl sm:p-6">
            <div className="absolute -right-16 -top-16 size-44 rounded-full bg-brand/35 blur-3xl" />
            <div className="relative rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">{heroContent.aiLabel}</span>
                <span className="rounded-full bg-brand/12 px-2.5 py-1 text-[10px] font-bold text-brand">{heroContent.newServiceLabel}</span>
              </div>
              <div className="mt-8 font-mono text-sm leading-7 text-white/75 sm:text-base">
                {heroContent.terminalLines.map((line, index) => (
                  <p key={line} className={index === 1 ? "mt-3" : undefined}>
                    {index === 0 ? <span className="text-brand">{line.slice(0, 4)}</span> : "› "}
                    {index === 0 ? line.slice(4) : line}
                  </p>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-white/60"><Check size={16} className="text-brand" /> {heroContent.readyLabel}</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {heroContent.metrics.map(({ value, label }) => (
                <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                  <p className="text-2xl font-semibold text-white">{value}</p>
                  <p className="mt-1 text-xs leading-5 text-white/45">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
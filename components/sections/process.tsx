import { ArrowRight } from "@/components/icons";
import { processSteps } from "@/lib/content";

export function Process() {
  return (
    <section id="proceso" className="bg-ink px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">/ Cómo trabajamos</p>
            <h2 className="mt-4 font-display text-[clamp(2.3rem,5vw,4.4rem)] font-semibold leading-[0.98] tracking-[-0.055em]">Un proceso claro, de la idea al sistema</h2>
          </div>
          <a href="#presupuesto" className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-brand hover:text-brand">Hablemos de tu proyecto <ArrowRight size={17} /></a>
        </div>

        <div className="mt-14 grid border-t border-white/10 lg:grid-cols-3">
          {processSteps.map((step, index) => (
            <article key={step.number} className="border-b border-white/10 py-8 lg:border-b-0 lg:border-r lg:px-8 lg:py-10 first:lg:pl-0 last:lg:border-r-0 last:lg:pr-0">
              <p className="text-sm font-bold text-brand">{step.number}</p>
              <h3 className="mt-7 text-2xl font-semibold tracking-[-0.03em]">{step.title}</h3>
              <p className="mt-4 max-w-sm text-sm leading-7 text-white/55">{step.description}</p>
              <div className="mt-8 text-xs font-semibold text-white/25">0{index + 1} / 03</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}